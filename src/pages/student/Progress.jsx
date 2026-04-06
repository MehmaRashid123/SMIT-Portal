import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'
import { fetchEnrollments } from '../../store/slices/enrollmentSlice'
import { fetchAssignments } from '../../store/slices/assignmentSlice'
import { fetchQuizzes } from '../../store/slices/quizSlice'

const B = '#0B73B7'

export default function StudentProgress() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list: enrollments } = useSelector(s => s.enrollment)
  const { list: assignments }  = useSelector(s => s.assignment)
  const { list: quizzes }      = useSelector(s => s.quiz)

  useEffect(() => {
    if (!user) return
    dispatch(fetchEnrollments(user.id)).then(res => {
      const cid = res.payload?.[0]?.course_id
      if (cid) { dispatch(fetchAssignments(cid)); dispatch(fetchQuizzes(cid)) }
    })
  }, [dispatch, user])

  const course = enrollments[0]?.courses

  const stats = [
    { label:'Attendance',   val:67,  total:114, color:'#0e9f6e', bg:'#e8faf4' },
    { label:'Assignments',  val:0,   total:assignments.length||0, color:B, bg:'#e8f4fc' },
    { label:'Quizzes',      val:0,   total:quizzes.length||0, color:'#7c3aed', bg:'#f3eeff' },
    { label:'Overall',      val:72,  total:100, color:'#f59e0b', bg:'#fffbeb' },
  ]

  return (
    <StudentLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">My Progress</h1>
        <p className="text-sm text-gray-400 mb-6">{course?.name || 'No active course'}</p>

        {/* Progress cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{s.label}</p>
              <p className="text-2xl font-extrabold mb-2" style={{ color:s.color }}>
                {s.val}<span className="text-sm text-gray-400 font-normal">/{s.total}</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-500"
                  style={{ width:`${s.total>0?(s.val/s.total*100):0}%`, background:s.color }}/>
              </div>
              <p className="text-xs text-gray-400 mt-1">{s.total>0?Math.round(s.val/s.total*100):0}%</p>
            </div>
          ))}
        </div>

        {/* Assignments progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="font-bold text-gray-800 mb-4">Assignments</p>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No assignments yet</p>
          ) : assignments.map((a,i) => (
            <div key={a.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background:B }}>{i+1}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-400">Due: {a.due_date || '—'}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700">Pending</span>
            </div>
          ))}
        </div>

        {/* Quizzes progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="font-bold text-gray-800 mb-4">Quizzes</p>
          {quizzes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No quizzes yet</p>
          ) : quizzes.map((q,i) => (
            <div key={q.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background:'#7c3aed' }}>{i+1}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{q.title}</p>
                <p className="text-xs text-gray-400">{q.quiz_questions?.length||0} questions · {q.duration} mins</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-500">Not Taken</span>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
