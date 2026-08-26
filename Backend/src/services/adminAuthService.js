import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';
const SALT_ROUNDS = 10;

/**
 * Registers a new system user with hashed password.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string} [role='agent']
 * @returns {Promise<Object>}
 */
export const registerUser = async (name, email, password, role = 'agent') => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUserResult = await query(
    'SELECT id FROM system_users WHERE LOWER(email) = $1;',
    [normalizedEmail]
  );

  if (existingUserResult.rows.length > 0) {
    const error = new Error('A user with this email address already exists.');
    error.status = 409;
    throw error;
  }

  // Hash password with bcrypt (10 salt rounds)
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const insertQuery = `
    INSERT INTO system_users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;

  const result = await query(insertQuery, [
    name.trim(),
    normalizedEmail,
    passwordHash,
    role || 'agent',
  ]);

  return result.rows[0];
};

/**
 * Validates user credentials and returns user details and signed JWT valid for 24h.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const userResult = await query(
    'SELECT id, name, email, password_hash, role, created_at FROM system_users WHERE LOWER(email) = $1;',
    [normalizedEmail]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const user = userResult.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  const { password_hash, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

export default {
  registerUser,
  loginUser,
};
