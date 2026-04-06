import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaves, submitLeave } from '../../store/slices/leavesSlice'
import StudentLayout from '../../components/StudentLayout'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const B = '#0B73B7'
const STATUS = { pending:'bg-yellow-100 text-yellow-700', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-500' }

export default function StudentLeaves() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list, loading } = useSelector(s => s.leaves)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reason:'', fromDate:'', toDate:'' })
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) dispatch(fetchLeaves(user.id)) }, [dispatch, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const result = await dispatch(submitLeave({ studentId:user.id, reason:form.reason, fromDate:form.fromDate, toDate:form.toDate, imageFile }))
    setSubmitting(false)
    if (result.error) { toast.error('Failed to submit'); return }
    toast.success('Leave submitted!')
    setShowForm(false); setForm({ reason:'', fromDate:'', toDate:'' }); setImageFile(null)
  }

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"

  return (
    <StudentLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Leave Requests</h1>
            <p className="text-sm text-gray-400 mt-0.5">{list.length} total requests</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background:B }}
            className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            New Request
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'#e8f4fc' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No leave requests yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "New Request" to submit one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(leave => (
              <div key={leave.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{leave.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {leave.from_date} → {leave.to_date}
                    </p>
                    {leave.image_url && (
                      <a href={leave.image_url} target="_blank" rel="noreferrer"
                        style={{ color:B }} className="text-xs hover:underline mt-1 block">
                        View Attachment
                      </a>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize flex-shrink-0 ${STATUS[leave.status]||'bg-gray-100 text-gray-500'}`}>
                    {leave.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Submit Leave Request" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reason *</label>
              <textarea required rows={3} className={inp} value={form.reason}
                onChange={e=>setForm(f=>({...f,reason:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">From Date *</label>
                <input required type="date" className={inp} value={form.fromDate}
                  onChange={e=>setForm(f=>({...f,fromDate:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">To Date *</label>
                <input required type="date" className={inp} value={form.toDate}
                  onChange={e=>setForm(f=>({...f,toDate:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Attachment (optional)</label>
              <input type="file" accept="image/*" className="w-full text-sm text-gray-500"
                onChange={e=>setImageFile(e.target.files[0])}/>
            </div>
            <button type="submit" disabled={submitting} style={{ background:B }}
              className="w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </Modal>
      )}
    </StudentLayout>
  )
}
