import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../store/slices/coursesSlice'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'

const COUNTRIES = ['Pakistan', 'Saudi Arabia', 'UAE', 'UK', 'USA', 'Canada', 'Australia', 'Other']
const GENDERS   = ['Male', 'Female']
const CLASS_PREFS = ['Morning', 'Evening', 'Weekend']
const PROFICIENCY = ['Beginner', 'Intermediate', 'Advanced']
const QUALIFICATIONS = ['Matric', 'Intermediate', 'Bachelor', 'Master', 'Other']
const HEARD_FROM = ['Facebook', 'Instagram', 'YouTube', 'Friend/Family', 'Google', 'Banner/Poster', 'Other']

const CITIES_BY_COUNTRY = {
  Pakistan: ['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Multan','Faisalabad','Hyderabad','Sukkur'],
  'Saudi Arabia': ['Riyadh','Jeddah','Mecca','Medina'],
  UAE: ['Dubai','Abu Dhabi','Sharjah'],
  UK: ['London','Manchester','Birmingham'],
  USA: ['New York','Los Angeles','Chicago'],
  Canada: ['Toronto','Vancouver','Montreal'],
  Australia: ['Sydney','Melbourne','Brisbane'],
  Other: ['Other'],
}

const CAMPUSES_BY_CITY = {
  Karachi:    ['Aliabad Female Campus','Gulshan Campus','Korangi Campus','Malir Campus','North Karachi Campus'],
  Lahore:     ['Johar Town Campus','Gulberg Campus'],
  Islamabad:  ['F-10 Campus','G-11 Campus'],
  Rawalpindi: ['Saddar Campus'],
  Peshawar:   ['Hayatabad Campus'],
  default:    ['Main Campus'],
}

const STEP_LABELS = ['Location & Course', 'Personal Info', 'Education & Details', 'Terms & Submit']

const EMPTY = {
  country:'', classPref:'', gender:'', city:'', courseId:'', campus:'',
  fullName:'', fatherName:'', dob:'', email:'', phone:'', fatherPhone:'',
  idNumber:'', fatherIdNumber:'', address:'',
  proficiency:'', qualification:'', heardFrom:'', hasLaptop:'',
  picture: null, agreed: false,
}

