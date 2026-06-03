import React, { useEffect, useState } from 'react';
import { Loader2, Receipt, AlertCircle, Search } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    
    adminAPI.getOrders(params)
      .then(({ data }) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Client-side filtering by user name or email
  const filteredOrders = orders.filter(o => {
    const userEmail = o.user?.email || '';
    const userName = o.user?.name || '';
    const query = search.toLowerCase();
    return userEmail.toLowerCase().includes(query) || userName.toLowerCase().includes(query) || o._id.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-sora text-white">Manage Orders</h2>
        <p className="text-sm text-gray-400">Monitor all transactions and checkouts across the store.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by customer email, name, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center">
          <label className="text-xs text-gray-400 whitespace-nowrap">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-550 h-8 w-8" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/10 border border-dashed border-gray-850 rounded-2xl">
          <Receipt size={48} className="mx-auto text-gray-655 mb-4" />
          <h3 className="text-lg font-bold mb-2">No orders found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            There are no transactions matching your criteria.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-850 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-850 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Ebooks Purchased</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-300">{order._id}</td>
                    <td className="px-6 py-4">
                      {order.user ? (
                        <div>
                          <div className="font-bold text-white">{order.user.name || 'No Name'}</div>
                          <div className="text-xxs text-gray-500">{order.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-550 italic flex items-center gap-1">
                          <AlertCircle size={12} /> Deleted User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px] truncate font-medium text-gray-300">
                        {order.items.map(item => item.product?.title || 'Ebook').join(', ')}
                      </div>
                      <div className="text-[10px] text-gray-550">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-450">₹{order.totalAmount}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                        order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
