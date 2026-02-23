import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
import { ChevronRight, Award, Truck, Shield, CreditCard, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products?featured=true`)
      ]);
      setCategories(categoriesRes.data);
      setFeaturedProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const heroSliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    cssEase: 'ease-in-out'
  };

  const heroImages = [
    {
      url: 'https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/9ef22138b1ac284627d8ada276fc5bfcc8c70f752587e055521011939341415b.png',
      title: 'Premium Dates Collection',
      subtitle: 'Discover the finest dates from around the world'
    },
    {
      url: 'https://static.prod-images.emergentagent.com/jobs/1488ece7-7b71-4c89-a940-ced66486fd5e/images/d0209b13fd7a6d1c6476d2f8679946333984b9966f56d36444d5f94197d0170f.png',
      title: 'Luxury Nuts Selection',
      subtitle: 'Handpicked nuts for your health and delight'
    },
    {
      url: 'https://images.pexels.com/photos/33654800/pexels-photo-33654800.jpeg',
      title: 'Exotic Spices',
      subtitle: 'Authentic spices for authentic flavors'
    }
  ];

  const statusFeatures = [
    { icon: Award, title: 'Premium Quality', description: 'Only the finest selection' },
    { icon: Truck, title: 'Fast Delivery', description: 'Quick and secure shipping' },
    { icon: Shield, title: 'Trusted Products', description: '100% authentic guarantee' },
    { icon: CreditCard, title: 'Secure Payment', description: 'Safe transaction methods' }
  ];

  const reviews = [
    {
      name: 'Fatima Hassan',
      image: 'https://i.pravatar.cc/150?img=47',
      rating: 5,
      text: 'The quality of dates and nuts is exceptional. Best premium dry fruits I have purchased online!'
    },
    {
      name: 'Mohammed Abdullah',
      image: 'https://i.pravatar.cc/150?img=12',
      rating: 5,
      text: 'Fresh products, beautiful packaging, and timely delivery. KhajurKart is my go-to store now.'
    },
    {
      name: 'Aisha Rahman',
      image: 'https://i.pravatar.cc/150?img=45',
      rating: 5,
      text: 'Ordered the stuffed dates for Ramadan. Everyone loved them! Excellent quality and taste.'
    }
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Slider */}
      <section className="relative" data-testid="hero-slider">
        <Slider {...heroSliderSettings}>
          {heroImages.map((slide, index) => (
            <div key={index} className="relative">
              <div className="relative h-[500px] md:h-[700px]">
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-khajur-primary/80 to-khajur-primary/40" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                    <div className="max-w-2xl">
                      <h1 className="font-serif text-5xl md:text-7xl font-medium text-khajur-cream mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="font-sans text-lg md:text-xl text-khajur-cream/80 mb-8 leading-relaxed">
                        {slide.subtitle}
                      </p>
                      <Link
                        to="/products"
                        className="inline-flex items-center bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all"
                        data-testid="hero-shop-now-button"
                      >
                        Shop Now
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Categories Grid */}
      <section className="py-20 md:py-32" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-khajur-primary mb-4">
              Explore Our Collections
            </h2>
            <p className="font-sans text-base text-khajur-dark/70 max-w-2xl mx-auto">
              Discover premium categories of dates, nuts, dry fruits, and exotic spices
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group relative overflow-hidden"
                data-testid={`category-card-${category.slug}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-khajur-primary/90 to-khajur-primary/20 flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="font-serif text-2xl font-medium text-khajur-cream mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-khajur-cream/80">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 bg-white" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-khajur-primary mb-4">
              Featured Products
            </h2>
            <p className="font-sans text-base text-khajur-dark/70 max-w-2xl mx-auto">
              Handpicked premium selection for discerning customers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center bg-khajur-primary text-khajur-cream hover:bg-khajur-primary/90 rounded-sm px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all border border-transparent hover:border-khajur-gold"
              data-testid="view-all-products-button"
            >
              View All Products
              <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-20 md:py-32" data-testid="status-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statusFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 border border-khajur-primary/10 bg-khajur-cream hover:bg-white transition-colors duration-300 text-center"
                  data-testid={`status-feature-${index}`}
                >
                  <Icon className="w-12 h-12 text-khajur-gold mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-medium text-khajur-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-khajur-dark/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 md:py-32 bg-white" data-testid="reviews-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-khajur-primary mb-4">
              What Our Customers Say
            </h2>
            <p className="font-sans text-base text-khajur-dark/70 max-w-2xl mx-auto">
              Trusted by thousands of satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-khajur-cream p-8 border border-khajur-border"
                data-testid={`review-${index}`}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-serif text-lg font-medium text-khajur-primary">{review.name}</h4>
                    <div className="flex space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-khajur-gold text-khajur-gold" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-accent text-base italic text-khajur-dark/80 leading-relaxed">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
