import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses, applyCourse } from '../store/slices/coursesSlice'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

const APPLY_FIELDS = ['Full Name', 'Father Name', 'CNIC', 'Phone', 'Email', 'Education', 'Address']

export default function Courses() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.courses)
  const { user, role } = useSelector(s => s.auth)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { dispatch(fetchCourses()) }, [dispatch])

  const handleApply = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await dispatch(applyCourse({ courseId: selected.id, studentId: user?.id || null, formData: form }))
    setSubmitting(false)
    if (result.error) { toast.error('Application failed. Try again.'); return }
    toast.success('Application submitted successfully!')
    setSelected(null)
    setForm({})
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Courses</h1>
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading courses...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No courses available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-semibold text-gray-800 text-lg">{course.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {course.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm flex-1 mb-4">{course.description || 'No description provided.'}</p>
                <div className="text-xs text-gray-400 mb-4">Duration: {course.duration || 'N/A'}</div>
                <button
                  disabled={course.status !== 'open'}
                  onClick={() => { setSelected(course); setForm({}) }}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition ${course.status === 'open' ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {course.status === 'open' ? 'Apply Now' : 'Admissions Closed'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={`Apply for ${selected.name}`} onClose={() => setSelected(null)}>
          <form onSubmit={handleApply} className="space-y-3">
            {APPLY_FIELDS.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form[field] || ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
