import { query } from '../config/db.js';
import initDb from '../config/initDb.js';

export const seedDatabase = async () => {
  try {
    console.log('Ensuring tables are initialized before seeding...');
    await initDb();

    console.log('Seeding sample parcel and events...');

    // Upsert or insert dummy parcel TRK-1001
    const parcelResult = await query(
      `
      INSERT INTO parcels (
        tracking_number,
        sender_name,
        recipient_name,
        origin,
        destination,
        status,
        current_location,
        estimated_delivery
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '2 days')
      ON CONFLICT (tracking_number) DO UPDATE SET
        sender_name = EXCLUDED.sender_name,
        recipient_name = EXCLUDED.recipient_name,
        origin = EXCLUDED.origin,
        destination = EXCLUDED.destination,
        status = EXCLUDED.status,
        current_location = EXCLUDED.current_location,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, tracking_number;
      `,
      [
        'TRK-1001',
        'Apex Logistics NY',
        'Sarah Jenkins',
        'New York, NY',
        'Los Angeles, CA',
        'In Transit',
        'Chicago Sorting Center, IL',
      ]
    );

    const parcelId = parcelResult.rows[0].id;
    console.log(`Parcel TRK-1001 ready with ID: ${parcelId}`);

    // Clean existing events for idempotent re-seeding
    await query('DELETE FROM parcel_events WHERE parcel_id = $1;', [parcelId]);

    // Insert 2 sample checkpoints
    await query(
      `
      INSERT INTO parcel_events (parcel_id, status, location, description, created_at)
      VALUES 
        ($1, 'Accepted', 'New York, NY', 'Shipment received at origin distribution center', NOW() - INTERVAL '1 day'),
        ($1, 'In Transit', 'Chicago Sorting Center, IL', 'Arrived at intermediate sorting hub and processed', NOW() - INTERVAL '3 hours');
      `,
      [parcelId]
    );

    console.log('Successfully seeded 1 package (TRK-1001) with 2 sample checkpoints.');
  } catch (error) {
    console.error('Failed to seed database:', error.message);
    throw error;
  }
};

// Allow direct execution from CLI
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;
