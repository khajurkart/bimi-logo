import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, cartTotal, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItem(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to checkout');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-khajur-dark/60">Loading cart...</p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20" data-testid="empty-cart">
        <ShoppingBag className="w-24 h-24 text-khajur-muted mb-4" />
        <h2 className="font-serif text-3xl font-medium text-khajur-primary mb-4">
          Your cart is empty
        </h2>
        <p className="text-khajur-dark/60 mb-8">Add some products to get started</p>
        <Link
          to="/products"
          className="bg-khajur-primary text-khajur-cream hover:bg-khajur-primary/90 rounded-sm px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all border border-transparent hover:border-khajur-gold"
          data-testid="continue-shopping-empty"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary mb-12">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item.product_id}
                  className="bg-white border border-khajur-border p-6 flex flex-col sm:flex-row gap-6"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full sm:w-32 h-32 object-cover"
                  />
                  
                  <div className="flex-1">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-serif text-xl font-medium text-khajur-primary hover:text-khajur-gold transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-khajur-muted mb-3">{product.weight}</p>
                    <p className="font-serif text-xl text-khajur-gold font-bold" data-testid={`cart-item-price-${item.product_id}`}>
                      ₹{product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                        className="bg-khajur-cream hover:bg-khajur-accent text-khajur-primary w-8 h-8 rounded-sm transition-colors flex items-center justify-center"
                        data-testid={`decrease-cart-quantity-${item.product_id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-medium w-8 text-center" data-testid={`cart-item-quantity-${item.product_id}`}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                        className="bg-khajur-cream hover:bg-khajur-accent text-khajur-primary w-8 h-8 rounded-sm transition-colors flex items-center justify-center"
                        data-testid={`increase-cart-quantity-${item.product_id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      data-testid={`remove-cart-item-${item.product_id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-khajur-border p-8 sticky top-24" data-testid="order-summary">
              <h2 className="font-serif text-2xl font-medium text-khajur-primary mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-khajur-dark/70">Subtotal</span>
                  <span className="font-medium" data-testid="cart-subtotal">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-khajur-dark/70">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t border-khajur-border pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-serif font-medium text-khajur-primary">Total</span>
                    <span className="font-serif text-2xl font-bold text-khajur-gold" data-testid="cart-total">
                      ₹{cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all mb-4"
                data-testid="proceed-to-checkout"
              >
                Proceed to Checkout
              </button>
              
              <Link
                to="/products"
                className="block text-center text-khajur-primary hover:text-khajur-gold transition-colors text-sm"
                data-testid="continue-shopping"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
