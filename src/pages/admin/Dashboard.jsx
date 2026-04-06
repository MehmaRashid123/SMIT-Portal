import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AdminLayout from '../../components/AdminLayout'
import { fetchStudents } from '../../store/slices/studentsSlice'
import { fetchCourses } from '../../store/slices/coursesSlice'
import { fetchLeaves } from '../../store/slices/leavesSlice'

const B = '#0B73B7'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: students } = useSelector(s => s.students)
  const { list: courses }  = useSelector(s => s.courses)
  const { list: leaves }   = useSelector(s => s.leaves)

  useEffect(() => {
    dispatch(fetchStudents())
    dispatch(fetchCourses())
    dispatch(fetchLeaves())
  }, [dispatch])

  const stats = [
    { label:'Total Students', val: students.length,                                  color:B,        bg:'#e8f4fc', icon:'👥' },
    { label:'Active Courses',  val: courses.filter(c=>c.status==='open').length,      color:'#0e9f6e',bg:'#e8faf4', icon:'📚' },
    { label:'Pending Leaves',  val: leaves.filter(l=>l.status==='pending').length,    color:'#f59e0b',bg:'#fffbeb', icon:'📋' },
    { label:'Total Courses',   val: courses.length,                                   color:'#7c3aed',bg:'#f3eeff', icon:'🎓' },
  ]

  const CARDS = [
    { label:'Student Management',  desc:'Upload students via Excel, view all',  to:'/admin/students',      color:B,        bg:'#e8f4fc', icon:'👥' },
    { label:'Course Management',   desc:'Add, edit and manage courses',          to:'/admin/courses',       color:'#0e9f6e',bg:'#e8faf4', icon:'📚' },
    { label:'Registrations',       desc:'View & manage course applications',     to:'/admin/registrations', color:'#f59e0b',bg:'#fffbeb', icon:'📝' },
    { label:'Leave Management',    desc:'Approve or reject leave requests',      to:'/admin/leaves',        color:'#ef4444',bg:'#fff5f5', icon:'📋' },
    { label:'Admin Settings',      desc:'Add admins, reset password',            to:'/admin/settings',      color:'#7c3aed',bg:'#f3eeff', icon:'⚙️' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, <span className="font-semibold text-gray-600">{user?.name || user?.username}</span></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick access cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map(card => (
            <Link key={card.to} to={card.to}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: card.bg }}>{card.icon}</div>
              <h3 className="font-bold text-gray-800 group-hover:text-gray-900">{card.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{card.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: card.color }}>
                Manage →
              </div>
            </Link>
          ))}
        </div>

        {/* Recent leaves */}
        {leaves.filter(l=>l.status==='pending').length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="font-bold text-gray-800">Pending Leave Requests</p>
              <Link to="/admin/leaves" style={{ color:B }} className="text-xs font-semibold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {leaves.filter(l=>l.status==='pending').slice(0,3).map(l => (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{l.students?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{l.reason?.slice(0,50)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
