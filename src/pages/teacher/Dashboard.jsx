import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import PortalLayout from '../../components/PortalLayout'
import { fetchCourses } from '../../store/slices/coursesSlice'
import { fetchAllEnrollments } from '../../store/slices/enrollmentSlice'

const G = '#0e9f6e'

const NAV = [
  { to:'/teacher',             label:'Dashboard',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/teacher/assignments', label:'Assignments', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/teacher/quiz',        label:'Quizzes',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/teacher/students',    label:'Students',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { to:'/teacher/leaves',      label:'Leaves',      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
]

export default function TeacherDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: courses } = useSelector(s => s.courses)
  const { all: enrollments } = useSelector(s => s.enrollment)

  useEffect(() => {
    dispatch(fetchCourses())
    dispatch(fetchAllEnrollments())
  }, [dispatch])

  const stats = [
    { label:'Total Students', val: enrollments.length, color: G,        bg:'#e8faf4' },
    { label:'Active Courses',  val: courses.filter(c=>c.status==='open').length, color:'#0B73B7', bg:'#e8f4fc' },
    { label:'Assignments',     val: '—', color:'#7c3aed', bg:'#f3eeff' },
    { label:'Quizzes',         val: '—', color:'#f59e0b', bg:'#fffbeb' },
  ]

  return (
    <PortalLayout links={NAV} accentColor={G}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {user?.name || user?.username} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Teacher Dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.val}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/teacher/quiz"
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex items-center gap-4 hover:border-green-400 transition-colors group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:'#e8faf4' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-800 group-hover:text-green-700">Create Quiz</p>
              <p className="text-sm text-gray-400">Add questions for students</p>
            </div>
          </Link>
          <Link to="/teacher/assignments"
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex items-center gap-4 hover:border-blue-400 transition-colors group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:'#e8f4fc' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B73B7" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-800 group-hover:text-blue-700">Add Assignment</p>
              <p className="text-sm text-gray-400">Create new assignment task</p>
            </div>
          </Link>
        </div>

        {/* Recent enrollments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="font-bold text-gray-800">Recent Students</p>
            <Link to="/teacher/students" style={{ color:G }} className="text-xs font-semibold hover:underline">View All</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Name','CNIC','Roll No','Course'].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody>
              {enrollments.slice(0,5).map(e => (
                <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{e.students?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{e.students?.cnic || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{e.students?.roll_number || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{e.courses?.name || '—'}</td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No students enrolled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  )
}
