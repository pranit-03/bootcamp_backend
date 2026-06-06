import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /auth/login
 * Login user with username and password
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.status) {
      throw new AppError('User account is inactive', 403);
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      status: 200,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Login failed', 500);
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }
});

/**
 * POST /auth/register
 * Register new user (admin only)
 */
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, name, phone, role } = req.body;

    if (!username || !email || !password || !name) {
      throw new AppError('Missing required fields', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'SALES',
      },
    });

    res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Registration failed', 500);
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }
});

export default router;
