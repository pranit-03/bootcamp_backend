import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authMiddleware);

/**
 * GET /suppliers
 * Get all suppliers with optional filters
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, skip = '0', take = '10' } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { contact: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (status !== undefined) {
      where.status = status === 'true';
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.supplier.count({ where });

    res.json({
      status: 200,
      data: suppliers,
      pagination: {
        total,
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch suppliers' });
  }
});

/**
 * GET /suppliers/:id
 * Get supplier by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    res.json({ status: 200, data: supplier });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to fetch supplier', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * POST /suppliers
 * Create new supplier
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, contact, email, phone } = req.body;

    if (!name || !contact || !email || !phone) {
      throw new AppError('Missing required fields', 400);
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contact,
        email,
        phone,
      },
    });

    res.status(201).json({
      status: 201,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to create supplier', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * PUT /suppliers/:id
 * Update supplier
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, contact, email, phone, status } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(contact && { contact }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status !== undefined && { status }),
      },
    });

    res.json({
      status: 200,
      message: 'Supplier updated successfully',
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to update supplier' });
  }
});

/**
 * DELETE /suppliers/:id
 * Delete supplier
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.supplier.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 200, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to delete supplier' });
  }
});

export default router;
