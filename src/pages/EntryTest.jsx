import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import smitLogo from '../assets/smit logo.png'

const B  = '#0B73B7'
const BG = 'linear-gradient(135deg,#0B73B7 0%,#0a9e6e 100%)'
const PASS_PCT = 70
const TOTAL_Q  = 20
const TIME_SEC = 30 * 60 // 30 minutes

export default function EntryTest() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const cnic = params.get('cnic') || ''

  const [phase,     setPhase]     = useState('verify')   // verify | instructions | test | result
  const [verifying, setVerifying] = useState(false)
  const [regData,   setRegData]   = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers,   setAnswers]   = useState({})
  const [current,   setCurrent]   = useState(0)
  const [timeLeft,  setTimeLeft]  = useState(TIME_SEC)
  const [result,    setResult]    = useState(null)
  const [submitting,setSubmitting]= useState(false)
  const [cnicInput, setCnicInput] = useState(cnic)
  const timerRef = useRef(null)

  // Timer
  useEffect(() => {
    if (phase !== 'test') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const verifyCnic = async (e) => {
    e.preventDefault()
    setVerifying(true)
    const { data: reg, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id_number', cnicInput.trim())
      .single()

    if (error || !reg) {
      toast.error('No registration found with this CNIC. Please register first.')
      setVerifying(false); return
    }
    if (reg.status !== 'approved') {
      toast.error('Your registration is not approved yet. Please wait for admin approval.')
      setVerifying(false); return
    }
    // Check test date — student cannot take test before scheduled date
    if (reg.test_date) {
      const today    = new Date().toISOString().split('T')[0]
      const testDate = reg.test_date
      if (today < testDate) {
        toast.error(`Your entry test is scheduled for ${testDate}. You cannot take it before that date.`)
        setVerifying(false); return
      }
    }
    // Check if already attempted
    const { data: existing } = await supabase
      .from('entry_test_results')
      .select('*')
      .eq('cnic', cnicInput.trim())
      .single()

    if (existing && existing.status !== 'pending') {
      setResult(existing)
      setRegData(reg)
      setPhase('result')
      setVerifying(false); return
    }

    setRegData(reg)
    setVerifying(false)
    setPhase('instructions')
  }

  const startTest = async () => {
    const { data: qs, error } = await supabase
      .from('entry_test_questions')
      .select('*')
      .limit(TOTAL_Q)
    if (error || !qs?.length) { toast.error('Questions not available. Contact admin.'); return }
    // Shuffle
    const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, TOTAL_Q)
    setQuestions(shuffled)
    setPhase('test')
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)

    let score = 0
    questions.forEach(q => { if (answers[q.id] === q.correct_option) score++ })
    const pct    = Math.round(score / TOTAL_Q * 100)
    const status = pct >= PASS_PCT ? 'pass' : 'fail'

    const { data: res, error } = await supabase
      .from('entry_test_results')
      .upsert([{
        registration_id: regData.id,
        cnic:            regData.id_number,
        full_name:       regData.full_name,
        score,
        total:           TOTAL_Q,
        status,
        attempted_at:    new Date().toISOString(),
      }], { onConflict: 'cnic' })
      .select().single()

    // Update registration entry_test_status
    await supabase.from('registrations').update({ entry_test_status: status }).eq('id', regData.id)

    // If passed → create student record
    if (status === 'pass') {
      const { data: existing } = await supabase.from('students').select('id').eq('cnic', regData.id_number).single()
      if (!existing) {
        const roll = `SMIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        await supabase.from('students').insert([{
          name: regData.full_name, cnic: regData.id_number,
          roll_number: roll, phone: regData.phone,
        }])
        await supabase.from('registrations').update({ roll_number: roll }).eq('id', regData.id)
      }
    }

    setResult({ ...res, score, total: TOTAL_Q, status, pct })
    setSubmitting(false)
    setPhase('result')
  }

  // ── VERIFY PHASE ──
  if (phase === 'verify') return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div style={{ height:4, background:BG, borderRadius:'4px 4px 0 0', margin:'-32px -32px 28px' }}/>
        <div className="flex items-center gap-3 mb-6">
          <img src={smitLogo} alt="SMIT" className="h-10 object-contain"/>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Entry Test</h1>
            <p className="text-xs text-gray-400">Verify your CNIC to begin</p>
          </div>
        </div>
        <form onSubmit={verifyCnic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CNIC *</label>
            <input required placeholder="XXXXX-XXXXXXX-X" value={cnicInput}
              onChange={e=>setCnicInput(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
              onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          </div>
          <button type="submit" disabled={verifying}
            style={{ background:BG }}
            className="w-full text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
            {verifying ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          Not registered? <Link to="/register" style={{ color:B }} className="font-semibold hover:underline">Register first</Link>
        </p>
      </div>
    </div>
  )

  // ── INSTRUCTIONS PHASE ──
  if (phase === 'instructions') return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <div style={{ height:4, background:BG, borderRadius:'4px 4px 0 0', margin:'-32px -32px 28px' }}/>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome, {regData?.full_name}!</h2>
        <p className="text-gray-400 text-sm mb-6">Please read the instructions before starting</p>
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 space-y-3 mb-6">
          {[
            `📝 Total Questions: ${TOTAL_Q} MCQs`,
            `⏱ Time Limit: 30 minutes`,
            `✅ Passing Score: ${PASS_PCT}% (${Math.ceil(TOTAL_Q*PASS_PCT/100)}/${TOTAL_Q} correct)`,
            '🔒 Once started, you cannot pause the test',
            '📵 Do not refresh or close the browser',
            '🎯 Each question has one correct answer',
          ].map((item, i) => (
            <p key={i} className="text-sm text-blue-800">{item}</p>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('verify')}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            ← Back
          </button>
          <button onClick={startTest}
            style={{ background:BG }}
            className="flex-2 flex-1 text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
            Start Test →
          </button>
        </div>
      </div>
    </div>
  )

  // ── TEST PHASE ──
  if (phase === 'test') {
    const q = questions[current]
    const opts = [
      { key:'a', text:q?.option_a },
      { key:'b', text:q?.option_b },
      { key:'c', text:q?.option_c },
      { key:'d', text:q?.option_d },
    ].filter(o => o.text)
    const answered = Object.keys(answers).length
    const pctDone  = Math.round(answered / TOTAL_Q * 100)

    return (
      <div className="min-h-screen" style={{ background:'#f0f8ff' }}>
        {/* Header */}
        <div style={{ background:BG }} className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={smitLogo} alt="SMIT" className="h-8 object-contain"/>
            <span className="text-white font-bold text-sm">Entry Test</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-xs">{answered}/{TOTAL_Q} answered</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
              ${timeLeft < 120 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-white/30" style={{ background:'rgba(255,255,255,.2)' }}>
          <div className="h-1.5 transition-all duration-300" style={{ width:`${pctDone}%`, background:'#0a9e6e' }}/>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            {/* Question nav dots */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                  style={i === current
                    ? { background:B, color:'#fff' }
                    : answers[questions[i]?.id]
                    ? { background:'#dcfce7', color:'#166534' }
                    : { background:'#f3f4f6', color:'#6b7280' }}>
                  {i+1}
                </button>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>
              Question {current+1} of {TOTAL_Q}
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-5">{q?.question}</h3>

            <div className="space-y-3">
              {opts.map(opt => {
                const selected = answers[q?.id] === opt.key
                return (
                  <button key={opt.key} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt.key }))}
                    className="w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150"
                    style={selected
                      ? { borderColor:B, background:'#e8f4fc', color:B }
                      : { borderColor:'#e5e7eb', color:'#374151' }}>
                    <span className="font-bold mr-2">{opt.key.toUpperCase()}.</span>{opt.text}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors">
              ← Previous
            </button>
            <span className="text-xs text-gray-400">{answered} of {TOTAL_Q} answered</span>
            {current < TOTAL_Q - 1 ? (
              <button onClick={() => setCurrent(c => c+1)}
                style={{ background:B }}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity">
                Next →
              </button>
            ) : (
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                style={{ background:'#0a9e6e' }}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60">
                {submitting ? 'Submitting...' : '✓ Submit Test'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── RESULT PHASE ──
  if (phase === 'result' && result) {
    const passed = result.status === 'pass'
    const pct    = result.pct ?? (result.total > 0 ? Math.round(result.score/result.total*100) : 0)
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background:'linear-gradient(150deg,#eef6fd,#e4f1fb,#f4faff)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
          <div style={{ height:4, background: passed ? 'linear-gradient(90deg,#0a9e6e,#0B73B7)' : 'linear-gradient(90deg,#ef4444,#f87171)', borderRadius:'4px 4px 0 0', margin:'-40px -40px 32px' }}/>

          {/* Score circle */}
          <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: passed ? 'linear-gradient(135deg,#0a9e6e,#0B73B7)' : 'linear-gradient(135deg,#ef4444,#f87171)' }}>
            <div className="text-center">
              <p className="text-white font-extrabold text-2xl leading-none">{pct}%</p>
              <p className="text-white/80 text-xs">{result.score}/{result.total}</p>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
            {passed ? '🎉 Congratulations!' : '😔 Better Luck Next Time'}
          </h2>
          <p className="text-gray-500 text-sm mb-2">{regData?.full_name || result.full_name}</p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6`}
            style={passed ? { background:'#dcfce7', color:'#166534' } : { background:'#fee2e2', color:'#991b1b' }}>
            {passed ? '✓ PASSED' : '✗ FAILED'} — {pct}%
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 mb-6 space-y-1.5">
            <div className="flex justify-between"><span>Score:</span><strong>{result.score}/{result.total}</strong></div>
            <div className="flex justify-between"><span>Percentage:</span><strong>{pct}%</strong></div>
            <div className="flex justify-between"><span>Passing Mark:</span><strong>{PASS_PCT}%</strong></div>
            <div className="flex justify-between"><span>Status:</span>
              <strong style={{ color: passed ? '#0a9e6e' : '#ef4444' }}>{passed ? 'PASS' : 'FAIL'}</strong>
            </div>
          </div>

          {passed ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-3">
                You passed! Set your password to access the student portal.
              </p>
              <Link to="/signup"
                style={{ background:BG }}
                className="block w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                Set Password & Get ID Card →
              </Link>
              <Link to="/result" className="block text-xs text-gray-400 hover:underline">
                Check result later at /result
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-3">
                You need {PASS_PCT}% to pass. Contact admin for re-test eligibility.
              </p>
              <Link to="/"
                style={{ border:`2px solid ${B}`, color:B }}
                className="block w-full font-bold py-3 rounded-xl text-sm bg-white hover:bg-blue-50 transition-colors">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
