import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import QRScanner from '../../components/QRScanner'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function AdminAttendance() {
  const [records,  setRecords]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [scanning, setScanning] = useState(false)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { fetchRecords() }, [dateFilter])

  const fetchRecords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(name, roll_number, cnic), courses(name)')
      .eq('date', dateFilter)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error) setRecords(data || [])
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('attendance').update({ status }).eq('id', id)
    if (error) { toast.error('Update failed'); return }
    setRecords(r => r.map(x => x.id === id ? { ...x, status } : x))
    toast.success('Updated!')
  }

  const STATUS = { present:'bg-green-100 text-green-700', absent:'bg-red-100 text-red-500', late:'bg-yellow-100 text-yellow-700' }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Attendance Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{records.length} records for {dateFilter}</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            <button onClick={() => setScanning(true)} style={{ background:B }}
              className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V6a3 3 0 013-3h3M3 15v3a3 3 0 003 3h3m6-18h3a3 3 0 013 3v3m0 6v3a3 3 0 01-3 3h-3"/>
              </svg>
              Scan QR
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label:'Present', val: records.filter(r=>r.status==='present').length, color:'#0e9f6e', bg:'#e8faf4' },
            { label:'Absent',  val: records.filter(r=>r.status==='absent').length,  color:'#ef4444', bg:'#fff5f5' },
            { label:'Late',    val: records.filter(r=>r.status==='late').length,    color:'#f59e0b', bg:'#fffbeb' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Student','Roll No','Course','Time','Status','Action'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No attendance records for this date</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.students?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.students?.roll_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{r.courses?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleTimeString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS[r.status]||'bg-gray-100 text-gray-500'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {scanning && <QRScanner onClose={() => { setScanning(false); fetchRecords() }} />}
    </AdminLayout>
  )
}
