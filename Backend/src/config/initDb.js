import bcrypt from 'bcryptjs';
import { query } from './db.js';

/**
 * Creates all required database tables if they do not already exist
 * and seeds a default admin user if no system users exist.
 */
export const initDb = async () => {
  try {
    console.log('Initializing database tables...');

    // 1. system_users table
    await query(`
      CREATE TABLE IF NOT EXISTS system_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'agent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. parcels table
    await query(`
      CREATE TABLE IF NOT EXISTS parcels (
        id SERIAL PRIMARY KEY,
        tracking_number VARCHAR(50) UNIQUE NOT NULL,
        sender_name VARCHAR(100) NOT NULL,
        sender_phone VARCHAR(50),
        sender_email VARCHAR(150),
        recipient_name VARCHAR(100) NOT NULL,
        recipient_phone VARCHAR(50),
        recipient_email VARCHAR(150),
        origin VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        current_location VARCHAR(100),
        estimated_delivery TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure newly added columns exist on existing table instances
    await query(`
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(50);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS sender_email VARCHAR(150);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(50);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(150);
    `);

    // 3. parcel_events table
    await query(`
      CREATE TABLE IF NOT EXISTS parcel_events (
        id SERIAL PRIMARY KEY,
        parcel_id INT REFERENCES parcels(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        description TEXT,
        created_by INT REFERENCES system_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. chat_threads table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_threads (
        id SERIAL PRIMARY KEY,
        guest_id VARCHAR(100) NOT NULL,
        tracking_number VARCHAR(50),
        channel VARCHAR(20) DEFAULT 'web',
        external_contact_id VARCHAR(150),
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. chat_messages table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        thread_id INT REFERENCES chat_threads(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables initialized successfully.');

    // Seed default admin user if no system users exist
    const userCountResult = await query('SELECT COUNT(*) FROM system_users;');
    const userCount = parseInt(userCountResult.rows[0].count, 10);

    if (userCount === 0) {
      console.log('No system users found. Creating default admin user (admin@enterprise.com)...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await query(
        `INSERT INTO system_users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4);`,
        ['System Admin', 'admin@enterprise.com', passwordHash, 'admin']
      );
      console.log('Default admin user created successfully.');
    }
  } catch (error) {
    console.error('Error during database initialization:', error.message);
    throw error;
  }
};

// Allow direct execution for CLI table initialization
if (process.argv[1] && process.argv[1].includes('initDb.js')) {
  initDb()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initDb;
