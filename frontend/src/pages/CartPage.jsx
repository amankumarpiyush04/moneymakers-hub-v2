import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Lock, BookOpen } from 'lucide-react';
import useCartStore from '../context/useCartStore';

export default function CartPage() {
  const { items, removeItem, total, count } = useCartStore();

  if (count() === 0) {
    return (
      <div className="bg-gray-950 text-white min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="p-6 bg-gray-900 border border-gray-850 rounded-full text-emerald-450 mb-6 animate-bounce">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold font-sora mb-3">Your shopping cart is empty</h2>
        <p className="text-gray-400 text-sm max-w-sm text-center mb-8">
          Looks like you haven't added any ebooks to your cart yet. Explore our guides to start leveling up.
        </p>
        <Link
          to="/browse"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-555 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-950/40"
        >
          Browse Ebooks
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold font-sora mb-10 text-center md:text-left flex items-center gap-3">
          <ShoppingBag className="text-emerald-500" /> Your Shopping Cart ({count()})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900/40 border border-gray-850 p-4 sm:p-5 rounded-2xl flex items-center gap-4 sm:gap-6 hover:border-gray-750 transition-colors"
              >
                {/* Book Thumbnail */}
                <div className="w-16 sm:w-20 aspect-[4/5] bg-gradient-to-br from-emerald-950/30 to-gray-955 border border-gray-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
                  {item.coverImage?.url ? (
                    <img
                      src={item.coverImage.url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col justify-between h-full w-full">
                      <BookOpen size={16} className="text-emerald-500" />
                      <span className="text-[6px] font-bold text-gray-500 line-clamp-1">{item.title}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest block mb-1">
                    {item.category}
                  </span>
                  <Link
                    to={`/ebook/${item.slug}`}
                    className="text-base font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1 mb-1 font-sora block"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-gray-500">By {item.author}</p>
                </div>

                {/* Price and Delete action */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold text-white">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="block text-[10px] text-gray-500 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 bg-gray-900 border border-gray-850 p-6 rounded-2xl">
            <h2 className="text-lg font-bold font-sora mb-6">Order Summary</h2>

            <div className="space-y-4 border-b border-gray-800 pb-6 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal ({count()} {count() === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-white">₹{total()}</span>
              </div>
              <div className="flex justify-between">
                <span>Internet Handling Fee</span>
                <span className="font-semibold text-emerald-450 uppercase text-xs">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST</span>
                <span className="font-semibold text-emerald-450 uppercase text-xs">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-6">
              <span className="font-bold text-white text-base">Total Amount</span>
              <span className="font-bold text-white text-2xl font-sora">₹{total()}</span>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-emerald-650 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-xxs text-gray-500 mt-6 uppercase tracking-wider font-semibold">
              <Lock size={12} className="text-emerald-500" /> 256-Bit SSL Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
