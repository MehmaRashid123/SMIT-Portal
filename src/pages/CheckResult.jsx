import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

const B  = "#0B73B7"
const BG = "linear-gradient(135deg,#0B73B7 0%,#0a9e6e 100%)"

function statusClass(s) {
  if (s === "approved" || s === "present" || s === "pass") return "bg-green-100 text-green-700"
  if (s === "rejected" || s === "absent" || s === "fail")  return "bg-red-100 text-red-500"
  return "bg-yellow-100 text-yellow-700"
}

export default function CheckResult() {
  const [cnic,    setCnic]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [result,  setResult]  = useState(null)

  const handleCheck = async (e) => {
    e.preventDefault()
    setError(""); setResult(null); setLoading(true)

    const { data: student } = await supabase
      .from("students").select("*").eq("cnic", cnic.trim()).single()

    if (!student) {
      const { data: et } = await supabase
        .from("entry_test_results").select("*").eq("cnic", cnic.trim()).single()
      if (et) { setResult({ entryTestOnly: true, et }); setLoading(false); return }
      setError("No student found with this CNIC.")
      setLoading(false); return
    }

    const [{ data: quizResults }, { data: submissions }, { data: attendance }, { data: leaves }] = await Promise.all([
      supabase.from("quiz_results").select("*, quizzes(title)").eq("student_id", student.id).order("created_at", { ascending: false }),
      supabase.from("assignment_submissions").select("*, assignments(title, due_date)").eq("student_id", student.id).order("created_at", { ascending: false }),
      supabase.from("attendance").select("*").eq("student_id", student.id).order("date", { ascending: false }),
      supabase.from("leaves").select("*").eq("student_id", student.id).order("created_at", { ascending: false }),
    ])

    setResult({ student, quizResults: quizResults||[], submissions: submissions||[], attendance: attendance||[], leaves: leaves||[] })
    setLoading(false)
  }

  const present = result?.attendance?.filter(a => a.status === "present").length || 0
  const total   = result?.attendance?.length || 0
  const attPct  = total > 0 ? Math.round(present / total * 100) : 0
  const avgQuiz = result?.quizResults?.length
    ? Math.round(result.quizResults.reduce((a, q) => a + (q.total > 0 ? q.score/q.total*100 : 0), 0) / result.quizResults.length)
    : null

  return (
    <div className="min-h-screen bg-white">
      <div style={{ background: BG }} className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            <span>›</span><span className="text-white font-medium">Check Result</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Check Your Result</h1>
          <p className="text-white/80 text-base">Enter your CNIC to view quiz scores, attendance and assignment status</p>
        </div>
      </div>

      <section className="py-12 px-4" style={{ background:"#f0f8ff" }}>
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:"#e8f4fc" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div><h2 className="font-extrabold text-gray-900">Result Lookup</h2><p className="text-xs text-gray-400">Enter your CNIC number below</p></div>
            </div>
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CNIC Number *</label>
                <input required value={cnic} onChange={e => setCnic(e.target.value)} placeholder="XXXXX-XXXXXXX-X"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
              </div>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
              )}
              <button type="submit" disabled={loading} style={{ background: BG }}
                className="w-full text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {loading ? "Searching..." : "Check Result"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {result && result.entryTestOnly && (
        <section className="pb-16 px-4" style={{ background:"#f8fbff" }}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: result.et.status === "pass" ? "#dcfce7" : "#fee2e2" }}>
                <span className="text-3xl">{result.et.status === "pass" ? "🎉" : "😔"}</span>
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">{result.et.full_name}</h3>
              <p className="text-gray-400 text-sm mb-4">Entry Test Result</p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-6"
                style={result.et.status === "pass" ? { background:"#dcfce7", color:"#166534" } : { background:"#fee2e2", color:"#991b1b" }}>
                {result.et.status === "pass" ? "✓ PASSED" : "✗ FAILED"} — {result.et.total > 0 ? Math.round(result.et.score/result.et.total*100) : 0}%
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1.5 mb-6">
                <div className="flex justify-between"><span>Score:</span><strong>{result.et.score}/{result.et.total}</strong></div>
                <div className="flex justify-between"><span>Percentage:</span><strong>{result.et.total > 0 ? Math.round(result.et.score/result.et.total*100) : 0}%</strong></div>
                <div className="flex justify-between"><span>Passing Mark:</span><strong>70%</strong></div>
              </div>
              {result.et.status === "pass" && (
                <Link to="/signup" style={{ background:B }}
                  className="block w-full text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
                  Set Password & Access Portal →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {result && !result.entryTestOnly && (
        <section className="pb-16 px-4" style={{ background:"#f8fbff" }}>
          <div className="max-w-4xl mx-auto space-y-6">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
                style={{ background: BG }}>{result.student.name.charAt(0)}</div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-gray-900">{result.student.name}</h3>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                  <span>Roll: <strong style={{ color:B }}>{result.student.roll_number || "—"}</strong></span>
                  <span>CNIC: <strong>{result.student.cnic}</strong></span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-extrabold" style={{ color: attPct >= 75 ? "#0e9f6e" : "#ef4444" }}>{attPct}%</div>
                <div className="text-xs text-gray-400">Attendance</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label:"Attendance",    val: present + "/" + total, sub: attPct + "%",  color:"#0e9f6e", bg:"#e8faf4" },
                { label:"Quizzes Taken", val: result.quizResults.length, sub: avgQuiz !== null ? "Avg " + avgQuiz + "%" : "No quizzes", color:B, bg:"#e8f4fc" },
                { label:"Assignments",   val: result.submissions.length, sub:"Submitted", color:"#7c3aed", bg:"#f3eeff" },
                { label:"Leaves",        val: result.leaves.length, sub: result.leaves.filter(l=>l.status==="approved").length + " approved", color:"#f59e0b", bg:"#fffbeb" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                  <p className="text-2xl font-extrabold" style={{ color:s.color }}>{s.val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color:s.color }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50" style={{ background:"linear-gradient(135deg,#e8f4fc,#fff)" }}>
                <p className="font-bold text-gray-800">Quiz Results</p>
              </div>
              {result.quizResults.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No quiz results yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Quiz Title","Score","Percentage","Grade"].map(h=>(
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {result.quizResults.map(q => {
                      const pct   = q.total > 0 ? Math.round(q.score/q.total*100) : 0
                      const grade = pct>=90?"A+":pct>=80?"A":pct>=70?"B":pct>=60?"C":pct>=50?"D":"F"
                      const gc    = pct>=70?"#0e9f6e":pct>=50?"#f59e0b":"#ef4444"
                      return (
                        <tr key={q.id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 font-medium text-gray-800">{q.quizzes?.title || "—"}</td>
                          <td className="px-5 py-3 text-gray-600">{q.score}/{q.total}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-20">
                                <div className="h-1.5 rounded-full" style={{ width: pct + "%", background:gc }}/>
                              </div>
                              <span className="text-xs font-semibold" style={{ color:gc }}>{pct}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                              style={{ background: gc + "22", color:gc }}>{grade}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50" style={{ background:"linear-gradient(135deg,#f3eeff,#fff)" }}>
                <p className="font-bold text-gray-800">Assignment Submissions</p>
              </div>
              {result.submissions.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No assignments submitted yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Assignment","Due Date","Submitted On","Status"].map(h=>(
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {result.submissions.map(s => (
                      <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{s.assignments?.title || "—"}</td>
                        <td className="px-5 py-3 text-gray-500">{s.assignments?.due_date || "—"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">Submitted</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between" style={{ background:"linear-gradient(135deg,#e8faf4,#fff)" }}>
                <p className="font-bold text-gray-800">Recent Attendance</p>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: attPct>=75?"#dcfce7":"#fee2e2", color: attPct>=75?"#166534":"#991b1b" }}>
                  {attPct}% — {attPct>=75?"Good":"Needs Improvement"}
                </span>
              </div>
              {result.attendance.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No attendance records yet.</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {result.attendance.slice(0,10).map(a => (
                    <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.date}</p>
                        <p className="text-xs text-gray-400 capitalize">{a.marked_by || "qr"} scan</p>
                      </div>
                      <span className={"text-xs px-2.5 py-1 rounded-full font-semibold capitalize " + statusClass(a.status)}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result.leaves.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50" style={{ background:"linear-gradient(135deg,#fffbeb,#fff)" }}>
                  <p className="font-bold text-gray-800">Leave Requests</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {result.leaves.map(l => (
                    <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{l.reason}</p>
                        <p className="text-xs text-gray-400">{l.from_date} to {l.to_date}</p>
                      </div>
                      <span className={"text-xs px-2.5 py-1 rounded-full font-semibold capitalize " + statusClass(l.status)}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}