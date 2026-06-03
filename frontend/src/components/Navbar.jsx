import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, BookOpen, Menu, X, Shield } from 'lucide-react';
import useAuthStore from '../context/useAuthStore';
import useCartStore from '../context/useCartStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { session, user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const cartCount = useCartStore(s => s.count());
  const setCartOpen = useCartStore(s => s.setCartOpen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black backdrop-blur-md border-b border-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-amber-500 font-bold text-xl tracking-tight">
              <BookOpen className="h-6 w-6" />
              <span className="font-sora font-semibold">MoneyMakers Hub</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link to="/browse" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Store</Link>
            
            {isAuthenticated() && (
              <Link to="/dashboard/library" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">My Library</Link>
            )}
            
            {isAuthenticated() && isAdmin() && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-500 hover:text-amber-450 transition-colors text-sm font-medium">
                <Shield size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Right actions (Cart, Auth) */}
          <div className="hidden md:flex items-center gap-6">
            {/* Cart Icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-black bg-amber-500 rounded-full transform translate-x-1/3 -translate-y-1/3">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth section */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded-full px-4 py-2 text-sm font-medium hover:border-zinc-800 transition-colors"
                >
                  <User className="h-4 w-4 text-amber-500" />
                  <span className="max-w-[120px] truncate">{user?.name || session?.user?.email.split('@')[0]}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-900 rounded-lg shadow-xl py-1 z-50">
                    <Link
                      to="/dashboard/library"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      My Library
                    </Link>
                    <Link
                      to="/dashboard/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <hr className="border-zinc-900 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-zinc-400 hover:text-white text-sm font-medium px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-amber-600 hover:bg-amber-550 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-amber-950/20">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-black bg-amber-500 rounded-full transform translate-x-1/3 -translate-y-1/3">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-zinc-900 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Store
          </Link>
          
          {isAuthenticated() && (
            <>
              <Link
                to="/dashboard/library"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                My Library
              </Link>
              <Link
                to="/dashboard/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                My Orders
              </Link>
              <Link
                to="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Profile Settings
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-amber-500 hover:bg-zinc-900 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:bg-zinc-900 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated() && (
            <div className="pt-4 border-t border-zinc-900 flex gap-4">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-amber-600 hover:bg-amber-550 text-black py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
