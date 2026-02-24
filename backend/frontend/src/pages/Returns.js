import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ChevronLeft, Package, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Returns = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    requestType: 'return',
    reason: '',
    selectedItems: []
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [returnsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/returns`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setReturns(returnsRes.data);
      // Only show delivered orders
      const deliveredOrders = ordersRes.data.filter(o => o.status === 'delivered');
      setOrders(deliveredOrders);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = (order) => {
    setSelectedOrder(order);
    setFormData({
      requestType: 'return',
      reason: '',
      selectedItems: order.items.map(item => ({ ...item, selected: true }))
    });
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    const selectedItems = formData.selectedItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      await axios.post(
        `${API}/returns`,
        {
          order_id: selectedOrder.id,
          items: selectedItems.map(({ selected, ...item }) => item),
          reason: formData.reason,
          request_type: formData.requestType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${formData.requestType === 'return' ? 'Return' : 'Exchange'} request submitted successfully`);
      setShowRequestForm(false);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-khajur-cream flex items-center justify-center">
        <p className="text-khajur-dark/60">Redirecting to login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-khajur-cream flex items-center justify-center">
        <p className="text-khajur-dark/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-khajur-cream py-8" data-testid="returns-page">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to="/account"
              className="mr-4 text-khajur-primary hover:text-khajur-gold"
              data-testid="back-to-account"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl font-serif font-bold text-khajur-primary">Return & Exchange</h1>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-sm p-4 mb-8 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Return & Exchange Policy:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Returns/Exchanges accepted within 7 days of delivery</li>
              <li>Products must be unused and in original packaging</li>
              <li>Refund processed within 5-7 business days after approval</li>
            </ul>
          </div>
        </div>

        {/* Existing Requests */}
        {returns.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-khajur-primary mb-6">My Requests</h2>
            <div className="space-y-4">
              {returns.map((returnReq) => (
                <div key={returnReq.id} className="bg-white border-2 border-khajur-primary/20 rounded-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-khajur-dark/60">
                          Request #{returnReq.id.substring(0, 12)}...
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-sm border ${getStatusColor(returnReq.status)}`}>
                          {returnReq.status.toUpperCase()}
                        </span>
                        <span className="text-xs px-3 py-1 bg-khajur-primary/10 text-khajur-primary rounded-sm uppercase font-bold">
                          {returnReq.request_type}
                        </span>
                      </div>
                      <p className="text-sm text-khajur-dark/60">
                        Order: {returnReq.order_id.substring(0, 12)}... | Created: {new Date(returnReq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-khajur-border pt-4">
                    <p className="text-sm text-khajur-dark/80 mb-2">
                      <span className="font-medium">Reason:</span> {returnReq.reason}
                    </p>
                    <p className="text-sm text-khajur-dark/80">
                      <span className="font-medium">Items:</span> {returnReq.items.length} item(s)
                    </p>
                    {returnReq.admin_notes && (
                      <div className="mt-3 bg-khajur-cream p-3 rounded-sm">
                        <p className="text-sm text-khajur-dark/80">
                          <span className="font-medium">Admin Note:</span> {returnReq.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Request */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-khajur-primary mb-6">
            {orders.length > 0 ? 'Create New Request' : 'No Delivered Orders'}
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white border-2 border-khajur-primary/20 rounded-sm p-12 text-center">
              <Package className="w-24 h-24 text-khajur-muted mx-auto mb-4" />
              <h3 className="text-xl font-serif font-medium text-khajur-primary mb-2">
                No orders available for return/exchange
              </h3>
              <p className="text-khajur-dark/60 mb-6">
                You can only return or exchange delivered orders
              </p>
              <Link
                to="/products"
                className="inline-block bg-khajur-gold hover:bg-khajur-gold/90 text-khajur-primary px-8 py-3 rounded-sm uppercase tracking-wider font-bold transition-all"
              >
                Shop Now
              </Link>
            </div>
          ) : !showRequestForm ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const hasReturnRequest = returns.some(r => r.order_id === order.id);
                return (
                  <div key={order.id} className="bg-white border-2 border-khajur-primary/20 rounded-sm p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-khajur-primary">
                          Order #{order.id.substring(0, 12)}...
                        </p>
                        <p className="text-sm text-khajur-dark/60">
                          {order.items.length} items | ₹{order.total_amount.toFixed(2)} | {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {hasReturnRequest ? (
                        <span className="text-sm text-khajur-dark/60 italic">Request already submitted</span>
                      ) : (
                        <button
                          onClick={() => handleCreateRequest(order)}
                          className="bg-khajur-gold hover:bg-khajur-gold/90 text-khajur-primary px-6 py-2 rounded-sm uppercase tracking-wider text-sm font-bold transition-all flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Request Return/Exchange</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="bg-white border-2 border-khajur-primary/20 rounded-sm p-8">
              <h3 className="text-xl font-serif font-bold text-khajur-primary mb-6">
                Return/Exchange Request for Order #{selectedOrder.id.substring(0, 12)}...
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-khajur-primary mb-3">Request Type *</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="return"
                        checked={formData.requestType === 'return'}
                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                        className="text-khajur-primary focus:ring-khajur-gold mr-2"
                      />
                      <span className="text-khajur-dark">Return (Refund)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="exchange"
                        checked={formData.requestType === 'exchange'}
                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                        className="text-khajur-primary focus:ring-khajur-gold mr-2"
                      />
                      <span className="text-khajur-dark">Exchange</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-khajur-primary mb-3">Select Items *</label>
                  <div className="space-y-2">
                    {formData.selectedItems.map((item, index) => (
                      <label key={index} className="flex items-center space-x-3 p-3 bg-khajur-cream rounded-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => {
                            const updated = [...formData.selectedItems];
                            updated[index].selected = e.target.checked;
                            setFormData({ ...formData, selectedItems: updated });
                          }}
                          className="text-khajur-primary focus:ring-khajur-gold"
                        />
                        <span className="text-khajur-dark">
                          {item.product_name} (Qty: {item.quantity}) - ₹{item.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-khajur-primary mb-2">Reason *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Please describe why you want to return/exchange this order..."
                    className="w-full bg-khajur-cream border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-khajur-gold hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] text-khajur-primary px-6 py-4 rounded-sm uppercase tracking-wider font-bold transition-all"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-transparent border-2 border-khajur-primary text-khajur-primary hover:bg-khajur-primary hover:text-khajur-cream px-6 py-4 rounded-sm uppercase tracking-wider font-bold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Returns;
