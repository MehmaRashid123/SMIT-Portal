import { useState } from 'react'
import { useSelector } from 'react-redux'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function AdminSettings() {
  const { user } = useSelector(s => s.auth)
  const [resetForm, setResetForm] = useState({ oldPassword:'', newPassword:'' })
  const [newAdmin,  setNewAdmin]  = useState({ name:'', username:'', password:'' })
  const [saving,    setSaving]    = useState(false)
  const [adding,    setAdding]    = useState(false)

  const handleReset = async (e) => {
    e.preventDefault(); setSaving(true)
    const { data, error } = await supabase.from('admins').select('*').eq('id', user.id).eq('password', resetForm.oldPassword).single()
    if (error || !data) { toast.error('Old password incorrect'); setSaving(false); return }
    const { error: upErr } = await supabase.from('admins').update({ password: resetForm.newPassword }).eq('id', user.id)
    setSaving(false)
    if (upErr) { toast.error('Failed'); return }
    toast.success('Password updated!')
    setResetForm({ oldPassword:'', newPassword:'' })
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault(); setAdding(true)
    const { error } = await supabase.from('admins').insert([newAdmin])
    setAdding(false)
    if (error) { toast.error('Failed: ' + error.message); return }
    toast.success('Admin added!')
    setNewAdmin({ name:'', username:'', password:'' })
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin Settings</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5 text-lg">Reset Password</h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Old Password</label>
              <input required type="password" className={inp} value={resetForm.oldPassword}
                onChange={e=>setResetForm(f=>({...f,oldPassword:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
              <input required type="password" className={inp} value={resetForm.newPassword}
                onChange={e=>setResetForm(f=>({...f,newPassword:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div>
            <button type="submit" disabled={saving} style={{ background:B }}
              className="text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5 text-lg">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            {[['Name','text',newAdmin.name,'name'],['Username','text',newAdmin.username,'username'],['Password','password',newAdmin.password,'password']].map(([label,type,val,key])=>(
              <div key={key}><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input required type={type} className={inp} value={val}
                  onChange={e=>setNewAdmin(f=>({...f,[key]:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/></div>
            ))}
            <button type="submit" disabled={adding} style={{ background:B }}
              className="text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
              {adding ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}