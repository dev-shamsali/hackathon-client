'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, Send, FileText, X, Check, ChevronRight, Save, Users, Clock, ArrowLeft } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

const CATEGORIES = [
  { key: 'problemSolving',           label: 'Problem Solving',           max: 20 },
  { key: 'technicalImplementation',  label: 'Technical Implementation',  max: 20 },
  { key: 'innovation',               label: 'Innovation',                max: 20 },
  { key: 'uiux',                     label: 'UI / UX Design',            max: 15 },
  { key: 'presentation',             label: 'Presentation',              max: 10 },
  { key: 'scalability',              label: 'Scalability',               max: 10 },
  { key: 'documentation',            label: 'Documentation',             max: 5  }
];

const empty = () => Object.fromEntries(CATEGORIES.map(c => [c.key, 0]));

export default function JudgeDashboard() {
  const { user, loading, logout } = useAuth('judge');
  const [teams, setTeams]         = useState([]);
  const [scoredMap, setScoredMap] = useState({});
  const [selected, setSelected]   = useState(null);
  const [scores, setScores]       = useState(empty());
  const [notes, setNotes]         = useState('');
  const [search, setSearch]       = useState('');
  const [view, setView]           = useState('list'); // 'list' | 'score'
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const total    = CATEGORIES.reduce((s, c) => s + Number(scores[c.key] || 0), 0);
  const scored   = Object.keys(scoredMap).length;
  const pct      = teams.length ? Math.round((scored / teams.length) * 100) : 0;
  const pending  = teams.filter(t => !scoredMap[t._id] && (
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    t.projectTitle?.toLowerCase().includes(search.toLowerCase())
  ));
  const done     = teams.filter(t => scoredMap[t._id] && (
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    t.projectTitle?.toLowerCase().includes(search.toLowerCase())
  ));

  useEffect(() => { if (!loading && user) load(); }, [loading]);

  const load = async () => {
    try {
      const [tr, sr] = await Promise.all([api.get('/teams'), api.get('/scores/my')]);
      setTeams(tr.data);
      const m = {};
      sr.data.forEach(s => { if (!s.isDraft) m[s.teamId?._id || s.teamId] = s; });
      setScoredMap(m);
    } catch { toast.error('Failed to load'); }
  };

  const openTeam = async (team) => {
    setSelected(team);
    setScores(empty());
    setNotes('');
    setView('score');
    try {
      const { data } = await api.get(`/scores/draft/${team._id}`);
      if (data) {
        const s = {};
        CATEGORIES.forEach(c => { s[c.key] = data[c.key] || 0; });
        setScores(s);
        setNotes(data.notes || '');
      }
    } catch {}
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await api.post('/scores', { teamId: selected._id, ...scores, notes, isDraft: true });
      toast.success('Draft saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const submit = async () => {
    if (total === 0) return toast.error('Enter scores before submitting');
    setSubmitting(true);
    try {
      const { data } = await api.post('/scores', { teamId: selected._id, ...scores, notes, isDraft: false });
      toast.success('Score submitted');
      setScoredMap(p => ({ ...p, [selected._id]: data.score }));
      setSelected(null); setScores(empty()); setNotes(''); setView('list');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
        className="sticky top-0 z-40 px-5 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'score' ? (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => { setView('list'); setSelected(null); }}
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--cream-35)' }}>
                <ArrowLeft size={14} strokeWidth={1.5} />
              </motion.button>
            ) : (
              <Logo size="sm" showText={false} />
            )}
            <div>
              <p className="text-xs" style={{ color: 'var(--cream-35)' }}>Judge</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                {user?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--card)', border: '1px solid var(--line-md)' }}>
              <span className="text-xs mono font-medium" style={{ color: 'var(--cream-60)' }}>
                {scored}/{teams.length}
              </span>
              <span className="text-xs" style={{ color: 'var(--cream-35)' }}>evaluated</span>
            </div>
            <button onClick={logout} className="btn-ghost" style={{ padding: '7px 12px', fontSize: '12px', gap: '5px' }}>
              <LogOut size={13} strokeWidth={1.5} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── LIST VIEW ── */}
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-5 py-6">

            {/* Progress block */}
            <div className="card-hi p-5 mb-5">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] mb-1"
                    style={{ color: 'var(--cream-35)' }}>
                    Scoring Progress
                  </p>
                  <p className="font-semibold" style={{ fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.04em' }}>
                    {pct}<span className="text-base font-medium" style={{ color: 'var(--cream-35)' }}>%</span>
                  </p>
                </div>
                <p className="text-sm" style={{ color: 'var(--cream-35)' }}>
                  {scored} of {teams.length} teams
                </p>
              </div>
              <div className="w-full h-1 rounded-full" style={{ background: 'var(--hover)' }}>
                <motion.div className="h-1 rounded-full" style={{ background: 'var(--cream)' }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              {pct === 100 && teams.length > 0 && (
                <p className="text-xs mt-3" style={{ color: 'var(--accent)' }}>
                  All teams evaluated. Thank you.
                </p>
              )}
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Total Teams', value: teams.length },
                { label: 'Evaluated',   value: scored },
                { label: 'Remaining',   value: teams.length - scored }
              ].map(({ label, value }) => (
                <div key={label} className="card p-4">
                  <p className="text-xs mb-2" style={{ color: 'var(--cream-35)' }}>{label}</p>
                  <p className="text-2xl font-semibold mono" style={{ color: 'var(--cream)', letterSpacing: '-0.04em' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search size={13} strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--cream-35)' }} />
              <input placeholder="Search teams…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="field" style={{ paddingLeft: '38px' }} />
            </div>

            {/* Pending */}
            {pending.length > 0 && (
              <section className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <Clock size={11} strokeWidth={1.5} style={{ color: 'var(--cream-35)' }} />
                  <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--cream-35)' }}>
                    Pending — {pending.length}
                  </p>
                </div>
                <div className="space-y-2">
                  {pending.map((t, i) => (
                    <TeamRow key={t._id} team={t} index={i} status="pending"
                      onClick={() => openTeam(t)} />
                  ))}
                </div>
              </section>
            )}

            {/* Done */}
            {done.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Check size={11} strokeWidth={2.5} style={{ color: 'var(--cream-35)' }} />
                  <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--cream-35)' }}>
                    Evaluated — {done.length}
                  </p>
                </div>
                <div className="space-y-2">
                  {done.map((t, i) => (
                    <TeamRow key={t._id} team={t} index={i} status="done"
                      score={scoredMap[t._id]?.totalScore} />
                  ))}
                </div>
              </section>
            )}

            {teams.length === 0 && (
              <div className="text-center py-16">
                <Users size={28} strokeWidth={1} style={{ color: 'var(--cream-35)', margin: '0 auto 12px' }} />
                <p className="text-sm" style={{ color: 'var(--cream-35)' }}>No teams registered yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── SCORE VIEW ── */}
        {view === 'score' && selected && (
          <motion.div key="score" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-5 py-6 pb-28">

            {/* Team header */}
            <div className="card-hi p-5 mb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="tag mb-2">{selected.teamId}</p>
                  <h2 className="font-semibold mb-1"
                    style={{ fontSize: '1.25rem', color: 'var(--cream)', letterSpacing: '-0.02em' }}>
                    {selected.teamName}
                  </h2>
                  <p className="text-sm truncate" style={{ color: 'var(--cream-35)' }}>
                    {selected.projectTitle}
                  </p>
                </div>
                <button onClick={() => setDetailOpen(true)} className="btn-ghost"
                  style={{ padding: '8px 12px', flexShrink: 0 }}>
                  <FileText size={13} strokeWidth={1.5} /> Details
                </button>
              </div>

              {/* Documents — visible while scoring */}
              {(selected.prdUrl || selected.trdUrl) && (
                <div className="flex items-center gap-2 mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--line)' }}>
                  <span className="text-xs font-medium mr-1" style={{ color: 'var(--cream-35)' }}>Documents</span>
                  {selected.prdUrl && (
                    <a href={selected.prdUrl} target="_blank" rel="noreferrer" className="btn-ghost"
                      style={{ fontSize: '12px', padding: '7px 14px', gap: '5px', textDecoration: 'none' }}>
                      <FileText size={12} strokeWidth={1.5} /> View PRD
                    </a>
                  )}
                  {selected.trdUrl && (
                    <a href={selected.trdUrl} target="_blank" rel="noreferrer" className="btn-ghost"
                      style={{ fontSize: '12px', padding: '7px 14px', gap: '5px', textDecoration: 'none' }}>
                      <FileText size={12} strokeWidth={1.5} /> View TRD
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Score display */}
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-sm font-medium" style={{ color: 'var(--cream-60)' }}>Evaluation Criteria</p>
              <div className="flex items-baseline gap-1">
                <motion.span key={total} className="font-semibold mono"
                  style={{ fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.04em' }}
                  initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  {total}
                </motion.span>
                <span className="text-sm" style={{ color: 'var(--cream-35)' }}> / 100</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-2.5 mb-5">
              {CATEGORIES.map((cat, i) => (
                <motion.div key={cat.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <ScoreCard cat={cat} val={scores[cat.key]}
                    onChange={v => setScores(p => ({ ...p, [cat.key]: v }))} />
                </motion.div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>
                Notes & Observations
              </label>
              <textarea rows={3} placeholder="Add evaluation notes, feedback, or comments…"
                value={notes} onChange={e => setNotes(e.target.value)}
                className="field" style={{ resize: 'vertical', minHeight: '80px' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky submit bar */}
      <AnimatePresence>
        {view === 'score' && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 px-5 py-4 z-40"
            style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
            <div className="max-w-3xl mx-auto flex gap-3">
              <button className="btn-ghost" onClick={saveDraft} disabled={saving}
                style={{ minWidth: '120px' }}>
                {saving ? <span className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(242,234,216,0.2)', borderTopColor: 'var(--cream-60)' }} />
                  : <><Save size={13} strokeWidth={1.5} /> Save draft</>}
              </button>
              <motion.button whileTap={{ scale: 0.99 }} onClick={submit} disabled={submitting}
                className="btn-primary flex-1"
                style={total === 0 ? { opacity: 0.35 } : {}}>
                {submitting ? (
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(6,6,6,0.2)', borderTopColor: 'var(--bg)' }} />
                ) : (
                  <><Send size={13} strokeWidth={2} /> Submit Score &mdash; {total}/100</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail drawer */}
      <AnimatePresence>
        {detailOpen && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setDetailOpen(false)}>
            <motion.div initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }} transition={{ type: 'spring', damping: 28 }}
              className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              style={{ background: 'var(--card)', border: '1px solid var(--line-md)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold"
                  style={{ color: 'var(--cream)', letterSpacing: '-0.02em' }}>{selected.teamName}</h3>
                <button onClick={() => setDetailOpen(false)} className="btn-ghost"
                  style={{ padding: '5px 8px', border: 'none', color: 'var(--cream-35)' }}>
                  <X size={15} strokeWidth={1.5} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  ['Team ID', selected.teamId],
                  ['Project', selected.projectTitle],
                  ['Leader', selected.leaderName],
                  ['Institute', selected.institute],
                  ['Tech Stack', selected.techStack]
                ].map(([l, v]) => (
                  <div key={l} className="flex gap-3">
                    <span className="text-xs w-20 shrink-0 pt-0.5 font-medium"
                      style={{ color: 'var(--cream-35)' }}>{l}</span>
                    <span className="text-sm" style={{ color: 'var(--cream-60)' }}>{v}</span>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--cream-35)' }}>
                    Problem Statement
                  </p>
                  <p className="text-sm leading-relaxed p-3 rounded-xl"
                    style={{ background: 'var(--surface)', color: 'var(--cream-60)', border: '1px solid var(--line)' }}>
                    {selected.problemStatement}
                  </p>
                </div>
                {selected.members?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--cream-35)' }}>Members</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.members.map((m, i) => <span key={i} className="tag">{m}</span>)}
                    </div>
                  </div>
                )}
                {(selected.prdUrl || selected.trdUrl) && (
                  <div className="flex gap-3 pt-1">
                    {selected.prdUrl && (
                      <a href={selected.prdUrl} target="_blank" rel="noreferrer" className="btn-ghost"
                        style={{ fontSize: '12px', padding: '8px 14px' }}>
                        <FileText size={12} strokeWidth={1.5} /> PRD
                      </a>
                    )}
                    {selected.trdUrl && (
                      <a href={selected.trdUrl} target="_blank" rel="noreferrer" className="btn-ghost"
                        style={{ fontSize: '12px', padding: '8px 14px' }}>
                        <FileText size={12} strokeWidth={1.5} /> TRD
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Team Row ── */
function TeamRow({ team, index, status, score, onClick }) {
  const done = status === 'done';
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={!done ? onClick : undefined}
      whileHover={!done ? { x: 2 } : {}}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
      style={{
        background: done ? 'var(--surface)' : 'var(--card)',
        border: `1px solid ${done ? 'var(--line)' : 'var(--line-md)'}`,
        cursor: done ? 'default' : 'pointer',
        opacity: done ? 0.55 : 1
      }}>
      {/* Status dot */}
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={done ? { background: 'var(--hover)' } : { background: 'var(--cream)', }}>
        {done
          ? <Check size={11} strokeWidth={2.5} style={{ color: 'var(--cream-35)' }} />
          : <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--bg)' }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate"
            style={{ color: done ? 'var(--cream-35)' : 'var(--cream)' }}>
            {team.teamName}
          </p>
          <span className="tag shrink-0">{team.teamId}</span>
        </div>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--cream-35)' }}>
          {team.projectTitle}
        </p>
      </div>

      {done ? (
        <div className="text-right shrink-0">
          <p className="text-base font-semibold mono" style={{ color: 'var(--cream-60)', letterSpacing: '-0.02em' }}>
            {score}
          </p>
          <p className="text-xs" style={{ color: 'var(--cream-35)' }}>/ 100</p>
        </div>
      ) : (
        <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--cream-35)', flexShrink: 0 }} />
      )}
    </motion.div>
  );
}

/* ── Score Card ── */
function ScoreCard({ cat, val, onChange }) {
  const pct = (val / cat.max) * 100;
  const presets = [0, Math.round(cat.max * 0.25), Math.round(cat.max * 0.5), Math.round(cat.max * 0.75), cat.max];

  return (
    <div className="card-hi p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: 'var(--cream-60)' }}>{cat.label}</p>
        <div className="flex items-baseline gap-1">
          <motion.span key={val} className="font-semibold mono"
            style={{ fontSize: '1.1rem', color: 'var(--cream)', letterSpacing: '-0.02em' }}
            initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            {val}
          </motion.span>
          <span className="text-xs" style={{ color: 'var(--cream-35)' }}>/{cat.max}</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative mb-3">
        <div className="w-full h-1 rounded-full" style={{ background: 'var(--hover)' }}>
          <motion.div className="h-1 rounded-full" style={{ background: 'var(--cream)' }}
            animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} />
        </div>
        <input type="range" min={0} max={cat.max} value={val}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '100%' }} />
      </div>

      {/* Quick picks */}
      <div className="flex gap-1.5">
        {presets.map(v => (
          <button key={v} onClick={() => onChange(v)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={val === v ? {
              background: 'var(--cream)', color: 'var(--bg)'
            } : {
              background: 'var(--surface)', color: 'var(--cream-35)',
              border: '1px solid var(--line)'
            }}>
            {v}
          </button>
        ))}
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
