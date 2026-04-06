import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents, uploadStudents } from '../../store/slices/studentsSlice'
import AdminLayout from '../../components/AdminLayout'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function AdminStudents() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.students)
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

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

  const filtered = list.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.cnic?.includes(search) ||
    s.roll_number?.includes(search)
  )

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Student Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{list.length} students total</p>
          </div>
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            style={{ background:B }}
            className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            {uploading ? 'Uploading...' : 'Upload Excel'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
        </div>

        <p className="text-xs text-gray-400 mb-4 bg-blue-50 px-4 py-2 rounded-xl inline-block">
          Excel columns: <code className="font-bold">name, cnic, roll_number</code> (optional: phone)
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, CNIC or roll number..."
            className="w-full max-w-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none transition-all"
            onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['#','Name','CNIC','Roll Number','Phone','Registered'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No students found.</td></tr>
                ) : filtered.map((s,i) => (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i+1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.cnic}</td>
                    <td className="px-4 py-3 text-gray-500">{s.roll_number}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.password?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {s.password ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
