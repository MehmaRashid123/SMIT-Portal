import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PortalLayout from '../../components/PortalLayout'
import Modal from '../../components/Modal'
import { fetchAssignments, addAssignment } from '../../store/slices/assignmentSlice'
import { fetchCourses } from '../../store/slices/coursesSlice'
import toast from 'react-hot-toast'

const G = '#0e9f6e'
const NAV = [
  { to:'/teacher',             label:'Dashboard',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/teacher/assignments', label:'Assignments', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/teacher/quiz',        label:'Quizzes',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/teacher/students',    label:'Students',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

export default function ManageAssignments() {
  const dispatch = useDispatch()
  const { list } = useSelector(s => s.assignment)
  const { list: courses } = useSelector(s => s.courses)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', course_id:'', due_date:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchAssignments()); dispatch(fetchCourses()) }, [dispatch])

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

  return (
    <PortalLayout links={NAV} accentColor={G}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Assignments</h1>
          <button onClick={() => setShowModal(true)}
            style={{ background:G }} className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
            + Add Assignment
          </button>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No assignments yet.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Title','Course','Due Date','Status'].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{a.title}</td>
                    <td className="px-5 py-3 text-gray-500">{courses.find(c=>c.id===a.course_id)?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{a.due_date || '—'}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background:'#e8faf4', color:G }}>Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add Assignment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                  value={form.course_id} onChange={e => setForm(f=>({...f,course_id:e.target.value}))}>
                  <option value="">Select</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                  value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              style={{ background:G }} className="w-full text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Assignment'}
            </button>
          </form>
        </Modal>
      )}
    </PortalLayout>
  )
}
