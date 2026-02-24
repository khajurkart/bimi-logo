import { login, getProducts, getCategories } from "../api";import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `${API}/products?category=${selectedCategory}`
        : `${API}/products`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary mb-4">
            Our Products
          </h1>
          <p className="font-sans text-base text-khajur-dark/70 max-w-2xl">
            Explore our premium collection of dates, nuts, dry fruits, and spices
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-12" data-testid="category-filter">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-khajur-gold mr-2" />
            <h3 className="font-serif text-xl font-medium text-khajur-primary">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-2 rounded-sm uppercase tracking-widest text-xs font-bold transition-all ${
                selectedCategory === ''
                  ? 'bg-khajur-primary text-khajur-cream'
                  : 'bg-transparent border border-khajur-primary text-khajur-primary hover:bg-khajur-primary hover:text-khajur-cream'
              }`}
              data-testid="category-all"
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-6 py-2 rounded-sm uppercase tracking-widest text-xs font-bold transition-all ${
                  selectedCategory === category.slug
                    ? 'bg-khajur-primary text-khajur-cream'
                    : 'bg-transparent border border-khajur-primary text-khajur-primary hover:bg-khajur-primary hover:text-khajur-cream'
                }`}
                data-testid={`category-${category.slug}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-khajur-dark/60">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-khajur-dark/60">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
