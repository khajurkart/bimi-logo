import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, ShoppingBag, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    pendingReturns: 0,
    totalRevenue: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      await axios.get(`${API}/admin/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdmin(true);
      fetchStats();
    } catch (error) {
      toast.error('Admin access required');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, returnsRes] = await Promise.all([
        axios.get(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/returns`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;
      const returns = returnsRes.data;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        pendingReturns: returns.filter(r => r.status === 'pending').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0)
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-khajur-dark/60">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-20 bg-white" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-khajur-cream p-6 border border-khajur-border">
            <Package className="w-10 h-10 text-khajur-gold mb-3" />
            <h3 className="font-serif text-2xl font-bold text-khajur-primary mb-1">
              {stats.totalProducts}
            </h3>
            <p className="text-sm text-khajur-dark/60">Total Products</p>
          </div>
          <div className="bg-khajur-cream p-6 border border-khajur-border">
            <ShoppingBag className="w-10 h-10 text-khajur-gold mb-3" />
            <h3 className="font-serif text-2xl font-bold text-khajur-primary mb-1">
              {stats.totalOrders}
            </h3>
            <p className="text-sm text-khajur-dark/60">Total Orders</p>
          </div>
          <div className="bg-khajur-cream p-6 border border-khajur-border">
            <Users className="w-10 h-10 text-khajur-gold mb-3" />
            <h3 className="font-serif text-2xl font-bold text-khajur-primary mb-1">
              {stats.pendingOrders}
            </h3>
            <p className="text-sm text-khajur-dark/60">Pending Orders</p>
          </div>
          <div className="bg-khajur-cream p-6 border border-khajur-border">
            <RefreshCw className="w-10 h-10 text-khajur-gold mb-3" />
            <h3 className="font-serif text-2xl font-bold text-khajur-primary mb-1">
              {stats.pendingReturns}
            </h3>
            <p className="text-sm text-khajur-dark/60">Pending Returns</p>
          </div>
          <div className="bg-khajur-cream p-6 border border-khajur-border">
            <TrendingUp className="w-10 h-10 text-khajur-gold mb-3" />
            <h3 className="font-serif text-2xl font-bold text-khajur-primary mb-1">
              ₹{stats.totalRevenue.toFixed(2)}
            </h3>
            <p className="text-sm text-khajur-dark/60">Total Revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/products"
            className="bg-khajur-primary text-khajur-cream p-8 hover:bg-khajur-primary/90 transition-colors"
            data-testid="manage-products-link"
          >
            <Package className="w-12 h-12 mb-4" />
            <h2 className="font-serif text-2xl font-medium mb-2">Manage Products</h2>
            <p className="text-khajur-cream/80">Add, edit, or remove products from your inventory</p>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-khajur-gold text-khajur-primary p-8 hover:bg-khajur-gold/90 transition-colors"
            data-testid="manage-orders-link"
          >
            <ShoppingBag className="w-12 h-12 mb-4" />
            <h2 className="font-serif text-2xl font-medium mb-2">Manage Orders</h2>
            <p className="text-khajur-primary/80">View and update order status and tracking</p>
          </Link>
          <Link
            to="/admin/returns"
            className="bg-khajur-cream border-2 border-khajur-primary text-khajur-primary p-8 hover:bg-khajur-primary hover:text-khajur-cream transition-colors"
            data-testid="manage-returns-link"
          >
            <RefreshCw className="w-12 h-12 mb-4" />
            <h2 className="font-serif text-2xl font-medium mb-2">Returns & Exchanges</h2>
            <p className="opacity-80">Review and process return/exchange requests</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
