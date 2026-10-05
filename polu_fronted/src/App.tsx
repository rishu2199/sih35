import { FormEvent, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { DEMO_OFFICERS, LABORATORIES } from './data/mockAuth'
import { ROLE_META, type DemoOfficer, type LaboratoryId, type UserRole } from './types/auth'

type FormState = {
  email: string
  password: string
  laboratoryId: LaboratoryId
  remember: boolean
}

const INITIAL_FORM: FormState = {
  email: 'anand.raman@rrsl.gov.in',
  password: 'metro123',
  laboratoryId: 'rrsl-bengaluru',
  remember: true,
}

const roleOrder: UserRole[] = ['METROLOGIST', 'REVIEWER', 'DIRECTOR', 'AUDITOR']

function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('METROLOGIST')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signedInOfficer, setSignedInOfficer] = useState<DemoOfficer | null>(null)
  const [error, setError] = useState('')

  const selectedLab = useMemo(
    () => LABORATORIES.find((lab) => lab.id === form.laboratoryId) ?? LABORATORIES[0],
    [form.laboratoryId],
  )

  const applyDemoOfficer = (officer: DemoOfficer) => {
    setSelectedRole(officer.role)
    setForm((current) => ({
      ...current,
      email: officer.email,
      password: officer.password,
      laboratoryId: officer.laboratoryId,
    }))
    setError('')
    setSignedInOfficer(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSignedInOfficer(null)

    if (!form.email.trim() || !form.password.trim()) {
      setError('Enter your official email and password to continue.')
      return
    }

    const officer = DEMO_OFFICERS.find(
      (candidate) =>
        candidate.email.toLowerCase() === form.email.trim().toLowerCase() &&
        candidate.password === form.password,
    )

    if (!officer) {
      setError('Those credentials do not match a demo officer. Use a role below to fill a valid profile.')
      return
    }

    setIsSigningIn(true)
    window.setTimeout(() => {
      setIsSigningIn(false)
      setSignedInOfficer(officer)
    }, 650)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080c14]">
      <BackgroundGrid />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <EmblemMark />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Government of India
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-200">Department of Consumer Affairs</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              Secure laboratory network
            </span>
            <span className="text-slate-700">/</span>
            <span className="font-mono text-[11px]">v0.1.0 DEMO</span>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:gap-24 lg:py-16">
          <section className="max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/[0.07] px-3 py-1.5 text-[11px] font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              OIML R 76 verification workspace
            </div>
            <h1 className="max-w-[650px] text-4xl font-semibold leading-[1.07] tracking-[-0.04em] text-white sm:text-5xl lg:text-[4.25rem]">
              Make every measurement
              <span className="block text-slate-500">legally defensible.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-slate-400 sm:text-lg">
              A clear, traceable workspace for testing non-automatic weighing instruments from intake to sealed certificate.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
              <TrustSignal icon={<ShieldCheck />} label="ISO/IEC 17025" detail="Aligned workflow" />
              <TrustSignal icon={<Fingerprint />} label="SHA-256 trail" detail="Tamper evident" />
              <TrustSignal icon={<Wifi />} label="Offline ready" detail="Air-gapped labs" />
            </div>

            <div className="mt-12 hidden items-center gap-4 border-t border-white/[0.08] pt-5 text-xs text-slate-500 lg:flex">
              <span>Legal Metrology Act, 2009</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>OIML R 76-1:2006</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>NABL traceability</span>
            </div>
          </section>

          <section className="w-full">
            <div className="glass-card rounded-2xl p-5 sm:p-7">
              {signedInOfficer ? (
                <SignedInState officer={signedInOfficer} lab={selectedLab} onBack={() => setSignedInOfficer(null)} />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-300">Secure access</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Sign in to MetroLogix</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">Use your official laboratory identity.</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-2.5 text-emerald-300" title="Protected session">
                      <LockKeyhole className="h-4 w-4" />
                    </div>
                  </div>

                  <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
                    <Field label="Laboratory" htmlFor="laboratory">
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <select
                          id="laboratory"
                          value={form.laboratoryId}
                          onChange={(event) => setForm((current) => ({ ...current, laboratoryId: event.target.value as LaboratoryId }))}
                          className="field-input appearance-none pl-10 pr-10"
                        >
                          {LABORATORIES.map((lab) => (
                            <option key={lab.id} value={lab.id}>
                              {lab.code} · {lab.city}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{selectedLab.name} · {selectedLab.nablAccreditationNo}</p>
                    </Field>

                    <Field label="Official email" htmlFor="email">
                      <input
                        id="email"
                        type="email"
                        autoComplete="username"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        className="field-input"
                        placeholder="name@rrsl.gov.in"
                      />
                    </Field>

                    <Field label="Password" htmlFor="password">
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={form.password}
                          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                          className="field-input pr-12"
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((visible) => !visible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    <div className="flex items-center justify-between gap-4">
                      <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={form.remember}
                          onChange={(event) => setForm((current) => ({ ...current, remember: event.target.checked }))}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500 focus:ring-2 focus:ring-brand-500/40"
                        />
                        Keep me signed in
                      </label>
                      <button type="button" className="text-xs font-medium text-brand-300 transition hover:text-brand-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2">
                        Need help?
                      </button>
                    </div>

                    {error && (
                      <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/[0.08] px-3.5 py-3 text-xs leading-5 text-rose-200">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button type="submit" disabled={isSigningIn} className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 disabled:cursor-wait disabled:opacity-70">
                      {isSigningIn ? 'Verifying identity…' : 'Continue to workspace'}
                      {!isSigningIn && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                    </button>
                  </form>

                  <div className="my-7 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600">Demo profiles</span>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {roleOrder.map((role) => {
                      const officer = DEMO_OFFICERS.find((candidate) => candidate.role === role)!
                      const meta = ROLE_META[role]
                      const active = selectedRole === role
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => applyDemoOfficer(officer)}
                          className={`group rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 ${active ? `${meta.pillClass} border-current/30` : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]'}`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                              {meta.label}
                            </span>
                            {active && <Check className="h-3.5 w-3.5 text-current" />}
                          </span>
                          <span className="mt-1.5 block truncate text-[10px] text-slate-500">{officer.fullName}</span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-4 text-center text-[11px] leading-5 text-slate-600">Demo profiles fill valid credentials locally. No data leaves this page.</p>
                </>
              )}
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-slate-600">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500/70" />
              Protected under the Legal Metrology Act, 2009
            </p>
          </section>
        </div>

        <footer className="flex flex-col gap-2 border-t border-white/[0.08] pt-4 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>METROLOGIX-76 · Digital verification for NAWI laboratories</span>
          <span className="flex items-center gap-1.5"><Globe2 className="h-3 w-3" /> English · India</span>
        </footer>
      </div>
    </main>
  )
}

function BackgroundGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-brand-600/[0.07] blur-[130px]" />
      <div className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-emerald-500/[0.035] blur-[130px]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
    </div>
  )
}

function EmblemMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-100/[0.05] text-amber-100">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-200/40">
        <span className="font-serif text-lg leading-none">अ</span>
      </div>
      <span className="absolute -bottom-1 rounded bg-[#080c14] px-1 text-[7px] font-semibold tracking-widest text-amber-200/70">भारत</span>
    </div>
  )
}

function TrustSignal({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
      <span className="text-brand-300 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-medium text-slate-300">{label}</span>
        <span className="block truncate text-[10px] text-slate-600">{detail}</span>
      </span>
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-xs font-medium text-slate-300">{label}</label>
      {children}
    </div>
  )
}

function SignedInState({ officer, lab, onBack }: { officer: DemoOfficer; lab: (typeof LABORATORIES)[number]; onBack: () => void }) {
  const meta = ROLE_META[officer.role]
  return (
    <div className="flex min-h-[490px] flex-col justify-between">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
          <Check className="h-6 w-6" />
        </div>
        <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">Identity verified</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Welcome, {officer.fullName.split(' ').slice(-1)[0]}.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Your local demo session is ready. The next page will be the laboratory dashboard.</p>
        <div className="mt-7 divide-y divide-white/[0.07] rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-xs text-slate-500">Role</span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.pillClass}`}>{meta.label}</span>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-xs text-slate-500">Laboratory</span>
            <span className="text-right text-xs font-medium text-slate-300">{lab.code} · {lab.city}</span>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-xs text-slate-500">Access</span>
            <span className="text-right text-xs text-slate-300">{meta.powers.split(',')[0]}</span>
          </div>
        </div>
      </div>
      <button type="button" onClick={onBack} className="mt-8 flex h-11 items-center justify-center rounded-lg border border-white/[0.1] text-sm font-medium text-slate-300 transition hover:border-white/[0.2] hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400">
        Return to sign in
      </button>
    </div>
  )
}
