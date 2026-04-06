import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AdminLayout from '../../components/AdminLayout'
import { fetchStudents } from '../../store/slices/studentsSlice'
import { fetchCourses } from '../../store/slices/coursesSlice'
import { fetchLeaves } from '../../store/slices/leavesSlice'
import { supabase } from '../../lib/supabaseClient'

const B = '#0B73B7'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: students } = useSelector(s => s.students)
  const { list: courses }  = useSelector(s => s.courses)
  const { list: leaves }   = useSelector(s => s.leaves)
  const [regCount,  setRegCount]  = useState(0)
  const [etCount,   setEtCount]   = useState({ pass:0, fail:0, pending:0 })
  const [attToday,  setAttToday]  = useState(0)

  useEffect(() => {
    dispatch(fetchStudents())
    dispatch(fetchCourses())
    dispatch(fetchLeaves())
    // Registrations count
    supabase.from('registrations').select('id', { count:'exact', head:true })
      .then(({ count }) => setRegCount(count || 0))
    // Entry test stats
    supabase.from('entry_test_results').select('status')
      .then(({ data }) => {
        if (data) setEtCount({
          pass:    data.filter(r=>r.status==='pass').length,
          fail:    data.filter(r=>r.status==='fail').length,
          pending: data.filter(r=>r.status==='pending').length,
        })
      })
    // Today's attendance
    const today = new Date().toISOString().split('T')[0]
    supabase.from('attendance').select('id', { count:'exact', head:true }).eq('date', today)
      .then(({ count }) => setAttToday(count || 0))
  }, [dispatch])

  const activeStudents  = students.filter(s => (s.status||'active') === 'active').length
  const dropoutStudents = students.filter(s => s.status === 'graduated' || s.status === 'dropout').length
  const pendingLeaves   = leaves.filter(l => l.status === 'pending').length
  const openCourses     = courses.filter(c => c.status === 'open').length

  const STATS = [
    { label:'Active Students',  val:activeStudents,  color:B,        bg:'#e8f4fc', icon:'👥', to:'/admin/students' },
    { label:'Open Courses',     val:openCourses,     color:'#0e9f6e',bg:'#e8faf4', icon:'📚', to:'/admin/courses' },
    { label:'Registrations',    val:regCount,        color:'#f59e0b',bg:'#fffbeb', icon:'📝', to:'/admin/registrations' },
    { label:'Pending Leaves',   val:pendingLeaves,   color:'#ef4444',bg:'#fff5f5', icon:'📋', to:'/admin/leaves' },
    { label:'Entry Test Pass',  val:etCount.pass,    color:'#0e9f6e',bg:'#e8faf4', icon:'✅', to:'/admin/entry-test' },
    { label:'Entry Test Fail',  val:etCount.fail,    color:'#ef4444',bg:'#fff5f5', icon:'❌', to:'/admin/entry-test' },
    { label:"Today's Attendance",val:attToday,       color:B,        bg:'#e8f4fc', icon:'📅', to:'/admin/attendance' },
    { label:'Total Courses',    val:courses.length,  color:'#7c3aed',bg:'#f3eeff', icon:'🎓', to:'/admin/courses' },
  ]

  const QUICK = [
    { label:'Student Management',  desc:'View, dropout, graduate students',  to:'/admin/students',      color:B,        bg:'#e8f4fc', icon:'👥' },
    { label:'Course Management',   desc:'Add, edit courses with thumbnails', to:'/admin/courses',       color:'#0e9f6e',bg:'#e8faf4', icon:'📚' },
    { label:'Registrations',       desc:'Approve/reject applications',       to:'/admin/registrations', color:'#f59e0b',bg:'#fffbeb', icon:'📝' },
    { label:'Entry Test Results',  desc:'View & override test results',      to:'/admin/entry-test',    color:'#7c3aed',bg:'#f3eeff', icon:'✅' },
    { label:'Enrollments',         desc:'Enroll students in courses',        to:'/admin/enrollments',   color:'#0e9f6e',bg:'#e8faf4', icon:'🎓' },
    { label:'Attendance',          desc:'QR scanner & attendance records',   to:'/admin/attendance',    color:B,        bg:'#e8f4fc', icon:'📅' },
    { label:'Leave Management',    desc:'Approve or reject leave requests',  to:'/admin/leaves',        color:'#ef4444',bg:'#fff5f5', icon:'📋' },
    { label:'Teacher Management',  desc:'Add and manage teachers',           to:'/admin/teachers',      color:'#0e9f6e',bg:'#e8faf4', icon:'👨‍🏫' },
    { label:'Admin Settings',      desc:'Password, add new admins',          to:'/admin/settings',      color:'#7c3aed',bg:'#f3eeff', icon:'⚙️' },
    { label:'My ID Card',          desc:'Download your admin ID card',       to:'/admin/idcard',        color:B,        bg:'#e8f4fc', icon:'🪪' },
  ]

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, <span className="font-semibold text-gray-600">{user?.name || user?.username}</span>
              <span className="ml-2 text-xs">· {new Date().toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
            </p>
          </div>
          <Link to="/admin/attendance"
            style={{ background:B }}
            className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V6a3 3 0 013-3h3M3 15v3a3 3 0 003 3h3m6-18h3a3 3 0 013 3v3m0 6v3a3 3 0 01-3 3h-3"/>
            </svg>
            Scan QR Attendance
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATS.map(s => (
            <Link key={s.label} to={s.to}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background:s.bg }}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick access */}
        <h2 className="font-bold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {QUICK.map(card => (
            <Link key={card.to} to={card.to}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background:card.bg }}>{card.icon}</div>
              <h3 className="font-bold text-gray-800 text-sm">{card.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Pending leaves */}
        {pendingLeaves > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                <p className="font-bold text-gray-800">Pending Leave Requests</p>
              </div>
              <Link to="/admin/leaves" style={{ color:B }} className="text-xs font-semibold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {leaves.filter(l=>l.status==='pending').slice(0,4).map(l => (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{l.students?.name || '—'}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{l.reason}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium flex-shrink-0">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="font-bold text-gray-800">Recent Students</p>
            <Link to="/admin/students" style={{ color:B }} className="text-xs font-semibold hover:underline">View All</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name','Roll No','Status','Registered'].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {students.slice(0,5).map(s => (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-800">{s.name}</td>
                  <td className="px-5 py-3 font-semibold text-xs" style={{ color:B }}>{s.roll_number||'—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize
                      ${s.status==='dropout'?'bg-red-100 text-red-600':s.status==='graduated'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>
                      {s.status||'active'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.password?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                      {s.password?'✓ Yes':'✗ No'}
                    </span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
