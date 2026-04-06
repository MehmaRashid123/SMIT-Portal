import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setStudentPassword } from '../store/slices/authSlice'
import StudentCard from '../components/StudentCard'
import { supabase } from '../lib/supabaseClient'

const B = '#0B73B7'

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [form, setForm]       = useState({ cnic:'', password:'', confirm:'' })
  const [localError, setLocalError] = useState('')
  const [cardData, setCardData]     = useState(null) // { student, course, enrollment, pictureUrl }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setLocalError('Passwords do not match'); return }
    setLocalError('')
    const result = await dispatch(setStudentPassword({ cnic: form.cnic, newPassword: form.password }))
    if (result.error) return

    const student = result.payload

    // Fetch registration picture + course info
    const { data: reg } = await supabase
      .from('registrations')
      .select('picture_url, course_id, campus, city, courses(name, category, duration)')
      .eq('id_number', student.cnic)
      .eq('status', 'approved')
      .single()

    setCardData({
      student: { ...student, picture_url: reg?.picture_url || null },
      course:  reg?.courses || null,
      enrollment: { campus: reg?.campus, city: reg?.city },
    })
  }

  // ── Success: show ID card ──
  if (cardData) return (
    <div className="min-h-screen py-10 px-4"
      style={{ background:'linear-gradient(150deg,#eef6fd 0%,#e4f1fb 50%,#f4faff 100%)' }}>
      <div className="max-w-xl mx-auto">

        {/* Success banner */}
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'#e8faf4' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="font-extrabold text-gray-900">Account Created Successfully!</p>
            <p className="text-sm text-gray-400">Welcome, {cardData.student.name} · Roll: <strong style={{ color:B }}>{cardData.student.roll_number}</strong></p>
          </div>
        </div>

        {/* ID Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="font-bold text-gray-800 mb-1">Your Student ID Card</p>
          <p className="text-xs text-gray-400 mb-5">Download and keep this card — use the QR code for attendance</p>
          <div className="flex justify-center">
            <StudentCard
              student={cardData.student}
              course={cardData.course}
              enrollment={cardData.enrollment}
            />
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6 text-xs text-blue-700 space-y-1.5">
          <p className="font-bold text-blue-800 text-sm mb-2">📌 Important</p>
          <p>• Your Roll Number: <strong>{cardData.student.roll_number}</strong></p>
          <p>• Download your ID card now — it's also available in your student portal</p>
          <p>• Show the QR code to your teacher for attendance marking</p>
          <p>• Login with your CNIC and the password you just set</p>
        </div>

        <button onClick={() => navigate('/login?role=student')}
          style={{ background:B }}
          className="w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          Go to Student Portal →
        </button>
      </div>
    </div>
  )

  // ── Signup form ──
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background:'linear-gradient(150deg,#eef6fd 0%,#e4f1fb 50%,#f4faff 100%)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
        style={{ boxShadow:`0 24px 60px ${B}18` }}>
        <div style={{ height:4, background:`linear-gradient(90deg,${B},#0d85d4)`, borderRadius:'4px 4px 0 0', margin:'-32px -32px 28px' }} />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:'#e8f4fc', color:B }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Set Your Password</h1>
            <p className="text-sm text-gray-400">Only approved students can register</p>
          </div>
        </div>

        {(error || localError) && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['CNIC *','text','cnic','XXXXX-XXXXXXX-X'],
            ['New Password *','password','password',''],
            ['Confirm Password *','password','confirm',''],
          ].map(([label,type,key,ph]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
              <input required type={type} placeholder={ph}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ background:`linear-gradient(135deg,${B},#0d85d4)` }}
            className="w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 hover:-translate-y-0.5 transition-all">
            {loading ? 'Creating account...' : 'Create Account & Get ID Card'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already registered?{' '}
          <Link to="/login?role=student" className="font-semibold hover:underline" style={{ color:B }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
