import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import StudentLayout from '../../components/StudentLayout'
import { fetchEnrollments } from '../../store/slices/enrollmentSlice'
import { fetchLeaves } from '../../store/slices/leavesSlice'
import { fetchAssignments } from '../../store/slices/assignmentSlice'
import { fetchQuizzes } from '../../store/slices/quizSlice'

const B = '#0B73B7'
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const today = new Date()

export default function StudentDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: enrollments, loading } = useSelector(s => s.enrollment)
  const { list: leaves }      = useSelector(s => s.leaves)
  const { list: assignments }  = useSelector(s => s.assignment)
  const { list: quizzes }      = useSelector(s => s.quiz)
  const [activeTab, setActiveTab] = useState('Assignments')

  useEffect(() => {
    if (!user) return
    dispatch(fetchEnrollments(user.id))
    dispatch(fetchLeaves(user.id))
    dispatch(fetchEnrollments(user.id)).then(res => {
      const cid = res.payload?.[0]?.course_id
      if (cid) { dispatch(fetchAssignments(cid)); dispatch(fetchQuizzes(cid)) }
    })
  }, [dispatch, user])

  const enrollment = enrollments[0]
  const course = enrollment?.courses
  const weekDays = Array.from({ length:7 }, (_,i) => {
    const d = new Date(today); d.setDate(today.getDate() - today.getDay() + i)
    return { label:DAYS[i], date:d.getDate(), isToday: i===today.getDay() }
  })

  const tabContent = {
    Assignments: assignments.length === 0
      ? <p className="text-sm text-gray-400 text-center py-6">No assignments yet</p>
      : assignments.slice(0,3).map(a => (
          <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <p className="text-sm text-gray-700 truncate">{a.title}</p>
            <span className="text-xs text-gray-400">{a.due_date || '—'}</span>
          </div>
        )),
    Quizzes: quizzes.length === 0
      ? <p className="text-sm text-gray-400 text-center py-6">No upcoming quizzes</p>
      : quizzes.slice(0,3).map(q => (
          <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <p className="text-sm text-gray-700 truncate">{q.title}</p>
            <span className="text-xs text-gray-400">{q.duration} mins</span>
          </div>
        )),
    Events: <p className="text-sm text-gray-400 text-center py-6">No upcoming events</p>,
  }

  return (
    <StudentLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <span>Home</span>
          {course && <><span>›</span><span className="text-gray-600 font-medium">{course.name}</span></>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-gray-800">—</p>
                  <p className="text-sm text-gray-400 mt-1">Attendance</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background:'#e8faf4' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-gray-800">0/{assignments.length || 0}</p>
                  <p className="text-sm text-gray-400 mt-1">Assignment</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background:'#f3eeff' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Course */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Active Course</p>
                {loading ? <p className="text-gray-400 text-sm">Loading...</p> : !enrollment ? (
                  <p className="text-gray-400 text-sm">No active enrollment. Contact admin.</p>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-extrabold text-gray-900">{course?.name}</h2>
                        <p className="text-xs text-gray-400 mt-1">{course?.category} · {course?.duration}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {['Sat 09:00 AM – 12:00 PM','Sun 09:00 AM – 12:00 PM'].map((s,i)=>(
                            <span key={i} className="text-xs bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-gray-600">{s}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0"
                        style={{ borderColor:'#f87171',color:'#ef4444',background:'#fff5f5' }}>ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 mt-4 gap-0 divide-x divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                      {[
                        ['#','Batch', enrollment.batch||'—'],
                        ['👤','Roll', user?.roll_number||'—'],
                        ['📍','Campus', enrollment.campus||'—'],
                        ['🏙️','City', enrollment.city||'—'],
                      ].map(([icon,label,val])=>(
                        <div key={label} className="px-4 py-3 flex items-center gap-2 text-sm bg-white">
                          <span className="text-gray-400">{icon}</span>
                          <span className="text-gray-500">{label}:</span>
                          <span className="font-semibold text-gray-800">{val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Leaves */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-gray-800">Recent Leaves</p>
                <Link to="/student/leaves" style={{ color:B }} className="text-xs font-semibold hover:underline">View All</Link>
              </div>
              {leaves.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">No leave requests yet.</p>
                : leaves.slice(0,3).map(l => (
                    <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{l.reason}</p>
                        <p className="text-xs text-gray-400">{l.from_date} → {l.to_date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize
                        ${l.status==='approved'?'bg-green-100 text-green-700':l.status==='rejected'?'bg-red-100 text-red-500':'bg-yellow-100 text-yellow-700'}`}>
                        {l.status}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            {/* Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p className="font-bold text-gray-800 text-sm">Class Schedule</p>
              </div>
              <div className="flex gap-1">
                {weekDays.map(d => (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{d.label}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={d.isToday ? { background:B,color:'#fff' } : { color:'#374151' }}>
                      {d.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex gap-1 mb-4 bg-gray-50 rounded-xl p-1">
                {['Assignments','Quizzes','Events'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-all"
                    style={{ background:activeTab===t?B:'transparent', color:activeTab===t?'#fff':'#6b7280' }}>
                    {t}
                  </button>
                ))}
              </div>
              {tabContent[activeTab]}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
