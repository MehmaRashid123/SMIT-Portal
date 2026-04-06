import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import StudentLayout from '../../components/StudentLayout'
import { supabase } from '../../lib/supabaseClient'

const B = '#0B73B7'
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function StudentAttendance() {
  const { user } = useSelector(s => s.auth)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]     = useState(new Date().getMonth())

  useEffect(() => {
    if (!user) return
    const fetchAttendance = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: false })
      setLoading(false)
      if (!error) setRecords(data || [])
    }
    fetchAttendance()
  }, [user])

  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length
  const total   = records.length
  const pct     = total > 0 ? Math.round(present / total * 100) : 0

  const monthRecords = records.filter(r => new Date(r.date).getMonth() === month)

  const STATUS_STYLE = {
    present: 'bg-green-100 text-green-700',
    absent:  'bg-red-100 text-red-500',
    late:    'bg-yellow-100 text-yellow-700',
  }

  return (
    <StudentLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Attendance</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Present', val:present, color:'#0e9f6e', bg:'#e8faf4' },
            { label:'Absent',  val:absent,  color:'#ef4444', bg:'#fff5f5' },
            { label:'Late',    val:late,    color:'#f59e0b', bg:'#fffbeb' },
            { label:'Overall', val:`${pct}%`, color:B, bg:'#e8f4fc' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-gray-800">Attendance Rate</p>
            <p className="font-extrabold text-lg" style={{ color: pct >= 75 ? '#0e9f6e' : '#ef4444' }}>{pct}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full transition-all duration-700"
              style={{ width:`${pct}%`, background: pct >= 75 ? '#0e9f6e' : '#ef4444' }}/>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {total === 0 ? 'No attendance records yet. Attend class to see records.' :
             pct >= 75 ? '✓ Good attendance — keep it up!' : '⚠ Below 75% — please improve attendance'}
          </p>
        </div>

        {/* Month filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          {MONTHS.map((m,i) => (
            <button key={m} onClick={() => setMonth(i)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={month===i ? {background:B,color:'#fff'} : {background:'#f3f4f6',color:'#6b7280'}}>
              {m}
            </button>
          ))}
        </div>

        {/* Records */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Date','Day','Status','Marked By'].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : monthRecords.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">No records for this month</td></tr>
              ) : monthRecords.map(r => {
                const d = new Date(r.date)
                return (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.date}</td>
                    <td className="px-5 py-3 text-gray-500">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_STYLE[r.status]||'bg-gray-100 text-gray-500'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs capitalize">{r.marked_by || 'qr'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  )
}
