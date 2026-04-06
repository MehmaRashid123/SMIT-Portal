import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import smitLogo from '../assets/smit logo.png'

const B = '#0B73B7'

export default function PortalLayout({ links, children, accentColor = B }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useSelector(s => s.auth)
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { dispatch(logout()); navigate('/') }
  const isActive = (to) => location.pathname === to

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100" style={{ minHeight:64 }}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img src={smitLogo} alt="SMIT" className="h-8 object-contain"/>
          </Link>
        )}
        <button onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto hidden md:flex"
          style={{ color: accentColor }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
          </svg>
        </button>
        <button onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden" style={{ color: accentColor }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {links.map(link => {
          const active = isActive(link.to)
          return (
            <Link key={link.to} to={link.to}
              title={collapsed ? link.label : ''}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200"
              style={active ? { background: accentColor, color:'#fff' } : { color:'#6b7280' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              <span className="flex-shrink-0" style={{ color: active ? '#fff' : accentColor }}>{link.icon}</span>
              <span className="text-sm font-medium truncate">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
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
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)}/>
      )}

      {/* Mobile drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 transition-transform duration-300 md:hidden"
        style={{ width:220, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow:'2px 0 16px rgba(0,0,0,.1)' }}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-100"
        style={{ width: collapsed ? 64 : 220, boxShadow:'2px 0 12px rgba(0,0,0,.04)' }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30"
          style={{ boxShadow:'0 1px 8px rgba(0,0,0,.06)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: accentColor }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <img src={smitLogo} alt="SMIT" className="h-7 object-contain"/>
          <span className="text-sm font-bold ml-auto" style={{ color: accentColor }}>
            {links.find(l => isActive(l.to))?.label || 'Portal'}
          </span>
        </div>
        {children}
      </main>
    </div>
  )
}
