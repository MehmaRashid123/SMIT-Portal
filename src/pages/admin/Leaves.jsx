import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaves, updateLeaveStatus } from '../../store/slices/leavesSlice'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const B = '#0B73B7'
const STATUS_COLORS = { pending:'bg-yellow-100 text-yellow-700', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-600' }

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
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Leave Management</h1>
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Student','Roll No.','Reason','Dates','Status','Actions'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No leave requests.</td></tr>
                ) : list.map(leave => (
                  <tr key={leave.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{leave.students?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{leave.students?.roll_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{leave.reason}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{leave.from_date} → {leave.to_date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[leave.status]}`}>{leave.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(leave)} style={{ color:B }} className="text-xs font-semibold hover:underline">View</button>
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
            {[['Student',selected.students?.name],['Roll No',selected.students?.roll_number],['Reason',selected.reason],['Date Range',`${selected.from_date} → ${selected.to_date}`]].map(([l,v])=>(
              <div key={l}><span className="font-semibold text-gray-600">{l}: </span><span className="text-gray-700">{v}</span></div>
            ))}
            <div><span className="font-semibold text-gray-600">Status: </span>
              <span className={`ml-1 text-xs px-2 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
            </div>
            {selected.image_url && (
              <div><span className="font-semibold text-gray-600">Attachment: </span>
                <a href={selected.image_url} target="_blank" rel="noreferrer" style={{ color:B }} className="hover:underline ml-1">View Image</a>
              </div>
            )}
            {selected.status === 'pending' && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button disabled={updating} onClick={() => handleStatus(selected.id,'approved')}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{ background:'#0e9f6e' }}>✓ Approve</button>
                <button disabled={updating} onClick={() => handleStatus(selected.id,'rejected')}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{ background:'#ef4444' }}>✗ Reject</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}