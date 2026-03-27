const staff = [
  { id: 'u-supervisor-01', name: 'Ravi Kumar', role: 'supervisor', shift: 'Morning', status: 'present', clockIn: '8:00 AM', hours: 6.5 },
  { id: 'u-supervisor-02', name: 'Sunita M.', role: 'supervisor', shift: 'Evening', status: 'present', clockIn: '2:00 PM', hours: 3.2 },
  { id: 'u-staff-01', name: 'Arun P.', role: 'delivery', shift: 'Morning', status: 'late', clockIn: '8:45 AM', hours: 5.7 },
  { id: 'u-staff-02', name: 'Meena R.', role: 'delivery', shift: 'Evening', status: 'absent', clockIn: '-', hours: 0 },
]

const weekAttendance = [
  { day: 'Mon', present: 4, total: 4 },
  { day: 'Tue', present: 4, total: 4 },
  { day: 'Wed', present: 3, total: 4 },
  { day: 'Thu', present: 4, total: 4 },
  { day: 'Fri', present: 4, total: 4 },
  { day: 'Sat', present: 3, total: 4 },
  { day: 'Today', present: 3, total: 4 },
]

export default function StaffPage() {
  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">👥</span>
        <h2>Staff & Attendance</h2>
      </div>

      {/* Summary */}
      <div className="stats-grid mb-2">
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{staff.filter(s => s.status === 'present').length}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{staff.filter(s => s.status === 'absent').length}</div>
          <div className="stat-label">Absent</div>
        </div>
      </div>

      {/* Weekly attendance sparkline */}
      <div className="card mb-2">
        <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>This Week</h3>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px' }}>
          {weekAttendance.map(d => (
            <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(d.present / d.total) * 100}%`,
                background: d.present === d.total ? 'var(--accent-green)' : 'var(--accent-orange)',
                borderRadius: '4px 4px 0 0',
                minHeight: '8px',
              }} />
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff list */}
      <div className="section-header mt-2">
        <span className="section-emoji">📋</span>
        <h2>Today</h2>
      </div>
      <div className="gap-row stagger">
        {staff.map(s => (
          <div key={s.id} className="card anim-scale" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: s.status === 'present' ? 'rgba(0,230,118,0.15)' : s.status === 'late' ? 'rgba(255,145,0,0.15)' : 'rgba(255,61,61,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
            }}>
              {s.status === 'present' ? '✅' : s.status === 'late' ? '🟡' : '❌'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                {s.role} · {s.shift} · In: {s.clockIn}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{s.hours}h</div>
              <span className={`badge ${s.status === 'present' ? 'badge-green' : s.status === 'late' ? 'badge-orange' : 'badge-red'}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
