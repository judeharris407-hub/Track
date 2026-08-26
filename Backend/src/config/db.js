import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'parcel_tracker',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Connection event listeners
pool.on('connect', () => {
  console.log('PostgreSQL client connected to pool.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Helper function to execute SQL queries with try/catch error handling
 * @param {string} text - SQL query string
 * @param {Array} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    console.error('Database query execution error:', {
      query: text,
      error: error.message,
    });
    throw error;
  }
};

// Quick connection test during module load
query('SELECT NOW()')
  .then((res) => {
    console.log('PostgreSQL database connected successfully. Current timestamp:', res.rows[0].now);
  })
  .catch((err) => {
    console.warn('Initial PostgreSQL connection test warning:', err.message);
  });

export { pool };
export default pool;
