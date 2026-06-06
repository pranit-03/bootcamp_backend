import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authMiddleware);

/**
 * GET /users
 * Get all users (admin/manager only)
 */
router.get(
  '/',
  roleMiddleware(['ADMINISTRATOR', 'MANAGER']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { search, role, status, skip = '0', take = '10' } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { username: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { name: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.role = String(role).toUpperCase();
      }

      if (status !== undefined) {
        where.status = status === 'true';
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
        },
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.user.count({ where });

      res.json({
        status: 200,
        data: users,
        pagination: {
          total,
          skip: parseInt(String(skip)),
          take: parseInt(String(take)),
        },
      });
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to fetch users' });
    }
  }
);

/**
 * GET /users/:id
 * Get user by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ status: 200, data: user });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to fetch user', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * POST /users
 * Create new user (admin/manager only)
 */
router.post(
  '/',
  roleMiddleware(['ADMINISTRATOR', 'MANAGER']),
  async (req: AuthRequest, res: Response) => {
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
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
        },
      });

      res.status(201).json({
        status: 201,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      const err = error instanceof AppError ? error : new AppError('Failed to create user', 500);
      res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
    }
  }
);

/**
 * PUT /users/:id
 * Update user
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, phone, role, status } = req.body;

    // Check if user is updating own role/status (only admin can do this)
    if ((role || status !== undefined) && req.user?.role !== 'ADMINISTRATOR') {
      throw new AppError('Only administrators can update role/status', 403);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(status !== undefined && { status }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    res.json({
      status: 200,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to update user', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * DELETE /users/:id
 * Delete user (admin only)
 */
router.delete(
  '/:id',
  roleMiddleware(['ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.userId === req.params.id) {
        throw new AppError('Cannot delete your own account', 400);
      }

      await prisma.user.delete({
        where: { id: req.params.id },
      });

      res.json({ status: 200, message: 'User deleted successfully' });
    } catch (error) {
      const err = error instanceof AppError ? error : new AppError('Failed to delete user', 500);
      res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
    }
  }
);

export default router;
