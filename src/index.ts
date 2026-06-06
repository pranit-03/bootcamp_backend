import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import transactionsRoutes from './routes/transactions';
import usersRoutes from './routes/users';
import suppliersRoutes from './routes/suppliers';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = [
        // any localhost port for local dev
        /^http:\/\/localhost(:\d+)?$/,
        // deployed frontend domains
        /^https:\/\/.*\.onrender\.com$/,
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.netlify\.app$/,
      ];

      if (allowed.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'InvenTrack API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/apisuppliers', (req, res) => {
  const redirectUrl = `/api/suppliers${req.url}`;
  res.redirect(301, redirectUrl);
});
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'InvenTrack backend is running',
    baseUrl: `/api`,
    health: '/health'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 404, message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ status: 500, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
