import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import smitLogo from '../assets/smit logo.png'

const B = '#0B73B7'

const NAV = [
  { to:'/student',             label:'Dashboard',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/student/progress',    label:'Progress',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { to:'/student/attendance',  label:'Attendance', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to:'/student/payment',     label:'Payment',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { to:'/student/assignments', label:'Assignment', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/student/quiz',        label:'Quiz',       icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/student/leaves',      label:'Leave',      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  { to:'/student/idcard',      label:'ID Card',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M16 10h2M16 14h2M6 10h6M6 14h4"/></svg> },
]

export default function StudentLayout({ children }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useSelector(s => s.auth)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { dispatch(logout()); navigate('/') }
  const isActive = (to) => to === '/student' ? location.pathname === '/student' : location.pathname.startsWith(to)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="flex flex-col flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-100"
        style={{ width: collapsed ? 64 : 220, boxShadow:'2px 0 12px rgba(0,0,0,.04)' }}>

        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100" style={{ minHeight:64 }}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <img src={smitLogo} alt="SMIT" className="h-8 object-contain" />
            </Link>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto flex-shrink-0"
            style={{ color:B }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {collapsed ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(link => {
            const active = isActive(link.to)
            return (
              <Link key={link.to} to={link.to} title={collapsed ? link.label : ''}
                className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200"
                style={active ? { background:B, color:'#fff' } : { color:'#6b7280' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <span className="flex-shrink-0" style={{ color: active ? '#fff' : B }}>{link.icon}</span>
                {!collapsed && <span className="text-sm font-medium truncate">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background:B }}>
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  )
}
