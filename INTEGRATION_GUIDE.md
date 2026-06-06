# Frontend-Backend Integration Guide

This guide shows how to integrate the backend API with your existing React frontend.

## 1. Update DataContext to Use API

Replace the current mock data in your `DataContext.tsx` with API calls:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface DataContextType {
  // Products
  products: any[];
  fetchProducts: (filters?: any) => Promise<void>;
  createProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, quantity: number, operation: string) => Promise<void>;

  // Transactions
  transactions: any[];
  fetchTransactions: (filters?: any) => Promise<void>;
  createTransaction: (transaction: any) => Promise<void>;

  // Users
  users: any[];
  fetchUsers: (filters?: any) => Promise<void>;
  createUser: (user: any) => Promise<void>;

  // Suppliers
  suppliers: any[];
  fetchSuppliers: (filters?: any) => Promise<void>;
  createSupplier: (supplier: any) => Promise<void>;

  // Analytics
  analytics: any;
  fetchAnalytics: () => Promise<void>;

  // Loading & Error
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

// Auth Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });
  const [user, setUser] = useState<any>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      const { token, user } = response.data.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('authToken', token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Data Provider
export function DataProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Products
  const fetchProducts = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await api.get('/products', { params: filters });
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: any) => {
    try {
      const response = await api.post('/products', product);
      setProducts([...products, response.data.data]);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const updateProduct = async (id: string, product: any) => {
    try {
      const response = await api.put(`/products/${id}`, product);
      setProducts(
        products.map((p) => (p.id === id ? response.data.data : p))
      );
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const updateProductStock = async (id: string, quantity: number, operation: string) => {
    try {
      const response = await api.patch(`/products/${id}/stock`, {
        quantity,
        operation,
      });
      setProducts(
        products.map((p) => (p.id === id ? response.data.data : p))
      );
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  // Transactions
  const fetchTransactions = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await api.get('/transactions', { params: filters });
      setTransactions(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transaction: any) => {
    try {
      const response = await api.post('/transactions', transaction);
      setTransactions([...transactions, response.data.data]);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create transaction');
    }
  };

  // Users
  const fetchUsers = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await api.get('/users', { params: filters });
      setUsers(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user: any) => {
    try {
      const response = await api.post('/users', user);
      setUsers([...users, response.data.data]);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Suppliers
  const fetchSuppliers = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers', { params: filters });
      setSuppliers(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplier: any) => {
    try {
      const response = await api.post('/suppliers', supplier);
      setSuppliers([...suppliers, response.data.data]);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create supplier');
    }
  };

  // Analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/summary');
      setAnalytics(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        transactions,
        fetchTransactions,
        createTransaction,
        users,
        fetchUsers,
        createUser,
        suppliers,
        fetchSuppliers,
        createSupplier,
        analytics,
        fetchAnalytics,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Custom Hooks
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
```

## 2. Update Inventory Component

```typescript
import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function Inventory() {
  const { products, fetchProducts, createProduct, updateProductStock } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Fetch products on component mount
    fetchProducts({
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleAddProduct = async (formData: any) => {
    try {
      await createProduct(formData);
      setShowAddForm(false);
      // Show success message
    } catch (error) {
      // Show error message
      console.error(error);
    }
  };

  const handleStockUpdate = async (productId: string, quantity: number) => {
    try {
      await updateProductStock(productId, quantity, 'add');
      // Show success message
    } catch (error) {
      // Show error message
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Input
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Furniture">Furniture</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <Button onClick={() => setShowAddForm(true)}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <AddProductForm
          onSubmit={handleAddProduct}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Products Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">SKU</th>
              <th className="px-6 py-3 text-left">Product Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-right">Stock</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{product.sku}</td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4 text-right font-bold">{product.stock}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      product.status === 'IN_STOCK'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    onClick={() => handleStockUpdate(product.id, 5)}
                  >
                    +5 Stock
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 3. Update LoginPage Component

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/DataContext';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-8">InvenTrack</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

## 4. Update App.tsx

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, DataProvider, useAuth } from './app/context/DataContext';
import LoginPage from './app/components/LoginPage';
import Dashboard from './app/components/Dashboard';
import Inventory from './app/components/Inventory';
import SalesAndPurchases from './app/components/SalesAndPurchases';
import UserManagement from './app/components/UserManagement';
import Analytics from './app/components/Analytics';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <SalesAndPurchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## 5. Backend API Integration Checklist

- [ ] Backend running on http://localhost:3000
- [ ] Database created and migrated
- [ ] CORS enabled for frontend URL
- [ ] JWT_SECRET configured
- [ ] Update `API_BASE_URL` to match backend URL
- [ ] Replace mock data with API calls
- [ ] Test login flow
- [ ] Test create/read/update/delete operations
- [ ] Test error handling
- [ ] Test authorization/roles
- [ ] Add loading states and error messages

## 6. Example API Calls in Components

### Create Product
```typescript
const handleAddProduct = async (formData) => {
  try {
    const { data } = await axios.post(
      'http://localhost:3000/api/products',
      formData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('Product created:', data);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```

### Fetch with Filters
```typescript
const handleSearch = async (searchTerm) => {
  const { data } = await axios.get(
    'http://localhost:3000/api/products',
    {
      params: {
        search: searchTerm,
        category: 'Electronics',
        skip: 0,
        take: 20
      },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  setProducts(data.data);
};
```

### Update Stock
```typescript
const handleStockIncrease = async (productId) => {
  const { data } = await axios.patch(
    `http://localhost:3000/api/products/${productId}/stock`,
    { quantity: 10, operation: 'add' },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('Updated stock:', data.data.stock);
};
```

## Next Steps

1. Copy the API integration code above into your frontend
2. Start the backend server (`npm run dev` in backend folder)
3. Start the frontend (`npm run dev` in frontend folder)
4. Test the login flow with the API
5. Update each component to use API calls instead of mock data
6. Test all CRUD operations
7. Handle loading and error states
