import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authMiddleware);

/**
 * GET /products
 * Get all products with optional filters and search
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      category,
      status,
      skip = '0',
      take = '10',
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.category = String(category);
    }

    if (status && status !== 'all') {
      where.status = String(status);
    }

    const products = await prisma.product.findMany({
      where,
      skip: parseInt(String(skip)),
      take: parseInt(String(take)),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.product.count({ where });

    res.json({
      status: 200,
      data: products,
      pagination: {
        total,
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch products' });
  }
});

/**
 * GET /products/:id
 * Get product by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ status: 200, data: product });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to fetch product', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * POST /products
 * Create new product
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { sku, name, category, price, stock, reorderLevel, barcode, description } = req.body;

    if (!sku || !name || !category || price === undefined) {
      throw new AppError('Missing required fields', 400);
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category,
        price,
        stock: stock || 0,
        reorderLevel: reorderLevel || 10,
        barcode,
        description,
        status: stock > reorderLevel ? 'IN_STOCK' : 'LOW_STOCK',
      },
    });

    res.status(201).json({
      status: 201,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to create product', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

/**
 * PUT /products/:id
 * Update product
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, price, reorderLevel, barcode, description, status } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(price !== undefined && { price }),
        ...(reorderLevel !== undefined && { reorderLevel }),
        ...(barcode && { barcode }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    res.json({
      status: 200,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to update product' });
  }
});

/**
 * DELETE /products/:id
 * Delete product
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 200, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to delete product' });
  }
});

/**
 * PATCH /products/:id/stock
 * Update stock level
 */
router.patch('/:id/stock', async (req: AuthRequest, res: Response) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'

    if (quantity === undefined || !operation) {
      throw new AppError('quantity and operation are required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    let newStock = product.stock;
    if (operation === 'add') {
      newStock += quantity;
    } else if (operation === 'subtract') {
      newStock -= quantity;
    } else if (operation === 'set') {
      newStock = quantity;
    }

    // Determine status
    let status = 'IN_STOCK';
    if (newStock === 0) status = 'OUT_OF_STOCK';
    else if (newStock <= 5) status = 'CRITICAL';
    else if (newStock <= product.reorderLevel) status = 'LOW_STOCK';

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: newStock, status },
    });

    res.json({
      status: 200,
      message: 'Stock updated successfully',
      data: updated,
    });
  } catch (error) {
    const err = error instanceof AppError ? error : new AppError('Failed to update stock', 500);
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  }
});

export default router;
