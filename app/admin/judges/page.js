'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, ToggleLeft, ToggleRight, X, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminJudges() {
  const { loading } = useAuth('admin');
  const [judges, setJudges]       = useState([]);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId]   = useState(null);

  useEffect(() => { if (!loading) load(); }, [loading]);

  const load = async () => {
    try { const { data } = await api.get('/admin/judges'); setJudges(data); }
    catch { toast.error('Failed'); }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields');
    setSubmitting(true);
    try {
      await api.post('/admin/judges', form);
      toast.success('Judge added');
      setModal(false);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this judge?')) return;
    setActionId(id + 'd');
    try {
      await api.delete(`/admin/judges/${id}`);
      setJudges(p => p.filter(j => j._id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  const toggle = async (id) => {
    setActionId(id + 't');
    try {
      const { data } = await api.patch(`/admin/judges/${id}/toggle`);
      setJudges(p => p.map(j => j._id === id ? { ...j, isActive: data.isActive } : j));
    } catch { toast.error('Failed'); } finally { setActionId(null); }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
        className="sticky top-0 z-40 px-5 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="btn-ghost" style={{ padding: '6px 10px', border: 'none', color: 'var(--cream-35)' }}>
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
            </Link>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--cream)' }}>Judges</p>
              <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{judges.length} accounts</p>
            </div>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px', gap: '6px' }}>
            <Plus size={13} strokeWidth={2.5} /> Add Judge
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-2">
        {judges.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--cream-35)' }}>No judges yet</p>
          </div>
        )}
        {judges.map((j, i) => (
          <motion.div key={j._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: j.isActive ? 'var(--card)' : 'var(--surface)',
              border: j.isActive ? '1px solid var(--line-md)' : '1px solid var(--line)',
              opacity: j.isActive ? 1 : 0.5
            }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                style={{ background: j.isActive ? 'var(--cream)' : 'var(--hover)', color: j.isActive ? 'var(--bg)' : 'var(--cream-35)' }}>
                {j.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{j.name}</p>
                  <span className="tag" style={j.isActive ? { color: '#7fb47a', background: 'rgba(127,180,122,0.1)' } : {}}>
                    {j.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--cream-35)' }}>{j.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => toggle(j._id)} disabled={actionId === j._id + 't'}
                className="btn-ghost" style={{ padding: '6px 10px', color: j.isActive ? 'var(--cream-60)' : 'var(--cream-35)' }}>
                {actionId === j._id + 't'
                  ? <span className="w-3.5 h-3.5 border rounded-full animate-spin"
                      style={{ borderColor: 'rgba(242,234,216,0.1)', borderTopColor: 'currentColor' }} />
                  : j.isActive ? <ToggleRight size={16} strokeWidth={1.5} /> : <ToggleLeft size={16} strokeWidth={1.5} />}
              </button>
              <button onClick={() => remove(j._id)} disabled={actionId === j._id + 'd'}
                className="btn-ghost"
                style={{ padding: '6px 10px', color: '#dc6b6b', borderColor: 'rgba(220,107,107,0.2)' }}>
                {actionId === j._id + 'd'
                  ? <span className="w-3 h-3 border rounded-full animate-spin"
                      style={{ borderColor: 'rgba(220,107,107,0.2)', borderTopColor: '#dc6b6b' }} />
                  : <Trash2 size={13} strokeWidth={1.5} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setModal(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 28 }}
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
              style={{ background: 'var(--card)', border: '1px solid var(--line-md)' }}
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-6">
                <p className="font-semibold text-sm" style={{ color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                  Add Judge
                </p>
                <button onClick={() => setModal(false)} style={{ color: 'var(--cream-35)', lineHeight: 0 }}>
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={add} className="space-y-3.5">
                {[
                  { key: 'name',  label: 'Full Name', type: 'text',     ph: 'Dr. Jane Smith' },
                  { key: 'email', label: 'Email',     type: 'email',    ph: 'judge@example.com' }
                ].map(({ key, label, type, ph }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>{label}</label>
                    <input type={type} placeholder={ph} value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="field" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className="field" style={{ paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cream-35)', lineHeight: 0 }}>
                      {showPwd ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full" style={{ height: '44px' }}>
                  {submitting
                    ? <span className="w-4 h-4 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(6,6,6,0.15)', borderTopColor: 'var(--bg)' }} />
                    : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-7 h-7 border rounded-full animate-spin"
        style={{ borderColor: 'var(--line-md)', borderTopColor: 'var(--cream)' }} />
    </div>
  );
}
