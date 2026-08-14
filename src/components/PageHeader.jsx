// A consistent page header used at the top of app pages: an icon tile,
// a gradient title, a subtitle, and optional right-aligned actions/stats.
export default function PageHeader({ icon, title, subtitle, children }) {
  return (
    <div className="page-header">
      {icon && <span className="page-header-ic">{icon}</span>}
      <div className="grow">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="muted" style={{ margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  )
}
