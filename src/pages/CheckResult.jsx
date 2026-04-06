import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

const B  = "#0B73B7"
const BG = "linear-gradient(135deg,#0B73B7 0%,#0a9e6e 100%)"

export default function CheckResult() {
  const [cnic,    setCnic]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [result,  setResult]  = useState(null)

  const handleCheck = async (e) => {
    e.preventDefault()
    setError(""); setResult(null); setLoading(true)

    const { data: et } = await supabase
      .from("entry_test_results")
      .select("*")
      .eq("cnic", cnic.trim())
      .maybeSingle()

    setLoading(false)

    if (!et) {
      setError("No entry test result found for this CNIC. Make sure you have taken the entry test.")
      return
    }

    setResult(et)
  }

  const pct = result ? (result.total > 0 ? Math.round(result.score / result.total * 100) : 0) : 0
  const passed = result?.status === "pass"

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div style={{ background: BG }} className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <span>›</span><span className="text-white font-medium">Entry Test Result</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Check Entry Test Result</h1>
          <p className="text-white/80 text-sm sm:text-base">Enter your CNIC to view your entry test result</p>
        </div>
      </div>

      {/* Search */}
      <section className="py-10 px-4" style={{ background:"#f0f8ff" }}>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background:"#e8f4fc" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900">Result Lookup</h2>
                <p className="text-xs text-gray-400">Entry test results only</p>
              </div>
            </div>
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CNIC *</label>
                <input required value={cnic} onChange={e => setCnic(e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
              </div>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
              )}
              <button type="submit" disabled={loading} style={{ background: BG }}
                className="w-full text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
                {loading ? "Searching..." : "Check Result"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Result card */}
      {result && (
        <section className="pb-16 px-4" style={{ background:"#f8fbff" }}>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              {/* Score circle */}
              <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
                style={{ background: passed ? "linear-gradient(135deg,#0a9e6e,#0B73B7)" : "linear-gradient(135deg,#ef4444,#f87171)" }}>
                <div>
                  <p className="text-white font-extrabold text-2xl leading-none">{pct}%</p>
                  <p className="text-white/80 text-xs">{result.score}/{result.total}</p>
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-1">{result.full_name}</h3>
              <p className="text-gray-400 text-xs mb-4">
                Attempted: {result.attempted_at ? new Date(result.attempted_at).toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' }) : '—'}
              </p>

              <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-6`}
                style={passed ? { background:"#dcfce7", color:"#166534" } : { background:"#fee2e2", color:"#991b1b" }}>
                {passed ? "✓ PASSED" : "✗ FAILED"} — {pct}%
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 space-y-2 mb-6 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Score</span>
                  <strong>{result.score} / {result.total}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Percentage</span>
                  <strong style={{ color: passed ? "#0e9f6e" : "#ef4444" }}>{pct}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Passing Mark</span>
                  <strong>70%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Result</span>
                  <strong style={{ color: passed ? "#0e9f6e" : "#ef4444" }}>
                    {passed ? "PASS" : "FAIL"}
                  </strong>
                </div>
              </div>

              {passed ? (
                <div className="space-y-3">
                  <Link to="/enroll" style={{ background: BG }}
                    className="block w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                    Select Course & Teacher →
                  </Link>
                  <Link to="/signup"
                    className="block w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Already enrolled? Set password
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.allow_retest ? (
                    <Link to="/entry-test" style={{ background: BG }}
                      className="block w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                      Re-Take Entry Test →
                    </Link>
                  ) : (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-sm text-yellow-700">
                      ⚠️ You need 70% to pass. Contact admin to request a re-test.
                    </div>
                  )}
                  <Link to="/"
                    className="block w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
