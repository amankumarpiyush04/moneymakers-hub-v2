import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Mail, Loader2 } from 'lucide-react';
import useAuthStore from '../../context/useAuthStore';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function DashboardProfile() {
  const { user, session, fetchProfile, resetPassword } = useAuthStore();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const { register: profileReg, handleSubmit: handleProfileSubmit, setValue } = useForm();
  const { register: passReg, handleSubmit: handlePassSubmit, reset: resetPassForm, watch } = useForm();

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
    } else if (session?.user) {
      setValue('name', session.user.user_metadata?.name || '');
    }
  }, [user, session, setValue]);

  const onProfileUpdate = async (data) => {
    setUpdatingProfile(true);
    try {
      const res = await usersAPI.updateProfile({ name: data.name });
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        await fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setUpdatingPassword(true);
    const result = await resetPassword(data.newPassword);
    setUpdatingPassword(false);
    
    if (result.success) {
      toast.success('Password changed successfully!');
      resetPassForm();
    } else {
      toast.error(result.message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold font-sora text-white">Profile Settings</h2>
        <p className="text-sm text-gray-400">Manage your account information and security.</p>
      </div>

      {/* Account Info Form */}
      <div className="bg-gray-900 border border-gray-850 p-6 sm:p-8 rounded-2xl space-y-6">
        <h3 className="text-base font-bold font-sora text-white flex items-center gap-2">
          <User className="text-emerald-500" size={18} /> Account Information
        </h3>

        <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              <input
                type="email"
                disabled
                value={session?.user?.email || ''}
                className="w-full bg-gray-950 border border-gray-850 rounded-lg px-10 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-550 uppercase tracking-wider font-bold mb-1.5">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-505" size={16} />
              <input
                {...profileReg('name', { required: true })}
                type="text"
                placeholder="Your Name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingProfile}
              className="bg-emerald-600 hover:bg-emerald-555 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {updatingProfile ? <Loader2 className="animate-spin" size={16} /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-gray-900 border border-gray-850 p-6 sm:p-8 rounded-2xl space-y-6">
        <h3 className="text-base font-bold font-sora text-white flex items-center gap-2">
          <Lock className="text-emerald-505" size={18} /> Update Password
        </h3>

        <form onSubmit={handlePassSubmit(onPasswordChange)} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-550 uppercase tracking-wider font-bold mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-505" size={16} />
              <input
                {...passReg('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-555 uppercase tracking-wider font-bold mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-505" size={16} />
              <input
                {...passReg('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === watch('newPassword') || 'Passwords do not match'
                })}
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="bg-emerald-600 hover:bg-emerald-555 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {updatingPassword ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
