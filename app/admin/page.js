'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Star, Trophy, BarChart3, Lock, Unlock, LogOut, ArrowRight, Activity } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth('admin');
  const [stats, setStats]   = useState({ teams: 0, judges: 0, scores: 0, avgScore: 0 });
  const [locked, setLocked] = useState(false);
  const [locking, setLocking] = useState(false);

  useEffect(() => { if (!loading && user) load(); }, [loading]);

  const load = async () => {
    try {
      const [a, s] = await Promise.all([api.get('/admin/analytics'), api.get('/admin/settings')]);
      setStats(a.data);
      setLocked(s.data.scoringLocked);
    } catch { toast.error('Failed to load'); }
  };

  const toggleLock = async () => {
    setLocking(true);
    try {
      const { data } = await api.post('/admin/lock-scoring');
      setLocked(data.locked);
      toast.success(data.locked ? 'Scoring locked' : 'Scoring unlocked');
    } catch { toast.error('Failed'); } finally { setLocking(false); }
  };

  const navItems = [
    { href: '/admin/teams',   label: 'Teams',          sub: 'Manage registered teams',    icon: Users,     count: stats.teams },
    { href: '/admin/judges',  label: 'Judges',         sub: 'Manage judge accounts',      icon: Star,      count: stats.judges },
    { href: '/admin/results', label: 'Results',        sub: 'Rankings and award winners', icon: Trophy,    count: null },
    { href: '/leaderboard',   label: 'Live Leaderboard', sub: 'Public-facing standings',  icon: BarChart3, count: null }
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
        className="sticky top-0 z-40 px-5 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo size="sm" showText />

          <div className="flex items-center gap-2">
            <button onClick={toggleLock} disabled={locking}
              className="btn-ghost"
              style={locked ? {
                borderColor: 'rgba(220,107,107,0.25)', color: '#dc6b6b',
                padding: '7px 14px', fontSize: '12px', gap: '5px'
              } : { padding: '7px 14px', fontSize: '12px', gap: '5px' }}>
              {locking
                ? <span className="w-3 h-3 border rounded-full animate-spin"
                    style={{ borderColor: 'rgba(242,234,216,0.2)', borderTopColor: 'currentColor' }} />
                : locked ? <Lock size={12} strokeWidth={2} /> : <Unlock size={12} strokeWidth={2} />}
              <span className="hidden sm:inline">{locked ? 'Locked' : 'Lock scoring'}</span>
            </button>
            <button onClick={logout} className="btn-ghost"
              style={{ padding: '7px 12px', fontSize: '12px', gap: '5px' }}>
              <LogOut size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-7">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <h1 className="font-semibold mb-1"
            style={{ fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.03em' }}>
            Welcome back, {user?.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: locked ? '#dc6b6b' : '#7fb47a', display: 'inline-block' }} />
            <p className="text-xs" style={{ color: 'var(--cream-35)' }}>
              {locked ? 'Scoring is currently locked' : 'Scoring is open'}
            </p>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Teams',         value: stats.teams,    icon: Users    },
            { label: 'Judges',        value: stats.judges,   icon: Star     },
            { label: 'Submissions',   value: stats.scores,   icon: Activity },
            { label: 'Average Score', value: stats.avgScore, icon: BarChart3, suffix: '/100' }
          ].map(({ label, value, icon: Icon, suffix }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{label}</p>
                <Icon size={13} strokeWidth={1.5} style={{ color: 'var(--cream-35)' }} />
              </div>
              <p className="font-semibold mono" style={{ fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.04em' }}>
                {value}{suffix && <span className="text-sm font-normal" style={{ color: 'var(--cream-35)' }}>{suffix}</span>}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Nav grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {navItems.map(({ href, label, sub, icon: Icon, count }, i) => (
            <Link key={href} href={href}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}
                className="card-hi p-5 cursor-pointer group transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--hover)' }}>
                    <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--cream-60)' }} />
                  </div>
                  {count !== null && (
                    <span className="tag">{count}</span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm mb-0.5"
                      style={{ color: 'var(--cream)', letterSpacing: '-0.01em' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{sub}</p>
                  </div>
                  <ArrowRight size={14} strokeWidth={1.5} style={{ color: 'var(--cream-35)', flexShrink: 0 }}
                    className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border rounded-full animate-spin"
        style={{ borderColor: 'var(--line-md)', borderTopColor: 'var(--cream)' }} />
    </div>
  );
}
