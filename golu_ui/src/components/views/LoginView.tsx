import React, { useState } from 'react';
import { User, Eye, EyeOff, ArrowRight, Lock, Check, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { NationalEmblem } from '../auth/NationalEmblem';

export interface UserAuthProfile {
  username: string;
  name: string;
  role: 'Metrologist' | 'Reviewer' | 'Director' | 'Auditor' | 'Admin';
  roleTitle: string;
  labLocation: string;
}

interface LoginViewProps {
  onLoginSuccess: (user: UserAuthProfile) => void;
}

const DEMO_USERS = {
  metrologist: {
    username: 'metrologist@lm-lab.gov.in',
    password: 'Metro@123',
    role: 'Metrologist' as const,
    name: 'R. K. Ramanathan',
    roleTitle: 'Metrology Testing Officer',
    desc: 'Conduct tests',
    icon: '🧪',
  },
  reviewer: {
    username: 'reviewer@lm-lab.gov.in',
    password: 'Review@123',
    role: 'Reviewer' as const,
    name: 'Priyanka Sharma',
    roleTitle: 'Senior Metrological Reviewer',
    desc: 'Verify results',
    icon: '✓',
  },
  director: {
    username: 'director@lm-lab.gov.in',
    password: 'Director@123',
    role: 'Director' as const,
    name: 'Dr. V. K. Menon',
    roleTitle: 'Laboratory Director',
    desc: 'Approve reports',
    icon: '✍',
  },
  admin: {
    username: 'admin@lm-lab.gov.in',
    password: 'Admin@123',
    role: 'Admin' as const,
    name: 'Shri Alok Verma',
    roleTitle: 'System Administrator',
    desc: 'Manage system',
    icon: '⚙',
  },
};

type RoleKey = keyof typeof DEMO_USERS;

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('metrologist@lm-lab.gov.in');
  const [password, setPassword] = useState('Metro@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleKey>('metrologist');

  // Interactive submission states
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleRoleSelect = (roleKey: RoleKey) => {
    const user = DEMO_USERS[roleKey];
    setSelectedRole(roleKey);
    setUsername(user.username);
    setPassword(user.password);
    setFieldErrors({});
    setErrorMessage(null);
    setToastMessage(`Demo credentials loaded: ${user.role} (${user.desc})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setStatus('loading');

    // Simulate authenticating gateway delay
    setTimeout(() => {
      // Find matching user or fallback to standard role match
      const matched = Object.values(DEMO_USERS).find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (matched && password === matched.password) {
        setStatus('success');
        setTimeout(() => {
          onLoginSuccess({
            username: matched.username,
            name: matched.name,
            role: matched.role,
            roleTitle: matched.roleTitle,
            labLocation: 'RRSL Bengaluru',
          });
        }, 800);
      } else if (!matched && password.length >= 6) {
        // Fallback demo approval for custom username
        setStatus('success');
        setTimeout(() => {
          onLoginSuccess({
            username,
            name: username.split('@')[0],
            role: 'Metrologist',
            roleTitle: 'Metrology Testing Officer',
            labLocation: 'RRSL Bengaluru',
          });
        }, 800);
      } else {
        setStatus('error');
        setErrorMessage(
          'Unable to authenticate: The username or password is incorrect. Please verify your credentials and try again.'
        );
      }
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F6F8FB] flex flex-col justify-between items-center py-8 px-4 font-sans select-none overflow-y-auto">
      {/* Subtle Engineering & Laboratory Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.45] overflow-hidden">
        {/* Fine measurement grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #E2E8F0 1px, transparent 1px),
              linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Faint technical measurement circles suggesting precision weighing platter & calibration reticle */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] text-foundation-300 opacity-25"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="400" cy="400" r="380" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="400" cy="400" r="280" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="400" r="180" stroke="currentColor" strokeWidth="0.8" strokeDasharray="8 4" />
          <circle cx="400" cy="400" r="80" stroke="currentColor" strokeWidth="0.8" />
          <line x1="400" y1="10" x2="400" y2="790" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="10" y1="400" x2="790" y2="400" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Top spacing */}
      <div className="hidden sm:block h-2" />

      {/* Main Login Card (420px - 460px wide, centered) */}
      <div className="relative z-10 w-full max-w-[450px] bg-white/95 backdrop-blur-md border border-[#E4E8EF] rounded-[20px] p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] my-auto transition-all">
        
        {/* Government Identity Area (Section 4) */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-foundation-600 uppercase tracking-widest leading-none">
            Government of India
          </span>

          <div className="my-2.5">
            <NationalEmblem size={44} />
          </div>

          <span className="text-xs font-semibold text-foundation-700 tracking-wide">
            Department of Consumer Affairs
          </span>

          <div className="w-full border-t border-[#E4E8EF] my-3" />

          <h2 className="text-lg font-extrabold tracking-tight text-foundation-950 font-mono">
            METROLOGIX-76
          </h2>

          <p className="text-xs font-medium text-foundation-600 mt-0.5 leading-snug">
            Non-Automatic Weighing Instrument
            <br />
            Verification & Test Reporting System
          </p>

          <span className="text-[10px] font-mono font-medium text-foundation-400 mt-1 tracking-wider uppercase">
            OIML R 76-1:2006 · Legal Metrology
          </span>
        </div>

        {/* Heading Area (Section 5) */}
        <div className="mt-5 pt-3.5 border-t border-foundation-100">
          <h3 className="text-sm font-bold text-foundation-900 tracking-tight">
            Sign in to Laboratory Workspace
          </h3>
          <p className="text-[11px] text-foundation-500 mt-0.5 leading-normal">
            Authenticate to access instrument verification, test sessions and statutory reports.
          </p>
        </div>

        {/* Error Alert (Section 13) */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block">Unable to authenticate</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Toast Feedback for Preset Loading */}
        {toastMessage && (
          <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 animate-fadeIn font-medium">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Username Field (Section 6) */}
          <div>
            <label className="text-xs font-semibold text-foundation-700 block mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foundation-400">
                <User size={15} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: undefined });
                }}
                placeholder="Enter laboratory username"
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-xs text-foundation-900 placeholder-foundation-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                  fieldErrors.username ? 'border-rose-400 focus:ring-rose-400' : 'border-[#E4E8EF]'
                }`}
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
            {fieldErrors.username && (
              <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                {fieldErrors.username}
              </span>
            )}
          </div>

          {/* Password Field (Section 7) */}
          <div>
            <label className="text-xs font-semibold text-foundation-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foundation-400">
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                placeholder="Enter password"
                className={`w-full pl-9 pr-9 py-2.5 bg-white border rounded-lg text-xs font-mono text-foundation-900 placeholder-foundation-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                  fieldErrors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-[#E4E8EF]'
                }`}
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-foundation-400 hover:text-foundation-700 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Secondary Controls: Remember Me + Forgot Password (Section 8) */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-foundation-600 hover:text-foundation-900">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#E4E8EF] text-brand-600 focus:ring-brand-500"
              />
              <span className="text-[11px]">Remember this device</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotNotice(true)}
              className="text-[11px] text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Action Button (Section 9) */}
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`w-full h-11 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
              status === 'success'
                ? 'bg-emerald-600'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800'
            }`}
          >
            {status === 'loading' ? (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : status === 'success' ? (
              <div className="flex items-center gap-2">
                <Check size={16} className="stroke-[3]" />
                <span>Access granted · Opening Workspace...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>Sign in</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </div>
            )}
          </button>
        </form>

        {/* Quick Role Access 2x2 Grid (Section 10 & 11) */}
        <div className="mt-5 pt-3.5 border-t border-foundation-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-foundation-600 block">
                Demo Workspace
              </span>
              <span className="text-[10px] text-foundation-400">
                Use a predefined laboratory role
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-foundation-100 text-foundation-600">
              1-Click
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DEMO_USERS) as RoleKey[]).map((key) => {
              const u = DEMO_USERS[key];
              const isSelected = selectedRole === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleSelect(key)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                      : 'border-[#E4E8EF] hover:border-foundation-300 hover:bg-foundation-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{u.icon}</span>
                    <span className="text-xs font-bold text-foundation-900">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-foundation-500 mt-0.5 pl-4">
                    {u.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security / Trust Indicator (Section 12) */}
        <div className="mt-4 pt-3 border-t border-foundation-100 flex items-center justify-center gap-1.5 text-foundation-500 text-[11px]">
          <Lock size={12} className="text-foundation-400" />
          <span className="font-medium">Secure Laboratory Environment</span>
          <span className="text-foundation-300">·</span>
          <span>Authorized personnel only</span>
        </div>
      </div>

      {/* Statutory Footer Below the Card (Section 12) */}
      <footer className="relative z-10 text-center text-foundation-500 text-[11px] select-none py-3">
        <div className="font-mono text-foundation-600 font-medium">
          METROLOGIX-76 <span className="text-foundation-300">·</span> v1.0.0
        </div>
        <div className="mt-0.5 text-foundation-400 text-[10px]">
          OIML R 76-1:2006 <span className="text-foundation-300">•</span> Legal Metrology Act 2009 <span className="text-foundation-300">•</span> Department of Consumer Affairs (DoCA)
        </div>
      </footer>

      {/* Forgot Password Notice Modal */}
      {showForgotNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foundation-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-foundation-200 p-5 max-w-sm w-full shadow-lg text-center animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Info size={20} />
            </div>
            <h4 className="text-sm font-bold text-foundation-900">
              Laboratory Password Recovery
            </h4>
            <p className="text-xs text-foundation-600 mt-1.5 leading-relaxed">
              Password recovery is managed by your laboratory administrator. Please contact your Regional Reference Standard Laboratory (RRSL) IT coordinator for credential reset.
            </p>
            <button
              onClick={() => setShowForgotNotice(false)}
              className="mt-4 w-full py-2 bg-foundation-100 hover:bg-foundation-200 text-foundation-800 text-xs font-semibold rounded-lg transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
