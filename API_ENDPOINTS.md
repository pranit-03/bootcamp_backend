# API Endpoints

Base URL: `/api`

## Auth
- POST /api/auth/login — Login
- POST /api/auth/register — Register user

## Products
- GET /api/products — List products
- GET /api/products/:id — Get product by ID
- POST /api/products — Create product
- PUT /api/products/:id — Update product
- DELETE /api/products/:id — Delete product
- PATCH /api/products/:id/stock — Update product stock

## Transactions
- GET /api/transactions — List transactions
- GET /api/transactions/:id — Get transaction by ID
- POST /api/transactions — Create transaction (sale/purchase)
- PUT /api/transactions/:id — Update transaction status
- DELETE /api/transactions/:id — Delete/cancel transaction

## Users
- GET /api/users — List users
- GET /api/users/:id — Get user by ID
- POST /api/users — Create user
- PUT /api/users/:id — Update user
- DELETE /api/users/:id — Delete user

## Suppliers
- GET /api/suppliers — List suppliers
- GET /api/suppliers/:id — Get supplier by ID
- POST /api/suppliers — Create supplier
- PUT /api/suppliers/:id — Update supplier
- DELETE /api/suppliers/:id — Delete supplier

## Analytics
- GET /api/analytics/summary — Dashboard summary
- GET /api/analytics/inventory — Inventory analytics
- GET /api/analytics/transactions — Transaction analytics

## Misc
- GET /health — Server health
