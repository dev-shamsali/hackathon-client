'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import Logo from '@/components/Logo';

export default function HomePage() {
  const router = useRouter();
  const [role, setRole]       = useState('judge');
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    const r     = Cookies.get('role');
    if (token && r) router.push(r === 'admin' ? '/admin' : '/judge/dashboard');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { ...form, role });
      Cookies.set('token', data.token, { expires: 1 });
      Cookies.set('role',  data.user.role, { expires: 1 });
      Cookies.set('user',  JSON.stringify(data.user), { expires: 1 });
      toast.success(`Welcome, ${data.user.name}`);
      setTimeout(() => router.push(role === 'admin' ? '/admin' : '/judge/dashboard'), 350);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{ borderRight: '1px solid var(--line)' }}>

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 80%, rgba(192,168,122,0.06) 0%, transparent 65%)' }} />

        {/* Huge faded "2026" watermark */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none"
          style={{ lineHeight: 0.82 }}>
          <p className="font-semibold text-right pr-8"
            style={{ fontSize: 'clamp(110px,17vw,210px)', color: 'rgba(242,234,216,0.022)', letterSpacing: '-0.06em' }}>
            2026
          </p>
        </div>

        <div className="relative flex flex-col h-full p-14">
          {/* Wordmark */}
          <Logo size="md" showText href="/" />

          {/* Main copy */}
          <div className="mt-auto mb-14">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-medium uppercase tracking-[0.2em] mb-5"
              style={{ color: 'var(--accent)' }}>
              Judging Management System
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="font-semibold leading-[1.05] mb-5"
              style={{ fontSize: 'clamp(2.4rem,4vw,3.8rem)', color: 'var(--cream)', letterSpacing: '-0.035em' }}>
              Evaluate.<br />
              Rank.<br />
              Celebrate.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="text-base leading-relaxed"
              style={{ color: 'var(--cream-35)', maxWidth: '360px', fontWeight: 400 }}>
              Real-time scoring across 7 criteria, automated winner calculation with tiebreaker logic, and live public leaderboards.
            </motion.p>
          </div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="grid grid-cols-3 gap-8 pt-8"
            style={{ borderTop: '1px solid var(--line)' }}>
            {[
              { value: '100', label: 'Max Score' },
              { value: '7',   label: 'Criteria'  },
              { value: '4',   label: 'Awards'    }
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-semibold mono mb-0.5"
                  style={{ fontSize: '2rem', color: 'var(--cream)', letterSpacing: '-0.05em' }}>
                  {value}
                </p>
                <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <Logo size="lg" showText />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }} className="w-full max-w-[380px]">

          <div className="mb-8">
            <h2 className="font-semibold mb-1.5"
              style={{ fontSize: '1.55rem', color: 'var(--cream)', letterSpacing: '-0.03em' }}>
              Sign in
            </h2>
            <p className="text-sm" style={{ color: 'var(--cream-35)' }}>
              Access your judging dashboard
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6">
            {[{ key: 'judge', label: 'Judge' }, { key: 'admin', label: 'Admin' }].map(({ key, label }) => (
              <button key={key} onClick={() => setRole(key)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={role === key ? {
                  background: 'var(--cream)', color: 'var(--bg)'
                } : {
                  background: 'transparent', color: 'var(--cream-35)',
                  border: '1px solid var(--line-md)'
                }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>
                Email address
              </label>
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>
                Password
              </label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="field" style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cream-35)', lineHeight: 0 }}>
                  {showPwd ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileTap={{ scale: 0.99 }} className="btn-primary w-full mt-1" style={{ height: '46px' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(6,6,6,0.2)', borderTopColor: 'var(--bg)' }} />
                  Signing in
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue as {role === 'admin' ? 'Admin' : 'Judge'}
                  <ArrowRight size={15} strokeWidth={2} />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 space-y-3" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--cream-35)' }}>Participating team?</span>
              <Link href="/register">
                <span className="font-medium cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--cream)' }}>
                  Register here
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--cream-35)' }}>Public standings</span>
              <Link href="/leaderboard">
                <span className="font-medium cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--cream)' }}>
                  View leaderboard
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
