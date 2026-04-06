import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { fetchCourses } from '../store/slices/coursesSlice'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import smitLogo from '../assets/smit logo.png'

const B = '#0B73B7'

const COUNTRIES     = ['Pakistan','Saudi Arabia','UAE','UK','USA','Canada','Australia','Other']
const GENDERS       = ['Male','Female']
const CLASS_PREFS   = ['Morning','Evening','Weekend']
const PROFICIENCY   = ['Beginner','Intermediate','Advanced']
const QUALIFICATIONS= ['Matric','Intermediate','Bachelor','Master','Other']
const HEARD_FROM    = ['Facebook','Instagram','YouTube','Friend/Family','Google','Banner/Poster','Other']

const CITIES = {
  Pakistan:['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Multan','Faisalabad','Hyderabad','Sukkur'],
  'Saudi Arabia':['Riyadh','Jeddah','Mecca','Medina'],
  UAE:['Dubai','Abu Dhabi','Sharjah'],UK:['London','Manchester','Birmingham'],
  USA:['New York','Los Angeles','Chicago'],Canada:['Toronto','Vancouver','Montreal'],
  Australia:['Sydney','Melbourne','Brisbane'],Other:['Other'],
}
const CAMPUSES = {
  Karachi:['Aliabad Female Campus','Gulshan Campus','Korangi Campus','Malir Campus','North Karachi Campus'],
  Lahore:['Johar Town Campus','Gulberg Campus'],Islamabad:['F-10 Campus','G-11 Campus'],
  Rawalpindi:['Saddar Campus'],Peshawar:['Hayatabad Campus'],default:['Main Campus'],
}

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { list: courses } = useSelector(s => s.courses)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [preview, setPreview] = useState(null)

  const [f, setF] = useState({
    country:'', classPref:'', gender:'', city:'', courseId: params.get('course')||'', campus:'',
    fullName:'', fatherName:'', dob:'', email:'', phone:'', fatherPhone:'',
    idNumber:'', fatherIdNumber:'', address:'',
    proficiency:'', qualification:'', heardFrom:'', hasLaptop:'',
    picture:null, agreed:false,
  })

  useEffect(() => { if (!courses.length) dispatch(fetchCourses()) }, [dispatch])

  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))
  const cities    = CITIES[f.country] || []
  const campuses  = CAMPUSES[f.city]  || CAMPUSES.default
  const openCourses = courses.filter(c => c.status === 'open')

  const handlePic = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 1024*1024) { toast.error('File must be less than 1MB'); return }
    upd('picture', file); setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!f.agreed) { toast.error('Please accept terms & conditions'); return }
    setSubmitting(true)
    let pictureUrl = null
    if (f.picture) {
      const fname = `${Date.now()}-${f.picture.name}`
      const { error: upErr } = await supabase.storage.from('registrations').upload(fname, f.picture)
      if (!upErr) {
        const { data } = supabase.storage.from('registrations').getPublicUrl(fname)
        pictureUrl = data.publicUrl
      }
    }
    const { error } = await supabase.from('registrations').insert([{
      country:f.country, class_preference:f.classPref, gender:f.gender,
      city:f.city, course_id:f.courseId||null, campus:f.campus,
      full_name:f.fullName, father_name:f.fatherName, dob:f.dob,
      email:f.email, phone:f.phone, father_phone:f.fatherPhone,
      id_number:f.idNumber, father_id_number:f.fatherIdNumber, address:f.address,
      proficiency:f.proficiency, qualification:f.qualification,
      heard_from:f.heardFrom, has_laptop:f.hasLaptop==='yes',
      picture_url:pictureUrl, status:'pending',
    }])
    setSubmitting(false)
    if (error) { toast.error('Submission failed: '+error.message); return }
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background:'#e8f4fc' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Your registration has been received.<br/>Admin will review and approve your application.<br/>
          You'll receive your Roll Number after approval.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" style={{ background:B }} className="text-white font-bold px-6 py-3 rounded-full text-sm hover:opacity-90">Back to Home</Link>
          <Link to="/courses" style={{ border:`2px solid ${B}`,color:B }} className="font-bold px-6 py-3 rounded-full text-sm bg-white hover:bg-blue-50">View Courses</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background:'linear-gradient(150deg,#eef6fd 0%,#e4f1fb 40%,#f4faff 100%)' }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><img src={smitLogo} alt="SMIT" className="h-9 object-contain" /></Link>
          <h1 className="text-sm font-bold text-gray-700">SMIT Registration Form</h1>
          <Link to="/courses" className="text-xs text-gray-400 hover:text-gray-600">← Back</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Section 1: Location & Course ── */}
        <Section title="Location & Course Details" icon="📍">
          <Grid>
            <F label="Select Country *"><Sel value={f.country} onChange={v=>{upd('country',v);upd('city','');upd('campus','')}} opts={COUNTRIES} ph="Select country"/></F>
            <F label="Class Preference *"><Sel value={f.classPref} onChange={v=>upd('classPref',v)} opts={CLASS_PREFS} ph="Select class preference"/></F>
            <F label="Gender *"><Sel value={f.gender} onChange={v=>upd('gender',v)} opts={GENDERS} ph="Select gender"/></F>
            <F label="City *"><Sel value={f.city} onChange={v=>{upd('city',v);upd('campus','')}} opts={cities} ph={f.country?'Select city':'Select country first'} disabled={!f.country}/></F>
            <F label="Course *"><Sel value={f.courseId} onChange={v=>upd('courseId',v)} opts={openCourses.map(c=>({label:c.name,value:c.id}))} ph={openCourses.length?'Select course':'No course available'}/></F>
            <F label="Campus"><Sel value={f.campus} onChange={v=>upd('campus',v)} opts={campuses} ph={f.city?'Select campus':'Select city first'} disabled={!f.city}/></F>
          </Grid>
        </Section>

        {/* ── Section 2: Personal Info ── */}
        <Section title="Personal Information" icon="👤">
          <Grid>
            <F label="Full Name *"><Inp value={f.fullName} onChange={v=>upd('fullName',v)} ph="Full Name"/></F>
            <F label="Father Name *"><Inp value={f.fatherName} onChange={v=>upd('fatherName',v)} ph="Father Name"/></F>
            <F label="Date of Birth *"><Inp type="date" value={f.dob} onChange={v=>upd('dob',v)}/></F>
            <F label="Email *"><Inp type="email" value={f.email} onChange={v=>upd('email',v)} ph="email@example.com"/></F>
            <F label="Phone *"><Inp value={f.phone} onChange={v=>upd('phone',v)} ph="03XX-XXXXXXX"/></F>
            <F label="Father's Phone *"><Inp value={f.fatherPhone} onChange={v=>upd('fatherPhone',v)} ph="03XX-XXXXXXX"/></F>
            <F label="CNIC *"><Inp value={f.idNumber} onChange={v=>upd('idNumber',v)} ph="XXXXX-XXXXXXX-X"/></F>
            <F label="Father's CNIC *"><Inp value={f.fatherIdNumber} onChange={v=>upd('fatherIdNumber',v)} ph="XXXXX-XXXXXXX-X"/></F>
          </Grid>
          <F label={`Address * (${f.address.length}/220)`}>
            <textarea rows={3} maxLength={220} placeholder="Full residential address"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              value={f.address} onChange={e=>upd('address',e.target.value)}
              onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          </F>
        </Section>

        {/* ── Section 3: Education ── */}
        <Section title="Education & Technical Details" icon="🎓">
          <Grid>
            <F label="Computer Proficiency *"><Sel value={f.proficiency} onChange={v=>upd('proficiency',v)} opts={PROFICIENCY} ph="Select proficiency"/></F>
            <F label="Last Qualification *"><Sel value={f.qualification} onChange={v=>upd('qualification',v)} opts={QUALIFICATIONS} ph="Last qualification"/></F>
            <F label="Where did you hear about us? *"><Sel value={f.heardFrom} onChange={v=>upd('heardFrom',v)} opts={HEARD_FROM} ph="Select source"/></F>
            <F label="Do you have a Laptop? *">
              <div className="flex gap-3 mt-1">
                {['yes','no'].map(opt=>(
                  <button key={opt} type="button" onClick={()=>upd('hasLaptop',opt)}
                    className="flex-1 py-3 rounded-xl border-2 text-sm font-bold capitalize transition-all"
                    style={f.hasLaptop===opt?{background:B,color:'#fff',borderColor:B}:{borderColor:'#e5e7eb',color:'#6b7280'}}>
                    {opt==='yes'?'Yes':'No'}
                  </button>
                ))}
              </div>
            </F>
          </Grid>

          {/* Picture upload */}
          <F label="Upload Picture">
            <div className="flex items-start gap-6 mt-1">
              <label className="relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-blue-400 overflow-hidden flex-shrink-0"
                style={{ borderColor:preview?B:'#d1d5db' }}>
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-cover"/>
                  : <div className="flex flex-col items-center gap-1 text-gray-400">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                      <span className="text-xs font-medium">Upload Picture</span>
                    </div>
                }
                <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePic}/>
              </label>
              <ul className="text-xs text-gray-400 space-y-1.5 pt-1">
                <li className="font-semibold text-gray-500 text-sm">Requirements:</li>
                {['White or blue background','Less than 1MB','jpg, jpeg, png only','Recent passport size','Face clearly visible, no glasses'].map(r=>(
                  <li key={r} className="flex items-start gap-1.5"><span style={{color:B}}>•</span>{r}</li>
                ))}
              </ul>
            </div>
          </F>
        </Section>

        {/* ── Section 4: Terms ── */}
        <Section title="Terms & Conditions" icon="📋">
          <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600 leading-relaxed space-y-3 border border-gray-100 max-h-56 overflow-y-auto mb-4">
            <p>I hereby solemnly declare that all information provided in this application is true and accurate. I agree to abide by all rules, regulations, and policies established by SMIT.</p>
            <p>I accept responsibility to maintain good conduct and commit to focusing solely on learning. Any violation may result in immediate cancellation of my admission.</p>
            <p>Upon completion, I agree to complete any project assigned by SMIT. Female students are required to wear an abaya or hijab while attending classes.</p>
            <p>By submitting, you agree to our <span style={{color:B}} className="font-semibold">Privacy Policy</span> and <span style={{color:B}} className="font-semibold">Terms of Service</span>.</p>
            <div className="border-t border-gray-200 pt-3">
              <p className="font-bold text-gray-700">Important:</p>
              <p>Incomplete or false information may result in rejection of your application.</p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border-2 transition-all"
            style={{ borderColor:f.agreed?B:'#e5e7eb', background:f.agreed?'#e8f4fc':'#fff' }}
            onClick={()=>upd('agreed',!f.agreed)}>
            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
              style={f.agreed?{background:B,borderColor:B}:{borderColor:'#d1d5db'}}>
              {f.agreed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
            </div>
            <span className="text-sm text-gray-700 font-medium leading-relaxed">
              I have read and agree to the terms and conditions stated above.
            </span>
          </label>
        </Section>

        {/* Submit */}
        <div className="flex items-center justify-between pb-8">
          <button type="button" onClick={()=>navigate(-1)}
            className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            ← Cancel
          </button>
          <button type="submit" disabled={submitting || !f.agreed}
            style={{ background:f.agreed?B:'#d1d5db' }}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:cursor-not-allowed hover:opacity-90">
            {submitting ? 'Submitting...' : 'Submit Registration'}
            {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── helpers ──
function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2" style={{ background:'linear-gradient(135deg,#f8fbff,#fff)' }}>
        <span className="text-lg">{icon}</span>
        <h2 className="font-extrabold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  )
}
function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}
function F({ label, children }) {
  return <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>{children}</div>
}
function Inp({ value, onChange, ph, type='text' }) {
  return (
    <input type={type} value={value} placeholder={ph} onChange={e=>onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white"
      onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
  )
}
function Sel({ value, onChange, opts, ph, disabled }) {
  const options = opts.map(o=>typeof o==='string'?{label:o,value:o}:o)
  return (
    <select value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white appearance-none cursor-pointer"
      style={{ color:value?'#111827':'#9ca3af' }}
      onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}>
      <option value="" disabled>{ph}</option>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
