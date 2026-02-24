import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Package, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order status updated successfully');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = await axios.get(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedOrder(updated.data);
      }
    } catch (error) {
      console.error('Failed to update order status', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-khajur-dark/60">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-white" data-testid="admin-orders-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 text-khajur-primary hover:text-khajur-gold"
            data-testid="back-to-dashboard"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-serif text-4xl font-medium text-khajur-primary">
            Manage Orders
          </h1>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-khajur-border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-khajur-cream">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-khajur-primary uppercase tracking-wider">Tracking ID</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-khajur-primary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-khajur-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-khajur-cream/50">
                  <td className="px-6 py-4 text-sm font-medium text-khajur-primary">
                    {order.id.substring(0, 12)}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-khajur-dark">{order.customer_name}</div>
                    <div className="text-xs text-khajur-dark/60">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-khajur-dark/80">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-khajur-gold">
                    ₹{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className={`inline-block px-2 py-1 rounded ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {order.payment_method.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border-0 ${getStatusColor(order.status)}`}
                      data-testid={`order-status-${order.id}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-khajur-dark/80">
                    {order.tracking_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-khajur-primary hover:text-khajur-gold text-sm font-medium"
                      data-testid={`view-order-${order.id}`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="order-details-modal">
            <div className="bg-white max-w-3xl w-full rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-3xl font-medium text-khajur-primary">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-khajur-dark hover:text-khajur-gold"
                    data-testid="close-order-modal"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="bg-khajur-cream p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-khajur-dark/60 mb-1">Order ID</p>
                        <p className="text-sm font-medium text-khajur-primary">{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-khajur-dark/60 mb-1">Tracking ID</p>
                        <p className="text-sm font-medium text-khajur-primary">
                          {selectedOrder.tracking_id || 'Not assigned yet'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-khajur-dark/60 mb-1">Order Date</p>
                        <p className="text-sm font-medium text-khajur-dark">
                          {new Date(selectedOrder.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-khajur-dark/60 mb-1">Status</p>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-khajur-gold mr-2" />
                      <h3 className="font-serif text-xl font-medium text-khajur-primary">Customer Information</h3>
                    </div>
                    <div className="bg-white border border-khajur-border p-6">
                      <p className="text-sm font-medium text-khajur-dark mb-1">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-khajur-dark/60 mb-1">{selectedOrder.customer_email}</p>
                      <p className="text-sm text-khajur-dark/60">{selectedOrder.shipping_address.phone}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <div className="flex items-center mb-3">
                      <MapPin className="w-5 h-5 text-khajur-gold mr-2" />
                      <h3 className="font-serif text-xl font-medium text-khajur-primary">Shipping Address</h3>
                    </div>
                    <div className="bg-white border border-khajur-border p-6">
                      <p className="text-sm text-khajur-dark">{selectedOrder.shipping_address.address}</p>
                      <p className="text-sm text-khajur-dark">
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Package className="w-5 h-5 text-khajur-gold mr-2" />
                      <h3 className="font-serif text-xl font-medium text-khajur-primary">Order Items</h3>
                    </div>
                    <div className="bg-white border border-khajur-border">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="p-6 border-b border-khajur-border last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-khajur-dark">{item.product_name}</p>
                              <p className="text-xs text-khajur-dark/60 mt-1">Quantity: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-khajur-gold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-khajur-cream p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-khajur-dark/70">Subtotal</span>
                        <span className="font-medium">₹{selectedOrder.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-khajur-dark/70">Delivery Charges</span>
                        <span className="font-medium">₹{selectedOrder.delivery_charges?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="border-t border-khajur-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-serif text-lg font-medium text-khajur-primary">Total</span>
                          <span className="font-serif text-xl font-bold text-khajur-gold">
                            ₹{(selectedOrder.total_amount + (selectedOrder.delivery_charges || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
