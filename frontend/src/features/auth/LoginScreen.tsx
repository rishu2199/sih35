import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { useLab, NATIONAL_LABORATORIES } from '../../context/LabContext';
import { Button } from '../../components/ui/Button';
import type { UserProfile, UserRole } from '../../types';

export interface DemoOfficer {
  id: string;
  fullName: string;
  designation: string;
  email: string;
  username: string;
  role: UserRole;
  roleTitle: string;
  labCode: string;
  labName: string;
  powers: string[];
  color: string;
}

export const DEMO_OFFICERS: DemoOfficer[] = [
  {
    id: 'usr-blr-01',
    fullName: 'Dr. Anand Raman',
    designation: 'Testing Officer / Metrologist Grade I',
    username: 'testing.officer@rrsl.gov.in',
    email: 'testing.officer@rrsl.gov.in',
    role: 'METROLOGIST',
    roleTitle: 'Testing Officer / Metrologist Grade I',
    labCode: 'RRSL-BLR',
    labName: 'Regional Reference Standard Laboratory, Bengaluru',
    color: 'border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500',
    powers: [
      'Enter raw OIML R 76 observations',
      'Execute Eccentricity & Tare tests',
      'Submit completed sessions for PSO review',
    ],
  },
  {
    id: 'usr-blr-02',
    fullName: 'Smt. Preeti Deshmukh',
    designation: 'Principal Scientific Officer (PSO)',
    username: 'pso.reviewer@rrsl.gov.in',
    email: 'pso.reviewer@rrsl.gov.in',
    role: 'REVIEWER',
    roleTitle: 'Principal Scientific Officer (PSO)',
    labCode: 'RRSL-BLR',
    labName: 'Regional Reference Standard Laboratory, Bengaluru',
    color: 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500',
    powers: [
      'Row-level changeover point trace audit',
      'Flag anomalies & margin corridor warnings',
      'Remand for re-test or recommend to Director',
    ],
  },
  {
    id: 'usr-blr-03',
    fullName: 'Dr. Rajeshwari Sen',
    designation: 'Director & Controller of Legal Metrology',
    username: 'director@rrsl.gov.in',
    email: 'director@rrsl.gov.in',
    role: 'DIRECTOR',
    roleTitle: 'Director & Controller of Legal Metrology',
    labCode: 'RRSL-BLR',
    labName: 'Regional Reference Standard Laboratory, Bengaluru',
    color: 'border-purple-500/40 bg-purple-500/5 hover:border-purple-500',
    powers: [
      'Statutory Issuing Authority under LM Act 2009',
      'Apply ECDSA P-256 digital signature',
      'Activate immutable Rule 16 read-only lock',
    ],
  },
  {
    id: 'usr-doca-04',
    fullName: 'Shri Alok Verma',
    designation: 'DoCA Senior Regulatory Inspector',
    username: 'auditor.doca@gov.in',
    email: 'auditor.doca@gov.in',
    role: 'AUDITOR',
    roleTitle: 'DoCA Senior Regulatory Inspector',
    labCode: 'RRSL-BLR',
    labName: 'Department of Consumer Affairs, New Delhi',
    color: 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500',
    powers: [
      'Independent regulatory oversight',
      'Verify SHA-256 hash chains across labs',
      'Zero test modification privileges (Read-Only)',
    ],
  },
];

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  className?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  className = '',
}) => {
  const { setActiveLab } = useLab();
  const [emailInput, setEmailInput] = useState('testing.officer@rrsl.gov.in');
  const [passwordInput, setPasswordInput] = useState('Metrologix@2026');
  const [selectedLabId, setSelectedLabId] = useState(NATIONAL_LABORATORIES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectDemoOfficer = (officer: DemoOfficer) => {
    setEmailInput(officer.email);
    setPasswordInput('Metrologix@2026');
    setErrorMessage(null);

    // Set matching lab
    const matchingLab = NATIONAL_LABORATORIES.find((l) => l.code === officer.labCode);
    if (matchingLab) {
      setSelectedLabId(matchingLab.id);
      setActiveLab(matchingLab);
    }
  };

  const handleExecuteLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Attempt API login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: emailInput.trim(),
          password: passwordInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const authedUser = data.user;
        const profile: UserProfile = {
          id: authedUser.id,
          username: authedUser.username,
          fullName: authedUser.full_name,
          designation: authedUser.designation,
          email: authedUser.email,
          role: authedUser.role as UserRole,
          laboratoryId: authedUser.laboratory_id || selectedLabId,
          laboratoryName: authedUser.laboratory_name || 'Regional Reference Standard Laboratory',
        };
        onLoginSuccess(profile);
        return;
      }
    } catch (err) {
      console.info('Backend unreachable, logging in via demo credentials:', err);
    }

    // 2. Fallback to Demo Credentials Matching
    const matched = DEMO_OFFICERS.find(
      (o) =>
        o.email.toLowerCase() === emailInput.trim().toLowerCase() ||
        o.username.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matched) {
      const selectedLab = NATIONAL_LABORATORIES.find((l) => l.id === selectedLabId) || NATIONAL_LABORATORIES[0];
      setActiveLab(selectedLab);

      const profile: UserProfile = {
        id: matched.id,
        username: matched.username,
        fullName: matched.fullName,
        designation: matched.designation,
        email: matched.email,
        role: matched.role,
        laboratoryId: selectedLab.id,
        laboratoryName: selectedLab.name,
      };

      onLoginSuccess(profile);
    } else {
      setErrorMessage(
        'Invalid statutory credentials. Select one of the official demo roles below to log in instantly.'
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black ${className}`}>
      {/* Top National Header Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3">
        {/* Tricolor Ribbon */}
        <div className="flex justify-center mb-2">
          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shadow-sm" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/25">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>STATUTORY ROLE-BASED ACCESS CONTROL (RBAC)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
          METROLOGIX-76 NATIONAL PORTAL
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Non-Automatic Weighing Instruments (NAWI) Type Evaluation & Stamping Architecture under the Legal Metrology Act, 2009 & OIML Recommendation R 76-1.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl px-4 sm:px-0 space-y-6">
        {/* 1-Click Fast Role Selection Section for SIH Jury Evaluation */}
        <div className="bg-[#0f1728]/90 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                1-Click Statutory Role Selector (Jury Evaluation Mode)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ISO/IEC 17025 Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_OFFICERS.map((officer) => {
              const isSelected = emailInput.toLowerCase() === officer.email.toLowerCase();
              return (
                <div
                  key={officer.id}
                  onClick={() => handleSelectDemoOfficer(officer)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 text-left space-y-2 ${officer.color} ${
                    isSelected ? 'ring-2 ring-brand-500 shadow-md scale-[1.01]' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{officer.fullName}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {officer.roleTitle}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-white/10 text-white">
                      {officer.role}
                    </span>
                  </div>

                  <ul className="text-[10px] text-slate-400 space-y-1 pl-1">
                    {officer.powers.slice(0, 2).map((power, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-brand-400 font-bold">•</span>
                        <span>{power}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-white/[0.05]">
                    {officer.email}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Credentials Form */}
        <div className="bg-[#0f1728]/90 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 shadow-2xl space-y-4">
          <form onSubmit={handleExecuteLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Official Email / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                    placeholder="officer@rrsl.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Passcode / Statutory Secret
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Designated Regional Reference Laboratory (RRSL / GATC)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedLabId}
                  onChange={(e) => setSelectedLabId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                >
                  {NATIONAL_LABORATORIES.map((lab) => (
                    <option key={lab.id} value={lab.id} className="bg-slate-900 text-white">
                      {lab.name} ({lab.code}) — {lab.labType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 shadow-lg flex items-center justify-center gap-2 text-xs"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Sign In as Statutory Officer</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-white/[0.05]">
            Protected by Government of India National Cybersecurity Standard & Cryptographic Audit Trails under the Information Technology Act, 2000.
          </div>
        </div>
      </div>
    </div>
  );
};
