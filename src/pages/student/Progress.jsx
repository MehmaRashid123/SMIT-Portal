import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'
import { fetchEnrollments } from '../../store/slices/enrollmentSlice'
import { fetchAssignments } from '../../store/slices/assignmentSlice'
import { fetchQuizzes } from '../../store/slices/quizSlice'
import { supabase } from '../../lib/supabaseClient'

const B = '#0B73B7'

export default function StudentProgress() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: enrollments } = useSelector(s => s.enrollment)
  const { list: assignments }  = useSelector(s => s.assignment)
  const { list: quizzes }      = useSelector(s => s.quiz)
  const [attendance, setAttendance] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    if (!user) return
    dispatch(fetchEnrollments(user.id)).then(res => {
      const cid = res.payload?.[0]?.course_id
      if (cid) { dispatch(fetchAssignments(cid)); dispatch(fetchQuizzes(cid)) }
    })
    // Real attendance
    supabase.from('attendance').select('*').eq('student_id', user.id)
      .then(({ data }) => setAttendance(data || []))
    // Real quiz results
    supabase.from('quiz_results').select('*').eq('student_id', user.id)
      .then(({ data }) => setQuizResults(data || []))
    // Real submissions
    supabase.from('assignment_submissions').select('*').eq('student_id', user.id)
      .then(({ data }) => setSubmissions(data || []))
  }, [dispatch, user])

  const course   = enrollments[0]?.courses
  const present  = attendance.filter(a => a.status === 'present').length
  const attTotal = attendance.length
  const attPct   = attTotal > 0 ? Math.round(present / attTotal * 100) : 0

  const quizPct  = quizResults.length > 0
    ? Math.round(quizResults.reduce((a, q) => a + (q.total > 0 ? q.score/q.total*100 : 0), 0) / quizResults.length)
    : 0

  const stats = [
    { label:'Attendance',  val:present,          total:attTotal,           color:'#0e9f6e', bg:'#e8faf4' },
    { label:'Assignments', val:submissions.length, total:assignments.length||0, color:B,        bg:'#e8f4fc' },
    { label:'Quizzes',     val:quizResults.length, total:quizzes.length||0,     color:'#7c3aed', bg:'#f3eeff' },
    { label:'Avg Quiz',    val:quizPct,            total:100,                    color:'#f59e0b', bg:'#fffbeb' },
  ]

  return (
    <StudentLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My Progress</h1>
        <p className="text-sm text-gray-400 mb-6">{course?.name || 'No active course'}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{s.label}</p>
              <p className="text-2xl font-extrabold mb-2" style={{ color:s.color }}>
                {s.val}<span className="text-sm text-gray-400 font-normal">/{s.total}</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width:`${s.total>0?Math.min(s.val/s.total*100,100):0}%`, background:s.color }}/>
              </div>
              <p className="text-xs text-gray-400 mt-1">{s.total>0?Math.round(Math.min(s.val/s.total*100,100)):0}%</p>
            </div>
          ))}
        </div>

        {/* Attendance summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-800">Attendance</p>
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: attPct>=75?'#dcfce7':'#fee2e2', color: attPct>=75?'#166534':'#991b1b' }}>
              {attPct}% — {attPct>=75?'Good':'Needs Improvement'}
            </span>
          </div>
          {attendance.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No attendance records yet</p>
            : <div className="flex flex-wrap gap-1.5">
                {attendance.slice(0,20).map(a => (
                  <div key={a.id} className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={a.status==='present'?{background:'#dcfce7',color:'#166534'}:{background:'#fee2e2',color:'#991b1b'}}>
                    {a.date}
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="font-bold text-gray-800 mb-4">Assignments</p>
          {assignments.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">No assignments yet</p>
            : assignments.map((a,i) => {
                const submitted = submissions.find(s => s.assignment_id === a.id)
                return (
                  <div key={a.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background:B }}>{i+1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-400">Due: {a.due_date || '—'}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${submitted?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                      {submitted ? '✓ Submitted' : 'Pending'}
                    </span>
                  </div>
                )
              })
          }
        </div>

        {/* Quizzes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="font-bold text-gray-800 mb-4">Quizzes</p>
          {quizzes.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">No quizzes yet</p>
            : quizzes.map((q,i) => {
                const res = quizResults.find(r => r.quiz_id === q.id)
                const pct = res && res.total > 0 ? Math.round(res.score/res.total*100) : null
                return (
                  <div key={q.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background:'#7c3aed' }}>{i+1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{q.title}</p>
                      <p className="text-xs text-gray-400">{q.duration} mins</p>
                    </div>
                    {res
                      ? <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ background: pct>=70?'#dcfce7':'#fee2e2', color: pct>=70?'#166534':'#991b1b' }}>
                          {res.score}/{res.total} ({pct}%)
                        </span>
                      : <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-500">Not Taken</span>
                    }
                  </div>
                )
              })
          }
        </div>
      </div>
    </StudentLayout>
  )
}
