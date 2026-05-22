'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Search, Trash2, FileText } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminTeams() {
  const { loading } = useAuth('admin');
  const [teams, setTeams]     = useState([]);
  const [search, setSearch]   = useState('');
  const [deleting, setDel]    = useState(null);

  useEffect(() => { if (!loading) load(); }, [loading]);

  const load = async () => {
    try { const { data } = await api.get('/teams'); setTeams(data); }
    catch { toast.error('Failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this team?')) return;
    setDel(id);
    try {
      await api.delete(`/teams/${id}`);
      setTeams(p => p.filter(t => t._id !== id));
      toast.success('Team removed');
    } catch { toast.error('Failed'); } finally { setDel(null); }
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
