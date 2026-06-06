# InvenTrack Backend API Documentation

## Overview

Base URL: `http://localhost:3000/api`

All endpoints require authentication with JWT token in the Authorization header (except `/auth/login` and `/auth/register`):

```
Authorization: Bearer <your_jwt_token>
```

## Postman Test Setup

1. Import the API collection or create requests manually with the Base URL `http://localhost:3000/api`.
2. Add a global or environment variable in Postman:
   - `base_url` = `http://localhost:3000/api`
   - `jwt_token` = `<your_jwt_token>`
3. Use the Authorization header for protected requests:

```
Authorization: Bearer {{jwt_token}}
```

4. Use `POST /auth/login` to retrieve a token and save it in Postman environment for subsequent requests.

5. Set `Content-Type: application/json` for request bodies on POST, PUT, and PATCH endpoints.

---

## Authentication

### POST /auth/login

Login user with credentials.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@inventrack.com",
      "name": "Admin User",
      "role": "ADMINISTRATOR"
    }
  }
}
```

**Response (401):**
```json
{
  "status": 401,
  "message": "Invalid credentials"
}
```

---

### POST /auth/register

Register new user (typically admin only in production).

**Request:**
```json
{
  "username": "john_sales",
  "email": "john@inventrack.com",
  "password": "securepass123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "SALES"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "john_sales",
    "email": "john@inventrack.com",
    "name": "John Doe",
    "role": "SALES"
  }
}
```

---

## Products

### GET /products

Get all products with optional filters.

**Query Parameters:**
- `search` - Search by product name or SKU
- `category` - Filter by category (e.g., "Electronics")
- `status` - Filter by status (IN_STOCK, LOW_STOCK, CRITICAL, OUT_OF_STOCK)
- `skip` - Pagination offset (default: 0)
- `take` - Pagination limit (default: 10)

**Example Request:**
```
GET /api/products?search=laptop&category=Electronics&status=IN_STOCK&skip=0&take=10
```

**Response (200):**
```json
{
  "status": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "sku": "SKU001",
      "name": "Dell Laptop",
      "category": "Electronics",
      "description": "15-inch laptop",
      "price": 899.99,
      "stock": 25,
      "reorderLevel": 10,
      "barcode": "1234567890123",
      "status": "IN_STOCK",
      "createdAt": "2025-06-01T10:30:00Z",
      "updatedAt": "2025-06-01T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "skip": 0,
    "take": 10
  }
}
```

---

### GET /products/:id

Get product by ID.

**Response (200):**
```json
{
  "status": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "sku": "SKU001",
    "name": "Dell Laptop",
    "category": "Electronics",
    "description": "15-inch laptop",
    "price": 899.99,
    "stock": 25,
    "reorderLevel": 10,
    "barcode": "1234567890123",
    "status": "IN_STOCK",
    "createdAt": "2025-06-01T10:30:00Z",
    "updatedAt": "2025-06-01T10:30:00Z"
  }
}
```

---

### POST /products

Create new product.

**Request:**
```json
{
  "sku": "SKU002",
  "name": "HP Printer",
  "category": "Electronics",
  "description": "Wireless printer",
  "price": 299.99,
  "stock": 15,
  "reorderLevel": 5,
  "barcode": "9876543210987"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Product created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "sku": "SKU002",
    "name": "HP Printer",
    "category": "Electronics",
    "description": "Wireless printer",
    "price": 299.99,
    "stock": 15,
    "reorderLevel": 5,
    "barcode": "9876543210987",
    "status": "IN_STOCK",
    "createdAt": "2025-06-01T11:00:00Z",
    "updatedAt": "2025-06-01T11:00:00Z"
  }
}
```

---

### PUT /products/:id

Update product details.

**Request:**
```json
{
  "name": "HP LaserJet Printer",
  "price": 329.99,
  "reorderLevel": 3
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Product updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "sku": "SKU002",
    "name": "HP LaserJet Printer",
    "category": "Electronics",
    "price": 329.99,
    "stock": 15,
    "reorderLevel": 3,
    "status": "IN_STOCK",
    "createdAt": "2025-06-01T11:00:00Z",
    "updatedAt": "2025-06-01T11:05:00Z"
  }
}
```

---

### PATCH /products/:id/stock

Update product stock level.

**Request:**
```json
{
  "quantity": 5,
  "operation": "add"
}
```

**Operations:**
- `add` - Increment stock
- `subtract` - Decrement stock
- `set` - Set stock to exact value

**Response (200):**
```json
{
  "status": 200,
  "message": "Stock updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "sku": "SKU002",
    "name": "HP LaserJet Printer",
    "stock": 20,
    "status": "IN_STOCK",
    "updatedAt": "2025-06-01T11:10:00Z"
  }
}
```

---

### DELETE /products/:id

Delete product.

**Response (200):**
```json
{
  "status": 200,
  "message": "Product deleted successfully"
}
```

---

## Transactions

### GET /transactions

Get all transactions (sales and purchases).

**Query Parameters:**
- `type` - Filter by type (SALE, PURCHASE)
- `status` - Filter by status (PENDING, COMPLETED, CANCELLED)
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `search` - Search by customer or supplier name
- `skip` - Pagination offset
- `take` - Pagination limit

**Example Request:**
```
GET /api/transactions?type=SALE&status=COMPLETED&skip=0&take=10
```

**Response (200):**
```json
{
  "status": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "type": "SALE",
      "date": "2025-06-01T14:30:00Z",
      "productId": "550e8400-e29b-41d4-a716-446655440010",
      "product": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "sku": "SKU001",
        "name": "Dell Laptop",
        "category": "Electronics"
      },
      "quantity": 2,
      "amount": 1799.98,
      "status": "COMPLETED",
      "customer": "ABC Corporation",
      "notes": "Office equipment purchase",
      "createdAt": "2025-06-01T14:30:00Z",
      "updatedAt": "2025-06-01T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "skip": 0,
    "take": 10
  }
}
```

---

### POST /transactions

Create new transaction.

**Request:**
```json
{
  "type": "SALE",
  "productId": "550e8400-e29b-41d4-a716-446655440010",
  "quantity": 2,
  "amount": 1799.98,
  "customer": "ABC Corporation",
  "notes": "Office equipment purchase"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Transaction created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "type": "SALE",
    "date": "2025-06-01T14:30:00Z",
    "productId": "550e8400-e29b-41d4-a716-446655440010",
    "quantity": 2,
    "amount": 1799.98,
    "status": "COMPLETED",
    "customer": "ABC Corporation",
    "notes": "Office equipment purchase",
    "createdAt": "2025-06-01T14:30:00Z",
    "updatedAt": "2025-06-01T14:30:00Z"
  }
}
```

---

### PUT /transactions/:id

Update transaction status.

**Request:**
```json
{
  "status": "CANCELLED"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Transaction updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "type": "SALE",
    "status": "CANCELLED",
    "updatedAt": "2025-06-01T14:35:00Z"
  }
}
```

---

### DELETE /transactions/:id

Delete/cancel transaction (reverses stock changes).

**Response (200):**
```json
{
  "status": 200,
  "message": "Transaction deleted successfully"
}
```

---

## Users

### GET /users

Get all users (Admin/Manager only).

**Query Parameters:**
- `search` - Search by username, email, or name
- `role` - Filter by role (ADMINISTRATOR, MANAGER, SALES, INVENTORY)
- `status` - Filter by status (true/false)
- `skip` - Pagination offset
- `take` - Pagination limit

**Response (200):**
```json
{
  "status": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "john_sales",
      "email": "john@inventrack.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "SALES",
      "status": true,
      "createdAt": "2025-06-01T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "skip": 0,
    "take": 10
  }
}
```

---

### POST /users

Create new user (Admin/Manager only).

**Request:**
```json
{
  "username": "jane_inventory",
  "email": "jane@inventrack.com",
  "password": "secure123",
  "name": "Jane Smith",
  "phone": "+9876543210",
  "role": "INVENTORY"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "username": "jane_inventory",
    "email": "jane@inventrack.com",
    "name": "Jane Smith",
    "phone": "+9876543210",
    "role": "INVENTORY",
    "status": true
  }
}
```

---

### PUT /users/:id

Update user information.

**Request:**
```json
{
  "email": "jane.smith@inventrack.com",
  "name": "Jane M. Smith",
  "phone": "+9876543210"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "username": "jane_inventory",
    "email": "jane.smith@inventrack.com",
    "name": "Jane M. Smith",
    "phone": "+9876543210",
    "role": "INVENTORY",
    "status": true
  }
}
```

---

### DELETE /users/:id

Delete user (Admin only).

**Response (200):**
```json
{
  "status": 200,
  "message": "User deleted successfully"
}
```

---

## Suppliers

### GET /suppliers

Get all suppliers.

**Query Parameters:**
- `search` - Search by name, email, or contact
- `status` - Filter by status (true/false)
- `skip` - Pagination offset
- `take` - Pagination limit

**Response (200):**
```json
{
  "status": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "name": "Tech Supplies Inc",
      "contact": "John Supplier",
      "email": "contact@techsupplies.com",
      "phone": "+1555123456",
      "status": true,
      "createdAt": "2025-06-01T10:00:00Z",
      "updatedAt": "2025-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "skip": 0,
    "take": 10
  }
}
```

---

### POST /suppliers

Create new supplier.

**Request:**
```json
{
  "name": "Office Furniture Co",
  "contact": "Sales Team",
  "email": "sales@officefurniture.com",
  "phone": "+1555987654"
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Supplier created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440041",
    "name": "Office Furniture Co",
    "contact": "Sales Team",
    "email": "sales@officefurniture.com",
    "phone": "+1555987654",
    "status": true,
    "createdAt": "2025-06-01T11:00:00Z",
    "updatedAt": "2025-06-01T11:00:00Z"
  }
}
```

---

### PUT /suppliers/:id

Update supplier.

**Request:**
```json
{
  "contact": "New Sales Manager",
  "phone": "+1555111111",
  "status": false
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Supplier updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440041",
    "name": "Office Furniture Co",
    "contact": "New Sales Manager",
    "email": "sales@officefurniture.com",
    "phone": "+1555111111",
    "status": false,
    "updatedAt": "2025-06-01T11:30:00Z"
  }
}
```

---

### DELETE /suppliers/:id

Delete supplier.

**Response (200):**
```json
{
  "status": 200,
  "message": "Supplier deleted successfully"
}
```

---

## Analytics

### GET /analytics/summary

Get dashboard summary statistics.

**Response (200):**
```json
{
  "status": 200,
  "data": {
    "products": {
      "total": 50,
      "lowStock": 8
    },
    "suppliers": 15,
    "users": 12,
    "sales": {
      "amount": 45000.50,
      "period": "last 30 days"
    },
    "purchases": {
      "amount": 18500.25,
      "period": "last 30 days"
    },
    "totalTransactions": 156
  }
}
```

---

### GET /analytics/inventory

Get detailed inventory analytics.

**Response (200):**
```json
{
  "status": 200,
  "data": {
    "statusCounts": [
      { "status": "IN_STOCK", "_count": 35 },
      { "status": "LOW_STOCK", "_count": 8 },
      { "status": "CRITICAL", "_count": 5 },
      { "status": "OUT_OF_STOCK", "_count": 2 }
    ],
    "categoryStats": [
      {
        "category": "Electronics",
        "_count": 20,
        "_sum": { "stock": 450 },
        "_avg": { "price": 599.99 }
      },
      {
        "category": "Furniture",
        "_count": 15,
        "_sum": { "stock": 120 },
        "_avg": { "price": 799.99 }
      }
    ],
    "topProducts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Dell Laptop",
        "stock": 50,
        "reorderLevel": 10,
        "status": "IN_STOCK"
      }
    ],
    "lowStockProducts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440050",
        "name": "USB Cable",
        "sku": "SKU099",
        "stock": 3,
        "reorderLevel": 20,
        "status": "CRITICAL"
      }
    ]
  }
}
```

---

### GET /analytics/transactions

Get transaction analytics.

**Query Parameters:**
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response (200):**
```json
{
  "status": 200,
  "data": {
    "typeCounts": [
      { "type": "SALE", "_count": 89, "_sum": { "amount": 45000.50 } },
      { "type": "PURCHASE", "_count": 67, "_sum": { "amount": 18500.25 } }
    ],
    "statusCounts": [
      { "status": "COMPLETED", "_count": 150 },
      { "status": "PENDING", "_count": 5 },
      { "status": "CANCELLED", "_count": 1 }
    ],
    "dailyTransactions": [
      {
        "date": "2025-05-01T00:00:00Z",
        "_count": 12,
        "_sum": { "amount": 3500.00 }
      },
      {
        "date": "2025-05-02T00:00:00Z",
        "_count": 15,
        "_sum": { "amount": 4200.00 }
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": 400,
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "status": 404,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Internal server error"
}
```

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Update `JWT_SECRET` with a secure key

3. **Set up database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Seed initial data** (optional):
   - Create admin user via `/auth/register`
   - Create products and suppliers via respective endpoints
