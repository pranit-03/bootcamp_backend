# InvenTrack Backend - Quick Start Guide

Get the backend running in 5 minutes!

## Prerequisites

- ✅ Node.js 16+ installed
- ✅ PostgreSQL installed and running
- ✅ Git (optional)

## Step 1: PostgreSQL Setup

### Option A: Using existing PostgreSQL

If PostgreSQL is already running, create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (in psql prompt)
CREATE DATABASE inventrack_db;

# Exit psql
\q
```

### Option B: Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer, remember the password

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- Express.js (web framework)
- Prisma (database ORM)
- JWT (authentication)
- bcrypt (password hashing)
- CORS (cross-origin requests)

## Step 3: Configure Environment

```bash
# Copy example to .env
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/inventrack_db"
JWT_SECRET="your-secret-key-12345"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation.

## Step 4: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database schema
npm run prisma:migrate
```

When prompted for migration name, type: `init` and press Enter.

✅ Database is now ready!

## Step 5: Create Admin User (Optional but Recommended)

Start the server first:

```bash
npm run dev
```

Then in another terminal, create admin user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@inventrack.com",
    "password": "admin123",
    "name": "Administrator",
    "role": "ADMINISTRATOR"
  }'
```

## Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📚 API Base URL: http://localhost:3000/api
```

✅ Backend is running!

## Verify It's Working

Test the health check:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response should include a token:
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "username": "admin",
      "role": "ADMINISTRATOR"
    }
  }
}
```

## Common Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Open Prisma Studio (visual DB browser)
npm run prisma:studio

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Connect Frontend

Update your frontend `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Integration Guide

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for React integration examples.

## Troubleshooting

### "Cannot connect to database"

Check `.env` DATABASE_URL:
- Verify PostgreSQL is running
- Test connection: `psql -U postgres -d inventrack_db`
- Verify username and password

### "port 3000 already in use"

Change PORT in `.env`:
```env
PORT=3001
```

Or kill the existing process:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "CORS errors from frontend"

Update CORS_ORIGIN in `.env`:
```env
CORS_ORIGIN="http://localhost:3000"
```

### JWT token errors

Generate a strong JWT_SECRET:
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy to `.env`:
```env
JWT_SECRET="generated-secret-here"
```

## Need Help?

1. Check error messages in terminal
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. Check [README.md](./README.md) for detailed setup

## Next Steps

1. ✅ Backend running
2. ⏭️  Connect frontend to backend
3. ⏭️  Test all API endpoints
4. ⏭️  Replace mock data with API calls
5. ⏭️  Deploy to production

Enjoy! 🚀
