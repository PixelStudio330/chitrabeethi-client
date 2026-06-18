'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // Import your new auth hook

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // Destructure the login utility function
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // ⚡ Set the global context state (this internally handles localStorage too!)
      login(data.token, data.user);

      // 🧭 Role-based redirection logic matching assignment rules
      if (data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'artist') {
        router.push('/dashboard/artist');
      } else {
        router.push('/'); // Regular user (Buyer) redirects to Home
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F3E6] px-4 py-12">
      {/* Container with a clean grid design texture feel */}
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-[#754A70]/10 shadow-xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#3F303D] tracking-tight">Welcome Back</h2>
          <p className="text-sm text-[#754A70]/70 mt-1">Access your ArtHub creative studio</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3F303D]/80 mb-1.5 font-bold">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g., admin@arthub.com"
              className="w-full px-4 py-3 rounded-xl border border-[#754A70]/20 bg-[#F8F3E6]/30 text-[#3F303D] text-sm focus:outline-none focus:ring-2 focus:ring-[#754A70]/30 transition-all placeholder:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3F303D]/80 mb-1.5 font-bold">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#754A70]/20 bg-[#F8F3E6]/30 text-[#3F303D] text-sm focus:outline-none focus:ring-2 focus:ring-[#754A70]/30 transition-all placeholder:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold bg-[#3F303D] hover:bg-[#754A70] text-[#F8F3E6] py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Dynamic Toggle Links */}
        <div className="mt-6 text-center text-xs text-[#754A70]/80">
          New to the gallery?{' '}
          <Link href="/register" className="font-bold text-[#3F303D] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}