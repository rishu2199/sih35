import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, Clock3, Download, Ellipsis, FileCheck2, Plus, Search, ShieldAlert, ShieldCheck, Thermometer, Weight, Wind } from 'lucide-react'
import type { ReactNode } from 'react'

type Session = { id: string; instrument: string; serial: string; operator: string; initials: string; stage: string; state: 'In progress' | 'Pending review' | 'Needs attention'; progress: number; time: string }

const sessions: Session[] = [
  { id: 'TS-26-0148', instrument: 'Precision-Pro 30K', serial: 'ET-2026-9041', operator: 'Ananya Rao', initials: 'AR', stage: 'Weighing · 4 of 7', state: 'In progress', progress: 58, time: 'Updated 8 min ago' },
  { id: 'TS-26-0147', instrument: 'MicroBalance X2', serial: 'SA-2026-4412', operator: 'Vikram Nair', initials: 'VN', stage: 'Technical review', state: 'Pending review', progress: 100, time: 'Submitted 22 min ago' },
  { id: 'TS-26-0145', instrument: 'Industrial Bench 60', serial: 'BW-2026-1138', operator: 'Meera Iyer', initials: 'MI', stage: 'Eccentricity · 3 of 5', state: 'Needs attention', progress: 42, time: 'Updated 36 min ago' },
  { id: 'TS-26-0144', instrument: 'Retail Scale 15K', serial: 'ES-2026-2874', operator: 'Arjun Das', initials: 'AD', stage: 'Repeatability · 2 of 3', state: 'In progress', progress: 72, time: 'Updated 1 hr ago' },
]

const activity = [
  { title: 'Session submitted for review', detail: 'TS-26-0147 · MicroBalance X2', time: '22 min ago', tone: 'blue', icon: FileCheck2 },
  { title: 'Standard weights verified', detail: 'F1 set · Certificate NPL/MASS/2026/0442', time: '1 hr ago', tone: 'green', icon: ShieldCheck },
  { title: 'Observation flagged for review', detail: 'TS-26-0145 · Eccentricity test', time: '2 hr ago', tone: 'amber', icon: ShieldAlert },
]

const chartData = [
  { day: 'Mon', sessions: 12, approved: 7 }, { day: 'Tue', sessions: 16, approved: 10 }, { day: 'Wed', sessions: 11, approved: 8 },
  { day: 'Thu', sessions: 21, approved: 14 }, { day: 'Fri', sessions: 18, approved: 12 }, { day: 'Sat', sessions: 9, approved: 5 }, { day: 'Sun', sessions: 6, approved: 3 },
]
const monthData = [
  { day: 'Wk 1', sessions: 76, approved: 48 }, { day: 'Wk 2', sessions: 91, approved: 62 },
  { day: 'Wk 3', sessions: 84, approved: 58 }, { day: 'Wk 4', sessions: 97, approved: 69 },
]

