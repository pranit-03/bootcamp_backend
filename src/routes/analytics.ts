import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * GET /analytics/summary
 * Get dashboard summary statistics
 */
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({
      where: { status: { in: ['LOW_STOCK', 'CRITICAL'] } },
    });

    const totalSuppliers = await prisma.supplier.count({ where: { status: true } });
    const totalUsers = await prisma.user.count({ where: { status: true } });

    // Sales and purchases from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalSales = await prisma.transaction.aggregate({
      where: {
        type: 'SALE',
        date: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    });

    const totalPurchases = await prisma.transaction.aggregate({
      where: {
        type: 'PURCHASE',
        date: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    });

    const totalTransactions = await prisma.transaction.count();

    res.json({
      status: 200,
      data: {
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
        suppliers: totalSuppliers,
        users: totalUsers,
        sales: {
          amount: totalSales._sum.amount || 0,
          period: 'last 30 days',
        },
        purchases: {
          amount: totalPurchases._sum.amount || 0,
          period: 'last 30 days',
        },
        totalTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch summary' });
  }
});

/**
 * GET /analytics/inventory
 * Get inventory analytics
 */
router.get('/inventory', async (req: AuthRequest, res: Response) => {
  try {
    const statusCounts = await prisma.product.groupBy({
      by: ['status'],
      _count: true,
    });

    const categoryStats = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
      _sum: { stock: true },
      _avg: { price: true },
    });

    const topProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        reorderLevel: true,
        status: true,
      },
      orderBy: { stock: 'desc' },
      take: 10,
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { status: { in: ['LOW_STOCK', 'CRITICAL', 'OUT_OF_STOCK'] } },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        reorderLevel: true,
        status: true,
      },
    });

    res.json({
      status: 200,
      data: {
        statusCounts,
        categoryStats,
        topProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch inventory analytics' });
  }
});

/**
 * GET /analytics/transactions
 * Get transaction analytics
 */
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    const typeCounts = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _count: true,
      _sum: { amount: true },
    });

    const statusCounts = await prisma.transaction.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const dailyTransactions = await prisma.transaction.groupBy({
      by: ['date'],
      where,
      _count: true,
      _sum: { amount: true },
    });

    res.json({
      status: 200,
      data: {
        typeCounts,
        statusCounts,
        dailyTransactions: dailyTransactions.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch transaction analytics' });
  }
});

export default router;
