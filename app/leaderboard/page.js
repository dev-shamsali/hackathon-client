'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';
import api from '@/services/api';
import Logo from '@/components/Logo';

export default function Leaderboard() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRef]    = useState(false);
  const [tab, setTab]           = useState('rankings');
  const [updated, setUpdated]   = useState(null);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, []);

  const load = async (silent = false) => {
    if (silent) setRef(true); else setLoading(true);
    try {
      const { data: r } = await api.get('/scores/leaderboard');
      setData(r);
      setUpdated(new Date());
    } catch {} finally { setLoading(false); setRef(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Top rule */}
      <div className="h-px w-full" style={{ background: 'var(--line-hi)' }} />

      <header className="px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Logo size="sm" showText />
            <p className="text-xs mt-1" style={{ color: 'var(--cream-35)' }}>
              Live Leaderboard{updated ? ` — Updated ${updated.toLocaleTimeString()}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(true)} disabled={refreshing} className="btn-ghost"
              style={{ padding: '7px 10px' }}>
              <RefreshCw size={13} strokeWidth={1.5} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <Link href="/">
              <button className="btn-ghost" style={{ padding: '7px 10px' }}>
                <Home size={13} strokeWidth={1.5} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-5">

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
          {[
            { key: 'rankings', label: 'Rankings' },
            { key: 'awards',   label: 'Awards'   }
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={tab === key ? {
                background: 'var(--cream)', color: 'var(--bg)'
              } : { color: 'var(--cream-35)' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border rounded-full animate-spin"
              style={{ borderColor: 'var(--line-md)', borderTopColor: 'var(--cream)' }} />
          </div>
        ) : !data || data.rankings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--cream-35)' }}>
              No results yet
            </p>
            <p className="text-xs" style={{ color: 'var(--cream-35)', opacity: 0.6 }}>
              Results will appear here once judges begin submitting scores
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ── Rankings tab ── */}
            {tab === 'rankings' && (
              <motion.div key="r" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="space-y-2">

                {data.rankings.map((e, i) => (
                  <motion.div key={e.team?._id || i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}>

                    {/* Separator before 4th place */}
                    {i === 3 && (
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                        <p className="text-xs" style={{ color: 'var(--cream-35)' }}>Other Placements</p>
                        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                      </div>
                    )}

                    <div className="flex items-center gap-4 p-4 rounded-xl"
                      style={{
                        background: i < 3 ? 'var(--card)' : 'var(--surface)',
                        border: i === 0 ? '1px solid var(--line-hi)' : '1px solid var(--line-md)'
                      }}>

                      <span className="font-semibold mono shrink-0"
                        style={{
                          fontSize: i < 3 ? '1.05rem' : '0.85rem',
                          color: i === 0 ? 'var(--cream)' : 'var(--cream-35)',
                          letterSpacing: '-0.03em', width: '28px'
                        }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`font-medium truncate ${i < 3 ? 'text-sm' : 'text-xs'}`}
                            style={{ color: i < 3 ? 'var(--cream)' : 'var(--cream-60)' }}>
                            {e.team?.teamName}
                          </p>
                          <span className="tag shrink-0">{e.team?.teamId}</span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--cream-35)' }}>
                          {e.team?.projectTitle}
                        </p>

                        {i < 3 && (
                          <div className="flex gap-3 mt-2">
                            {[['Innov', e.avgInnovation], ['Tech', e.avgTechnical], ['UI', e.avgUiux]].map(([l, v]) => (
                              <div key={l} className="flex items-baseline gap-1">
                                <span className="text-xs font-semibold mono" style={{ color: 'var(--cream-60)' }}>
                                  {v?.toFixed(0)}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--cream-35)' }}>{l}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-semibold mono"
                          style={{ fontSize: i < 3 ? '1.4rem' : '1rem', color: 'var(--cream)', letterSpacing: '-0.04em' }}>
                          {e.avgTotal.toFixed(1)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{e.judgeCount}j</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── Awards tab ── */}
            {tab === 'awards' && (
              <motion.div key="a" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="space-y-2">
                {[
                  { key: 'bestUiux',         label: 'Best UI/UX Design',          sub: 'Outstanding visual design and user experience', field: 'avgUiux' },
                  { key: 'bestTechnical',     label: 'Best Technical Build',       sub: 'Engineering excellence and code quality',        field: 'avgTechnical' },
                  { key: 'mostInnovative',    label: 'Most Innovative',            sub: 'Creative and novel problem-solving approach',    field: 'avgInnovation' },
                  { key: 'bestDocumentation', label: 'Best Documentation',         sub: 'Comprehensive PRD & TRD quality',                field: 'avgDocumentation' }
                ].map(({ key, label, sub, field }, i) => {
                  const w = data.specialAwards?.[key];
                  return (
                    <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="card-hi p-5">
                      <div className="mb-3">
                        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                          {label}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{sub}</p>
                      </div>
                      <div className="divider mb-3" />
                      {w ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--cream-60)' }}>
                              {w.team?.teamName}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--cream-35)' }}>
                              {w.team?.projectTitle}
                            </p>
                          </div>
                          <p className="font-semibold mono shrink-0"
                            style={{ fontSize: '1.1rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                            {w[field]?.toFixed(1)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: 'var(--cream-35)' }}>Not yet determined</p>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