function Dashboard() {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<'7 days' | '30 days'>('7 days')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [toast, setToast] = useState('')
  const displayedChart = period === '7 days' ? chartData : monthData
  const chartMaximum = period === '7 days' ? 24 : 100
  const filteredSessions = useMemo(() => sessions.filter((item) => `${item.id} ${item.instrument} ${item.serial} ${item.operator} ${item.state}`.toLowerCase().includes(query.toLowerCase())), [query])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000) }

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div><div className="eyebrow">MONDAY, 05 OCTOBER 2026 <span className="eyebrow-rule" /> RRSL-BLR</div><h1>Laboratory overview</h1><p className="page-lead">Your testing operations at a glance. Here’s what needs your attention today.</p></div>
        <div className="heading-actions"><button className="heading-notifications" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Open notifications"><Bell size={17} /><i /></button><button className="button button-secondary" onClick={() => notify('Overview summary prepared for download.')}><Download size={16} />Export overview</button><button className="button button-primary" onClick={() => notify('Instrument intake will be available in the next page.')}><Plus size={17} />New test session</button></div>
      </div>

      <section className="metric-grid" aria-label="Laboratory metrics">
        <MetricCard icon={<FlaskIcon />} label="Active test sessions" value="12" change="2 started today" trend="up" caption="Across 5 testing stages" />
        <MetricCard icon={<Clock3 size={19} />} label="Awaiting review" value="04" change="Oldest · 2h 14m" trend="neutral" caption="Technical review queue" />
        <MetricCard icon={<Weight size={19} />} label="Instruments under test" value="08" change="3 due this week" trend="neutral" caption="Of 24 registered instruments" />
        <MetricCard icon={<ShieldCheck size={19} />} label="Compliance rate" value="96.8%" change="1.4% this month" trend="up" caption="Current reporting period" />
      </section>

      <section className="overview-grid">
        <article className="panel activity-panel">
          <div className="panel-heading"><div><h2>Testing activity</h2><p>Sessions processed across the laboratory</p></div><button className="select-button" onClick={() => setPeriod(period === '7 days' ? '30 days' : '7 days')}>{period}<ChevronDown size={15} /></button></div>
          <div className="chart-legend"><span><i className="legend-square indigo" />Sessions started</span><span><i className="legend-square teal" />Sessions completed</span><span className="chart-total"><strong>{period === '7 days' ? '93' : '348'}</strong> total</span></div>
          <div className="bar-chart" role="img" aria-label={`Bar chart showing sessions started and completed over the last ${period}`}>
            <div className="chart-y-labels">{(period === '7 days' ? [24, 18, 12, 6, 0] : [100, 75, 50, 25, 0]).map((tick) => <span key={tick}>{tick}</span>)}</div>
            <div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="bar-groups">{displayedChart.map((item) => <div className="bar-group" key={item.day}><div className="bar-pair"><div className="bar bar-started" style={{ height: `${item.sessions / chartMaximum * 100}%` }} title={`${item.sessions} started`} /><div className="bar bar-completed" style={{ height: `${item.approved / chartMaximum * 100}%` }} title={`${item.approved} completed`} /></div><span>{item.day}</span></div>)}</div></div>
          </div>
          <div className="chart-footnote"><span><span className="footnote-dot" />Activity is within your weekly average</span><span>Updated just now</span></div>
        </article>

        <article className="panel readiness-panel">
          <div className="panel-heading"><div><h2>Lab readiness</h2><p>Pre-test conditions &amp; standards</p></div><button className="icon-button subtle-icon" aria-label="More readiness options" onClick={() => notify('Readiness details are current.')}><Ellipsis size={19} /></button></div>
          <div className="readiness-status"><div className="readiness-check"><Check size={17} /></div><div><strong>Ready for testing</strong><span>All critical checks are passing</span></div><span className="live-pill"><i />LIVE</span></div>
          <div className="readiness-list">
            <div className="readiness-item"><div className="readiness-icon"><ShieldCheck size={17} /></div><div className="readiness-copy"><strong>Reference standards</strong><span>F1 set · Valid through 31 Jan 2027</span></div><span className="mini-check"><Check size={13} /></span></div>
            <div className="readiness-item"><div className="readiness-icon climate"><Thermometer size={17} /></div><div className="readiness-copy"><strong>Temperature <small>23.1°C</small></strong><span>Within operating range · 18–28°C</span></div><span className="mini-check"><Check size={13} /></span></div>
            <div className="readiness-item"><div className="readiness-icon climate"><Wind size={17} /></div><div className="readiness-copy"><strong>Relative humidity <small>49.2%</small></strong><span>Within operating range · 30–70%</span></div><span className="mini-check"><Check size={13} /></span></div>
          </div>
          <button className="text-link" onClick={() => notify('Equipment and standards will be available in a later page.')}>View equipment status <ArrowRight size={15} /></button>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel sessions-panel">
          <div className="panel-heading sessions-heading"><div><h2>Active test sessions</h2><p>Live work in progress across your lab</p></div><button className="text-link all-sessions" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show recent' : 'View all'} <ArrowRight size={15} /></button></div>
          <div className="table-toolbar"><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sessions or instruments" aria-label="Search sessions or instruments" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => notify('Session filters will be available on the sessions page.')}>All statuses <ChevronDown size={14} /></button></div>
          <div className="session-table-wrap"><table className="session-table"><thead><tr><th>SESSION / INSTRUMENT</th><th>OPERATOR</th><th>TEST STAGE</th><th>STATUS</th><th><span className="sr-only">Open session</span></th></tr></thead><tbody>{(showAll ? filteredSessions : filteredSessions.slice(0, 4)).map((session) => <tr key={session.id}><td><div className="session-main"><span className="session-id">{session.id}</span><strong>{session.instrument}</strong><span className="serial-number">S/N {session.serial}</span></div></td><td><div className="operator-cell"><span className="operator-avatar">{session.initials}</span><span>{session.operator}</span></div></td><td><div className="stage-cell"><span>{session.stage}</span><div className="progress-track"><i style={{ width: `${session.progress}%` }} /></div></div></td><td><StatusBadge status={session.state} /></td><td><button className="row-arrow" aria-label={`Open ${session.id}`} onClick={() => notify(`${session.id} detail page will be added later.`)}><ArrowRight size={16} /></button></td></tr>)}</tbody></table>{filteredSessions.length === 0 && <div className="empty-state">No sessions match “{query}”. Try a different search.</div>}</div>
          <div className="table-footer"><span>Showing <strong>{Math.min(filteredSessions.length, showAll ? filteredSessions.length : 4)}</strong> of <strong>{filteredSessions.length}</strong> active sessions</span><span>Synced moments ago <span className="sync-dot" /></span></div>
        </article>

        <article className="panel activity-feed-panel">
          <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest updates from your team</p></div><button className="icon-button subtle-icon" aria-label="More activity options" onClick={() => notify('You’re viewing the latest activity.')}><Ellipsis size={19} /></button></div>
          <div className="feed-list">{activity.map(({ title, detail, time, tone, icon: Icon }, index) => <div className="feed-item" key={title}><div className={`feed-icon ${tone}`}><Icon size={16} /></div><div className="feed-copy"><strong>{title}</strong><span>{detail}</span><time>{time}</time></div>{index < activity.length - 1 && <span className="feed-line" />}</div>)}</div>
          <button className="text-link activity-link" onClick={() => notify('The full audit activity page will be added later.')}>View activity log <ArrowRight size={15} /></button>
        </article>
      </section>

      <footer className="dashboard-footer"><span><ShieldCheck size={14} /> OIML R 76 · ISO/IEC 17025 aligned workflow</span><span>Workspace data shown is illustrative</span><span>METROLOGIX-76 <b>·</b> v1.0.0</span></footer>
      {notificationsOpen && <div className="notification-popover"><div className="popover-title"><strong>Notifications</strong><span>2 new</span></div><div className="popover-row"><i className="popover-dot amber-dot" /><div><strong>Review queue needs attention</strong><span>4 sessions are waiting for review</span><small>18 minutes ago</small></div></div><div className="popover-row"><i className="popover-dot green-dot" /><div><strong>Reference standards verified</strong><span>F1 weight set is ready for use</span><small>1 hour ago</small></div></div><button className="popover-dismiss" onClick={() => setNotificationsOpen(false)}>Mark all as read</button></div>}
      {toast && <div className="toast dashboard-toast" role="status">{toast}</div>}
    </div>
  )
}

function FlaskIcon() { return <span className="metric-flask"><span /></span> }

function MetricCard({ icon, label, value, change, trend, caption }: { icon: ReactNode; label: string; value: string; change: string; trend: 'up' | 'neutral'; caption: string }) {
  return <article className="metric-card"><div className="metric-top"><div className="metric-icon">{icon}</div><span className="metric-label">{label}</span><button className="metric-more" aria-label={`More about ${label}`}><Ellipsis size={18} /></button></div><div className="metric-main"><strong>{value}</strong><span className={`metric-change ${trend}`}>{trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}</span></div><div className="metric-caption">{caption}</div></article>
}

function StatusBadge({ status }: { status: Session['state'] }) {
  const tone = status === 'In progress' ? 'progress' : status === 'Pending review' ? 'review' : 'attention'
  return <span className={`status-badge ${tone}`}><i />{status}</span>
}

export default Dashboard
