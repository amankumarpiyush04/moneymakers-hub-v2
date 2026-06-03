// ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../context/useAuthStore';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) setSent(true);
    else toast.error(result.message);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 font-bold text-2xl">
            <BookOpen size={28} /> MoneyMakers Hub
          </Link>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-white text-xl font-semibold mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-4">We sent a password reset link to your email address.</p>
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 text-sm">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-white text-xl font-semibold mb-2">Forgot password?</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email" placeholder="you@example.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-gray-400 text-sm mt-4">
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ResetPasswordPage.jsx — Supabase redirects here with the token in the URL hash
export function ResetPasswordPage() {
  const { resetPassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    setLoading(true);
    const result = await resetPassword(password);
    setLoading(false);
    if (result.success) setDone(true);
    else toast.error(result.message);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          {done ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-white text-xl font-semibold mb-2">Password updated!</h2>
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 text-sm">Sign in with new password</Link>
            </div>
          ) : (
            <>
              <h1 className="text-white text-xl font-semibold mb-6">Set new password</h1>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">New Password</label>
                  <input
                    {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    type="password" placeholder="Min 8 characters"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