export default function RegistrationForm({ onClose, preSelectedCourse }) {
  const dispatch = useDispatch()
  const { list: courses } = useSelector(s => s.courses)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ ...EMPTY, courseId: preSelectedCourse?.id || '' })
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { if (!courses.length) dispatch(fetchCourses()) }, [dispatch])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const cities    = CITIES_BY_COUNTRY[form.country] || []
  const campuses  = CAMPUSES_BY_CITY[form.city] || CAMPUSES_BY_CITY.default
  const openCourses = courses.filter(c => c.status === 'open')

  const handlePicture = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 1024 * 1024) { toast.error('File must be less than 1MB'); return }
    set('picture', file)
    setPreview(URL.createObjectURL(file))
  }

  // Step validation
  const canNext = () => {
    if (step === 0) return form.country && form.classPref && form.gender && form.city && form.courseId
    if (step === 1) return form.fullName && form.fatherName && form.dob && form.email && form.phone && form.fatherPhone && form.idNumber && form.fatherIdNumber && form.address
    if (step === 2) return form.proficiency && form.qualification && form.heardFrom && form.hasLaptop !== ''
    return form.agreed
  }

  const handleSubmit = async () => {
    if (!form.agreed) { toast.error('Please accept terms & conditions'); return }
    setSubmitting(true)

    let pictureUrl = null
    if (form.picture) {
      const fname = `${Date.now()}-${form.picture.name}`
      const { error: upErr } = await supabase.storage.from('registrations').upload(fname, form.picture)
      if (!upErr) {
        const { data } = supabase.storage.from('registrations').getPublicUrl(fname)
        pictureUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('registrations').insert([{
      country: form.country, class_preference: form.classPref, gender: form.gender,
      city: form.city, course_id: form.courseId, campus: form.campus,
      full_name: form.fullName, father_name: form.fatherName, dob: form.dob,
      email: form.email, phone: form.phone, father_phone: form.fatherPhone,
      id_number: form.idNumber, father_id_number: form.fatherIdNumber,
      address: form.address, proficiency: form.proficiency,
      qualification: form.qualification, heard_from: form.heardFrom,
      has_laptop: form.hasLaptop === 'yes', picture_url: pictureUrl,
      status: 'pending',
    }])

    setSubmitting(false)
    if (error) { toast.error('Submission failed: ' + error.message); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background:'#e8f4fc' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-400 text-sm mb-6">Your registration has been received. We'll contact you soon.</p>
        <button onClick={onClose} style={{ background:B }}
          className="text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
          Done
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${B},#0d85d4)` }} className="px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-extrabold text-lg">SMIT Registration Form</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={i <= step ? { background:'#fff', color:B } : { background:'rgba(255,255,255,.25)', color:'rgba(255,255,255,.7)' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-white/70 text-xs mt-1 hidden sm:block whitespace-nowrap">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="flex-1 h-0.5 mb-4" style={{ background: i < step ? '#fff' : 'rgba(255,255,255,.25)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 0: Location & Course ── */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location & Course Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Select Country *">
                  <Select value={form.country} onChange={v => { set('country',''); set('city',''); set('campus',''); set('country',v) }}
                    options={COUNTRIES} placeholder="Select country" />
                </Field>
                <Field label="Class Preference *">
                  <Select value={form.classPref} onChange={v => set('classPref',v)} options={CLASS_PREFS} placeholder="Select class preference" />
                </Field>
                <Field label="Gender *">
                  <Select value={form.gender} onChange={v => set('gender',v)} options={GENDERS} placeholder="Select gender" />
                </Field>
                <Field label="City *">
                  <Select value={form.city} onChange={v => { set('city',v); set('campus','') }}
                    options={cities} placeholder={form.country ? 'Select city' : 'Select country first'} disabled={!form.country} />
                </Field>
                <Field label="Course *">
                  <Select value={form.courseId} onChange={v => set('courseId',v)}
                    options={openCourses.map(c => ({ label:c.name, value:c.id }))}
                    placeholder={openCourses.length ? 'Select course' : 'No course available'} />
                </Field>
                <Field label="Campus">
                  <Select value={form.campus} onChange={v => set('campus',v)}
                    options={campuses} placeholder={form.city ? 'Select campus' : 'Select course first'} disabled={!form.city} />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *"><Input value={form.fullName} onChange={v=>set('fullName',v)} placeholder="Full Name" /></Field>
                <Field label="Father Name *"><Input value={form.fatherName} onChange={v=>set('fatherName',v)} placeholder="Father Name" /></Field>
                <Field label="Date of Birth *"><Input type="date" value={form.dob} onChange={v=>set('dob',v)} /></Field>
                <Field label="Email *"><Input type="email" value={form.email} onChange={v=>set('email',v)} placeholder="email@example.com" /></Field>
                <Field label="Phone *"><Input value={form.phone} onChange={v=>set('phone',v)} placeholder="03XX-XXXXXXX" /></Field>
                <Field label="Father's Phone *"><Input value={form.fatherPhone} onChange={v=>set('fatherPhone',v)} placeholder="03XX-XXXXXXX" /></Field>
                <Field label="ID Number (CNIC) *"><Input value={form.idNumber} onChange={v=>set('idNumber',v)} placeholder="XXXXX-XXXXXXX-X" /></Field>
                <Field label="Father's ID Number *"><Input value={form.fatherIdNumber} onChange={v=>set('fatherIdNumber',v)} placeholder="XXXXX-XXXXXXX-X" /></Field>
              </div>
              <Field label={`Address * (${form.address.length}/220 characters)`}>
                <textarea rows={3} maxLength={220}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
                  value={form.address} onChange={e=>set('address',e.target.value)}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}
                  placeholder="Full address" />
              </Field>
            </div>
          )}

          {/* ── STEP 2: Education & Details ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Education & Technical Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Computer Proficiency *">
                  <Select value={form.proficiency} onChange={v=>set('proficiency',v)} options={PROFICIENCY} placeholder="Select your computer proficiency" />
                </Field>
                <Field label="Last Qualification *">
                  <Select value={form.qualification} onChange={v=>set('qualification',v)} options={QUALIFICATIONS} placeholder="Last qualification" />
                </Field>
                <Field label="Where did you hear about us? *">
                  <Select value={form.heardFrom} onChange={v=>set('heardFrom',v)} options={HEARD_FROM} placeholder="Where did you hear about us?" />
                </Field>
                <Field label="Do you have a Laptop? *">
                  <div className="flex gap-3 mt-1">
                    {['yes','no'].map(opt => (
                      <button key={opt} type="button" onClick={() => set('hasLaptop', opt)}
                        className="flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all"
                        style={form.hasLaptop===opt ? { background:B, color:'#fff', borderColor:B } : { borderColor:'#e5e7eb', color:'#6b7280' }}>
                        {opt === 'yes' ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Picture upload */}
              <Field label="Upload Picture">
                <div className="flex items-start gap-4 mt-1">
                  <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-blue-400"
                    style={{ borderColor: preview ? B : '#d1d5db' }}>
                    {preview
                      ? <img src={preview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                      : <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                          </svg>
                          <span className="text-xs text-gray-400 mt-1">Upload Picture</span>
                        </>
                    }
                    <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePicture} />
                  </label>
                  <ul className="text-xs text-gray-400 space-y-1 mt-1">
                    <li>• White or blue background</li>
                    <li>• Less than 1MB</li>
                    <li>• jpg, jpeg, png only</li>
                    <li>• Recent passport size</li>
                    <li>• Face clearly visible</li>
                    <li>• No glasses</li>
                  </ul>
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 3: Terms ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Terms & Conditions</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 leading-relaxed space-y-3 max-h-64 overflow-y-auto border border-gray-100">
                <p>I hereby solemnly declare that all information provided in this application is true and accurate to the best of my knowledge. Furthermore, I agree to abide by all current and future rules, regulations, and policies established by SMIT.</p>
                <p>I accept the responsibility to maintain good conduct throughout the program and commit to focusing solely on learning. I will not engage in any political, unethical, or unrelated activities during my enrollment. Any violation may result in immediate cancellation of my admission.</p>
                <p>Upon completion of the course, I agree to successfully complete any project assigned by SMIT as part of the program requirements.</p>
                <p>Female students are required to wear an abaya or hijab while attending classes.</p>
                <p>By submitting this form, you agree to our <span style={{ color:B }} className="font-semibold">Privacy Policy</span> and <span style={{ color:B }} className="font-semibold">Terms of Service</span>.</p>
                <div className="border-t border-gray-200 pt-3">
                  <p className="font-semibold text-gray-700">Important Notice:</p>
                  <p>Please ensure all information provided is accurate. Incomplete or false information may result in rejection of your application.</p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div onClick={() => set('agreed', !form.agreed)}
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={form.agreed ? { background:B, borderColor:B } : { borderColor:'#d1d5db' }}>
                  {form.agreed && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I have read and agree to the terms and conditions stated above.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <button onClick={() => step > 0 ? setStep(s=>s-1) : onClose()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{step+1} / {STEP_LABELS.length}</span>
            {step < STEP_LABELS.length - 1 ? (
              <button onClick={() => setStep(s=>s+1)} disabled={!canNext()}
                style={{ background: canNext() ? B : '#d1d5db' }}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:cursor-not-allowed">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.agreed}
                style={{ background: form.agreed ? B : '#d1d5db' }}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── tiny helpers ──
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type='text' }) {
  const B = '#0B73B7'
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
      onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
  )
}

function Select({ value, onChange, options, placeholder, disabled }) {
  const B = '#0B73B7'
  const opts = options.map(o => typeof o === 'string' ? { label:o, value:o } : o)
  return (
    <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all bg-white appearance-none"
      style={{ color: value ? '#111827' : '#9ca3af' }}
      onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}>
      <option value="" disabled>{placeholder}</option>
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
