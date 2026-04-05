import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { signupStudent } from '../store/slices/authSlice'

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [form, setForm] = useState({ cnic: '', rollNumber: '', password: '', confirm: '' })
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setLocalError('Passwords do not match'); return }
    setLocalError('')
    const result = await dispatch(signupStudent({ cnic: form.cnic, rollNumber: form.rollNumber, password: form.password }))
    if (!result.error) navigate('/student/leaves')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">S</div>
          <h1 className="text-2xl font-bold text-gray-800">Student Signup</h1>
          <p className="text-gray-500 text-sm mt-1">Only admin-registered students can sign up</p>
        </div>
        {(error || localError) && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error || localError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
            <input required placeholder="XXXXX-XXXXXXX-X" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.cnic} onChange={e => setForm(f => ({ ...f, cnic: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
            <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input required type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-60">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-green-700 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
