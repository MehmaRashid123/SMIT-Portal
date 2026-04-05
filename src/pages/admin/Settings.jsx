import { useState } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { user } = useSelector(s => s.auth)
  const [resetForm, setResetForm] = useState({ oldPassword: '', newPassword: '' })
  const [newAdmin, setNewAdmin] = useState({ name: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [addingSaving, setAddingSaving] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase.from('admins').select('*').eq('id', user.id).eq('password', resetForm.oldPassword).single()
    if (error || !data) { toast.error('Old password is incorrect'); setSaving(false); return }
    const { error: updateErr } = await supabase.from('admins').update({ password: resetForm.newPassword }).eq('id', user.id)
    setSaving(false)
    if (updateErr) { toast.error('Failed to update password'); return }
    toast.success('Password updated!')
    setResetForm({ oldPassword: '', newPassword: '' })
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setAddingSaving(true)
    const { error } = await supabase.from('admins').insert([newAdmin])
    setAddingSaving(false)
    if (error) { toast.error('Failed to add admin: ' + error.message); return }
    toast.success('Admin added!')
    setNewAdmin({ name: '', username: '', password: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>

        {/* Reset Password */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reset Password</h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
              <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={resetForm.oldPassword} onChange={e => setResetForm(f => ({ ...f, oldPassword: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={resetForm.newPassword} onChange={e => setResetForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Add New Admin */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={newAdmin.name} onChange={e => setNewAdmin(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={newAdmin.username} onChange={e => setNewAdmin(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={newAdmin.password} onChange={e => setNewAdmin(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={addingSaving} className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">
              {addingSaving ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
