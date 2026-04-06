import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ name:'', username:'', password:'' })
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { fetchTeachers() }, [])

  const fetchTeachers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false })
    setLoading(false)
    if (!error) setTeachers(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from('teachers').insert([form])
    setSaving(false)
    if (error) { toast.error('Failed: ' + error.message); return }
    toast.success('Teacher added!')
    setModal(false); setForm({ name:'', username:'', password:'' })
    fetchTeachers()
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Teacher Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{teachers.length} teachers total</p>
          </div>
          <button onClick={() => setModal(true)} style={{ background:B }}
            className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Teacher
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['#','Name','Username','Joined','Actions'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No teachers yet.</td></tr>
              ) : teachers.map((t,i) => (
                <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:'#0e9f6e' }}>
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.username}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Add New Teacher" onClose={() => setModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            {[['Full Name','text','name','Full Name'],['Username','text','username','Username'],['Password','password','password','Password']].map(([label,type,key,ph])=>(
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input required type={type} placeholder={ph} className={inp} value={form[key]}
                  onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
            ))}
            <button type="submit" disabled={saving} style={{ background:B }}
              className="w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Teacher'}
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}
