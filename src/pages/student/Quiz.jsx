import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'
import Modal from '../../components/Modal'
import { fetchQuizzes, submitQuizResult } from '../../store/slices/quizSlice'
import { fetchEnrollments } from '../../store/slices/enrollmentSlice'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function StudentQuiz() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list } = useSelector(s => s.quiz)
  const [active, setActive] = useState(null)   // quiz being taken
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchEnrollments(user.id)).then(res => {
      if (res.payload?.[0]?.course_id) dispatch(fetchQuizzes(res.payload[0].course_id))
    })
  }, [dispatch, user])

  const startQuiz = (quiz) => { setActive(quiz); setAnswers({}); setResult(null) }

  const handleSubmit = async () => {
    const questions = active.quiz_questions || []
    let score = 0
    questions.forEach(q => { if (answers[q.id] === q.correct_option) score++ })
    setSubmitting(true)
    await dispatch(submitQuizResult({ quiz_id: active.id, student_id: user.id, score, total: questions.length }))
    setSubmitting(false)
    setResult({ score, total: questions.length })
  }

  return (
    <StudentLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Quizzes</h1>
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No quizzes available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map(q => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-gray-800 mb-1">{q.title}</p>
                <p className="text-sm text-gray-400 mb-3">{q.quiz_questions?.length || 0} questions · {q.duration || 10} mins</p>
                <button onClick={() => startQuiz(q)}
                  style={{ background:B }} className="text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity w-full">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && !result && (
        <Modal title={active.title} onClose={() => setActive(null)}>
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {(active.quiz_questions || []).map((q, i) => (
              <div key={q.id}>
                <p className="text-sm font-semibold text-gray-800 mb-2">{i+1}. {q.question}</p>
                <div className="space-y-2">
                  {[q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean).map((opt, oi) => {
                    const key = ['a','b','c','d'][oi]
                    const selected = answers[q.id] === key
                    return (
                      <button key={key} onClick={() => setAnswers(a => ({ ...a, [q.id]: key }))}
                        className="w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all"
                        style={selected ? { borderColor:B, background:'#e8f4fc', color:B, fontWeight:600 } : { borderColor:'#e5e7eb' }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background:B }} className="w-full mt-4 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </Modal>
      )}

      {result && (
        <Modal title="Quiz Result" onClose={() => { setActive(null); setResult(null) }}>
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: result.score >= result.total/2 ? '#e8faf4' : '#fff5f5' }}>
              <span className="text-2xl font-extrabold" style={{ color: result.score >= result.total/2 ? '#0e9f6e' : '#ef4444' }}>
                {result.score}/{result.total}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800">{result.score >= result.total/2 ? 'Well done!' : 'Keep practicing!'}</p>
            <p className="text-sm text-gray-400 mt-1">You scored {Math.round(result.score/result.total*100)}%</p>
          </div>
        </Modal>
      )}
    </StudentLayout>
  )
}
