import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { adminAPI } from '../../services/api';

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => {
        setStats(data.stats);
        setMonthlyRevenue(data.monthlyRevenue || []);
        setTopProducts(data.topProducts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-white min-h-screen bg-gray-950">
        <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
      </div>
    );
  }

  // Find max monthly revenue for charting scale
  const maxRevenue = monthlyRevenue.length > 0 
    ? Math.max(...monthlyRevenue.map(m => m.revenue)) 
    : 1000;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold font-sora text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of platform metrics and performance.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-gray-900 border border-gray-850 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-0.5 uppercase tracking-wider font-bold">Total Revenue</span>
            <span className="text-xl font-bold text-white font-sora">₹{stats?.totalRevenue}</span>
          </div>
        </div>

        {/* Sales */}
        <div className="bg-gray-900 border border-gray-850 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-0.5 uppercase tracking-wider font-bold">Total Sales</span>
            <span className="text-xl font-bold text-white font-sora">{stats?.totalSales} copies</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-gray-900 border border-gray-850 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-0.5 uppercase tracking-wider font-bold">Active Products</span>
            <span className="text-xl font-bold text-white font-sora">{stats?.totalProducts} ebooks</span>
          </div>
        </div>

        {/* Users */}
        <div className="bg-gray-900 border border-gray-850 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block mb-0.5 uppercase tracking-wider font-bold">Platform Users</span>
            <span className="text-xl font-bold text-white font-sora">{stats?.totalUsers} members</span>
          </div>
        </div>
      </div>

      {/* Revenue Graph / Top Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-8 bg-gray-900 border border-gray-850 p-6 rounded-2xl">
          <h3 className="text-base font-bold font-sora text-white mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Revenue (Last 6 Months)
          </h3>

          {monthlyRevenue.length === 0 ? (
            <p className="text-gray-550 text-sm text-center py-20">No monthly revenue data available yet.</p>
          ) : (
            <div className="flex items-end justify-between h-48 pt-6 px-4">
              {monthlyRevenue.map((m, idx) => {
                const pct = (m.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="w-10 sm:w-12 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-600/30 hover:border-emerald-500/40 rounded-t transition-all relative flex flex-col justify-end" style={{ height: `${Math.max(pct, 5)}%` }}>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-950 border border-gray-800 text-xxs font-semibold px-1.5 py-1 rounded text-white whitespace-nowrap shadow-xl">
                        ₹{m.revenue}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-550 mt-3 font-semibold uppercase">
                      {MONTH_NAMES[m._id.month]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-gray-900 border border-gray-850 p-6 rounded-2xl">
          <h3 className="text-base font-bold font-sora text-white mb-6">Top Selling Ebooks</h3>

          {topProducts.length === 0 ? (
            <p className="text-gray-550 text-sm py-8 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((prod) => (
                <div key={prod._id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-white truncate block">{prod.title}</span>
                    <span className="text-[10px] text-gray-500 block">{prod.totalSales} copies sold</span>
                  </div>
                  <span className="font-bold text-sm text-emerald-450 shrink-0">₹{prod.totalRevenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
