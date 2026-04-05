import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents, uploadStudents } from '../../store/slices/studentsSlice'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

export default function AdminStudents() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.students)
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)

  useEffect(() => { dispatch(fetchStudents()) }, [dispatch])

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)
      // Expect columns: name, cnic, roll_number, phone (optional)
      const students = rows.map(r => ({
        name: r.name || r.Name || '',
        cnic: String(r.cnic || r.CNIC || ''),
        roll_number: String(r.roll_number || r['Roll Number'] || r.RollNumber || ''),
        phone: r.phone || r.Phone || '',
      })).filter(s => s.cnic && s.roll_number)
      if (students.length === 0) { toast.error('No valid rows found. Ensure columns: name, cnic, roll_number'); setUploading(false); return }
      const result = await dispatch(uploadStudents(students))
      setUploading(false)
      if (result.error) { toast.error('Upload failed: ' + result.error.message); return }
      toast.success(`${students.length} students uploaded!`)
    }
    reader.readAsBinaryString(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
          <button onClick={() => fileRef.current.click()} disabled={uploading} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-60">
            {uploading ? 'Uploading...' : '📤 Upload Excel'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
        </div>
        <p className="text-xs text-gray-400 mb-4">Excel columns required: <code>name, cnic, roll_number</code> (optional: phone)</p>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Name', 'CNIC', 'Roll Number', 'Phone', 'Registered'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No students yet.</td></tr>
                ) : list.map((s, i) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.cnic}</td>
                    <td className="px-4 py-3 text-gray-600">{s.roll_number}</td>
                    <td className="px-4 py-3 text-gray-600">{s.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${s.password ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.password ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
