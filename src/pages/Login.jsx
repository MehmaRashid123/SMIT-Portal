import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { loginStudent, loginAdmin, loginTeacher } from '../store/slices/authSlice'

const B = '#0B73B7'

const ROLES = [
  {
    key: 'student', label: 'Student', color: '#0B73B7', bg: '#e8f4fc',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
      </svg>
    ),
  },
  {
    key: 'teacher', label: 'Teacher', color: '#0e9f6e', bg: '#e8faf4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    key: 'admin', label: 'Admin', color: '#7c3aed', bg: '#f3eeff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
]

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { loading, error } = useSelector(s => s.auth)

  const roleParam = params.get('role') || 'student'
  const [activeRole, setActiveRole] = useState(roleParam)
  const [form, setForm] = useState({ identifier: '', password: '' })

  useEffect(() => { setActiveRole(roleParam) }, [roleParam])

  const role = ROLES.find(r => r.key === activeRole) || ROLES[0]

  const switchRole = (key) => {
    setActiveRole(key)
    setParams({ role: key })
    setForm({ identifier: '', password: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let result
    if (activeRole === 'student') {
      result = await dispatch(loginStudent({ cnic: form.identifier, password: form.password }))
      if (!result.error) { navigate('/student'); return }
    } else if (activeRole === 'admin') {
      result = await dispatch(loginAdmin({ username: form.identifier, password: form.password }))
      if (!result.error) { navigate('/admin'); return }
    } else {
      result = await dispatch(loginTeacher({ username: form.identifier, password: form.password }))
      if (!result.error) { navigate('/teacher'); return }
    }
  }

  const idLabel = activeRole === 'student' ? 'CNIC' : 'Username'
  const idPlaceholder = activeRole === 'student' ? 'Enter your CNIC (XXXXX-XXXXXXX-X)' : 'Enter username'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(150deg,#eef6fd 0%,#e4f1fb 50%,#f4faff 100%)' }}>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .login-card { animation: slideUp .4s cubic-bezier(.22,1,.36,1) forwards; }
      `}</style>

      <div className="login-card w-full max-w-md">

        {/* Role switcher tabs */}
        <div className="flex rounded-2xl p-1 mb-6 gap-1"
          style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e5e7eb' }}>
          {ROLES.map(r => (
            <button key={r.key} onClick={() => switchRole(r.key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250"
              style={activeRole === r.key
                ? { background: r.color, color: '#fff', boxShadow: `0 4px 14px ${r.color}44` }
                : { color: '#6b7280', background: 'transparent' }}>
              <span style={{ color: activeRole === r.key ? '#fff' : r.color }}>{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: `0 24px 60px ${role.color}18` }}>

          {/* top accent */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${role.color}, ${role.color}99)` }} />

          <div className="p-8">
            {/* header */}
            <div className="flex items-center gap-4 mb-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: role.bg, color: role.color }}>
                {role.icon}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">{role.label} Login</h1>
                <p className="text-sm text-gray-400">Welcome back to SMIT Connect</p>
              </div>
            </div>

            {/* error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 border border-red-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                {error}
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{idLabel}</label>
                <input
                  required
                  placeholder={idPlaceholder}
                  value={form.identifier}
                  onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ '--focus-color': role.color }}
                  onFocus={e => e.target.style.borderColor = role.color}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  required
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  onFocus={e => e.target.style.borderColor = role.color}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 mt-2"
                style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}cc)`,
                  boxShadow: `0 6px 20px ${role.color}33` }}>
                {loading ? 'Signing in...' : `Login as ${role.label}`}
              </button>
            </form>

            {/* footer links */}
            <div className="mt-5 text-center space-y-2">
              {activeRole === 'student' && (
                <p className="text-sm text-gray-500">
                  No account?{' '}
                  <Link to="/signup" className="font-semibold hover:underline" style={{ color: role.color }}>
                    Sign Up
                  </Link>
                </p>
              )}
              <p className="text-sm text-gray-400">
                <Link to="/" className="hover:underline">← Back to Home</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
