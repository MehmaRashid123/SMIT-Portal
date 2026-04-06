import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import smitLogo from '../assets/smit logo.png'

const B  = '#0B73B7'
const BG = 'linear-gradient(135deg,#0B73B7,#0a9e6e)'

export default function CourseEnroll() {
  const navigate = useNavigate()

  const [phase, setPhase]       = useState('verify')
  const [cnic,  setCnic]        = useState('')
  const [student, setStudent]   = useState(null)
  const [courses,  setCourses]  = useState([])
  const [teachers, setTeachers] = useState([])
  const [slots,    setSlots]    = useState([])
  const [verifying, setVerifying] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const [selectedCourse,  setSelectedCourse]  = useState('')
  const [selectedSlot,    setSelectedSlot]    = useState('')

  const filteredTeachers = teachers.filter(t => t.course_id === selectedCourse)
  const filteredSlots = slots.filter(s => {
    const teacher = filteredTeachers.find(t => t.id === s.teacher_id)
    return teacher && s.course_id === selectedCourse
  })

  useEffect(() => {
    if (phase !== 'select') return
    Promise.all([
      supabase.from('courses').select('id, name, category, duration').eq('status', 'open'),
      supabase.from('teachers').select('id, name, campus, course_id, courses(name)').not('course_id', 'is', null),
      supabase.from('slots').select('*, teachers(name)'),
    ]).then(([{ data: c }, { data: t }, { data: s }]) => {
      setCourses(c || [])
      setTeachers(t || [])
      setSlots(s || [])
    })
  }, [phase])

  const verifyCnic = async (e) => {
    e.preventDefault()
    setVerifying(true)

    // 1. Check entry test result first
    const { data: testResult } = await supabase
      .from('entry_test_results')
      .select('status')
      .eq('cnic', cnic.trim())
      .maybeSingle()

    if (!testResult) {
      toast.error('No entry test result found. Please take the entry test first.')
      setVerifying(false); return
    }
    if (testResult.status !== 'pass') {
      toast.error('You must pass the entry test before enrolling.')
      setVerifying(false); return
    }

    // 2. Get student record
    const { data: studentData } = await supabase
      .from('students').select('*').eq('cnic', cnic.trim()).maybeSingle()

    if (!studentData) {
      toast.error('Student record not found. Please contact admin.')
      setVerifying(false); return
    }

    // 3. Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments').select('id').eq('student_id', studentData.id).maybeSingle()

    if (existing) {
      toast.error('You are already enrolled. Please login to your student portal.')
      setVerifying(false); return
    }

    setStudent(studentData)
    setVerifying(false)
    setPhase('select')
  }

  const handleEnroll = async (e) => {
    e.preventDefault()
    if (!selectedCourse) { toast.error('Please select a course'); return }
    if (!selectedSlot)   { toast.error('Please select a time slot'); return }

    const slot    = slots.find(s => s.id === selectedSlot)
    const teacher = teachers.find(t => t.id === slot?.teacher_id)

    // Check seat availability
    const { count } = await supabase
      .from('enrollments').select('id', { count:'exact', head:true })
      .eq('slot_id', selectedSlot)

    if (count >= slot.total_seats) {
      toast.error('This slot is full. Please select another slot.')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('enrollments').insert([{
      student_id: student.id,
      course_id:  selectedCourse,
      teacher_id: slot?.teacher_id || null,
      slot_id:    selectedSlot,
      slot:       slot?.timing || null,
      batch:      `Batch ${new Date().getFullYear()}`,
      campus:     slot?.campus || teacher?.campus || null,
    }])
    setSaving(false)
    if (error) { toast.error('Enrollment failed: ' + error.message); return }
    setPhase('done')
  }

  // ── VERIFY ──
  if (phase === 'verify') return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div style={{ height:4, background:BG, borderRadius:'4px 4px 0 0', margin:'-32px -32px 28px' }}/>
        <div className="flex items-center gap-3 mb-6">
          <img src={smitLogo} alt="SMIT" className="h-10 object-contain"/>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Course Enrollment</h1>
            <p className="text-xs text-gray-400">Enter your CNIC to continue</p>
          </div>
        </div>
        <form onSubmit={verifyCnic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CNIC *</label>
            <input required placeholder="XXXXX-XXXXXXX-X" value={cnic} onChange={e=>setCnic(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
              onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          </div>
          <button type="submit" disabled={verifying} style={{ background:BG }}
            className="w-full text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60">
            {verifying ? 'Verifying...' : 'Continue →'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          Already enrolled? <Link to="/login?role=student" style={{ color:B }} className="font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  )

  // ── SELECT COURSE + TEACHER ──
  if (phase === 'select') return (
    <div className="min-h-screen px-4 py-8"
      style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={smitLogo} alt="SMIT" className="h-9 object-contain"/>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Select Your Course & Teacher</h1>
            <p className="text-sm text-gray-400">Welcome, <strong>{student?.name}</strong> · Roll: <span style={{ color:B }}>{student?.roll_number}</span></p>
          </div>
        </div>

        <form onSubmit={handleEnroll} className="space-y-5">

          {/* Course selection */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background:B }}>1</span>
              Select Course
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map(c => (
                <button key={c.id} type="button" onClick={() => { setSelectedCourse(c.id); setSelectedTeacher('') }}
                  className="text-left p-4 rounded-xl border-2 transition-all"
                  style={selectedCourse === c.id
                    ? { borderColor:B, background:'#e8f4fc' }
                    : { borderColor:'#e5e7eb', background:'#fff' }}>
                  <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.category} · {c.duration || '—'}</p>
                  {selectedCourse === c.id && (
                    <span className="text-xs font-bold mt-1 inline-block" style={{ color:B }}>✓ Selected</span>
                  )}
                </button>
              ))}
              {courses.length === 0 && (
                <p className="text-sm text-gray-400 col-span-2 text-center py-4">No open courses available.</p>
              )}
            </div>
          </div>

          {/* Teacher/Slot selection */}
          {selectedCourse && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background:B }}>2</span>
                Select Time Slot
              </h2>
              {filteredSlots.length === 0 ? (
                <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-700 border border-yellow-100">
                  ⚠️ No slots available for this course yet. Please contact admin.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSlots.map(s => {
                    const teacher  = teachers.find(t => t.id === s.teacher_id)
                    const isFull   = (s.enrolled_count || 0) >= s.total_seats
                    const selected = selectedSlot === s.id
                    return (
                      <button key={s.id} type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlot(s.id)}
                        className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={selected
                          ? { borderColor:'#0e9f6e', background:'#e8faf4' }
                          : { borderColor:'#e5e7eb', background:'#fff' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background:'#0e9f6e' }}>
                          {(teacher?.name||'T').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{teacher?.name || '—'}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                            </svg>
                            {s.timing}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: isFull ? '#ef4444' : '#0e9f6e' }}>
                            {isFull ? 'Full' : `${s.total_seats - (s.enrolled_count||0)} seats available`} · {s.campus}
                          </p>
                        </div>
                        {selected && <span className="text-xs font-bold flex-shrink-0" style={{ color:'#0e9f6e' }}>✓</span>}
                        {isFull  && <span className="text-xs font-bold flex-shrink-0 text-red-400">Full</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {selectedCourse && selectedSlot && (
            <button type="submit" disabled={saving} style={{ background:BG }}
              className="w-full text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
              {saving ? 'Enrolling...' : '✓ Confirm Enrollment'}
            </button>
          )}
        </form>
      </div>
    </div>
  )

  // ── DONE ──
  if (phase === 'done') return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <div style={{ height:4, background:BG, borderRadius:'4px 4px 0 0', margin:'-40px -40px 32px' }}/>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background:'#e8faf4' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Enrollment Complete!</h2>
        <p className="text-gray-500 text-sm mb-6">
          You have been successfully enrolled. Login to access your student portal.
        </p>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-xs text-blue-700 text-left mb-6 space-y-1.5">
          <p className="font-bold text-blue-800 text-sm mb-2">📌 Next Steps</p>
          <p>• Login with your CNIC and password</p>
          <p>• View your course, assignments and quizzes</p>
          <p>• Show your ID card QR code to teacher for attendance</p>
        </div>
        <Link to="/login?role=student" style={{ background:BG }}
          className="block w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
          Go to Student Portal →
        </Link>
      </div>
    </div>
  )

  return null
}
