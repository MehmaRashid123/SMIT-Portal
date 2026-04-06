import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PortalLayout from '../../components/PortalLayout'
import { fetchEnrollmentsByTeacher } from '../../store/slices/enrollmentSlice'

const G = '#0e9f6e'
const NAV = [
  { to:'/teacher',             label:'Dashboard',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/teacher/attendance',  label:'Attendance',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to:'/teacher/assignments', label:'Assignments', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/teacher/quiz',        label:'Quizzes',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/teacher/students',    label:'Students',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

export default function TeacherStudents() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { all: enrollments, loading } = useSelector(s => s.enrollment)

  useEffect(() => {
    if (user?.id) dispatch(fetchEnrollmentsByTeacher(user.id))
  }, [dispatch, user])

  return (
    <PortalLayout links={NAV} accentColor={G}>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">My Students</h1>
        <p className="text-sm text-gray-400 mb-6">{enrollments.length} students enrolled in your class</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','Roll No','Course','Slot'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400">Loading...</td></tr>
                ) : enrollments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400">No students enrolled in your class yet.</td></tr>
                ) : enrollments.map(e => (
                  <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: G }}>
                          {(e.students?.name||'?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{e.students?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{e.students?.roll_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{e.courses?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{e.slot || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
