import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, BookOpen, Download, Loader2 } from 'lucide-react';
import { usersAPI } from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getOrders()
      .then(({ data }) => {
        const found = data.orders.find(o => o._id === id);
        if (found) {
          setOrder(found);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-gray-950 text-white min-h-screen">
        <Loader2 className="animate-spin text-amber-500 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen py-16 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 border border-gray-850 p-8 rounded-2xl text-center shadow-2xl space-y-6">
        {/* Animated Checkmark */}
        <div className="mx-auto h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-450 animate-scale-up">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-sora text-white">Order Confirmed!</h1>
          <p className="text-gray-400 text-sm">
            Thank you for your purchase. Your payment was verified and processed successfully.
          </p>
        </div>

        {order ? (
          /* Order Summary Card */
          <div className="bg-gray-950/60 border border-gray-850 p-4 rounded-xl text-left space-y-3.5 text-xs text-gray-400">
            <div className="flex justify-between border-b border-gray-850 pb-2.5">
              <span>Order ID</span>
              <span className="font-semibold text-white font-mono">{order._id}</span>
            </div>
            
            <div className="space-y-2 border-b border-gray-850 pb-2.5">
              <span className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">Items Purchased</span>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {item.product?.title || 'Ebook'}
                  </span>
                  <span className="font-bold text-white shrink-0">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-sm text-white pt-1">
              <span>Paid Amount</span>
              <span className="font-sora text-amber-400">₹{order.totalAmount}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-950/60 border border-gray-850 p-4 rounded-xl text-xs text-gray-400">
            Order Reference: <span className="font-semibold text-white font-mono">{id}</span>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <Link
            to="/dashboard/library"
            className="w-full bg-amber-655 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50"
          >
            Go to My Library <Download size={16} />
          </Link>
          
          <Link
            to="/browse"
            className="w-full bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Browse More Ebooks <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
