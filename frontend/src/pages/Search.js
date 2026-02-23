import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search as SearchIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const searchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20" data-testid="search-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <SearchIcon className="w-6 h-6 text-khajur-gold mr-3" />
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary">
              Search Results
            </h1>
          </div>
          {query && (
            <p className="font-sans text-base text-khajur-dark/70">
              Showing results for: <span className="font-medium text-khajur-primary">"{query}"</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-khajur-dark/60">Searching...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-khajur-dark/60 mb-8">{products.length} products found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="w-24 h-24 text-khajur-muted mx-auto mb-4" />
            <p className="text-khajur-dark/60 mb-4">No products found for "{query}"</p>
            <Link
              to="/products"
              className="text-khajur-primary hover:text-khajur-gold transition-colors"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
