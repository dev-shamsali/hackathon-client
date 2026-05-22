'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const PLACE = ['01', '02', '03'];

export default function AdminResults() {
  const { loading } = useAuth('admin');
  const [results, setResults]   = useState(null);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRef]    = useState(false);

  useEffect(() => { if (!loading) load(); }, [loading]);

  const load = async (r = false) => {
    if (r) setRef(true);
    try { const { data } = await api.get('/admin/results'); setResults(data); }
    catch { toast.error('Failed to load'); }
    finally { setFetching(false); setRef(false); }
  };

  if (loading || fetching) return <Loader />;

  const { rankings = [], specialAwards = {} } = results || {};
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

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
            <p className="text-sm font-semibold" style={{ color: 'var(--cream)' }}>Results</p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="btn-ghost"
            style={{ padding: '6px 10px', fontSize: '12px', gap: '5px' }}>
            <RefreshCw size={12} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {rankings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: 'var(--cream-35)' }}>No scores submitted yet</p>
          </div>
        ) : (
          <>
            {/* Rankings */}
            <section className="mb-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] mb-3"
                style={{ color: 'var(--cream-35)' }}>Rankings</p>

              <div className="space-y-2">
                {top3.map((e, i) => (
                  <motion.div key={e.team?._id || i}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-5 rounded-xl"
                    style={{
                      background: i === 0 ? 'var(--card)' : 'var(--surface)',
                      border: i === 0 ? '1px solid var(--line-hi)' : '1px solid var(--line-md)'
                    }}>
                    <span className="font-semibold mono shrink-0"
                      style={{ fontSize: '1.1rem', color: i === 0 ? 'var(--cream)' : 'var(--cream-35)', letterSpacing: '-0.03em', width: '28px' }}>
                      {PLACE[i]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold truncate text-sm" style={{ color: 'var(--cream)' }}>
                          {e.team?.teamName}
                        </p>
                        <span className="tag shrink-0">{e.team?.teamId}</span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--cream-35)' }}>
                        {e.team?.projectTitle}
                      </p>
                      <div className="flex gap-4 mt-2">
                        {[
                          ['Innovation', e.avgInnovation],
                          ['Technical', e.avgTechnical],
                          ['UI/UX', e.avgUiux]
                        ].map(([l, v]) => (
                          <div key={l}>
                            <span className="text-xs font-semibold mono" style={{ color: 'var(--cream-60)' }}>
                              {v?.toFixed(0)}
                            </span>
                            <span className="text-xs ml-1" style={{ color: 'var(--cream-35)' }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold mono" style={{ fontSize: '1.5rem', color: 'var(--cream)', letterSpacing: '-0.04em' }}>
                        {e.avgTotal.toFixed(1)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cream-35)' }}>{e.judgeCount}j avg</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Special Awards */}
            <section className="mb-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] mb-3"
                style={{ color: 'var(--cream-35)' }}>Special Awards</p>

              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { key: 'bestUiux',          label: 'Best UI/UX',               field: 'avgUiux' },
                  { key: 'bestTechnical',      label: 'Best Technical',           field: 'avgTechnical' },
                  { key: 'mostInnovative',     label: 'Most Innovative',          field: 'avgInnovation' },
                  { key: 'bestDocumentation',  label: 'Best Documentation',       field: 'avgDocumentation' }
                ].map(({ key, label, field }, i) => {
                  const w = specialAwards[key];
                  return (
                    <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.07 }} className="card-hi p-4">
                      <p className="text-xs font-medium mb-2.5" style={{ color: 'var(--cream-35)' }}>{label}</p>
                      {w ? (
                        <div className="flex items-end justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--cream)' }}>
                              {w.team?.teamName}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--cream-35)' }}>
                              {w.team?.projectTitle}
                            </p>
                          </div>
                          <p className="font-semibold mono shrink-0"
                            style={{ color: 'var(--cream-60)', letterSpacing: '-0.02em' }}>
                            {w[field]?.toFixed(1)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: 'var(--cream-35)' }}>Not determined</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Remaining */}
            {rest.length > 0 && (
              <section>
                <p className="text-xs font-medium uppercase tracking-[0.14em] mb-3"
                  style={{ color: 'var(--cream-35)' }}>Other Placements</p>
                <div className="space-y-1.5">
                  {rest.map((e, i) => (
                    <div key={e.team?._id || i}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs mono font-medium w-6" style={{ color: 'var(--cream-35)' }}>
                          {String(i + 4).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--cream-60)' }}>
                            {e.team?.teamName}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold mono" style={{ color: 'var(--cream-35)' }}>
                        {e.avgTotal.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
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
