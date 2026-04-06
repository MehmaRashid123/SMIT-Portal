import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'
const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-500',
}

export default function AdminRegistrations() {
  const { list: courses } = useSelector(s => s.courses)
  const [regs, setRegs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [filter, setFilter]   = useState('all')

  useEffect(() => { fetchRegs() }, [])

  const fetchRegs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('registrations')
      .select('*, courses(name)')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) { toast.error('Failed to load'); return }
    setRegs(data || [])
  }

  const updateStatus = async (id, status) => {
    setUpdating(true)
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id)
    if (error) { toast.error('Update failed'); setUpdating(false); return }

    if (status === 'approved') {
      const reg = regs.find(r => r.id === id)
      if (reg) {
        const { data: existing } = await supabase
          .from('students').select('id, roll_number').eq('cnic', reg.id_number).single()

        if (!existing) {
          // Generate roll number: SMIT-YYYY-XXXX
          const roll = `SMIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
          const { data: newStudent, error: stuErr } = await supabase.from('students').insert([{
            name: reg.full_name,
            cnic: reg.id_number,
            roll_number: roll,
            phone: reg.phone,
          }]).select().single()

          if (stuErr) {
            toast.error('Approved but student record failed: ' + stuErr.message)
          } else {
            // Save roll number back to registration for reference
            await supabase.from('registrations').update({ roll_number: roll }).eq('id', id)
            setRegs(r => r.map(x => x.id === id ? { ...x, status:'approved', roll_number: roll } : x))
            setSelected(s => s ? { ...s, status:'approved', roll_number: roll } : null)
            toast.success(`✓ Approved! Roll No: ${roll}`)
            setUpdating(false)
            return
          }
        } else {
          toast.success(`Approved! (Roll: ${existing.roll_number})`)
        }
      }
    } else {
      toast.success(`Registration ${status}!`)
    }

    setUpdating(false)
    setRegs(r => r.map(x => x.id === id ? { ...x, status } : x))
    setSelected(s => s ? { ...s, status } : null)
  }

  const filtered = filter === 'all' ? regs : regs.filter(r => r.status === filter)

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Registrations</h1>
            <p className="text-sm text-gray-400 mt-0.5">{regs.length} total applications</p>
          </div>
          {/* filter tabs */}
          <div className="flex gap-2">
            {['all','pending','approved','rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                style={filter===f ? {background:B,color:'#fff'} : {background:'#f3f4f6',color:'#6b7280'}}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','CNIC','Course','City','Date','Status','Action'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No registrations found.</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.id_number}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.courses?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.city || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[r.status]||'bg-gray-100 text-gray-500'}`}>
                        {r.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(r)} style={{ color:B }}
                        className="text-xs font-semibold hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <Modal title="Registration Details" onClose={() => setSelected(null)}>
          <div className="space-y-3 text-sm max-h-[65vh] overflow-y-auto pr-1">
            {selected.picture_url && (
              <div className="flex justify-center mb-2">
                <img src={selected.picture_url} alt="applicant" className="w-20 h-20 rounded-2xl object-cover border-2" style={{ borderColor:B }}/>
              </div>
            )}
            {[
              ['Full Name', selected.full_name],
              ['Father Name', selected.father_name],
              ['CNIC', selected.id_number],
              ['Father CNIC', selected.father_id_number],
              ['Date of Birth', selected.dob],
              ['Email', selected.email],
              ['Phone', selected.phone],
              ["Father's Phone", selected.father_phone],
              ['Gender', selected.gender],
              ['City', selected.city],
              ['Campus', selected.campus],
              ['Course', selected.courses?.name],
              ['Class Preference', selected.class_preference],
              ['Qualification', selected.qualification],
              ['Computer Proficiency', selected.proficiency],
              ['Has Laptop', selected.has_laptop ? 'Yes' : 'No'],
              ['Heard From', selected.heard_from],
              ['Address', selected.address],
            ].map(([label, val]) => val ? (
              <div key={label} className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 flex-shrink-0">{label}:</span>
                <span className="text-gray-700">{val}</span>
              </div>
            ) : null)}

            {(selected.status === 'pending' || !selected.status) && (
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button disabled={updating} onClick={() => updateStatus(selected.id, 'approved')}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
                  style={{ background:'#0e9f6e' }}>
                  {updating ? 'Processing...' : '✓ Approve & Create Student'}
                </button>
                <button disabled={updating} onClick={() => updateStatus(selected.id, 'rejected')}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
                  style={{ background:'#ef4444' }}>
                  ✗ Reject
                </button>
              </div>
            )}
            {selected.status === 'approved' && (
              <div className="mt-3 p-4 rounded-2xl border-2" style={{ background:'#e8f4fc', borderColor:'#0B73B7' }}>
                <p className="text-xs font-bold text-blue-800 mb-1">✓ Approved — Student Account Created</p>
                {selected.roll_number && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-600">Roll Number:</span>
                    <span className="font-extrabold text-lg" style={{ color:'#0B73B7' }}>{selected.roll_number}</span>
                    <button onClick={() => { navigator.clipboard.writeText(selected.roll_number); toast.success('Copied!') }}
                      className="text-xs text-blue-600 hover:underline ml-1">Copy</button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Share the Roll Number with the student. They can set their password at <strong>/signup</strong> using their CNIC.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}
