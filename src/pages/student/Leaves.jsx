import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaves, submitLeave } from '../../store/slices/leavesSlice'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-600' }

export default function StudentLeaves() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list, loading } = useSelector(s => s.leaves)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reason: '', fromDate: '', toDate: '' })
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) dispatch(fetchLeaves(user.id)) }, [dispatch, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await dispatch(submitLeave({ studentId: user.id, reason: form.reason, fromDate: form.fromDate, toDate: form.toDate, imageFile }))
    setSubmitting(false)
    if (result.error) { toast.error('Failed to submit leave.'); return }
    toast.success('Leave request submitted!')
    setShowForm(false)
    setForm({ reason: '', fromDate: '', toDate: '' })
    setImageFile(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Leave Requests</h1>
          <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
            + New Request
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No leave requests yet.</div>
        ) : (
          <div className="space-y-3">
            {list.map(leave => (
              <div key={leave.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{leave.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">{leave.from_date} → {leave.to_date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[leave.status]}`}>{leave.status}</span>
                </div>
                {leave.image_url && (
                  <a href={leave.image_url} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline mt-2 block">View Attachment</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Submit Leave Request" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
              <input type="file" accept="image/*" className="w-full text-sm text-gray-500" onChange={e => setImageFile(e.target.files[0])} />
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
