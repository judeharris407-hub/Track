import { registerUser, loginUser } from '../../services/adminAuthService.js';

/**
 * Register a new system user
 * POST /api/v1/admin/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const newUser = await registerUser(name, email, password, role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing system user
 * POST /api/v1/admin/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required fields.',
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
};
