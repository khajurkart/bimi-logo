import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white border border-transparent hover:border-khajur-gold/30 transition-all duration-500 overflow-hidden" data-testid={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-khajur-cream">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-xl font-medium text-khajur-primary mb-2 group-hover:text-khajur-gold transition-colors" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-khajur-dark/60 mb-3 line-clamp-2">{product.description}</p>
        <p className="text-xs text-khajur-muted mb-4">{product.weight}</p>
        
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl text-khajur-gold font-bold" data-testid={`product-price-${product.id}`}>
            ₹{product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addToCart(product.id)}
            className="bg-khajur-primary text-khajur-cream hover:bg-khajur-gold hover:text-khajur-primary p-3 rounded-sm transition-all duration-300"
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
