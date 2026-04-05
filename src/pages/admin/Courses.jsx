import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses, addCourse, updateCourse } from '../../store/slices/coursesSlice'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const EMPTY = { name: '', status: 'open', description: '', duration: '' }

export default function AdminCourses() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.courses)
  const [modal, setModal] = useState(null) // null | 'add' | course object
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchCourses()) }, [dispatch])

  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (course) => { setForm({ name: course.name, status: course.status, description: course.description || '', duration: course.duration || '' }); setModal(course) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    let result
    if (modal === 'add') {
      result = await dispatch(addCourse(form))
    } else {
      result = await dispatch(updateCourse({ id: modal.id, updates: { name: form.name, status: form.status } }))
    }
    setSaving(false)
    if (result.error) { toast.error('Failed to save.'); return }
    toast.success(modal === 'add' ? 'Course added!' : 'Course updated!')
    setModal(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <button onClick={openAdd} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
            + Add Course
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Course Name', 'Duration', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-400">No courses yet.</td></tr>
                ) : list.map(course => (
                  <tr key={course.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{course.name}</td>
                    <td className="px-4 py-3 text-gray-600">{course.duration || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {course.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(course)} className="text-green-700 hover:underline text-xs font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Course' : 'Edit Course'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            {modal === 'add' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input placeholder="e.g. 6 months" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
