import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { useRazorpay } from 'react-razorpay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (formData.paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await handleCODOrder();
    }
  };

  const handleCODOrder = async () => {
    setLoading(true);
    try {
      const orderItems = cart.items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const shippingAddress = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      await axios.post(
        `${API}/orders`,
        {
          items: orderItems,
          total_amount: cartTotal,
          payment_method: 'cod',
          shipping_address: shippingAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/');
    } catch (error) {
      console.error('Order failed', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Create order items
      const orderItems = cart.items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const shippingAddress = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      // Create order in backend
      const orderResponse = await axios.post(
        `${API}/orders`,
        {
          items: orderItems,
          total_amount: cartTotal,
          payment_method: 'razorpay',
          shipping_address: shippingAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = orderResponse.data.order_id;

      // Create Razorpay order
      const razorpayOrderResponse = await axios.post(
        `${API}/razorpay/create-order`,
        {
          amount: cartTotal,
          currency: 'INR'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const razorpayOrder = razorpayOrderResponse.data;

      // Initialize Razorpay payment
      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: 'KhajurKart',
        description: 'Premium Dry Fruits & Spices',
        image: 'https://customer-assets.emergentagent.com/job_premium-spice-cart/artifacts/p1zf2opj_WhatsApp%20Image%202026-02-23%20at%204.12.54%20PM.jpeg',
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#0F3D2E'
        },
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(
              `${API}/razorpay/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Payment successful! Order confirmed.');
            await clearCart();
            navigate('/');
          } catch (error) {
            console.error('Payment verification failed', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay payment failed', error);
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-khajur-dark/60 mb-4">Please login to checkout</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20" data-testid="checkout-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary mb-12">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Shipping Information */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-khajur-border p-8">
                <h2 className="font-serif text-2xl font-medium text-khajur-primary mb-6">
                  Shipping Information
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-khajur-dark mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                        data-testid="checkout-fullname"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-khajur-dark mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                        data-testid="checkout-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-khajur-dark mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                      data-testid="checkout-phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-khajur-dark mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                      data-testid="checkout-address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-khajur-dark mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                        data-testid="checkout-city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-khajur-dark mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                        data-testid="checkout-state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-khajur-dark mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                        data-testid="checkout-pincode"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-8">
                  <h3 className="font-serif text-xl font-medium text-khajur-primary mb-4">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="text-khajur-primary focus:ring-khajur-gold"
                        data-testid="payment-cod"
                      />
                      <span className="text-khajur-dark">Cash on Delivery</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleInputChange}
                        className="text-khajur-primary focus:ring-khajur-gold"
                        data-testid="payment-razorpay"
                      />
                      <span className="text-khajur-dark">Pay Online (Razorpay)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-khajur-border p-8 sticky top-24" data-testid="checkout-summary">
                <h2 className="font-serif text-2xl font-medium text-khajur-primary mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span className="text-khajur-dark/70">
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        ₹{(item.product?.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-khajur-border pt-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="font-serif font-medium text-khajur-primary">Total</span>
                    <span className="font-serif text-2xl font-bold text-khajur-gold" data-testid="checkout-total">
                      ₹{cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="place-order-button"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
