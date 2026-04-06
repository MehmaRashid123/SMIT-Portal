import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PortalLayout from '../../components/PortalLayout'
import Modal from '../../components/Modal'
import { fetchAssignments, addAssignment } from '../../store/slices/assignmentSlice'
import { fetchCourses } from '../../store/slices/coursesSlice'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const G = '#0e9f6e'
const B = '#0B73B7'
const NAV = [
  { to:'/teacher',             label:'Dashboard',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/teacher/assignments', label:'Assignments', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/teacher/quiz',        label:'Quizzes',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/teacher/students',    label:'Students',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

export default function ManageAssignments() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list } = useSelector(s => s.assignment)
  const { list: courses } = useSelector(s => s.courses)

  const [showModal,     setShowModal]     = useState(false)
  const [viewModal,     setViewModal]     = useState(null)  // assignment to view submissions
  const [submissions,   setSubmissions]   = useState([])
  const [loadingSubs,   setLoadingSubs]   = useState(false)
  const [form, setForm] = useState({ title:'', description:'', course_id:'', due_date:'' })
  const [saving, setSaving] = useState(false)
  const [grading, setGrading] = useState(null) // submission id being graded
  const [gradeForm, setGradeForm] = useState({ grade:'', feedback:'' })

  useEffect(() => {
    // fetch assignments for teacher's course
    if (user?.course_id) dispatch(fetchAssignments(user.course_id))
    else dispatch(fetchAssignments())
    dispatch(fetchCourses())
  }, [dispatch, user])

  const openSubmissions = async (assignment) => {
    setViewModal(assignment)
    setLoadingSubs(true)
    const { data } = await supabase
      .from('assignment_submissions')
      .select('*, students(name, roll_number)')
      .eq('assignment_id', assignment.id)
      .order('created_at', { ascending: false })
    setSubmissions(data || [])
    setLoadingSubs(false)
  }

  const handleGrade = async (subId) => {
    await supabase.from('assignment_submissions')
      .update({ grade: gradeForm.grade, feedback: gradeForm.feedback, graded_at: new Date().toISOString() })
      .eq('id', subId)
    toast.success('Graded!')
    setGrading(null)
    setGradeForm({ grade:'', feedback:'' })
    // refresh
    openSubmissions(viewModal)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.course_id) { toast.error('Select a course'); return }
    setSaving(true)
    const result = await dispatch(addAssignment(form))
    setSaving(false)
    if (result.error) { toast.error('Failed'); return }
    toast.success('Assignment added!')
    setShowModal(false)
    setForm({ title:'', description:'', course_id:'', due_date:'' })
  }

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"

  return (
    <PortalLayout links={NAV} accentColor={G}>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Assignments</h1>
          <button onClick={() => setShowModal(true)} style={{ background:G }}
            className="text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 whitespace-nowrap">
            + Add
          </button>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No assignments yet.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Title','Course','Due Date','Submissions','Action'].map(h=>(
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {list.map(a => (
                    <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{a.title}</td>
                      <td className="px-5 py-3 text-gray-500 max-w-[130px] truncate">
                        {courses.find(c=>c.id===a.course_id)?.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{a.due_date || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background:'#e8faf4', color:G }}>
                          {a.submission_count || 0} submitted
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => openSubmissions(a)} style={{ color:B }}
                          className="text-xs font-semibold hover:underline">
                          View Submissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Assignment Modal ── */}
      {showModal && (
        <Modal title="Add Assignment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
              <input required className={inp} value={form.title}
                onChange={e => setForm(f=>({...f,title:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
              <textarea rows={3} className={inp} value={form.description}
                onChange={e => setForm(f=>({...f,description:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=G} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Course *</label>
                <select required className={inp} value={form.course_id}
                  onChange={e => setForm(f=>({...f,course_id:e.target.value}))}>
                  <option value="">Select</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Due Date</label>
                <input type="date" className={inp} value={form.due_date}
                  onChange={e => setForm(f=>({...f,due_date:e.target.value}))}/>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ background:G }}
              className="w-full text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Assignment'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Submissions Modal ── */}
      {viewModal && (
        <Modal title={`Submissions — ${viewModal.title}`} onClose={() => { setViewModal(null); setGrading(null) }}>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {loadingSubs ? (
              <p className="text-center py-8 text-gray-400 text-sm">Loading...</p>
            ) : submissions.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No submissions yet.</p>
            ) : submissions.map(sub => (
              <div key={sub.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{sub.students?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{sub.students?.roll_number} · {new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>
                  {sub.grade
                    ? <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:'#e8faf4', color:G }}>
                        Grade: {sub.grade}
                      </span>
                    : <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Pending</span>
                  }
                </div>
                {sub.note && (
                  <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">{sub.note}</p>
                )}
                {sub.feedback && (
                  <p className="text-xs text-blue-600 italic">Feedback: {sub.feedback}</p>
                )}
                {grading === sub.id ? (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Grade (A/B/C...)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        value={gradeForm.grade} onChange={e=>setGradeForm(f=>({...f,grade:e.target.value}))}/>
                      <input placeholder="Feedback (optional)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                        value={gradeForm.feedback} onChange={e=>setGradeForm(f=>({...f,feedback:e.target.value}))}/>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleGrade(sub.id)} style={{ background:G }}
                        className="flex-1 text-white py-2 rounded-lg text-xs font-bold">Save Grade</button>
                      <button onClick={() => setGrading(null)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setGrading(sub.id); setGradeForm({ grade: sub.grade||'', feedback: sub.feedback||'' }) }}
                    style={{ color:B }} className="text-xs font-semibold hover:underline">
                    {sub.grade ? 'Edit Grade' : 'Add Grade'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </PortalLayout>
  )
}
