<<<<<<< HEAD
# InvenTrack Backend

Node.js/Express backend API for InvenTrack Inventory Management System with PostgreSQL and Prisma ORM.

## Architecture Overview

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Password Hashing:** bcrypt

### Project Structure

```
src/
├── index.ts                 # Main application entry point
├── middleware/
│   └── auth.ts             # Authentication & authorization middleware
├── routes/
│   ├── auth.ts             # Authentication endpoints
│   ├── products.ts         # Product CRUD endpoints
│   ├── transactions.ts     # Sales/Purchases endpoints
│   ├── users.ts            # User management endpoints
│   ├── suppliers.ts        # Supplier management endpoints
│   └── analytics.ts        # Analytics & reporting endpoints
└── utils/
    ├── jwt.ts              # JWT token generation and verification
    └── errors.ts           # Error handling utilities

prisma/
└── schema.prisma           # Database schema definition
```

## Database Schema

### Models

#### User
- `id` (UUID) - Primary key
- `username` (String, unique) - Login username
- `email` (String, unique) - User email
- `password` (String) - Hashed password
- `name` (String) - Full name
- `phone` (String) - Contact phone
- `role` (Enum) - User role (ADMINISTRATOR, MANAGER, SALES, INVENTORY)
- `status` (Boolean) - Active/inactive status
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

#### Product
- `id` (UUID) - Primary key
- `sku` (String, unique) - Stock Keeping Unit
- `name` (String) - Product name
- `category` (String) - Product category
- `description` (String) - Product description
- `price` (Float) - Unit price
- `stock` (Int) - Current stock level
- `reorderLevel` (Int) - Reorder threshold
- `barcode` (String, unique) - Barcode/QR code
- `status` (Enum) - Stock status (IN_STOCK, LOW_STOCK, CRITICAL, OUT_OF_STOCK)
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

#### Transaction
- `id` (UUID) - Primary key
- `type` (Enum) - Transaction type (SALE, PURCHASE)
- `date` (DateTime) - Transaction date
- `productId` (UUID) - Foreign key to Product
- `quantity` (Int) - Transaction quantity
- `amount` (Float) - Transaction amount
- `status` (Enum) - Transaction status (PENDING, COMPLETED, CANCELLED)
- `customer` (String) - Customer name/reference
- `supplier` (String) - Supplier name/reference
- `notes` (String) - Additional notes
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

#### Supplier
- `id` (UUID) - Primary key
- `name` (String) - Supplier company name
- `contact` (String) - Contact person
- `email` (String, unique) - Contact email
- `phone` (String) - Contact phone
- `status` (Boolean) - Active/inactive status
- `createdAt` (DateTime) - Creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update product stock
- `DELETE /api/products/:id` - Delete product

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction status
- `DELETE /api/transactions/:id` - Delete/cancel transaction

### Users
- `GET /api/users` - Get all users (Admin/Manager only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin/Manager only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Analytics
- `GET /api/analytics/summary` - Dashboard summary statistics
- `GET /api/analytics/inventory` - Inventory analytics
- `GET /api/analytics/transactions` - Transaction analytics

## Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PostgreSQL 12+ database

### 1. Installation

```bash
# Clone or extract the backend
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/inventrack_db"

# JWT configuration
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="7d"

# Server configuration
PORT=3000
NODE_ENV="development"

# CORS configuration (match your frontend URL)
CORS_ORIGIN="http://localhost:5173"
```

### 3. Database Setup

Generate Prisma client:

```bash
npm run prisma:generate
```

Create and migrate database:

```bash
npm run prisma:migrate
```

This will:
- Create the PostgreSQL database
- Run all migrations
- Generate Prisma client

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Development Commands

```bash
# Start dev server with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (visual DB management)
npm run prisma:studio
```

## Authentication

### JWT Token Flow

1. User calls `POST /api/auth/login` with username & password
2. Server validates credentials and generates JWT token
3. Client stores token (localStorage/sessionStorage)
4. For subsequent requests, include token in Authorization header:

```
Authorization: Bearer <token>
```

### Token Payload

```json
{
  "userId": "uuid",
  "username": "string",
  "role": "ADMINISTRATOR|MANAGER|SALES|INVENTORY"
}
```

## Authorization

Role-based access control:

- **ADMINISTRATOR** - Full access to all resources
- **MANAGER** - Access to users, products, transactions, analytics
- **SALES** - Access to transactions, products (read-only)
- **INVENTORY** - Access to products, stock management

## API Response Format

All responses follow a standard format:

### Success Response
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": { /* resource data */ }
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Error description"
}
```

## Error Handling

Standard HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Frontend Integration

### Example API Call (React/Fetch)

```typescript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'pass' })
});
const { data: { token } } = await response.json();

// Fetch Products
const products = await fetch('http://localhost:3000/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Example with Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Database Connection

### PostgreSQL Setup

If PostgreSQL is not installed:

**Windows:**
```bash
# Using chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE inventrack_db;

# Create user (optional)
CREATE USER inventrack_user WITH PASSWORD 'secure_password';
ALTER ROLE inventrack_user WITH CREATEDB;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE inventrack_db TO inventrack_user;
```

## Deployment

### Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Running in Production

```bash
npm start
```

### Environment for Production

Update `.env` for production:

```env
NODE_ENV=production
JWT_SECRET=<long-random-string>
DATABASE_URL=<production-db-url>
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### JWT Errors
- Token expired → User needs to login again
- Invalid token → Check JWT_SECRET matches
- Missing token → Include Authorization header

### CORS Errors
- Verify CORS_ORIGIN matches frontend URL
- Check if requests include credentials

## Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with all endpoints, request/response examples, and payload structures.

## Support & Issues

For issues or questions:
1. Check API_DOCUMENTATION.md
2. Review error messages in server logs
3. Verify environment configuration
4. Check database connection

## License

ISC
=======
# bootcamp_backend
backend all
>>>>>>> 227b60e356590d3e7c0a221b5ede7e1a0d905e66
