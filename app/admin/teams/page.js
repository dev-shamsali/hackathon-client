'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Search, Trash2, FileText, Pencil, X, Check } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  teamName: '', leaderName: '', email: '', institute: '',
  projectTitle: '', problemStatement: '', techStack: '',
  members: '', prdUrl: '', trdUrl: ''
};

export default function AdminTeams() {
  const { loading } = useAuth('admin');
  const [teams, setTeams]       = useState([]);
  const [search, setSearch]     = useState('');
  const [deleting, setDel]      = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { if (!loading) load(); }, [loading]);

  const load = async () => {
    try { const { data } = await api.get('/teams'); setTeams(data); }
    catch { toast.error('Failed to load teams'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    setDel(id);
    try {
      await api.delete(`/teams/${id}`);
      setTeams(p => p.filter(t => t._id !== id));
      toast.success('Team deleted');
    } catch { toast.error('Failed to delete'); } finally { setDel(null); }
  };

  const openEdit = (team) => {
    setForm({
      teamName: team.teamName || '',
      leaderName: team.leaderName || '',
      email: team.email || '',
      institute: team.institute || '',
      projectTitle: team.projectTitle || '',
      problemStatement: team.problemStatement || '',
      techStack: team.techStack || '',
      members: (team.members || []).join(', '),
      prdUrl: team.prdUrl || '',
      trdUrl: team.trdUrl || ''
    });
    setEditTeam(team);
  };

  const closeEdit = () => { setEditTeam(null); setForm(EMPTY_FORM); };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/teams/${editTeam._id}`, form);
      setTeams(p => p.map(t => t._id === data._id ? data : t));
      toast.success('Team updated');
      closeEdit();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const filtered = teams.filter(t =>
    [t.teamName, t.projectTitle, t.email].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
        className="sticky top-0 z-40 px-5 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="btn-ghost" style={{ padding: '6px 10px', border: 'none', color: 'var(--cream-35)' }}>
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
            </Link>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--cream)' }}>Teams</p>
              <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{teams.length} registered</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        <div className="relative mb-5">
          <Search size={13} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--cream-35)' }} />
          <input placeholder="Search teams…" value={search} onChange={e => setSearch(e.target.value)}
            className="field" style={{ paddingLeft: '38px' }} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--cream-35)' }}>No teams found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((team, i) => (
              <motion.div key={team._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="card-hi p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="tag">{team.teamId}</span>
                    </div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--cream)' }}>
                      {team.teamName}
                    </p>
                    <p className="text-sm truncate" style={{ color: 'var(--cream-35)' }}>
                      {team.projectTitle}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs"
                      style={{ color: 'var(--cream-35)' }}>
                      <span>{team.leaderName}</span>
                      <span style={{ color: 'var(--line-hi)' }}>·</span>
                      <span>{team.institute}</span>
                      <span style={{ color: 'var(--line-hi)' }}>·</span>
                      <span>{team.email}</span>
                    </div>

                    {team.techStack && (
                      <p className="text-xs mt-1.5 truncate" style={{ color: 'var(--cream-35)', opacity: 0.7 }}>
                        {team.techStack}
                      </p>
                    )}

                    {team.members?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {team.members.map((m, idx) => <span key={idx} className="tag">{m}</span>)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {team.prdUrl && (
                      <a href={team.prdUrl} target="_blank" rel="noreferrer" className="btn-ghost"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '4px' }}>
                        <FileText size={11} strokeWidth={1.5} /> PRD
                      </a>
                    )}
                    {team.trdUrl && (
                      <a href={team.trdUrl} target="_blank" rel="noreferrer" className="btn-ghost"
                        style={{ padding: '6px 10px', fontSize: '11px', gap: '4px' }}>
                        <FileText size={11} strokeWidth={1.5} /> TRD
                      </a>
                    )}
                    <button onClick={() => openEdit(team)} className="btn-ghost"
                      style={{ padding: '6px 10px' }}>
                      <Pencil size={12} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => del(team._id)} disabled={deleting === team._id}
                      className="btn-ghost"
                      style={{ padding: '6px 10px', color: '#dc6b6b', borderColor: 'rgba(220,107,107,0.2)' }}>
                      {deleting === team._id
                        ? <span className="w-3 h-3 border rounded-full animate-spin"
                            style={{ borderColor: 'rgba(220,107,107,0.2)', borderTopColor: '#dc6b6b' }} />
                        : <Trash2 size={12} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTeam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,6,6,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && closeEdit()}>
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--line)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--cream)' }}>Edit Team</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cream-35)' }}>{editTeam.teamId}</p>
                </div>
                <button onClick={closeEdit} className="btn-ghost" style={{ padding: '6px 8px', border: 'none' }}>
                  <X size={15} strokeWidth={1.5} />
                </button>
              </div>

              {/* Form */}
              <div className="px-5 py-5 space-y-3.5">
                <Row label="Team Name">
                  <input className="field" value={form.teamName}
                    onChange={e => setForm(p => ({ ...p, teamName: e.target.value }))} />
                </Row>
                <Row label="Leader Name">
                  <input className="field" value={form.leaderName}
                    onChange={e => setForm(p => ({ ...p, leaderName: e.target.value }))} />
                </Row>
                <Row label="Email">
                  <input className="field" type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </Row>
                <Row label="Institute">
                  <input className="field" value={form.institute}
                    onChange={e => setForm(p => ({ ...p, institute: e.target.value }))} />
                </Row>
                <Row label="Project Title">
                  <input className="field" value={form.projectTitle}
                    onChange={e => setForm(p => ({ ...p, projectTitle: e.target.value }))} />
                </Row>
                <Row label="Tech Stack">
                  <input className="field" value={form.techStack}
                    onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))} />
                </Row>
                <Row label="Members" hint="comma-separated">
                  <input className="field" value={form.members} placeholder="Alice, Bob, Carol"
                    onChange={e => setForm(p => ({ ...p, members: e.target.value }))} />
                </Row>
                <Row label="Problem Statement">
                  <textarea className="field" rows={3} value={form.problemStatement}
                    onChange={e => setForm(p => ({ ...p, problemStatement: e.target.value }))}
                    style={{ resize: 'vertical', minHeight: '72px' }} />
                </Row>
                <Row label="PRD URL" hint="optional">
                  <input className="field" value={form.prdUrl} placeholder="/uploads/file.pdf"
                    onChange={e => setForm(p => ({ ...p, prdUrl: e.target.value }))} />
                </Row>
                <Row label="TRD URL" hint="optional">
                  <input className="field" value={form.trdUrl} placeholder="/uploads/file.pdf"
                    onChange={e => setForm(p => ({ ...p, trdUrl: e.target.value }))} />
                </Row>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-4"
                style={{ borderTop: '1px solid var(--line)' }}>
                <button onClick={closeEdit} className="btn-ghost"
                  style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving} className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', gap: '6px' }}>
                  {saving
                    ? <span className="w-3.5 h-3.5 border rounded-full animate-spin"
                        style={{ borderColor: 'rgba(6,6,6,0.3)', borderTopColor: '#060606' }} />
                    : <Check size={13} strokeWidth={2} />}
                  Save changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium" style={{ color: 'var(--cream-60)' }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: 'var(--cream-35)' }}>· {hint}</span>}
      </div>
      {children}
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
