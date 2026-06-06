import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authMiddleware);

/**
 * GET /transactions
 * Get all transactions with optional filters
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      status,
      startDate,
      endDate,
      search,
      skip = '0',
      take = '10',
    } = req.query;

    const where: any = {};

    if (type && type !== 'all') {
      where.type = String(type).toUpperCase();
    }

    if (status && status !== 'all') {
      where.status = String(status).toUpperCase();
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    if (search) {
      where.OR = [
        { customer: { contains: String(search), mode: 'insensitive' } },
        { supplier: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { product: true },
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
      orderBy: { date: 'desc' },
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      status: 200,
      data: transactions,
      pagination: {
        total,
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch transactions' });
  }
});

/**
 * GET /transactions/:id
 * Get transaction by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { product: true },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({ status: 200, data: transaction });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to fetch transaction', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * POST /transactions
 * Create new transaction (sale or purchase)
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, productId, quantity, amount, customer, supplier, notes } = req.body;

    if (!type || !productId || !quantity || amount === undefined) {
      throw new AppError('Missing required fields', 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: String(type).toUpperCase() as any,
        productId,
        quantity,
        amount,
        customer,
        supplier,
        notes,
        status: 'COMPLETED',
      },
      include: { product: true },
    });

    // Update product stock
    if (type === 'PURCHASE' || type === 'purchase') {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      });
    } else if (type === 'SALE' || type === 'sale') {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });
    }

    res.status(201).json({
      status: 201,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to create transaction', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * PUT /transactions/:id
 * Update transaction status
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { status: String(status).toUpperCase() as any },
      include: { product: true },
    });

    res.json({
      status: 200,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to update transaction' });
  }
});

/**
 * DELETE /transactions/:id
 * Cancel/delete transaction
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Reverse stock change
    if (transaction.type === 'PURCHASE') {
      await prisma.product.update({
        where: { id: transaction.productId },
        data: { stock: { decrement: transaction.quantity } },
      });
    } else {
      await prisma.product.update({
        where: { id: transaction.productId },
        data: { stock: { increment: transaction.quantity } },
      });
    }

    await prisma.transaction.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 200, message: 'Transaction deleted successfully' });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to delete transaction', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

export default router;
