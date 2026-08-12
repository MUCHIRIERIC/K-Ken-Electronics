'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Key, ChevronRight, ChevronLeft, ArrowLeft, 
  Sun, Moon, ShieldCheck, Truck, RefreshCw, Award, MessageCircle,
  Trash2, Plus, Minus, Search, Filter, X, Check
} from 'lucide-react';

export default function KenKenElectronics() {
  // ==========================================
  // 1. STATE MANAGEMENT & DUMMY DATA
  // ==========================================
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kenken_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kenken_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Admin Auth State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState(null);

  // Distance / Delivery Calculator State
  const [distanceKm, setDistanceKm] = useState(10);

  // Initial Product Data (Simulated backend data)
  const products = [
    {
      id: '1',
      title: 'Samsung 65" Neo QLED 4K Smart TV',
      category: 'Modern TVs',
      price: 125000,
      stockQuantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600',
      sideViewUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600',
      isFlashSale: true,
      description: 'Quantum Matrix Technology with Mini LEDs delivers stunning precision and color contrast.'
    },
    {
      id: '2',
      title: 'iPhone 15 Pro Max 256GB',
      category: 'Mobile Phones',
      price: 185000,
      stockQuantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
      sideViewUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
      isFlashSale: false,
      description: 'Forged in titanium, featuring the groundbreaking A17 Pro chip and customizable Action button.'
    },
    {
      id: '3',
      title: 'Sony HT-A9 7.1.4ch Home Theater System',
      category: 'Sub woofers',
      price: 95000,
      stockQuantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600',
      sideViewUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      isFlashSale: true,
      description: '360 Spatial Sound Mapping technology adapts to your room to create immersive soundscapes.'
    },
    {
      id: '4',
      title: 'LG C3 55" OLED evo 4K TV',
      category: 'Modern TVs',
      price: 140000,
      stockQuantity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=600',
      sideViewUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600',
      isFlashSale: false,
      description: 'Self-lit pixels deliver infinite contrast and 100% color fidelity.'
    },
    {
      id: '5',
      title: 'Google Pixel 8 Pro',
      category: 'Mobile Phones',
      price: 110000,
      stockQuantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600',
      sideViewUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
      isFlashSale: true,
      description: 'Engineered by Google, featuring the Tensor G3 chip and advanced AI photo editing tools.'
    },
    {
      id: '6',
      title: 'JBL PartyBox 310 Portable Subwoofer',
      category: 'Sub woofers',
      price: 68000,
      stockQuantity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600',
      sideViewUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      isFlashSale: false,
      description: '240W of powerful JBL Pro Sound with dynamic light show synced to the beat.'
    }
  ];

  // Featured items for the 5-second interval hero slider
  const featuredProducts = products.slice(0, 5);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('kenken_cart', JSON.stringify(cart));
  }, [cart]);

  // 5-Second Hero Carousel Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  // Handle Cart Operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  // Filter and Sort Products
  const filteredProducts = products
    .filter((p) => (isFlashSale ? p.isFlashSale : true))
    .filter((p) => (selectedCategory === 'All' ? true : p.category === selectedCategory));

  if (sortBy === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Calculate estimated delivery (Max 5 days)
  const calculateDeliveryDays = (km) => {
    const days = Math.min(5, Math.max(1, Math.ceil(km / 50)));
    return days;
  };

  // Handle Admin Login Simulation
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminEmail === 'muchirimunene031@gmail.com' && adminPassword === 'munene398') {
      setAdminToken('valid_jwt_token_sample');
      alert('Admin authentication successful!');
    } else {
      alert('Invalid admin credentials.');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isFlashSale ? 'bg-gray-50 text-gray-900' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* ==========================================
          NAVBAR & HEADER
      ========================================== */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${isFlashSale ? 'bg-white/80 border-gray-200' : 'bg-slate-900/80 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Container */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-12 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-cyan-500/20">
              KKE
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Ken Ken Electronics
              </h1>
              {/* Fast Typewriter Effect Tagline */}
              <p className="text-xs font-mono tracking-tight text-cyan-400 overflow-hidden whitespace-nowrap border-r-2 border-cyan-400 animate-typewriter">
                Next-Gen Electronics & Mobile Performance
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-6">
            
            {/* Flash Sale Toggle */}
            <button
              onClick={() => setIsFlashSale(!isFlashSale)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
                isFlashSale ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
              }`}
            >
              {isFlashSale ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isFlashSale ? 'Flash Sale Live' : 'Enable Flash Sale'}</span>
            </button>

            {/* Cart Icon with Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-slate-200"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-black font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Auth / Account Button */}
            {user ? (
              <span className="text-sm font-medium text-cyan-400">Hi, {user.name}</span>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="text-sm px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
              >
                Sign In
              </button>
            )}

            {/* Secret Admin Key Icon Trigger */}
            <div
              className="relative py-2 px-1"
              onMouseEnter={() => setIsKeyVisible(true)}
              onMouseLeave={() => setIsKeyVisible(false)}
            >
              <button
                onClick={() => setIsAdminOpen(true)}
                className={`p-2 rounded-lg transition-opacity duration-300 ${
                  isKeyVisible ? 'opacity-100 bg-slate-800 text-cyan-400' : 'opacity-0 cursor-default'
                }`}
                tabIndex={isKeyVisible ? 0 : -1}
              >
                <Key className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ==========================================
          HERO CAROUSEL (5-Second Intervals)
      ========================================== */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`rounded-2xl p-8 transition-all duration-700 ${isFlashSale ? 'bg-white shadow-xl border border-gray-200' : 'bg-slate-900 border border-slate-800'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Details Column */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                Featured Highlight
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {featuredProducts[currentSlide].title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {featuredProducts[currentSlide].description}
              </p>
              <div className="text-2xl font-bold text-cyan-400">
                KSh {featuredProducts[currentSlide].price.toLocaleString()}
              </div>
              <button
                onClick={() => addToCart(featuredProducts[currentSlide])}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition flex items-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add Featured To Cart</span>
              </button>
            </div>

            {/* Front & Side View Image Showcase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-center">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Front View</span>
                <div className="h-48 rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50 flex items-center justify-center p-2">
                  <img
                    src={featuredProducts[currentSlide].imageUrl}
                    alt="Front View"
                    className="h-full object-contain hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Side View</span>
                <div className="h-48 rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50 flex items-center justify-center p-2">
                  <img
                    src={featuredProducts[currentSlide].sideViewUrl}
                    alt="Side View"
                    className="h-full object-contain hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Slider Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {featuredProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === idx ? 'bg-cyan-400 w-8' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          CUSTOMER OF THE WEEK & REWARDS SECTION
      ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
          isFlashSale ? 'bg-amber-50 border-amber-200' : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-900/50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Recognition & Rewards</span>
              <h3 className="text-lg font-bold">Customer of the Week: Eric M.</h3>
              <p className="text-xs text-slate-400">Awarded a KSh 5,000 store voucher for top engagement & loyalty!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Next reward announcement in:</span>
            <span className="text-sm font-mono font-bold text-cyan-400">3 Days, 14 Hours</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          FILTER, SORT & PRODUCT GRID
      ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Modern TVs', 'Mobile Phones', 'Sub woofers'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : isFlashSale ? 'bg-gray-200 text-gray-800' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By Price */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-sm rounded-lg px-3 py-2 border outline-none ${
                isFlashSale ? 'bg-white border-gray-300 text-gray-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <option value="default">Sort by Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Responsive Grid: Desktop 4 Columns | Mobile 2 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.slice(0, visibleCount).map((product) => {
            const isLowStock = product.stockQuantity < 3;
            return (
              <div
                key={product.id}
                className={`group rounded-xl border overflow-hidden flex flex-col justify-between transition hover:border-cyan-500/50 ${
                  isFlashSale ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div 
                  className="cursor-pointer p-4"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Product Image & Badges */}
                  <div className="relative h-40 sm:h-48 rounded-lg overflow-hidden bg-slate-800/30 mb-3 flex items-center justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full object-contain group-hover:scale-105 transition duration-300"
                    />
                    {isLowStock && (
                      <span className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Low Stock ({product.stockQuantity} Left)
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-cyan-400 transition">
                    {product.title}
                  </h3>
                  
                  <div className="text-xs text-slate-400 mb-1">
                    Stock Left: <span className="font-bold text-slate-200">{product.stockQuantity}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <div className="text-base font-bold text-cyan-400 mb-3">
                    KSh {product.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 hover:border-cyan-500 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredProducts.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="px-6 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
            >
              Show More Products
            </button>
          </div>
        )}

      </main>

      {/* ==========================================
          ABOUT US SECTION
      ========================================== */}
      <section className={`py-16 border-t ${isFlashSale ? 'bg-gray-100 border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base">Genuine Products</h4>
              <p className="text-xs text-slate-400">100% authentic electronics sourced directly from certified global manufacturers.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base">Fast Dispatch</h4>
              <p className="text-xs text-slate-400">Prompt order handling with real-time distance-based delivery estimates.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base">Warranty Support</h4>
              <p className="text-xs text-slate-400">Dedicated customer care and technical support for all your electronics purchases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRODUCT DETAIL MODAL (With Back Navigation)
      ========================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 relative max-h-[90vh] overflow-y-auto ${
            isFlashSale ? 'bg-white text-gray-900 border-gray-200' : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}>
            
            {/* Back Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 mb-4 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to items</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-56 rounded-xl bg-slate-800/40 p-4 flex items-center justify-center">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="h-full object-contain" />
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-cyan-400 uppercase">{selectedProduct.category}</span>
                <h2 className="text-xl font-bold">{selectedProduct.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{selectedProduct.description}</p>

                <div className="text-xl font-bold text-cyan-400">
                  KSh {selectedProduct.price.toLocaleString()}
                </div>

                {/* Distance & Delivery Calculator */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Calculate Estimated Delivery Distance (KM):
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="250"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Distance: {distanceKm} KM</span>
                    <span className="font-bold text-cyan-400">
                      Est. Delivery: {calculateDeliveryDays(distanceKm)} Day(s) (Max 5)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      setIsAuthOpen(true);
                      return;
                    }
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition"
                >
                  {user ? 'Add to Cart' : 'Sign In Required to Purchase'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          SLIDE-OVER CART SIDEBAR
      ========================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className={`w-full max-w-md h-full p-6 flex flex-col justify-between ${
            isFlashSale ? 'bg-white text-gray-900' : 'bg-slate-900 text-slate-100'
          }`}>
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                  <span>Your Shopping Cart</span>
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Item List */}
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Your cart is currently empty.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40">
                      <div className="flex items-center space-x-3">
                        <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-contain rounded" />
                        <div>
                          <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
                          <span className="text-xs text-cyan-400 font-bold">
                            KSh {item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-300 ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex justify-between text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-cyan-400">
                  KSh {cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}
                </span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  if (!user) {
                    setIsCartOpen(false);
                    setIsAuthOpen(true);
                  } else {
                    alert('Order submitted successfully! We will contact you shortly.');
                    setCart([]);
                    setIsCartOpen(false);
                  }
                }}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition"
              >
                Proceed to Checkout
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          USER AUTH MODAL
      ========================================== */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Create Account / Sign In</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const name = formData.get('name');
                const newUser = { name };
                setUser(newUser);
                localStorage.setItem('kenken_user', JSON.stringify(newUser));
                setIsAuthOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input required name="name" type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input required type="email" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-cyan-500 text-slate-950 font-bold rounded text-sm mt-2">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN AUTH MODAL
      ========================================== */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button onClick={() => setIsAdminOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-6">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold">Protected Portal Access</h3>
            </div>

            {adminToken ? (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">
                  Authenticated as Admin
                </div>
                <button
                  onClick={() => setAdminToken(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded font-semibold"
                >
                  Sign Out of Admin Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Portal Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="name@domain.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-500 text-slate-950 font-bold rounded text-sm">
                  Authenticate Access
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          FLOATING WHATSAPP SUPPORT BUTTON
      ========================================== */}
      <a
        href="https://wa.me/254768450250"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-3.5 rounded-full shadow-2xl transition duration-300 flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          Chat with Support
        </span>
      </a>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className={`border-t py-12 ${isFlashSale ? 'bg-white border-gray-200 text-gray-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          
          <div className="space-y-2">
            <h5 className="font-bold text-sm text-slate-200">Ken Ken Electronics</h5>
            <p className="leading-relaxed">
              Your trusted partner for modern TVs, premium mobile phones, and powerful audio sound systems.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-sm text-slate-200">Contact Details</h5>
            <p>Direct Phone: +254 768 450 250</p>
            <p>WhatsApp Support: 0768450250</p>
            <p>Customer Service Hours: 8:00 AM - 8:00 PM</p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-sm text-slate-200">Delivery Information</h5>
            <p>Maximum delivery timeframe: 5 Days based on distance.</p>
            <p>© {new Date().getFullYear()} Ken Ken Electronics. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
