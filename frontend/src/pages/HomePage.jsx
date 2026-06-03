import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ShoppingBag, Sparkles, Star, ArrowUpRight } from 'lucide-react';
import { productsAPI } from '../services/api';
import useCartStore from '../context/useCartStore';
import toast from 'react-hot-toast';
import classicBg from '../assets/classic-bg.png';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const addItem = useCartStore(s => s.addItem);
  const hasItem = useCartStore(s => s.hasItem);

  useEffect(() => {
    productsAPI.getAll()
      .then(({ data }) => {
        const prodList = data.products || data || [];
        setProducts(prodList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.title} added to your vault!`);
  };

  // Extract unique categories dynamically
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtered products for active tab
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  // New arrivals (3 most recently created)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div 
      className="text-white min-h-screen"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.95) 85%, #000000 100%), url(${classicBg}?v=2)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-28 pb-24 md:pt-40 md:pb-32 border-b border-zinc-900/60 overflow-hidden">
        {/* Subtle top glow overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] font-medium text-amber-500 uppercase font-mono animate-fade-in">
              <Sparkles size={10} /> The Digital Vault
            </span>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic font-normal tracking-tight text-white leading-[1.15] animate-slide-up [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
              A quiet shelf for <br />
              <span className="text-amber-500 font-normal">restless builders</span>.
            </h1>
            
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light font-sans animate-slide-up [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
              Tactical guides, blueprints, and frameworks to scale your mind, software, and capital. Deliberately brief. Hard-earned in the field.
            </p>
            
            <div className="pt-4 flex flex-wrap justify-center gap-4 animate-slide-up [animation-delay:450ms] opacity-0 [animation-fill-mode:forwards]">
              <Link
                to="/browse"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-550 text-black font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center gap-2 font-mono"
              >
                Browse the Shelf <ArrowRight size={14} />
              </Link>
              <a
                href="#manifesto"
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-300 font-medium text-xs uppercase tracking-wider rounded transition-colors font-mono"
              >
                Read Manifesto
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto / Storytelling Section */}
      <section id="manifesto" className="py-24 border-b border-zinc-900/60 bg-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-[10px] tracking-[0.25em] text-amber-500 uppercase font-medium font-mono">
                Our Philosophy
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif italic text-white leading-tight">
                Slow, deliberate, <br />
                <span className="text-zinc-400 font-normal">unhurried.</span>
              </h2>
              <div className="w-12 h-[1px] bg-amber-500/30" />
            </div>
            <div className="space-y-6 text-zinc-450 text-sm md:text-base leading-relaxed font-light font-sans">
              <p>
                We do not publish high-volume junk, AI-generated filler, or clickbait courses. Each document in the Vault is the result of months of synthesis and execution.
              </p>
              <p>
                We build books like physical printing presses used to: carefully typeset, structured to save you hundreds of hours of trial and error, and formatted for immediate utility.
              </p>
              <p className="font-serif italic text-zinc-200 text-lg">
                "Read less. Execute more. Build something that outlasts the noise."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Catalog Section */}
      <section className="py-24 border-b border-zinc-900/60 bg-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[9px] tracking-[0.25em] text-amber-500 uppercase font-mono font-semibold block mb-2">Curated Blueprints</span>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-white">Browse the Catalog</h2>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center border-b border-zinc-900 mb-12 overflow-x-auto scrollbar-none py-1">
            <div className="flex gap-8 px-4 font-mono">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`pb-4 text-[10px] font-medium uppercase tracking-widest transition-all relative ${
                    activeCategory === cat ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 transition-all duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid with Animations */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-zinc-950/20 border border-zinc-900 rounded aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-zinc-500 text-center py-12 text-xs font-mono">No ebooks available in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Link
                  key={`${product._id}-${activeCategory}`}
                  to={`/ebook/${product.slug}`}
                  className="group bg-black/40 hover:bg-black/60 border border-zinc-900/80 hover:border-amber-500/20 rounded transition-all duration-300 flex flex-col h-full overflow-hidden animate-fade-in-up"
                >
                  {/* Image Container */}
                  <div className="aspect-[4/5] bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-900/60 p-4">
                    {product.coverImage?.url ? (
                      <img
                        src={product.coverImage.url}
                        alt={product.title}
                        className="w-full h-full object-cover rounded shadow-md transform group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black rounded border border-zinc-900 flex flex-col justify-between p-6 shadow-md">
                        <BookOpen size={20} className="text-amber-500/50" />
                        <div>
                          <p className="text-[9px] text-amber-500/50 font-semibold uppercase tracking-widest mb-2 font-mono">{product.category}</p>
                          <h4 className="text-lg font-serif italic text-white line-clamp-2 leading-snug">{product.title}</h4>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">{product.category}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">By {product.author || 'MoneyMakers'}</span>
                    </div>
                    <h3 className="text-base font-serif italic text-white group-hover:text-amber-500 transition-colors line-clamp-1 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 mb-6 flex-1 font-light leading-relaxed font-sans">
                      {product.shortDescription || product.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-900/60">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-semibold text-white font-mono">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-zinc-600 line-through font-mono">₹{product.originalPrice}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={hasItem(product._id)}
                        className={`px-3 py-1.5 rounded text-[9px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-1.5 font-mono ${
                          hasItem(product._id)
                            ? 'bg-zinc-900/60 text-zinc-550 border border-zinc-900 cursor-not-allowed'
                            : 'bg-zinc-950 hover:bg-amber-600 hover:text-black text-amber-500 border border-zinc-800 hover:border-amber-600'
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
      </section>

      {/* New Arrivals Section */}
      <section className="py-24 bg-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <span className="text-[9px] text-amber-500 tracking-[0.25em] font-semibold uppercase block mb-2 font-mono">Fresh Off the Press</span>
              <h2 className="text-3xl font-serif italic text-white">New on the shelves</h2>
            </div>
            <Link to="/browse" className="text-zinc-400 hover:text-amber-500 text-[10px] font-semibold uppercase tracking-widest transition-colors flex items-center gap-1.5 group font-mono">
              View Entire Shelf <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-zinc-950/20 border border-zinc-900 rounded aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <p className="text-zinc-500 text-center py-12 text-xs font-mono">No new arrivals available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {newArrivals.map((product) => (
                <Link
                  key={product._id}
                  to={`/ebook/${product.slug}`}
                  className="group bg-black/40 hover:bg-black/60 border border-zinc-900/80 hover:border-amber-500/20 rounded transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  {/* Image container */}
                  <div className="aspect-[4/5] bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-zinc-900/60 p-4">
                    {product.coverImage?.url ? (
                      <img
                        src={product.coverImage.url}
                        alt={product.title}
                        className="w-full h-full object-cover rounded shadow-md transform group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black rounded border border-zinc-900 flex flex-col justify-between p-6 shadow-md">
                        <BookOpen size={20} className="text-amber-500/50" />
                        <div>
                          <p className="text-[9px] text-amber-500/50 font-semibold uppercase tracking-widest mb-2 font-mono">{product.category}</p>
                          <h4 className="text-lg font-serif italic text-white line-clamp-2 leading-snug">{product.title}</h4>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">{product.category}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">By {product.author || 'MoneyMakers'}</span>
                    </div>
                    <h3 className="text-base font-serif italic text-white group-hover:text-amber-500 transition-colors line-clamp-1 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 mb-6 flex-1 font-light leading-relaxed font-sans">
                      {product.shortDescription || product.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-900/60">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-semibold text-white font-mono">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-zinc-600 line-through font-mono">₹{product.originalPrice}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={hasItem(product._id)}
                        className={`px-3 py-1.5 rounded text-[9px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-1.5 font-mono ${
                          hasItem(product._id)
                            ? 'bg-zinc-900/60 text-zinc-555 border border-zinc-900 cursor-not-allowed'
                            : 'bg-zinc-950 hover:bg-amber-600 hover:text-black text-amber-500 border border-zinc-800 hover:border-amber-600'
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
      </section>

      {/* Newsletter Section */}
      <section className="py-24 border-t border-zinc-900 bg-black/60 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <span className="text-[10px] tracking-[0.25em] text-amber-500 uppercase font-mono font-semibold">Stay Dispatched</span>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-white">Subscribe to the Shelf</h2>
          <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-sans font-light">
            Receive curated updates on new ebook releases, tactical frameworks, and business blueprints. Brief and unhurried.
          </p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              if (email) {
                toast.success(`Subscribed successfully with ${email}!`);
                e.target.reset();
              }
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              className="flex-1 bg-zinc-950/80 border border-zinc-900 focus:border-amber-500/50 rounded px-4 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none transition-colors font-mono"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-550 text-black font-bold text-xs uppercase tracking-widest rounded transition-colors font-mono"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
