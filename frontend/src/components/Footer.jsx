import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 text-zinc-500 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Intro */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-amber-500 font-bold text-lg tracking-tight font-sans">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">MoneyMakers Hub</span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400">
              Premium digital guides and ebooks to accelerate your journey to financial freedom, passive income, and wealth creation.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-zinc-300 text-xs font-semibold mb-4 tracking-widest uppercase font-mono">Shop</h3>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link to="/browse" className="hover:text-amber-500 transition-colors">Browse Ebooks</Link></li>
              <li><Link to="/browse/finance" className="hover:text-amber-500 transition-colors">Finance & Investing</Link></li>
              <li><Link to="/browse/crypto" className="hover:text-amber-500 transition-colors">Crypto & Web3</Link></li>
              <li><Link to="/browse/business" className="hover:text-amber-500 transition-colors">Side Hustles & Business</Link></li>
            </ul>
          </div>

          {/* Library / Account */}
          <div>
            <h3 className="text-zinc-300 text-xs font-semibold mb-4 tracking-widest uppercase font-mono">Support</h3>
            <ul className="space-y-2 text-xs font-mono">
              <li><Link to="/dashboard/library" className="hover:text-amber-500 transition-colors">My Library</Link></li>
              <li><Link to="/dashboard/orders" className="hover:text-amber-500 transition-colors">Order History</Link></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Social / Info */}
          <div className="space-y-4">
            <h3 className="text-zinc-300 text-xs font-semibold tracking-widest uppercase font-mono">Stay Connected</h3>
            <p className="text-xs text-zinc-400">Follow us for weekly financial insights and new release notifications.</p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-zinc-950 border border-zinc-900 rounded-full hover:border-zinc-800 hover:text-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 bg-zinc-950 border border-zinc-900 rounded-full hover:border-zinc-800 hover:text-white transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="p-2 bg-zinc-950 border border-zinc-900 rounded-full hover:border-zinc-800 hover:text-white transition-colors">
                <Globe size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono">
          <p>© {new Date().getFullYear()} MoneyMakers Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
