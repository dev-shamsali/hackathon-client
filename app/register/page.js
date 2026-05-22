'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Upload, ChevronLeft, ArrowRight, Check, Loader2, Copy, X } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

const STEPS = ['Team', 'Project', 'Documents'];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    teamName: '', leaderName: '', email: '', members: '',
    institute: '', projectTitle: '', problemStatement: '', techStack: '',
    prd: null, trd: null
  });

  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const next = () => {
    if (step === 0) {
      if (!form.teamName || !form.leaderName || !form.email || !form.institute)
        return toast.error('Please fill all required fields');
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Invalid email');
    }
    if (step === 1) {
      if (!form.projectTitle || !form.problemStatement || !form.techStack)
        return toast.error('Please fill all required fields');
    }
    setStep(s => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      ['teamName','leaderName','email','members','institute','projectTitle','problemStatement','techStack'].forEach(k => {
        if (form[k]) fd.append(k, form[k]);
      });
      if (form.prd) fd.append('prd', form.prd);
      if (form.trd) fd.append('trd', form.trd);

      const { data } = await api.post('/teams/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTeamInfo(data.team);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(teamInfo.teamId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Success state ── */
  if (teamInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm">

          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-8"
            style={{ background: 'var(--cream)', border: '1px solid var(--line-md)' }}>
            <Check size={18} strokeWidth={2.5} style={{ color: 'var(--bg)' }} />
          </div>

          <h2 className="font-semibold mb-2"
            style={{ fontSize: '1.8rem', color: 'var(--cream)', letterSpacing: '-0.03em' }}>
            Registered
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--cream-35)' }}>
            Your team has been submitted successfully.
          </p>

          <div className="card-hi p-5 mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.12em] mb-3"
              style={{ color: 'var(--cream-35)' }}>
              Team ID
            </p>
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold mono" style={{ fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em' }}>
                {teamInfo.teamId}
              </p>
              <button onClick={copyId} className="btn-ghost"
                style={{ padding: '7px 14px', fontSize: '12px', gap: '5px' }}>
                <Copy size={12} strokeWidth={2} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--cream-60)' }}>{teamInfo.teamName}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cream-35)' }}>
                Save your Team ID for reference during the event.
              </p>
            </div>
          </div>

          <Link href="/">
            <button className="btn-primary w-full">Return to Home</button>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-10">
          <Logo size="sm" showText href="/" />
          <Link href="/">
            <motion.div whileHover={{ x: -2 }}
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: 'var(--cream-35)' }}>
              <ChevronLeft size={15} strokeWidth={1.5} /> Back
            </motion.div>
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--accent)' }}>
            Team Registration
          </p>
          <h1 className="font-semibold" style={{ fontSize: '2rem', color: 'var(--cream)', letterSpacing: '-0.03em' }}>
            Register your team
          </h1>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                  style={i < step ? {
                    background: 'var(--cream)', color: 'var(--bg)'
                  } : i === step ? {
                    background: 'var(--cream)', color: 'var(--bg)',
                    boxShadow: '0 0 0 3px rgba(242,234,216,0.12)'
                  } : {
                    background: 'transparent', color: 'var(--cream-35)',
                    border: '1px solid var(--line-md)'
                  }}>
                  {i < step ? <Check size={11} strokeWidth={3} /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block"
                  style={{ color: i <= step ? 'var(--cream-60)' : 'var(--cream-35)' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-3 transition-all duration-400"
                  style={{ background: i < step ? 'var(--line-hi)' : 'var(--line)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
            <div className="card-hi p-6 sm:p-7">

              {step === 0 && (
                <div className="space-y-4">
                  <SectionHead title="Team Information" />
                  <Field label="Team Name *" ph="Innovators X" val={form.teamName} set={v => u('teamName', v)} />
                  <Field label="Team Leader *" ph="John Doe" val={form.leaderName} set={v => u('leaderName', v)} />
                  <Field label="Email Address *" type="email" ph="team@example.com" val={form.email} set={v => u('email', v)} />
                  <Field label="Institute / College *" ph="MIT, IIT Delhi…" val={form.institute} set={v => u('institute', v)} />
                  <Field label="Team Members" ph="Alice, Bob, Charlie (comma separated)" val={form.members} set={v => u('members', v)} />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <SectionHead title="Project Details" />
                  <Field label="Project Title *" ph="AI-Powered Health Monitor" val={form.projectTitle} set={v => u('projectTitle', v)} />
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>
                      Problem Statement *
                    </label>
                    <textarea rows={4} placeholder="Describe the problem your solution addresses..."
                      value={form.problemStatement} onChange={e => u('problemStatement', e.target.value)}
                      className="field" style={{ resize: 'vertical', minHeight: '96px' }} />
                  </div>
                  <Field label="Tech Stack *" ph="React, Node.js, MongoDB, AWS" val={form.techStack} set={v => u('techStack', v)} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <SectionHead title="Documents" sub="Optional — Improves evaluation depth" />
                  <FileField label="PRD Document" file={form.prd} set={f => u('prd', f)} />
                  <FileField label="TRD Document" file={form.trd} set={f => u('trd', f)} />
                  <p className="text-xs" style={{ color: 'var(--cream-35)' }}>
                    Accepted formats: PDF, DOC, DOCX — max 10 MB per file.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-7">
                {step > 0 && (
                  <button className="btn-ghost flex-1" onClick={() => setStep(s => s - 1)}>
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <motion.button whileTap={{ scale: 0.99 }} onClick={next}
                    className="btn-primary flex-1">
                    Continue <ArrowRight size={14} strokeWidth={2} />
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.99 }} onClick={submit} disabled={loading}
                    className="btn-primary flex-1">
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Submitting</>
                    ) : 'Submit Registration'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div className="mb-1">
      <p className="text-sm font-semibold" style={{ color: 'var(--cream)', letterSpacing: '-0.01em' }}>{title}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--cream-35)' }}>{sub}</p>}
    </div>
  );
}

function Field({ label, ph, val, set, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>{label}</label>
      <input type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)} className="field" />
    </div>
  );
}

function FileField({ label, file, set }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--cream-60)' }}>{label}</label>
      <div className="relative">
        <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all"
          style={{
            background: 'var(--surface)',
            border: `1px dashed ${file ? 'rgba(242,234,216,0.22)' : 'rgba(242,234,216,0.1)'}`,
          }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: file ? 'var(--cream)' : 'var(--hover)', border: file ? 'none' : '1px solid var(--line-md)' }}>
            <Upload size={13} strokeWidth={2} style={{ color: file ? 'var(--bg)' : 'var(--cream-35)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: file ? 'var(--cream-60)' : 'var(--cream-35)' }}>
              {file ? file.name : 'Click to upload'}
            </p>
          </div>
          {file && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--cream)' }}>
              <Check size={10} strokeWidth={3} style={{ color: 'var(--bg)' }} />
            </div>
          )}
          <input type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={e => set(e.target.files?.[0] || null)} />
        </label>
        {file && (
          <button type="button" onClick={e => { e.preventDefault(); set(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--hover)', border: '1px solid var(--line-md)' }}>
            <X size={10} strokeWidth={2} style={{ color: 'var(--cream-35)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
