import { useState } from 'react'
import { Activity, ClipboardCheck, FileText, FlaskConical, Gauge, Menu, PackageCheck, Scale, ShieldCheck, X } from 'lucide-react'
import Dashboard from './features/dashboard/Dashboard'
import LoginPage from './features/auth/LoginPage'

const navigation = [
  { label: 'Overview', icon: Activity, active: true },
  { label: 'Test sessions', icon: FlaskConical },
  { label: 'Instruments', icon: Gauge },
  { label: 'Review queue', icon: ClipboardCheck, count: '4' },
  { label: 'Reports', icon: FileText },
]

const workspace = [
  { label: 'Standards & equipment', icon: PackageCheck },
  { label: 'Audit trail', icon: ShieldCheck },
]

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [signedInRole, setSignedInRole] = useState<string | null>(null)

  if (!signedInRole) return <LoginPage onAuthenticated={setSignedInRole} />

  const profiles: Record<string, { name: string; initials: string; title: string }> = {
    Metrologist: { name: 'Dr. S. K. Ramanathan', initials: 'SR', title: 'Testing officer' },
    Reviewer: { name: 'Dr. Meenakshi Sundaram', initials: 'MS', title: 'Principal scientific officer' },
    Director: { name: 'Dr. Rajeshwari Sen', initials: 'RS', title: 'Director & issuing authority' },
    Admin: { name: 'METROLOGIX Administrator', initials: 'AD', title: 'System administrator' },
  }
  const profile = profiles[signedInRole] ?? profiles.Metrologist

  const choosePage = (label: string) => {
    if (label !== 'Overview') setNotice(`${label} will be added as the next page in this workspace.`)
    setMobileNavOpen(false)
    window.setTimeout(() => setNotice(''), 3200)
  }

  const sidebar = (
    <>
      <div className="brand-lockup">
        <div className="brand-mark"><Scale size={21} strokeWidth={1.8} /></div>
        <div><div className="brand-name">METROLOGIX<span>76</span></div><div className="brand-subtitle">LABORATORY WORKSPACE</div></div>
        <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
      </div>
      <div className="lab-switcher">
        <div className="lab-avatar">BLR</div>
        <div className="lab-switcher-copy"><strong>RRSL Bengaluru</strong><span>Regional reference lab</span></div>
        <span className="online-dot" aria-label="Workspace online" />
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        <div className="nav-caption">WORKSPACE</div>
        {navigation.map(({ label, icon: Icon, active, count }) => (
          <button key={label} className={`nav-item${active ? ' active' : ''}`} onClick={() => choosePage(label)} aria-current={active ? 'page' : undefined}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}
          </button>
        ))}
        <div className="nav-caption nav-caption-spaced">GOVERNANCE</div>
        {workspace.map(({ label, icon: Icon }) => (
          <button key={label} className="nav-item" onClick={() => choosePage(label)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="secure-note"><ShieldCheck size={16} /><span>Secure laboratory workspace</span></div>
        <div className="sidebar-user"><div className="user-avatar">{profile.initials}</div><div className="sidebar-user-copy"><strong>{profile.name}</strong><span>{profile.title}</span></div><span className="more-dots">···</span></div>
        <div className="sidebar-version">METROLOGIX-76 <span>v1.0</span></div>
      </div>
    </>
  )

  return (
    <div className="app-frame">
      <aside className="sidebar">{sidebar}</aside>
      {mobileNavOpen && <div className="mobile-backdrop" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`mobile-sidebar${mobileNavOpen ? ' open' : ''}`}>{sidebar}</aside>
      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>Overview</strong></div>
          <div className="topbar-right"><div className="local-mode"><span className="local-dot" />Local workspace</div><div className="topbar-separator" /><button className="top-user" aria-label={`Signed in as ${profile.name}`}><span className="top-user-avatar">{profile.initials}</span><span className="top-user-name">{profile.name}</span></button></div>
        </header>
        <Dashboard />
      </main>
      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}

export default App
