import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllEnrollments, addEnrollment } from '../../store/slices/enrollmentSlice'
import { fetchStudents } from '../../store/slices/studentsSlice'
import { fetchCourses } from '../../store/slices/coursesSlice'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function AdminEnrollments() {
  const dispatch = useDispatch()
  const { all: enrollments, loading } = useSelector(s => s.enrollment)
  const { list: students } = useSelector(s => s.students)
  const { list: courses }  = useSelector(s => s.courses)
  const [modal, setModal] = useState(false)
  const [form,  setForm]  = useState({ student_id:'', course_id:'', batch:'', campus:'', city:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchAllEnrollments())
    dispatch(fetchStudents())
    dispatch(fetchCourses())
  }, [dispatch])

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)
    const result = await dispatch(addEnrollment(form))
    setSaving(false)
    if (result.error) { toast.error('Failed: ' + result.error.message); return }
    toast.success('Student enrolled!')
    setModal(false); setForm({ student_id:'', course_id:'', batch:'', campus:'', city:'' })
    // Re-fetch to get full joined data (students + courses)
    dispatch(fetchAllEnrollments())
  }

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all bg-white"

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Enrollments</h1>
            <p className="text-sm text-gray-400 mt-0.5">{enrollments.length} total enrollments</p>
          </div>
          <button onClick={() => setModal(true)} style={{ background:B }}
            className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Enroll Student
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Student','Roll No','Course','Batch','Campus','City'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No enrollments yet.</td></tr>
              ) : enrollments.map(e => (
                <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{e.students?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.students?.roll_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{e.courses?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.batch || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.campus || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{e.city || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title="Enroll Student" onClose={() => setModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Student *</label>
              <select required className={inp} value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))}>
                <option value="">Select student</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.roll_number}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Course *</label>
              <select required className={inp} value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))}>
                <option value="">Select course</option>
                {courses.filter(c=>c.status==='open').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Batch','batch','e.g. Batch 16'],['Campus','campus','Campus name'],['City','city','City']].map(([label,key,ph])=>(
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input placeholder={ph} className={inp} value={form[key]}
                    onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} style={{ background:B }}
              className="w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60">
              {saving ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}
