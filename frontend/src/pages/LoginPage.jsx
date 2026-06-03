import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../context/useAuthStore';
import classicBg from '../assets/classic-bg.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogle = async () => {
    const result = await loginWithGoogle();
    if (!result.success) toast.error(result.message);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 animate-fade-in-up"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.95) 85%, #000000 100%), url(${classicBg}?v=2)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors font-bold text-2xl font-sans">
            <BookOpen size={24} /> MoneyMakers Hub
          </Link>
          <h1 className="text-zinc-400 text-[10px] uppercase tracking-[0.25em] font-semibold mt-4 font-mono">Sign in to your account</h1>
        </div>

        <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-900/80 rounded p-8 shadow-xl">
          {/* Google login */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-widest py-3 rounded transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 18 18" className="shrink-0">
              <path fill="#d97706" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#d97706" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#d97706" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#d97706" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900/60" /></div>
            <div className="relative flex justify-center"><span className="bg-zinc-950/80 backdrop-blur-md px-3 text-zinc-550 text-xs font-mono">or</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                type="email" placeholder="you@example.com"
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-amber-500/50 rounded px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none transition-colors font-sans"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-amber-500/50 rounded px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-700 focus:outline-none transition-colors font-sans"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-amber-500 hover:text-amber-400 hover:underline font-mono">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-550 disabled:opacity-60 text-black font-bold uppercase tracking-widest text-xs font-mono py-3 rounded transition-colors mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-zinc-400 text-xs mt-6 font-sans">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-500 hover:text-amber-400 font-semibold font-mono uppercase tracking-wider ml-1">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
