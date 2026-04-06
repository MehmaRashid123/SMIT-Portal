import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'
import Modal from '../../components/Modal'
import { fetchAssignments, submitAssignment } from '../../store/slices/assignmentSlice'
import { fetchEnrollments } from '../../store/slices/enrollmentSlice'
import toast from 'react-hot-toast'

const B = '#0B73B7'
const NAV = []

export default function StudentAssignments() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list } = useSelector(s => s.assignment)
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchEnrollments(user.id)).then(res => {
      if (res.payload?.[0]?.course_id) dispatch(fetchAssignments(res.payload[0].course_id))
    })
  }, [dispatch, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await dispatch(submitAssignment({ assignmentId: selected.id, studentId: user.id, note }))
    setSubmitting(false)
    if (result.error) { toast.error('Submission failed'); return }
    toast.success('Assignment submitted!')
    setSelected(null); setNote('')
  }

  return (
    <StudentLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Assignments</h1>
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No assignments yet.</div>
        ) : (
          <div className="space-y-4">
            {list.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{a.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{a.description}</p>
                  <p className="text-xs text-gray-300 mt-1">Due: {a.due_date || '—'}</p>
                </div>
                <button onClick={() => setSelected(a)} style={{ background:B }}
                  className="text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">
                  Submit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <Modal title={`Submit: ${selected.title}`} onClose={() => setSelected(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Answer / Note</label>
              <textarea rows={4} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                value={note} onChange={e=>setNote(e.target.value)}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <button type="submit" disabled={submitting} style={{ background:B }}
              className="w-full text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </form>
        </Modal>
      )}
    </StudentLayout>
  )
}
