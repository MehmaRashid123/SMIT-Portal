import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaves, updateLeaveStatus } from '../../store/slices/leavesSlice'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-600' }

export default function AdminLeaves() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.leaves)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => { dispatch(fetchLeaves()) }, [dispatch])

  const handleStatus = async (id, status) => {
    setUpdating(true)
    const result = await dispatch(updateLeaveStatus({ id, status }))
    setUpdating(false)
    if (result.error) { toast.error('Update failed'); return }
    toast.success(`Leave ${status}!`)
    setSelected(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Leave Management</h1>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Student', 'Roll No.', 'Reason', 'Dates', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No leave requests.</td></tr>
                ) : list.map(leave => (
                  <tr key={leave.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{leave.students?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{leave.students?.roll_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{leave.reason}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{leave.from_date} → {leave.to_date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[leave.status]}`}>{leave.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(leave)} className="text-green-700 hover:underline text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <Modal title="Leave Request Details" onClose={() => setSelected(null)}>
          <div className="space-y-3 text-sm">
            <div><span className="font-medium text-gray-700">Student:</span> <span className="text-gray-600">{selected.students?.name}</span></div>
            <div><span className="font-medium text-gray-700">Roll No:</span> <span className="text-gray-600">{selected.students?.roll_number}</span></div>
            <div><span className="font-medium text-gray-700">Reason:</span> <p className="text-gray-600 mt-1">{selected.reason}</p></div>
            <div><span className="font-medium text-gray-700">Date Range:</span> <span className="text-gray-600">{selected.from_date} → {selected.to_date}</span></div>
            <div><span className="font-medium text-gray-700">Status:</span> <span className={`ml-1 text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[selected.status]}`}>{selected.status}</span></div>
            {selected.image_url && (
              <div>
                <span className="font-medium text-gray-700">Attachment:</span>
                <a href={selected.image_url} target="_blank" rel="noreferrer" className="ml-2 text-green-700 hover:underline">View Image</a>
              </div>
            )}
            {selected.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button disabled={updating} onClick={() => handleStatus(selected.id, 'approved')} className="flex-1 bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">
                  Approve
                </button>
                <button disabled={updating} onClick={() => handleStatus(selected.id, 'rejected')} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-500 transition disabled:opacity-60">
                  Reject
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
