import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Lock, BookOpen } from 'lucide-react';
import useCartStore from '../context/useCartStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const isOpen = useCartStore(s => s.cartOpen);
  const setCartOpen = useCartStore(s => s.setCartOpen);
  const onClose = () => setCartOpen(false);

  const { items, removeItem, total, count } = useCartStore();

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}>
      {/* Blurred Backdrop overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Sliding Panel */}
        <div className={`w-screen max-w-md bg-black border-l border-zinc-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <h2 className="text-xl font-bold font-sora text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-amber-500" /> Your Vault
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {count() === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500">
                  <ShoppingBag size={32} />
                </div>
                <h3 className="text-lg font-bold font-sora text-zinc-300">The vault is empty</h3>
                <p className="text-zinc-500 text-xs max-w-[240px]">
                  Add some ebook guides to start building your wealth catalog.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/browse');
                  }}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors uppercase tracking-wider"
                >
                  Browse the catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex items-center gap-4 hover:border-zinc-800 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 aspect-[4/5] bg-gradient-to-br from-zinc-900 to-black border border-zinc-805 rounded overflow-hidden shrink-0 flex items-center justify-center p-1.5 relative">
                    {item.coverImage?.url ? (
                      <img src={item.coverImage.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={14} className="text-amber-500" />
                    )}
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-100 truncate mb-0.5">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500">By {item.author}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-200">₹{item.price}</span>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {count() > 0 && (
            <div className="border-t border-zinc-900 p-6 bg-zinc-950/40 space-y-6">
              <div className="space-y-2.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-205">₹{total()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Handling Fee</span>
                  <span className="font-bold text-emerald-450 uppercase text-[10px]">Free</span>
                </div>
                <hr className="border-zinc-900 my-2" />
                <div className="flex justify-between items-center text-white font-bold text-sm">
                  <span>Total due</span>
                  <span className="text-lg font-sora text-amber-500">₹{total()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full bg-amber-600 hover:bg-amber-550 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1 text-[9px] text-zinc-550 uppercase tracking-widest font-semibold">
                <Lock size={10} className="text-amber-500" /> SECURE SSL ENCRYPTED
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
