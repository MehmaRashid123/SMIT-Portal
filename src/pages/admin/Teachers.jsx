import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'
const G = '#0e9f6e'
const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white"

export default function AdminTeachers() {
  const [teachers,  setTeachers]  = useState([])
  const [courses,   setCourses]   = useState([])
  const [campuses,  setCampuses]  = useState([])
  const [slots,     setSlots]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)       // add teacher
  const [slotModal, setSlotModal] = useState(null)        // teacher id for slot mgmt
  const [form, setForm] = useState({ name:'', username:'', password:'', course_id:'', campus:'', timing:'', total_seats:30 })
  const [slotForm,  setSlotForm]  = useState({ timing:'', total_seats:30 })
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: t }, { data: c }, { data: camp }, { data: s }] = await Promise.all([
      supabase.from('teachers').select('*, courses(name)').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, name').eq('status', 'open'),
      supabase.from('campuses').select('*').order('city'),
      supabase.from('slots').select('*, teachers(name)').order('created_at', { ascending: false }),
    ])
    setTeachers(t || [])
    setCourses(c || [])
    setCampuses(camp || [])
    setSlots(s || [])
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true)

    // Check duplicate username
    const { data: existing } = await supabase
      .from('teachers').select('id').eq('username', form.username).maybeSingle()
    if (existing) {
      toast.error('Username already taken. Please choose another.')
      setSaving(false); return
    }

    const { data: teacher, error } = await supabase.from('teachers').insert([{
      name:      form.name,
      username:  form.username,
      password:  form.password,
      course_id: form.course_id || null,
      campus:    form.campus    || null,
    }]).select().single()

    if (error) { toast.error('Failed: ' + error.message); setSaving(false); return }

    // If timing provided, create slot immediately
    if (form.timing && form.course_id) {
      await supabase.from('slots').insert([{
        teacher_id:  teacher.id,
        course_id:   form.course_id,
        campus:      form.campus || null,
        timing:      form.timing,
        total_seats: Number(form.total_seats) || 30,
      }])
    }

    setSaving(false)
    toast.success('Teacher added!')
    setModal(false)
    setForm({ name:'', username:'', password:'', course_id:'', campus:'', timing:'', total_seats:30 })
    fetchAll()
  }

  const handleAddSlot = async (e) => {
    e.preventDefault(); setSaving(true)
    const teacher = teachers.find(t => t.id === slotModal)
    const { error } = await supabase.from('slots').insert([{
      teacher_id:  slotModal,
      course_id:   teacher?.course_id || null,
      campus:      teacher?.campus    || null,
      timing:      slotForm.timing,
      total_seats: Number(slotForm.total_seats),
    }])
    setSaving(false)
    if (error) { toast.error('Failed: ' + error.message); return }
    toast.success('Slot added!')
    setSlotForm({ timing:'', total_seats:30 })
    fetchAll()
  }

  const deleteSlot = async (id) => {
    await supabase.from('slots').delete().eq('id', id)
    toast.success('Slot removed')
    fetchAll()
  }

  const teacherSlots = (teacherId) => slots.filter(s => s.teacher_id === teacherId)

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Teachers</h1>
            <p className="text-sm text-gray-400 mt-0.5">{teachers.length} total</p>
          </div>
          <button onClick={() => setModal(true)} style={{ background:B }}
            className="text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 flex items-center gap-2 whitespace-nowrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Teacher
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['#','Name','Username','Course','Campus','Slots','Actions'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
                ) : teachers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No teachers yet.</td></tr>
                ) : teachers.map((t, i) => (
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background:G }}>
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.username}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{t.courses?.name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.campus || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background:'#e8f4fc', color:B }}>
                        {teacherSlots(t.id).length} slots
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSlotModal(t.id)} style={{ color:B }}
                        className="text-xs font-semibold hover:underline">
                        Manage Slots
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add Teacher Modal ── */}
      {modal && (
        <Modal title="Add New Teacher" onClose={() => { setModal(false); setForm({ name:'', username:'', password:'', course_id:'', campus:'', timing:'', total_seats:30 }) }}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
              <input required placeholder="Full Name" className={inp} value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username *</label>
                <input required placeholder="username" className={inp} value={form.username}
                  onChange={e=>setForm(f=>({...f,username:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password *</label>
                <input required type="password" placeholder="Password" className={inp} value={form.password}
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Assign Course</label>
              <select className={inp} value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}>
                <option value="">Select course</option>
                {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Campus *</label>
              <select required className={inp} value={form.campus} onChange={e=>setForm(f=>({...f,campus:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}>
                <option value="">Select campus</option>
                {campuses.map(c=><option key={c.id} value={c.name}>{c.name} — {c.city}</option>)}
              </select>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Class Slot (Optional — can add later)</p>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Timing</label>
                <input placeholder="e.g. Mon/Wed  9:00 AM – 11:00 AM" className={inp} value={form.timing}
                  onChange={e=>setForm(f=>({...f,timing:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Seats</label>
                <input type="number" min={1} max={200} placeholder="30" className={inp} value={form.total_seats}
                  onChange={e=>setForm(f=>({...f,total_seats:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ background:B }}
              className="w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Teacher'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Manage Slots Modal ── */}
      {slotModal && (() => {
        const teacher = teachers.find(t => t.id === slotModal)
        const tSlots  = teacherSlots(slotModal)
        const totalEnrolled = tSlots.reduce((sum, s) => sum + (s.enrolled_count || 0), 0)
        return (
          <Modal title={`Slots — ${teacher?.name}`} onClose={() => { setSlotModal(null); setSlotForm({ timing:'', total_seats:30 }) }}>
            <div className="space-y-4">
              {/* Existing slots */}
              {tSlots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Slots</p>
                  {tSlots.map(s => {
                    const enrolled = slots.filter(sl => sl.id === s.id).length
                    return (
                      <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{s.timing}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {s.campus} · <span style={{ color:B }}>{s.total_seats} seats</span>
                          </p>
                        </div>
                        <button onClick={() => deleteSlot(s.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add new slot */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Add New Slot</p>
                <form onSubmit={handleAddSlot} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Timing *</label>
                    <input required placeholder="e.g. Mon/Wed  9:00 AM – 11:00 AM" className={inp} value={slotForm.timing}
                      onChange={e=>setSlotForm(f=>({...f,timing:e.target.value}))}
                      onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Seats *</label>
                    <input required type="number" min={1} max={200} placeholder="30" className={inp} value={slotForm.total_seats}
                      onChange={e=>setSlotForm(f=>({...f,total_seats:e.target.value}))}
                      onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                  </div>
                  <button type="submit" disabled={saving} style={{ background:G }}
                    className="w-full text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60">
                    {saving ? 'Adding...' : '+ Add Slot'}
                  </button>
                </form>
              </div>
            </div>
          </Modal>
        )
      })()}
    </AdminLayout>
  )
}
