import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import smitLogo from '../assets/smit logo.png'

const B = '#0B73B7'

const NAV = [
  { to:'/admin',              label:'Dashboard',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/admin/students',     label:'Students',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { to:'/admin/courses',      label:'Courses',      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
  { to:'/admin/registrations',label:'Registrations',icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  { to:'/admin/enrollments',  label:'Enrollments',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg> },
  { to:'/admin/teachers',     label:'Teachers',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  { to:'/admin/attendance',   label:'Attendance',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to:'/admin/entry-test',   label:'Entry Tests',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/admin/leaves',       label:'Leaves',       icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to:'/admin/idcard',       label:'My ID Card',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M16 10h2M16 14h2M6 10h6M6 14h4"/></svg> },
  { to:'/admin/settings',     label:'Settings',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

export default function AdminLayout({ children }) {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user }   = useSelector(s => s.auth)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { dispatch(logout()); navigate('/') }
  const isActive = (to) => to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100" style={{ minHeight:64 }}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img src={smitLogo} alt="SMIT" className="h-8 object-contain" />
          </Link>
        )}
        <button onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto flex-shrink-0 hidden md:flex"
          style={{ color: B }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
          </svg>
        </button>
        <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden" style={{ color:B }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(link => {
          const active = isActive(link.to)
          return (
            <Link key={link.to} to={link.to} title={collapsed ? link.label : ''}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200"
              style={active ? { background: B, color:'#fff' } : { color:'#6b7280' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              <span className="flex-shrink-0" style={{ color: active ? '#fff' : B }}>{link.icon}</span>
              <span className="text-sm font-medium truncate">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: B }}>
            {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || user?.username}</p>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Logout</button>
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

      {/* Mobile sidebar drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 transition-transform duration-300 md:hidden`}
        style={{ width:220, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow:'2px 0 12px rgba(0,0,0,.08)' }}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-100"
        style={{ width: collapsed ? 64 : 220, boxShadow:'2px 0 12px rgba(0,0,0,.04)' }}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} style={{ color:B }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <img src={smitLogo} alt="SMIT" className="h-7 object-contain"/>
        </div>
        {children}
      </main>
    </div>
  )
}
