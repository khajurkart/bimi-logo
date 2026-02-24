import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/account');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav className="bg-khajur-primary text-khajur-cream sticky top-0 z-50 shadow-md" data-testid="main-navbar">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
              <img 
                src="https://customer-assets.emergentagent.com/job_premium-spice-cart/artifacts/p1zf2opj_WhatsApp%20Image%202026-02-23%20at%204.12.54%20PM.jpeg" 
                alt="KhajurKart Logo" 
                className="h-16 w-auto"
              />
              <span className="font-serif text-2xl md:text-3xl font-bold text-khajur-gold">
                KhajurKart
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors" data-testid="nav-home">Home</Link>
              <Link to="/about" className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors" data-testid="nav-about">About Us</Link>
              <Link to="/products" className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors" data-testid="nav-products">Products</Link>
              <Link to="/contact" className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors" data-testid="nav-contact">Contact Us</Link>
              {user && (
                <Link to="/my-orders" className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors ml-12" data-testid="nav-orders">My Orders</Link>
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-khajur-primary/50 border border-khajur-gold/30 text-khajur-cream placeholder-khajur-cream/50 px-4 py-2 pr-10 rounded-sm focus:outline-none focus:border-khajur-gold transition-colors w-48"
                    data-testid="search-input"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" data-testid="search-button">
                    <Search className="w-5 h-5 text-khajur-gold" />
                  </button>
                </div>
              </form>

              {/* Account */}
              <button 
                onClick={handleAuthClick}
                className="hover:text-khajur-gold transition-colors relative"
                data-testid="account-button"
              >
                <User className="w-6 h-6" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="hover:text-khajur-gold transition-colors relative" data-testid="cart-button">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-khajur-gold text-khajur-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
                data-testid="mobile-menu-toggle"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-khajur-gold/20" data-testid="mobile-menu">
              <div className="flex flex-col space-y-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors">Home</Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors">About Us</Link>
                <Link to="/products" onClick={() => setIsMenuOpen(false)} className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors">Products</Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors">Contact Us</Link>
                {user && (
                  <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="font-sans text-sm uppercase tracking-widest hover:text-khajur-gold transition-colors">My Orders</Link>
                )}
                <form onSubmit={handleSearch} className="pt-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-khajur-primary/50 border border-khajur-gold/30 text-khajur-cream placeholder-khajur-cream/50 px-4 py-2 rounded-sm focus:outline-none focus:border-khajur-gold"
                  />
                </form>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
