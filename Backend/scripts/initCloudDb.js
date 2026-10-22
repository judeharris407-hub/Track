import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: process.env.DATABASE_URL is not set.');
  console.error('Please define DATABASE_URL in your .env file or environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const initCloudDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Connected to Cloud Database successfully.');
    console.log('Executing database schema migrations...');

    // 1. system_users table
    console.log('Creating table: system_users...');
    await client.query(`
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
    console.log('Creating table: parcels...');
    await client.query(`
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
        origin_lat DOUBLE PRECISION,
        origin_lng DOUBLE PRECISION,
        destination VARCHAR(100) NOT NULL,
        destination_lat DOUBLE PRECISION,
        destination_lng DOUBLE PRECISION,
        status VARCHAR(50) DEFAULT 'Pending',
        current_location VARCHAR(100),
        current_lat DOUBLE PRECISION,
        current_lng DOUBLE PRECISION,
        route_history JSONB DEFAULT '[]'::jsonb,
        departure_time TIMESTAMP,
        estimated_arrival_time TIMESTAMP,
        shipment_type VARCHAR(20) DEFAULT 'LAND',
        estimated_delivery TIMESTAMP,
        package_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(50);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS sender_email VARCHAR(150);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(50);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(150);
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS origin_lat DOUBLE PRECISION;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS origin_lng DOUBLE PRECISION;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS destination_lat DOUBLE PRECISION;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS destination_lng DOUBLE PRECISION;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS current_lat DOUBLE PRECISION;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS current_lng DOUBLE PRECISION;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS route_history JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS departure_time TIMESTAMP;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP;
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS shipment_type VARCHAR(20) DEFAULT 'LAND';
      ALTER TABLE parcels ADD COLUMN IF NOT EXISTS package_description TEXT;
    `);

    // 3. parcel_events table
    console.log('Creating table: parcel_events...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS parcel_events (
        id SERIAL PRIMARY KEY,
        parcel_id INT REFERENCES parcels(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        description TEXT,
        created_by INT REFERENCES system_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE parcel_events ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
      ALTER TABLE parcel_events ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
    `);

    // 4. chat_threads table
    console.log('Creating table: chat_threads...');
    await client.query(`
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
    console.log('Creating table: chat_messages...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        thread_id INT REFERENCES chat_threads(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('All database tables verified and created successfully.');

    // Seed default admin user if not present
    const userCheck = await client.query(
      'SELECT id FROM system_users WHERE LOWER(email) = LOWER($1);',
      ['admin@enterprise.com']
    );

    if (userCheck.rows.length === 0) {
      console.log('No default admin user found. Creating initial admin user (admin@enterprise.com)...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO system_users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4);`,
        ['System Admin', 'admin@enterprise.com', passwordHash, 'admin']
      );
      console.log('Initial default admin user created successfully.');
    } else {
      console.log('Default admin user (admin@enterprise.com) already exists.');
    }

    console.log('Cloud database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed with error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].includes('initCloudDb.js')) {
  initCloudDb()
    .then(() => {
      console.log('Migration process exited successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration process exited with error:', err);
      process.exit(1);
    });
}

export default initCloudDb;
