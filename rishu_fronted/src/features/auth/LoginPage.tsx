import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, CircleHelp, Eye, EyeOff, FlaskConical, Landmark, LoaderCircle, LockKeyhole, ShieldCheck, UserRound, UserRoundCheck, UserRoundCog, UserRoundPen, X } from 'lucide-react'

type Role = 'Metrologist' | 'Reviewer' | 'Director' | 'Admin'

type DemoAccount = { username: string; password: string; role: Role; description: string }

const demoAccounts: DemoAccount[] = [
  { username: 'metrologist@lm-lab.gov.in', password: 'Metro@123', role: 'Metrologist', description: 'Conduct tests' },
  { username: 'reviewer@lm-lab.gov.in', password: 'Review@123', role: 'Reviewer', description: 'Verify results' },
  { username: 'director@lm-lab.gov.in', password: 'Director@123', role: 'Director', description: 'Approve reports' },
  { username: 'admin@lm-lab.gov.in', password: 'Admin@123', role: 'Admin', description: 'Manage system' },
]

const roleIcons = {
  Metrologist: FlaskConical,
  Reviewer: UserRoundCheck,
  Director: UserRoundPen,
  Admin: UserRoundCog,
}

type LoginPageProps = { onAuthenticated: (role: Role) => void }

function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [message, setMessage] = useState<{ kind: 'demo' | 'error' | 'help'; title: string; detail: string } | null>(null)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const loadDemo = (account: DemoAccount) => {
    setUsername(account.username)
    setPassword(account.password)
    setSelectedRole(account.role)
    setErrors({})
    setMessage({ kind: 'demo', title: 'Demo credentials loaded', detail: `${account.role} access is ready. Select Sign in to continue.` })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: { username?: string; password?: string } = {}
    if (!username.trim()) nextErrors.username = 'Username is required'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)
    setMessage(null)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    window.setTimeout(() => {
      const account = demoAccounts.find((item) => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password)
      setLoading(false)
      if (!account) {
        setSelectedRole(null)
        setMessage({ kind: 'error', title: 'Unable to authenticate', detail: 'The username or password is incorrect. Verify the demo credentials and try again.' })
        return
      }
      setSuccess(true)
      setMessage({ kind: 'demo', title: 'Authentication successful', detail: `Opening ${account.role} workspace…` })
      window.setTimeout(() => onAuthenticated(account.role), 650)
    }, 550)
  }

  const showRecovery = () => setMessage({ kind: 'help', title: 'Password recovery', detail: 'Password recovery is managed by your laboratory administrator.' })

  return (
    <main className="login-page">
      <div className="login-grid-pattern" aria-hidden="true" />
      <div className="login-measure-mark measure-top" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="login-measure-mark measure-bottom" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>

      <section className="login-card" aria-labelledby="login-title">
        <div className="gov-identity">
          <div className="gov-emblem" aria-hidden="true"><Landmark size={25} strokeWidth={1.45} /></div>
          <div className="gov-caption">GOVERNMENT OF INDIA</div>
          <div className="gov-department">Department of Consumer Affairs</div>
          <div className="tricolour-rule" aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className="product-identity">
          <div className="product-wordmark">METROLOGIX<span>‑76</span></div>
          <h1>Non-Automatic Weighing Instrument<br />Verification &amp; Test Reporting System</h1>
          <div className="statutory-line"><span>OIML R 76-1:2006</span><i />Legal Metrology</div>
        </div>

        <div className="login-divider"><span /></div>

        <div className="login-intro">
          <h2 id="login-title">Sign in to Laboratory Workspace</h2>
          <p>Authenticate to access instrument verification, test sessions and statutory reports.</p>
        </div>

        <form className="login-form" onSubmit={submit} noValidate>
          <div className="login-field-group">
            <label htmlFor="username">Username</label>
            <div className={`login-input-wrap${errors.username ? ' has-error' : ''}`}>
              <UserRound size={17} aria-hidden="true" />
              <input id="username" name="username" type="text" autoComplete="username" placeholder="Enter laboratory username" value={username} onChange={(event) => { setUsername(event.target.value); setErrors((current) => ({ ...current, username: undefined })); setSelectedRole(null) }} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : 'username-hint'} />
            </div>
            {errors.username ? <span className="field-error" id="username-error"><X size={13} />{errors.username}</span> : <span className="field-hint" id="username-hint">Example: metrologist@lm-lab.gov.in</span>}
          </div>

          <div className="login-field-group password-group">
            <label htmlFor="password">Password</label>
            <div className={`login-input-wrap${errors.password ? ' has-error' : ''}`}>
              <LockKeyhole size={16} aria-hidden="true" />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })); setSelectedRole(null) }} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} disabled={loading || success}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {errors.password && <span className="field-error" id="password-error"><X size={13} />{errors.password}</span>}
          </div>

          <div className="login-options"><label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} disabled={loading || success} /><span className="custom-check"><Check size={12} /></span><span>Remember this device</span></label><button type="button" className="recovery-link" onClick={showRecovery} disabled={loading || success}>Forgot password?</button></div>

          {message && <div className={`login-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}><span className="message-icon">{message.kind === 'error' ? <X size={15} /> : message.kind === 'help' ? <CircleHelp size={15} /> : <Check size={15} />}</span><span><strong>{message.title}</strong><small>{message.detail}</small></span></div>}

          <button className="login-submit" type="submit" disabled={loading || success}>
            {loading ? <><LoaderCircle className="spinner" size={17} /><span>Authenticating…</span></> : success ? <><Check size={17} /><span>Access granted</span></> : <><span className="login-button-label">Sign in</span><ArrowRight size={17} /></>}
          </button>
        </form>

        <section className="demo-access" aria-labelledby="demo-title">
          <div className="demo-heading"><span className="demo-icon"><UserRoundCheck size={15} /></span><div><h3 id="demo-title">Demo Workspace</h3><p>Use a predefined laboratory role</p></div><span className="demo-tag">LOCAL DEMO</span></div>
          <div className="role-grid">{demoAccounts.map((account) => {
            const Icon = roleIcons[account.role]
            const selected = selectedRole === account.role
            return <button className={`role-option${selected ? ' selected' : ''}`} type="button" key={account.role} onClick={() => loadDemo(account)} aria-pressed={selected} disabled={loading || success}><span className="role-icon"><Icon size={16} strokeWidth={1.8} /></span><span className="role-copy"><strong>{account.role}</strong><small>{account.description}</small></span>{selected && <span className="role-selected-check"><Check size={12} /></span>}</button>
          })}</div>
          <p className="demo-footnote">Demo credentials are filled locally and are not sent to a server.</p>
        </section>

        <div className="login-trust"><span className="trust-icon"><ShieldCheck size={16} /></span><span><strong>Secure Laboratory Environment</strong><small>Authorized personnel only</small></span><span className="trust-version">v1.0.0</span></div>
      </section>

      <footer className="login-footer"><span>METROLOGIX-76 <i>•</i> Demonstration interface</span><span>OIML R 76-1:2006 <i>•</i> Legal Metrology Act 2009</span><span>This demo is not connected to an official government system.</span></footer>
    </main>
  )
}

export default LoginPage
