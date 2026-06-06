import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InvenTrack API',
      version: '1.0.0',
      description: 'Inventory Management System REST API',
    },
    servers: [
      { url: 'https://bootcamp-backend-9h1i.onrender.com', description: 'Production server' },
      { url: 'http://localhost:3005', description: 'Local development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'Admin@1234' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password', 'name'],
          properties: {
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'password123' },
            name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '9800000001' },
            role: { type: 'string', enum: ['SALES', 'MANAGER', 'ADMINISTRATOR'], example: 'SALES' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sku: { type: 'string', example: 'SKU-001' },
            name: { type: 'string', example: 'Product Name' },
            category: { type: 'string', example: 'Electronics' },
            description: { type: 'string' },
            price: { type: 'number', example: 999.99 },
            stock: { type: 'integer', example: 50 },
            reorderLevel: { type: 'integer', example: 10 },
            barcode: { type: 'string' },
            status: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'CRITICAL', 'OUT_OF_STOCK'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['SALE', 'PURCHASE'] },
            date: { type: 'string', format: 'date-time' },
            productId: { type: 'string' },
            quantity: { type: 'integer', example: 5 },
            amount: { type: 'number', example: 4999.95 },
            status: { type: 'string', enum: ['COMPLETED', 'PENDING', 'CANCELLED'] },
            customer: { type: 'string' },
            supplier: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['SALES', 'MANAGER', 'ADMINISTRATOR'] },
            status: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Supplier Co.' },
            contact: { type: 'string', example: 'Ram Thapa' },
            email: { type: 'string', example: 'supplier@example.com' },
            phone: { type: 'string', example: '9810000000' },
            status: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            status: { type: 'integer', example: 200 },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                skip: { type: 'integer' },
                take: { type: 'integer' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'integer' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          parameters: [
            { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'take', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'CRITICAL', 'OUT_OF_STOCK'] } },
          ],
          responses: {
            200: { description: 'List of products', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Create a product',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sku', 'name', 'category', 'price'],
                  properties: {
                    sku: { type: 'string' },
                    name: { type: 'string' },
                    category: { type: 'string' },
                    price: { type: 'number' },
                    stock: { type: 'integer' },
                    reorderLevel: { type: 'integer' },
                    barcode: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Product created' },
            400: { description: 'Missing required fields' },
          },
        },
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Products'],
          summary: 'Update product',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    category: { type: 'string' },
                    price: { type: 'number' },
                    reorderLevel: { type: 'integer' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Product updated' } },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product deleted' } },
        },
      },
      '/api/products/{id}/stock': {
        patch: {
          tags: ['Products'],
          summary: 'Update product stock',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantity', 'operation'],
                  properties: {
                    quantity: { type: 'integer', example: 20 },
                    operation: { type: 'string', enum: ['add', 'subtract', 'set'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Stock updated' } },
        },
      },
      '/api/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'Get all transactions',
          parameters: [
            { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'take', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['SALE', 'PURCHASE'] } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['COMPLETED', 'PENDING', 'CANCELLED'] } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'List of transactions' } },
        },
        post: {
          tags: ['Transactions'],
          summary: 'Create a transaction',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type', 'productId', 'quantity', 'amount'],
                  properties: {
                    type: { type: 'string', enum: ['SALE', 'PURCHASE'] },
                    productId: { type: 'string' },
                    quantity: { type: 'integer' },
                    amount: { type: 'number' },
                    customer: { type: 'string' },
                    supplier: { type: 'string' },
                    notes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Transaction created' } },
        },
      },
      '/api/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transaction by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Transaction details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Transactions'],
          summary: 'Update transaction status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', enum: ['COMPLETED', 'PENDING', 'CANCELLED'] } },
                },
              },
            },
          },
          responses: { 200: { description: 'Status updated' } },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Delete transaction',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Transaction deleted and stock reversed' } },
        },
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users (ADMINISTRATOR or MANAGER)',
          parameters: [
            { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'take', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['SALES', 'MANAGER', 'ADMINISTRATOR'] } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          ],
          responses: { 200: { description: 'List of users' } },
        },
        post: {
          tags: ['Users'],
          summary: 'Create user (ADMINISTRATOR or MANAGER)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: { 201: { description: 'User created' } },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Users'],
          summary: 'Update user',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    role: { type: 'string', enum: ['SALES', 'MANAGER', 'ADMINISTRATOR'] },
                    status: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'User updated' } },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user (ADMINISTRATOR only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User deleted' } },
        },
      },
      '/api/suppliers': {
        get: {
          tags: ['Suppliers'],
          summary: 'Get all suppliers',
          parameters: [
            { name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
            { name: 'take', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          ],
          responses: { 200: { description: 'List of suppliers' } },
        },
        post: {
          tags: ['Suppliers'],
          summary: 'Create supplier',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'contact', 'email', 'phone'],
                  properties: {
                    name: { type: 'string' },
                    contact: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Supplier created' } },
        },
      },
      '/api/suppliers/{id}': {
        get: {
          tags: ['Suppliers'],
          summary: 'Get supplier by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier details' }, 404: { description: 'Not found' } },
        },
        put: {
          tags: ['Suppliers'],
          summary: 'Update supplier',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    contact: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    status: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Supplier updated' } },
        },
        delete: {
          tags: ['Suppliers'],
          summary: 'Delete supplier',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Supplier deleted' } },
        },
      },
      '/api/analytics/summary': {
        get: {
          tags: ['Analytics'],
          summary: 'Dashboard summary',
          responses: { 200: { description: 'Total products, users, suppliers, 30-day sales/purchases' } },
        },
      },
      '/api/analytics/inventory': {
        get: {
          tags: ['Analytics'],
          summary: 'Inventory analytics',
          responses: { 200: { description: 'Status counts, category stats, top products, low stock alerts' } },
        },
      },
      '/api/analytics/transactions': {
        get: {
          tags: ['Analytics'],
          summary: 'Transaction analytics',
          parameters: [
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { 200: { description: 'Type counts, status counts, daily breakdown' } },
        },
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          security: [],
          responses: { 200: { description: 'Server is running' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
