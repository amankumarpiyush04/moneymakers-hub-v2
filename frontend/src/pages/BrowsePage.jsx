import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpen, ShoppingBag, Loader2, ArrowUpRight } from 'lucide-react';
import { productsAPI } from '../services/api';
import useCartStore from '../context/useCartStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'all', name: 'All Blueprints' },
  { id: 'finance', name: 'Finance & Money' },
  { id: 'crypto', name: 'Crypto & Web3' },
  { id: 'investing', name: 'Stock Market & Investing' },
  { id: 'business', name: 'Side Hustles & Business' },
  { id: 'marketing', name: 'Digital Marketing' },
  { id: 'mindset', name: 'Mindset & Psychology' },
];

export default function BrowsePage() {
  const { cat } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(cat || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const addItem = useCartStore(s => s.addItem);
  const hasItem = useCartStore(s => s.hasItem);

  useEffect(() => {
    setSelectedCategory(cat || 'all');
  }, [cat]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (search.trim()) params.search = search;
    
    productsAPI.getAll(params)
      .then(({ data }) => {
        let items = data.products || data || [];
        
        // Sort items locally if needed
        if (sortBy === 'price-low') {
          items.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          items.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'alpha') {
          items.sort((a, b) => a.title.localeCompare(b.title));
        }
        
        setProducts(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [selectedCategory, search, sortBy]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.title} added to your vault!`);
  };

  return (
    <div className="bg-black text-white min-h-screen py-16 animate-fade-in-up">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 border-b border-zinc-900 pb-8">
          <h1 className="text-4xl font-serif italic text-white mb-2">The Shelf</h1>
          <p className="text-zinc-500 text-xs tracking-wider uppercase font-sans">Tactical guides, blueprints, and frameworks to scale your mind, software, and capital.</p>
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search the shelf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 focus:border-amber-500/50 rounded py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-sans"
            />
          </div>

          <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:border-zinc-800 transition-colors"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs text-zinc-500 uppercase tracking-widest hidden sm:block whitespace-nowrap font-sans">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-amber-500/50 rounded py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white focus:outline-none transition-colors font-sans"
              >
                <option value="featured font-sans">Featured First</option>
                <option value="price-low font-sans">Price: Low to High</option>
                <option value="price-high font-sans">Price: High to Low</option>
                <option value="alpha font-sans">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="w-60 hidden md:block shrink-0">
            <div className="border border-zinc-900 p-5 rounded sticky top-24 space-y-4 bg-zinc-950/20">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 font-sans">Categories</h2>
              <div className="space-y-1">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all border ${
                      selectedCategory === category.id
                        ? 'bg-zinc-900/60 text-amber-500 border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-950'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Filter Sheet */}
          {mobileFiltersOpen && (
            <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
              <div className="w-80 bg-black p-6 h-full border-l border-zinc-900 shadow-xl overflow-y-auto animate-fade-in-up">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
                  <h3 className="text-sm font-bold uppercase tracking-widest font-sans text-white">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-zinc-550 hover:text-white text-lg">✕</button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-4 font-sans">Categories</h4>
                    <div className="space-y-1 font-sans">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setMobileFiltersOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all border ${
                            selectedCategory === category.id
                              ? 'bg-zinc-900/60 text-amber-500 border-zinc-800'
                              : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-zinc-900 rounded bg-zinc-950/10">
                <BookOpen size={32} className="mx-auto text-zinc-700 mb-4" />
                <h3 className="text-base font-serif italic text-zinc-300 mb-1">No blueprints found</h3>
                <p className="text-zinc-550 text-xs max-w-xs mx-auto leading-relaxed font-sans">
                  Try refining your search keyword or switching to a different category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/ebook/${product.slug}`}
                    className="group bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-900 hover:border-amber-500/30 rounded transition-all duration-300 flex flex-col h-full overflow-hidden animate-fade-in-up"
                  >
                    {/* Cover image */}
                    <div className="aspect-[4/5] bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-900 p-4">
                      {product.coverImage?.url ? (
                        <img
                          src={product.coverImage.url}
                          alt={product.title}
                          className="w-full h-full object-cover rounded shadow-lg transform group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black rounded border border-zinc-850 flex flex-col justify-between p-6 shadow-lg">
                          <BookOpen size={24} className="text-amber-500/70" />
                          <div>
                            <p className="text-[9px] text-amber-500/70 font-semibold uppercase tracking-widest mb-2 font-sans">{product.category}</p>
                            <h4 className="text-lg font-serif italic text-white line-clamp-2 leading-snug">{product.title}</h4>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book text details */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-sans">{product.category}</span>
                        <span className="text-[10px] text-zinc-550 font-sans">By {product.author || 'MoneyMakers'}</span>
                      </div>
                      <h3 className="text-base font-serif italic text-white group-hover:text-amber-500 transition-colors line-clamp-1 mb-2">
                        {product.title}
                      </h3>
                      <p className="text-zinc-455 text-xs line-clamp-2 mb-6 flex-1 font-light leading-relaxed font-sans">
                        {product.shortDescription || product.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-900/50">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-semibold text-white font-sans">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-zinc-600 line-through font-sans">₹{product.originalPrice}</span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={hasItem(product._id)}
                          className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                            hasItem(product._id)
                              ? 'bg-zinc-900 text-zinc-600 border border-zinc-900 cursor-not-allowed font-sans'
                              : 'bg-zinc-900 hover:bg-amber-600 hover:text-black text-amber-500 border border-zinc-800 hover:border-amber-600 font-sans'
                          }`}
                        >
                          <ShoppingBag size={12} />
                          {hasItem(product._id) ? 'In Vault' : 'Add to Vault'}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
