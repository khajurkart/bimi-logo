import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Heart, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    setTimeout(() => {
      window.location.href = '/cart';
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-khajur-dark/60">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-khajur-dark/60 mb-4">Product not found</p>
        <Link to="/products" className="text-khajur-primary hover:text-khajur-gold">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          to="/products"
          className="inline-flex items-center text-khajur-primary hover:text-khajur-gold mb-8 transition-colors"
          data-testid="back-to-products"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white p-8">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-contain"
              data-testid="product-detail-image"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary mb-4" data-testid="product-detail-name">
              {product.name}
            </h1>
            <p className="font-serif text-3xl text-khajur-gold font-bold mb-6" data-testid="product-detail-price">
              ₹{product.price.toFixed(2)}
            </p>
            <p className="text-sm text-khajur-muted mb-2">Weight: {product.weight}</p>
            <p className="text-sm text-khajur-muted mb-8">
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>

            <div className="mb-8">
              <h3 className="font-serif text-xl font-medium text-khajur-primary mb-3">Description</h3>
              <p className="font-sans text-base text-khajur-dark/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block font-serif text-lg font-medium text-khajur-primary mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-khajur-cream hover:bg-khajur-accent text-khajur-primary px-4 py-2 rounded-sm transition-colors"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center" data-testid="product-quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="bg-khajur-cream hover:bg-khajur-accent text-khajur-primary px-4 py-2 rounded-sm transition-colors"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-khajur-primary text-khajur-cream hover:bg-khajur-primary/90 rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all border border-transparent hover:border-khajur-gold disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="add-to-cart-detail"
              >
                <ShoppingCart className="inline w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="buy-now-button"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
