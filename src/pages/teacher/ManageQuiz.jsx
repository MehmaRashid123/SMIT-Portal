import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PortalLayout from '../../components/PortalLayout'
import Modal from '../../components/Modal'
import { fetchQuizzes, addQuiz } from '../../store/slices/quizSlice'
import { fetchCourses } from '../../store/slices/coursesSlice'
import toast from 'react-hot-toast'

const G = '#0e9f6e'
const NAV = [
  { to:'/teacher',             label:'Dashboard',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/teacher/assignments', label:'Assignments', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/teacher/quiz',        label:'Quizzes',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/teacher/students',    label:'Students',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

const EMPTY_Q = { question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'a' }

export default function ManageQuiz() {
  const dispatch = useDispatch()
  const { list } = useSelector(s => s.quiz)
  const { list: courses } = useSelector(s => s.courses)
  const [showModal, setShowModal] = useState(false)
  const [quizForm, setQuizForm] = useState({ title:'', course_id:'', duration:10 })
  const [questions, setQuestions] = useState([{ ...EMPTY_Q }])
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchQuizzes()); dispatch(fetchCourses()) }, [dispatch])

  const addQuestion = () => setQuestions(q => [...q, { ...EMPTY_Q }])
  const updateQ = (i, field, val) => setQuestions(q => q.map((item, idx) => idx===i ? { ...item, [field]:val } : item))
  const removeQ = (i) => setQuestions(q => q.filter((_,idx) => idx!==i))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!quizForm.course_id) { toast.error('Select a course'); return }
    setSaving(true)
    const result = await dispatch(addQuiz({ quiz: quizForm, questions }))
    setSaving(false)
    if (result.error) { toast.error('Failed to create quiz'); return }
    toast.success('Quiz created!')
    setShowModal(false)
    setQuizForm({ title:'', course_id:'', duration:10 })
    setQuestions([{ ...EMPTY_Q }])
  }

  return (
    <PortalLayout links={NAV} accentColor={G}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Quizzes</h1>
          <button onClick={() => setShowModal(true)}
            style={{ background:G }} className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            + Create Quiz
          </button>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No quizzes yet. Create one!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map(q => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-gray-800">{q.title}</p>
                <p className="text-sm text-gray-400 mt-1">{q.quiz_questions?.length || 0} questions · {q.duration} mins</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background:'#e8faf4', color:G }}>Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Create New Quiz" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                  value={quizForm.title} onChange={e => setQuizForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                  value={quizForm.course_id} onChange={e => setQuizForm(f=>({...f,course_id:e.target.value}))}>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
              <input type="number" min={1} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                value={quizForm.duration} onChange={e => setQuizForm(f=>({...f,duration:+e.target.value}))} />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800 text-sm">Questions</p>
                <button type="button" onClick={addQuestion}
                  style={{ color:G }} className="text-xs font-semibold hover:underline">+ Add Question</button>
              </div>
              {questions.map((q, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500">Q{i+1}</p>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQ(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <input placeholder="Question" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
                    value={q.question} onChange={e => updateQ(i,'question',e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    {['a','b','c','d'].map(opt => (
                      <input key={opt} placeholder={`Option ${opt.toUpperCase()}`} required
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
                        value={q[`option_${opt}`]} onChange={e => updateQ(i,`option_${opt}`,e.target.value)} />
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mr-2">Correct:</label>
                    {['a','b','c','d'].map(opt => (
                      <label key={opt} className="mr-3 text-xs cursor-pointer">
                        <input type="radio" name={`correct_${i}`} value={opt} checked={q.correct_option===opt}
                          onChange={() => updateQ(i,'correct_option',opt)} className="mr-1" />
                        {opt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving}
              style={{ background:G }} className="w-full text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Create Quiz'}
            </button>
          </form>
        </Modal>
      )}
    </PortalLayout>
  )
}
