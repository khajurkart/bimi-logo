import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-khajur-primary text-khajur-cream" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_premium-spice-cart/artifacts/p1zf2opj_WhatsApp%20Image%202026-02-23%20at%204.12.54%20PM.jpeg" 
                alt="KhajurKart Logo" 
                className="h-12 w-auto"
              />
              <span className="font-serif text-xl font-bold text-khajur-gold">
                KhajurKart
              </span>
            </Link>
            <p className="text-sm text-khajur-cream/70 leading-relaxed">
              Premium destination for the world's finest dates, dry fruits, and spices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-medium text-khajur-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-khajur-gold transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm hover:text-khajur-gold transition-colors">About Us</Link></li>
              <li><Link to="/products" className="text-sm hover:text-khajur-gold transition-colors">Products</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-khajur-gold transition-colors">Contact Us</Link></li>
              <li><Link to="/returns" className="text-sm hover:text-khajur-gold transition-colors">Returns & Exchange</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-lg font-medium text-khajur-gold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=dates" className="text-sm hover:text-khajur-gold transition-colors">Dates</Link></li>
              <li><Link to="/products?category=nuts" className="text-sm hover:text-khajur-gold transition-colors">Nuts</Link></li>
              <li><Link to="/products?category=dry-fruits" className="text-sm hover:text-khajur-gold transition-colors">Dry Fruits</Link></li>
              <li><Link to="/products?category=spices" className="text-sm hover:text-khajur-gold transition-colors">Spices</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-medium text-khajur-gold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-khajur-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm">7981002137</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-khajur-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm">khajurkart@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-khajur-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  10-3-313/a, AR Raheem Residency<br />
                  beside gove IASE college,<br />
                  Potti Sriramulu Nagar,<br />
                  Vijaya Nagar Colony,<br />
                  Hyderabad, Telangana 500057
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-khajur-gold/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-khajur-cream/70 mb-4 md:mb-0">
            © 2026 KhajurKart. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-khajur-cream hover:text-khajur-gold transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-khajur-cream hover:text-khajur-gold transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-khajur-cream hover:text-khajur-gold transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
