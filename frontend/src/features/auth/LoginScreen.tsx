import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  BadgeCheck,
  Lock,
  Scale,
  Sparkles,
  Info,
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
}

export const DEMO_OFFICERS: DemoOfficer[] = [
  {
    id: 'usr-blr-01',
    fullName: 'Dr. Anand Raman',
    designation: 'Testing Officer / Metrologist Grade I',
    username: 'testing.officer@rrsl.gov.in',
    email: 'testing.officer@rrsl.gov.in',
    role: 'METROLOGIST',
    roleTitle: 'Testing Officer',
    labCode: 'RRSL-BLR',
    labName: 'Regional Reference Standard Laboratory, Bengaluru',
    powers: ['Record test observations', 'Execute eccentricity & repeatability', 'Submit for review'],
  },
  {
    id: 'usr-blr-02',
    fullName: 'Smt. Preeti Deshmukh',
    designation: 'Principal Scientific Officer (PSO)',
    username: 'pso.reviewer@rrsl.gov.in',
    email: 'pso.reviewer@rrsl.gov.in',
    role: 'REVIEWER',
    roleTitle: 'Technical Reviewer',
    labCode: 'RRSL-BLR',
    labName: 'Regional Reference Standard Laboratory, Bengaluru',
    powers: ['Audit row calculations & MPE', 'Flag anomalies & margins', 'Recommend or remand sessions'],
  },
  {
    id: 'usr-blr-03',
    fullName: 'Dr. Rajeshwari Sen',
    designation: 'Director & Controller of Legal Metrology',
    username: 'director@rrsl.gov.in',
    email: 'director@rrsl.gov.in',
    role: 'DIRECTOR',
    roleTitle: 'Lab Director',
    labCode: 'RRSL-BLR',
    labName: 'Regional Reference Standard Laboratory, Bengaluru',
    powers: ['Statutory issuing authority', 'Apply ECDSA digital signature', 'Lock approved certificates'],
  },
  {
    id: 'usr-doca-04',
    fullName: 'Shri Alok Verma',
    designation: 'Senior Regulatory Inspector',
    username: 'auditor.doca@gov.in',
    email: 'auditor.doca@gov.in',
    role: 'AUDITOR',
    roleTitle: 'DoCA Auditor',
    labCode: 'GATC-DEL',
    labName: 'Central Regulatory Oversight, New Delhi',
    powers: ['Read-only audit trail access', 'Verify SHA-256 hash chains', 'Inspect issued reports'],
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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [emailInput, setEmailInput] = useState('testing.officer@rrsl.gov.in');
  const [passwordInput, setPasswordInput] = useState('Metrologix@2026');
  const [selectedLabId, setSelectedLabId] = useState(NATIONAL_LABORATORIES[0].id);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // Sign Up state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('METROLOGIST');
  const [signupDesignation, setSignupDesignation] = useState('Testing Officer / Scientific Officer Grade I');
  const [signupLabId, setSignupLabId] = useState(NATIONAL_LABORATORIES[0].id);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDirectorPin, setSignupDirectorPin] = useState('');
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  // Quick 1-click select demo officer
  const handleSelectDemoOfficer = (officer: DemoOfficer) => {
    setEmailInput(officer.email);
    setPasswordInput('Metrologix@2026');
    setErrorMessage(null);
    setSuccessMessage(null);

    const matchingLab = NATIONAL_LABORATORIES.find((l) => l.code === officer.labCode);
    if (matchingLab) {
      setSelectedLabId(matchingLab.id);
      setActiveLab(matchingLab);
    }
  };

  // 1-Click Instant Login as Demo Officer
  const handleDirectDemoLogin = (officer: DemoOfficer) => {
    const selectedLab =
      NATIONAL_LABORATORIES.find((l) => l.code === officer.labCode) || NATIONAL_LABORATORIES[0];
    setActiveLab(selectedLab);

    const profile: UserProfile = {
      id: officer.id,
      username: officer.username,
      fullName: officer.fullName,
      designation: officer.designation,
      email: officer.email,
      role: officer.role,
      laboratoryId: selectedLab.id,
      laboratoryName: selectedLab.name,
    };

    onLoginSuccess(profile);
  };

  // Sign In Form Submission
  const handleExecuteLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Attempt backend API call if online
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
    } catch {
      // Offline fallback continues below
    }

    // 2. Demo Officers Credentials Fallback
    const matched = DEMO_OFFICERS.find(
      (o) =>
        o.email.toLowerCase() === emailInput.trim().toLowerCase() ||
        o.username.toLowerCase() === emailInput.trim().toLowerCase()
    );

    // Also check any locally registered officers in localStorage
    let registeredUsers: UserProfile[] = [];
    try {
      const stored = localStorage.getItem('metrologix_registered_officers');
      if (stored) registeredUsers = JSON.parse(stored);
    } catch {
      // ignore
    }
    const matchedCustom = registeredUsers.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matched) {
      const selectedLab =
        NATIONAL_LABORATORIES.find((l) => l.id === selectedLabId) || NATIONAL_LABORATORIES[0];
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
    } else if (matchedCustom) {
      const selectedLab =
        NATIONAL_LABORATORIES.find((l) => l.id === matchedCustom.laboratoryId) || NATIONAL_LABORATORIES[0];
      setActiveLab(selectedLab);
      onLoginSuccess(matchedCustom);
    } else {
      setErrorMessage(
        'Invalid credentials. For evaluation, click any demo role on the left or use password: Metrologix@2026'
      );
    }
    setIsSubmitting(false);
  };

  // Sign Up / Officer Registration Form Submission
  const handleExecuteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validations
    if (!signupFullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (signupRole === 'DIRECTOR' && signupDirectorPin.length !== 4) {
      setErrorMessage('Lab Directors must provide a 4-digit PIN for statutory signing.');
      return;
    }
    if (!signupTermsAccepted) {
      setErrorMessage('Please accept the statutory declaration of duty separation.');
      return;
    }

    setIsSubmitting(true);

    const selectedLab =
      NATIONAL_LABORATORIES.find((l) => l.id === signupLabId) || NATIONAL_LABORATORIES[0];
    setActiveLab(selectedLab);

    const newOfficer: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      username: signupEmail.split('@')[0],
      fullName: signupFullName.trim(),
      designation: signupDesignation.trim(),
      email: signupEmail.trim().toLowerCase(),
      role: signupRole,
      laboratoryId: selectedLab.id,
      laboratoryName: selectedLab.name,
    };

    // Store in localStorage for persistence
    try {
      const stored = localStorage.getItem('metrologix_registered_officers');
      const existing: UserProfile[] = stored ? JSON.parse(stored) : [];
      existing.push(newOfficer);
      localStorage.setItem('metrologix_registered_officers', JSON.stringify(existing));
    } catch {
      // ignore
    }

    // Try backend registration if available
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newOfficer.fullName,
          email: newOfficer.email,
          role: newOfficer.role,
          designation: newOfficer.designation,
          laboratory_id: newOfficer.laboratoryId,
          password: signupPassword,
          director_pin: signupRole === 'DIRECTOR' ? signupDirectorPin : undefined,
        }),
      });
    } catch {
      // Offline fallback continues
    }

    setSuccessMessage(`Account created for ${newOfficer.fullName}. Authenticating...`);

    setTimeout(() => {
      onLoginSuccess(newOfficer);
    }, 800);
  };

  // Update suggested designation on role change
  const handleRoleChange = (role: UserRole) => {
    setSignupRole(role);
    switch (role) {
      case 'METROLOGIST':
        setSignupDesignation('Testing Officer / Scientific Officer Grade I');
        break;
      case 'REVIEWER':
        setSignupDesignation('Principal Scientific Officer (PSO)');
        break;
      case 'DIRECTOR':
        setSignupDesignation('Director & Controller of Legal Metrology');
        break;
      case 'AUDITOR':
        setSignupDesignation('Senior Regulatory Inspector');
        break;
      default:
        setSignupDesignation('Legal Metrology Officer');
    }
  };

  return (
    <div className={`min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans ${className}`}>
      {/* Background Decorative Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* ============================================================ */}
        {/* LEFT SHOWCASE PANEL: Trust, Authority & 1-Click Demo Roles */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0f172a] via-[#090e1a] to-[#060a12] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between">
          <div className="space-y-6">
            {/* National Tricolor Line */}
            <div className="flex items-center gap-1 w-20 h-1 rounded-full overflow-hidden">
              <div className="h-full flex-1 bg-amber-500" />
              <div className="h-full flex-1 bg-white" />
              <div className="h-full flex-1 bg-emerald-500" />
            </div>

            {/* Department Brand */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25 mb-2">
                <ShieldCheck className="w-3 h-3" />
                <span>GOVERNMENT OF INDIA</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                METROLOGIX-76
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                National Portal for Non-Automatic Weighing Instruments (NAWI) Model Approval under OIML Recommendation R 76-1 and Legal Metrology Act, 2009.
              </p>
            </div>

            {/* Statutory Key Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deterministic OIML R 76 Table 3 & 6 error calculations</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>ISO/IEC 17025 standard weights traceability lockout</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <Fingerprint className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Cryptographic ECDSA digital signatures & eMaap QR codes</span>
              </div>
            </div>

            {/* 1-Click Demo Evaluation Launcher */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Click Demo Roles (Jury Mode)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoHelp(!showDemoHelp)}
                  className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>

              {showDemoHelp && (
                <p className="text-[11px] text-slate-400 leading-relaxed bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.05]">
                  Clicking any role below will instantly sign you in with pre-configured statutory privileges to evaluate duty separation.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                {DEMO_OFFICERS.map((officer) => {
                  const isSelected = emailInput.toLowerCase() === officer.email.toLowerCase();
                  return (
                    <button
                      key={officer.id}
                      type="button"
                      onClick={() => handleSelectDemoOfficer(officer)}
                      onDoubleClick={() => handleDirectDemoLogin(officer)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 shadow-sm'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span>{officer.roleTitle}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {officer.fullName}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                        {officer.role}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                <span>Single click: pre-fill form</span>
                <span>Double click: instant login</span>
              </div>
            </div>
          </div>

          {/* Footer attribution */}
          <div className="pt-6 mt-4 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Department of Consumer Affairs</span>
            <span>DoCA / SIH 26035</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT AUTH PANEL: Segmented Tab Switcher (Sign In / Register) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-[#0c121e]/70 flex flex-col justify-between">
          <div>
            {/* Top Segmented Control Switcher */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Officer</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <Scale className="w-3.5 h-3.5 text-blue-400" />
                <span>RRSL / GATC Gateway</span>
              </div>
            </div>

            {/* Error Message Callout */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Callout */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* VIEW A: SIGN IN FORM */}
            {/* ------------------------------------------------------------ */}
            {authMode === 'signin' && (
              <form onSubmit={handleExecuteLogin} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Statutory Officer Sign In
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authenticate to access your assigned laboratory workbench.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  {/* Email / Username */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Official Email or Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="officer@rrsl.gov.in"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">
                        Passcode / Statutory Secret
                      </label>
                      <span className="text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer">
                        Metrologix@2026
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Laboratory Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Assigned Reference Laboratory
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={selectedLabId}
                        onChange={(e) => setSelectedLabId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        {NATIONAL_LABORATORIES.map((lab) => (
                          <option key={lab.id} value={lab.id} className="bg-slate-900 text-white">
                            {lab.name} ({lab.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Remember Terminal Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberTerminal"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="rounded border-slate-700 bg-black/40 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="rememberTerminal" className="text-xs text-slate-400 select-none cursor-pointer">
                      Keep this terminal session active for 8 hours
                    </label>
                  </div>
                </div>

                {/* Primary Sign In Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------ */}
            {/* VIEW B: REGISTER OFFICER (SIGN UP) FORM */}
            {/* ------------------------------------------------------------ */}
            {authMode === 'signup' && (
              <form onSubmit={handleExecuteSignup} className="space-y-3.5">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Register Statutory Officer
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enroll a new testing officer, reviewer, or issuing director into the laboratory network.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Full Name & Email (2-Column) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        placeholder="Dr. Anand Raman"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Official Email
                      </label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="officer@rrsl.gov.in"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Role Segmented Selector Pills */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Statutory Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(['METROLOGIST', 'REVIEWER', 'DIRECTOR', 'AUDITOR'] as UserRole[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleChange(role)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                            signupRole === role
                              ? 'bg-blue-600 text-white border border-blue-400 shadow-sm'
                              : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Designation & Laboratory (2-Column) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Designation / Official Title
                      </label>
                      <input
                        type="text"
                        required
                        value={signupDesignation}
                        onChange={(e) => setSignupDesignation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Assigned Laboratory
                      </label>
                      <select
                        value={signupLabId}
                        onChange={(e) => setSignupLabId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        {NATIONAL_LABORATORIES.map((lab) => (
                          <option key={lab.id} value={lab.id} className="bg-slate-900 text-white">
                            {lab.code} — {lab.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm Password (2-Column) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Terminal Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-black/40 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Conditional Director PIN Setup (Only if role === DIRECTOR) */}
                  {signupRole === 'DIRECTOR' && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Director Statutory Signing PIN (4 Digits)</span>
                      </div>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={signupDirectorPin}
                        onChange={(e) => setSignupDirectorPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 7620"
                        className="w-32 px-3 py-1.5 text-center font-mono tracking-widest text-sm rounded-lg border border-purple-500/40 bg-black/40 text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-[10px] text-purple-400">
                        This PIN is required to authorize and stamp official OIML R 76-2 certificates with your digital signature.
                      </p>
                    </div>
                  )}

                  {/* Statutory Terms Declaration */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="signupTerms"
                      checked={signupTermsAccepted}
                      onChange={(e) => setSignupTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-black/40 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="signupTerms" className="text-[11px] text-slate-400 leading-snug cursor-pointer">
                      I declare that I am an authorized testing officer under the Legal Metrology Act, 2009, bound by strict separation of duties and statutory non-repudiation.
                    </label>
                  </div>
                </div>

                {/* Primary Register Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <span>Register & Access Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Security Note */}
          <div className="pt-4 mt-6 border-t border-white/[0.06] text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Encrypted laboratory session under Department of Consumer Affairs guidelines</span>
          </div>
        </div>
      </div>
    </div>
  );
};
