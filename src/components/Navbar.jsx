import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { fetchCourses } from '../store/slices/coursesSlice'
import smitLogo from '../assets/smit logo.png'

const B  = '#0B73B7'
const BL = '#0d85d4'
const BG = '#e8f4fc'

const NAV_LINKS = ['Home', 'About', 'Courses', 'Campuses', 'Check Result']
const getLinkHref = (l) =>
  ({ Home:'/', About:'/about', Courses:'/courses', Campuses:'/campus', 'Check Result':'/result' }[l] || '/')

// Group courses by category
function groupByCategory(courses) {
  return courses.reduce((acc, c) => {
    const cat = c.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})
}

export default function Navbar() {
  const dispatch          = useDispatch()
  const navigate          = useNavigate()
  const location          = useLocation()
  const { user, role }    = useSelector(s => s.auth)
  const { list: courses } = useSelector(s => s.courses)

  const [visible,     setVisible]     = useState(false)
  const [megaOpen,    setMegaOpen]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const megaRef  = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])
  useEffect(() => { dispatch(fetchCourses()) }, [dispatch])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    const fn = (e) => { if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleLogout = () => { dispatch(logout()); navigate('/') }
  const onEnter = () => { clearTimeout(timerRef.current); setMegaOpen(true) }
  const onLeave = () => { timerRef.current = setTimeout(() => setMegaOpen(false), 180) }
  const isActive = (l) => location.pathname === getLinkHref(l)

  const grouped   = groupByCategory(courses)
  const categories = Object.keys(grouped)
  // top courses = first 4 by is_top flag or just first 4
  const topCourses = courses.filter(c => c.is_top).slice(0, 4)
    .concat(courses.filter(c => !c.is_top)).slice(0, 4)

  return (
    <>
      <style>{`
        @keyframes shine {
          0%   { transform:translateX(-120%) skewX(-18deg); }
          100% { transform:translateX(280%)  skewX(-18deg); }
        }
        @keyframes arrowBounce {
          0%,100% { transform:translateX(0); }
          50%     { transform:translateX(5px); }
        }
        @keyframes megaIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .enroll-btn { position:relative; overflow:hidden; }
        .enroll-btn::after {
          content:''; position:absolute; inset:0; width:38%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);
          transform:translateX(-120%) skewX(-18deg); pointer-events:none;
        }
        .enroll-btn:hover::after { animation:shine .65s ease forwards; }
        .arrow-anim { animation:arrowBounce 1.1s ease-in-out infinite; }
        .nav-link {
          position:relative; padding:8px 16px; font-size:.875rem; font-weight:500;
          border-radius:8px; transition:all .3s; color:#374151; text-decoration:none;
          display:inline-flex; align-items:center; gap:4px; line-height:1;
          background:none; border:none; cursor:pointer; white-space:nowrap;
        }
        .nav-link:hover  { color:${B}; background:${BG}; }
        .nav-link.active { color:${B}; background:${BG}; font-weight:600; }
        .nav-link.active::after {
          content:''; position:absolute; bottom:2px; left:12px; right:12px;
          height:2px; background:${B}; border-radius:9999px;
        }
        .mega-cat-title {
          font-size:.65rem; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; color:#6b7280; margin-bottom:8px;
          display:flex; align-items:center; gap:6px;
        }
        .mega-course-item {
          display:flex; align-items:center; gap:8px; padding:6px 8px;
          border-radius:8px; cursor:pointer; transition:background .15s;
          text-decoration:none; color:#374151; font-size:.8rem;
        }
        .mega-course-item:hover { background:${BG}; color:${B}; }
        .mega-course-item svg { flex-shrink:0; opacity:.5; }
        .mega-course-item:hover svg { opacity:1; }
        .top-course-card {
          display:flex; align-items:center; gap:10px; padding:10px 12px;
          border-radius:10px; border:1px solid #e5e7eb; background:#fff;
          transition:all .2s; text-decoration:none; flex:1; min-width:0;
        }
        .top-course-card:hover { border-color:${B}; box-shadow:0 2px 12px rgba(11,115,183,.12); }
        .top-course-icon {
          width:36px; height:36px; border-radius:50%; background:${B};
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
      `}</style>

      <nav
        style={{ boxShadow: scrolled ? '0 2px 20px rgba(11,115,183,.13)' : 'none' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled ? 'bg-white/97 backdrop-blur-md' : 'bg-white/93 backdrop-blur-sm'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/"
              className={`flex items-center transition-all duration-700
                ${visible ? 'opacity-100 translate-x-0 blur-none' : 'opacity-0 -translate-x-8 blur-sm'}`}>
              <img src={smitLogo} alt="SMIT" className="h-10 w-auto object-contain" />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((label, i) =>
                label === 'Courses' ? (
                  <div key={label} ref={megaRef} className="relative"
                    onMouseEnter={onEnter} onMouseLeave={onLeave}>

                    <button
                      style={{ transitionDelay:`${i*80+200}ms` }}
                      className={`nav-link transition-all duration-300
                        ${visible ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 -translate-y-3 blur-sm'}
                        ${isActive(label) ? 'active' : ''}`}
                    >
                      Courses
                      <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen ? 'rotate-180':''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    {/* ── MEGA DROPDOWN ── */}
                    {megaOpen && (
                      <div
                        style={{
                          position:'fixed', top:'64px', left:'50%',
                          transform:'translateX(-50%)',
                          width:'min(96vw, 1100px)',
                          boxShadow:'0 16px 60px rgba(11,115,183,.18)',
                          animation:'megaIn .22s ease',
                          zIndex:100,
                        }}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                        onMouseEnter={onEnter} onMouseLeave={onLeave}
                      >
                        {/* top blue bar */}
                        <div style={{ background:`linear-gradient(90deg,${B},${BL})`, height:'3px' }} />

                        <div className="p-6">
                          {/* Categories grid */}
                          {categories.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">Loading courses...</p>
                          ) : (
                            <div className="grid gap-6"
                              style={{ gridTemplateColumns:`repeat(${Math.min(categories.length,5)},1fr)` }}>
                              {categories.map(cat => (
                                <div key={cat}>
                                  <p className="mega-cat-title">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                      stroke={B} strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                    </svg>
                                    {cat}
                                  </p>
                                  <div className="space-y-0.5">
                                    {grouped[cat].slice(0,4).map(c => (
                                      <Link key={c.id} to="/courses"
                                        onClick={() => setMegaOpen(false)}
                                        className="mega-course-item">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                          stroke="currentColor" strokeWidth="2">
                                          <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                        </svg>
                                        <span className="truncate">{c.name}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Top Courses row */}
                          {topCourses.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-gray-100">
                              <p className="mega-cat-title mb-3">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                  stroke={B} strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                </svg>
                                Top Courses
                              </p>
                              <div className="grid grid-cols-4 gap-3">
                                {topCourses.map(c => (
                                  <Link key={c.id} to="/courses"
                                    onClick={() => setMegaOpen(false)}
                                    className="top-course-card">
                                    <div className="top-course-icon">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="white" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                      </svg>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                                      <p className="text-xs text-gray-400">{c.duration || '—'}</p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <Link to="/courses" onClick={() => setMegaOpen(false)}
                              style={{ color:B }}
                              className="text-sm font-semibold hover:opacity-75 transition-opacity inline-flex items-center gap-1">
                              See All Courses
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={label} to={getLinkHref(label)}
                    style={{ transitionDelay:`${i*80+200}ms` }}
                    className={`nav-link transition-all duration-300
                      ${visible ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 -translate-y-3 blur-sm'}
                      ${isActive(label) ? 'active' : ''}`}>
                    {label}
                  </Link>
                )
              )}
            </div>

            {/* Right side */}
            <div style={{ transitionDelay:'700ms' }}
              className={`hidden md:flex items-center gap-3 transition-all duration-700
                ${visible ? 'opacity-100 translate-x-0 blur-none' : 'opacity-0 translate-x-8 blur-sm'}`}>

              {!user && (
                <Link to="/courses"
                  style={{ background:`linear-gradient(135deg,${B} 0%,${BL} 100%)` }}
                  className="enroll-btn flex items-center gap-2 text-white text-sm font-semibold
                    px-5 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 6px 24px rgba(11,115,183,.45)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                  <span className="relative z-10">Enroll Now</span>
                  <svg className="arrow-anim relative z-10 w-4 h-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </Link>
              )}

              {user && role === 'student' && (
                <>
                  <Link to="/student/leaves" style={{ color:B }}
                    className="text-sm font-medium px-3 py-2">My Leaves</Link>
                  <button onClick={handleLogout} style={{ background:B }}
                    className="text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
                    Logout
                  </button>
                </>
              )}
              {user && role === 'admin' && (
                <>
                  <Link to="/admin" style={{ color:B }} className="text-sm font-medium px-3 py-2">Dashboard</Link>
                  <button onClick={handleLogout} style={{ background:B }}
                    className="text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors"
              style={{ background: mobileOpen ? BG : 'transparent' }}
              onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              <span style={{ background:B }} className={`block w-5 h-0.5 rounded transition-all duration-300 ${mobileOpen?'rotate-45 translate-y-2':''}`}/>
              <span style={{ background:B }} className={`block w-5 h-0.5 rounded transition-all duration-300 ${mobileOpen?'opacity-0':''}`}/>
              <span style={{ background:B }} className={`block w-5 h-0.5 rounded transition-all duration-300 ${mobileOpen?'-rotate-45 -translate-y-2':''}`}/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen?'max-h-screen opacity-100':'max-h-0 opacity-0'}`}>
          <div className="bg-white border-t px-4 py-3 space-y-1" style={{ borderColor:BG }}>
            {NAV_LINKS.map(label => (
              <Link key={label} to={getLinkHref(label)} onClick={() => setMobileOpen(false)}
                style={isActive(label) ? { background:BG, color:B } : {}}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700">
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {!user && (
                <Link to="/courses" onClick={() => setMobileOpen(false)}
                  style={{ background:`linear-gradient(135deg,${B},${BL})` }}
                  className="enroll-btn flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                  <span className="relative z-10">Enroll Now</span>
                  <svg className="arrow-anim relative z-10 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </Link>
              )}
              {user && (
                <button onClick={handleLogout} style={{ background:B }}
                  className="w-full text-center text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
