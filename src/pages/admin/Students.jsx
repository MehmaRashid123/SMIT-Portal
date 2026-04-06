import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents, uploadStudents } from '../../store/slices/studentsSlice'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import { supabase } from '../../lib/supabaseClient'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const B = '#0B73B7'

const STATUS_STYLE = {
  active:     'bg-green-100 text-green-700',
  dropout:    'bg-red-100 text-red-600',
  suspended:  'bg-yellow-100 text-yellow-700',
  graduated:  'bg-blue-100 text-blue-700',
}

export default function AdminStudents() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.students)
  const fileRef = useRef()
  const [uploading,  setUploading]  = useState(false)
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected,   setSelected]   = useState(null)
  const [dropoutModal, setDropoutModal] = useState(null)
  const [dropoutReason, setDropoutReason] = useState('')
  const [updating,   setUpdating]   = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [detailData,  setDetailData]  = useState(null)

  useEffect(() => { dispatch(fetchStudents()) }, [dispatch])

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type:'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)
      const students = rows.map(r => ({
        name: r.name || r.Name || '',
        cnic: String(r.cnic || r.CNIC || ''),
        roll_number: String(r.roll_number || r['Roll Number'] || r.RollNumber || ''),
        phone: r.phone || r.Phone || '',
      })).filter(s => s.cnic && s.roll_number)
      if (!students.length) { toast.error('No valid rows. Columns: name, cnic, roll_number'); setUploading(false); return }
      const result = await dispatch(uploadStudents(students))
      setUploading(false)
      if (result.error) { toast.error('Upload failed'); return }
      toast.success(`${students.length} students uploaded!`)
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  const updateStatus = async (id, status, reason = '') => {
    setUpdating(true)
    const updates = { status }
    if (status === 'dropout') { updates.dropout_reason = reason; updates.dropout_date = new Date().toISOString().split('T')[0] }
    const { error } = await supabase.from('students').update(updates).eq('id', id)
    setUpdating(false)
    if (error) { toast.error('Update failed'); return }
    toast.success(`Student marked as ${status}`)
    dispatch(fetchStudents())
    setDropoutModal(null); setDropoutReason('')
  }

  const openDetail = async (student) => {
    setDetailModal(student)
    const [{ data: att }, { data: leaves }, { data: enroll }] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', student.id).order('date', { ascending: false }).limit(10),
      supabase.from('leaves').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
      supabase.from('enrollments').select('*, courses(name)').eq('student_id', student.id),
    ])
    setDetailData({ attendance: att||[], leaves: leaves||[], enrollments: enroll||[] })
  }

  const exportExcel = () => {
    const data = filtered.map((s,i) => ({
      '#': i+1, Name: s.name, CNIC: s.cnic, 'Roll Number': s.roll_number,
      Phone: s.phone||'', Status: s.status||'active', Registered: s.password?'Yes':'No',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, 'SMIT_Students.xlsx')
    toast.success('Exported!')
  }

  const filtered = list.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.cnic?.includes(search) || s.roll_number?.includes(search)
    const matchStatus = statusFilter === 'all' || (s.status || 'active') === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all:       list.length,
    active:    list.filter(s => (s.status||'active') === 'active').length,
    dropout:   list.filter(s => s.status === 'dropout').length,
    suspended: list.filter(s => s.status === 'suspended').length,
    graduated: list.filter(s => s.status === 'graduated').length,
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Student Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{list.length} total students</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export Excel
            </button>
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              style={{ background:B }}
              className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              {uploading ? 'Uploading...' : 'Upload Excel'}
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { key:'all',       label:'Total',     color:'#374151', bg:'#f3f4f6' },
            { key:'active',    label:'Active',    color:'#0e9f6e', bg:'#e8faf4' },
            { key:'dropout',   label:'Dropout',   color:'#ef4444', bg:'#fff5f5' },
            { key:'suspended', label:'Suspended', color:'#f59e0b', bg:'#fffbeb' },
            { key:'graduated', label:'Graduated', color:B,         bg:'#e8f4fc' },
          ].map(s => (
            <button key={s.key} onClick={() => setStatusFilter(s.key)}
              className="rounded-2xl p-4 text-center border-2 transition-all"
              style={statusFilter===s.key ? { borderColor:s.color, background:s.bg } : { borderColor:'#e5e7eb', background:'#fff' }}>
              <p className="text-2xl font-extrabold" style={{ color:s.color }}>{counts[s.key]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, CNIC, roll number..."
            className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none transition-all"
            onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['#','Name','CNIC','Roll No','Phone','Status','Registered','Actions'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No students found.</td></tr>
                ) : filtered.map((s,i) => (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background:B }}>{s.name?.charAt(0)}</div>
                        <span className="font-semibold text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.cnic}</td>
                    <td className="px-4 py-3 text-gray-500 font-semibold" style={{ color:B }}>{s.roll_number}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_STYLE[s.status||'active']}`}>
                        {s.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.password?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {s.password ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(s)}
                          className="text-xs px-2 py-1 rounded-lg font-semibold transition-colors hover:opacity-80"
                          style={{ background:'#e8f4fc', color:B }}>View</button>
                        {(s.status||'active') === 'active' && (
                          <button onClick={() => setDropoutModal(s)}
                            className="text-xs px-2 py-1 rounded-lg font-semibold transition-colors hover:opacity-80"
                            style={{ background:'#fff5f5', color:'#ef4444' }}>Dropout</button>
                        )}
                        {(s.status||'active') === 'active' && (
                          <button onClick={() => updateStatus(s.id, 'graduated')}
                            className="text-xs px-2 py-1 rounded-lg font-semibold transition-colors hover:opacity-80"
                            style={{ background:'#e8f4fc', color:B }}>Graduate</button>
                        )}
                        {s.status === 'dropout' && (
                          <button onClick={() => updateStatus(s.id, 'active')}
                            className="text-xs px-2 py-1 rounded-lg font-semibold transition-colors hover:opacity-80"
                            style={{ background:'#e8faf4', color:'#0e9f6e' }}>Restore</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dropout Modal */}
      {dropoutModal && (
        <Modal title={`Mark as Dropout: ${dropoutModal.name}`} onClose={() => setDropoutModal(null)}>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700 border border-red-100">
              ⚠️ This will mark the student as dropout. They will lose portal access.
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reason for Dropout *</label>
              <textarea required rows={3} value={dropoutReason} onChange={e=>setDropoutReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                onFocus={e=>e.target.style.borderColor='#ef4444'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDropoutModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button disabled={!dropoutReason.trim() || updating}
                onClick={() => updateStatus(dropoutModal.id, 'dropout', dropoutReason)}
                className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
                style={{ background:'#ef4444' }}>
                {updating ? 'Processing...' : 'Confirm Dropout'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={`Student: ${detailModal.name}`} onClose={() => { setDetailModal(null); setDetailData(null) }}>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Roll No', detailModal.roll_number||'—'],
                ['CNIC', detailModal.cnic],
                ['Phone', detailModal.phone||'—'],
                ['Status', detailModal.status||'active'],
                ['Registered', detailModal.password?'Yes':'No'],
                ['Dropout Reason', detailModal.dropout_reason||'—'],
              ].map(([l,v])=>(
                <div key={l} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{l}</p>
                  <p className="font-semibold text-gray-800 mt-0.5 capitalize">{v}</p>
                </div>
              ))}
            </div>

            {/* Enrollments */}
            {detailData?.enrollments?.length > 0 && (
              <div>
                <p className="font-bold text-gray-800 text-sm mb-2">Enrolled Courses</p>
                {detailData.enrollments.map(e => (
                  <div key={e.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:B }}/>
                    <span className="text-sm text-gray-700">{e.courses?.name || '—'}</span>
                    {e.campus && <span className="text-xs text-gray-400">· {e.campus}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Attendance */}
            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">Recent Attendance</p>
              {!detailData ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : detailData.attendance.length === 0 ? (
                <p className="text-xs text-gray-400">No records</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {detailData.attendance.map(a => (
                    <span key={a.id} className={`text-xs px-2 py-1 rounded-lg font-medium ${a.status==='present'?'bg-green-100 text-green-700':'bg-red-100 text-red-500'}`}>
                      {a.date}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Leaves */}
            <div>
              <p className="font-bold text-gray-800 text-sm mb-2">Leave Requests ({detailData?.leaves?.length||0})</p>
              {detailData?.leaves?.map(l => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-xs text-gray-600 truncate max-w-xs">{l.reason}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ml-2 flex-shrink-0
                    ${l.status==='approved'?'bg-green-100 text-green-700':l.status==='rejected'?'bg-red-100 text-red-500':'bg-yellow-100 text-yellow-700'}`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}
