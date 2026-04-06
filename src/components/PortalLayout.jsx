import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'

const B = '#0B73B7'

export default function PortalLayout({ links, children, accentColor = B }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useSelector(s => s.auth)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-100"
        style={{ width: collapsed ? 64 : 220, boxShadow: '2px 0 12px rgba(0,0,0,.04)' }}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          {!collapsed && (
            <Link to="/">
              <img src="/smit-logo.png" alt="SMIT" className="h-8 object-contain"
                onError={e => { e.target.style.display='none' }} />
              <span className="font-extrabold text-sm" style={{ color: accentColor }}>SMIT</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
            style={{ color: accentColor }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {links.map(link => {
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to}
                title={collapsed ? link.label : ''}
                className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 group"
                style={active
                  ? { background: accentColor, color: '#fff' }
                  : { color: '#6b7280' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="flex-shrink-0" style={{ color: active ? '#fff' : accentColor }}>{link.icon}</span>
                {!collapsed && <span className="text-sm font-medium truncate">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: accentColor }}>
              {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || user?.username}</p>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
