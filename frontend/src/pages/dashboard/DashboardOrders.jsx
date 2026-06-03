import React, { useEffect, useState } from 'react';
import { Loader2, ShoppingBag, Receipt, AlertCircle } from 'lucide-react';
import { usersAPI } from '../../services/api';

export default function DashboardOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getOrders()
      .then(({ data }) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900/10 border border-dashed border-gray-850 rounded-2xl">
        <Receipt size={48} className="mx-auto text-gray-655 mb-4" />
        <h3 className="text-lg font-bold mb-2">No orders found</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          You haven't placed any orders yet. Visit the catalog to find resources to grow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-sora text-white">Your Order History</h2>
        <p className="text-sm text-gray-400">View and track all previous transactions below.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-gray-900/40 border border-gray-850 rounded-2xl overflow-hidden hover:border-gray-750 transition-colors"
          >
            {/* Header info */}
            <div className="bg-gray-900/80 px-6 py-4 border-b border-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-400">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="block text-gray-550 mb-0.5 uppercase tracking-wider text-[9px] font-bold">Date Placed</span>
                  <span className="font-medium text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-gray-550 mb-0.5 uppercase tracking-wider text-[9px] font-bold">Total Amount</span>
                  <span className="font-semibold text-amber-450">₹{order.totalAmount}</span>
                </div>
                <div>
                  <span className="block text-gray-550 mb-0.5 uppercase tracking-wider text-[9px] font-bold">Order ID</span>
                  <span className="font-mono text-gray-300">{order._id}</span>
                </div>
              </div>

              <div>
                <span className={`px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider ${
                  order.status === 'completed'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : order.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Products inside order */}
            <div className="px-6 py-4 divide-y divide-gray-850">
              {order.items.map((item, idx) => {
                const { product, price } = item;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 aspect-[4/5] bg-gray-950 border border-gray-800 rounded overflow-hidden shrink-0 flex items-center justify-center relative">
                        {product?.coverImage?.url ? (
                          <img
                            src={product.coverImage.url}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag size={14} className="text-amber-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        {product ? (
                          <span className="font-bold text-sm text-white line-clamp-1">{product.title}</span>
                        ) : (
                          <span className="text-sm text-gray-500 italic flex items-center gap-1">
                            <AlertCircle size={12} /> Product no longer exists
                          </span>
                        )}
                        <span className="text-[10px] text-gray-550 uppercase tracking-wider block mt-0.5">
                          {product?.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-sm text-white shrink-0">₹{price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
