import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function AdminEntryTestResults() {
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchResults() }, [])

  const fetchResults = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('entry_test_results')
      .select('*')
      .order('attempted_at', { ascending: false })
    setLoading(false)
    if (error) { console.error('Fetch error:', error.message); return }
    setResults(data || [])
  }

  const overrideStatus = async (id, cnic, regId, status) => {
    setUpdating(id)
    await supabase.from('entry_test_results').update({ status, allow_retest: false }).eq('id', id)
    await supabase.from('registrations').update({ entry_test_status: status }).eq('id', regId)

    if (status === 'pass') {
      const { data: existing } = await supabase.from('students').select('id').eq('cnic', cnic).single()
      if (!existing) {
        const { data: reg } = await supabase.from('registrations').select('full_name,phone').eq('id', regId).single()
        const roll = `SMIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        await supabase.from('students').insert([{ name: reg?.full_name, cnic, roll_number: roll, phone: reg?.phone }])
        await supabase.from('registrations').update({ roll_number: roll }).eq('id', regId)
        toast.success(`Overridden to PASS. Roll: ${roll}`)
      } else {
        toast.success('Status updated to PASS')
      }
    } else {
      toast.success('Status updated to FAIL')
    }
    setResults(r => r.map(x => x.id === id ? { ...x, status, allow_retest: false } : x))
    setUpdating(null)
  }

  const allowRetest = async (id) => {
    setUpdating(id)
    await supabase.from('entry_test_results').update({ allow_retest: true }).eq('id', id)
    toast.success('Re-test allowed!')
    setResults(r => r.map(x => x.id === id ? { ...x, allow_retest: true } : x))
    setUpdating(null)
  }

  const filtered = filter === 'all' ? results : results.filter(r => r.status === filter)

  const STATUS = {
    pass:    'bg-green-100 text-green-700',
    fail:    'bg-red-100 text-red-500',
    pending: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Entry Test Results</h1>
            <p className="text-sm text-gray-400 mt-0.5">{results.length} total attempts</p>
          </div>
          <div className="flex gap-2">
            {['all','pass','fail','pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                style={filter===f ? {background:B,color:'#fff'} : {background:'#f3f4f6',color:'#6b7280'}}>
                {f} {f !== 'all' && `(${results.filter(r=>r.status===f).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label:'Total Attempts', val:results.length,                              color:B,        bg:'#e8f4fc' },
            { label:'Passed',         val:results.filter(r=>r.status==='pass').length, color:'#0e9f6e',bg:'#e8faf4' },
            { label:'Failed',         val:results.filter(r=>r.status==='fail').length, color:'#ef4444',bg:'#fff5f5' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name','CNIC','Score','%','Date','Status','Actions'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No results found.</td></tr>
              ) : filtered.map(r => {
                const pct = r.total > 0 ? Math.round(r.score/r.total*100) : 0
                return (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.cnic}</td>
                    <td className="px-4 py-3 text-gray-600">{r.score}/{r.total}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: pct>=70?'#0e9f6e':'#ef4444' }}>{pct}%</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {r.attempted_at ? new Date(r.attempted_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize w-fit ${STATUS[r.status]||'bg-gray-100 text-gray-500'}`}>
                          {r.status}
                        </span>
                        {r.allow_retest && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700 w-fit">
                            Retest Allowed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button disabled={updating===r.id || r.status==='pass'}
                          onClick={() => overrideStatus(r.id, r.cnic, r.registration_id, 'pass')}
                          className="text-xs px-2 py-1 rounded-lg font-semibold disabled:opacity-40"
                          style={{ background:'#dcfce7', color:'#166534' }}>
                          Pass
                        </button>
                        <button disabled={updating===r.id || r.status==='fail'}
                          onClick={() => overrideStatus(r.id, r.cnic, r.registration_id, 'fail')}
                          className="text-xs px-2 py-1 rounded-lg font-semibold disabled:opacity-40"
                          style={{ background:'#fee2e2', color:'#991b1b' }}>
                          Fail
                        </button>
                        {r.status === 'fail' && !r.allow_retest && (
                          <button disabled={updating===r.id}
                            onClick={() => allowRetest(r.id)}
                            className="text-xs px-2 py-1 rounded-lg font-semibold disabled:opacity-40"
                            style={{ background:'#f3e8ff', color:'#7c3aed' }}>
                            Allow Retest
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
