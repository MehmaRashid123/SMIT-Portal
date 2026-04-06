import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses, addCourse, updateCourse } from '../../store/slices/coursesSlice'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const B = '#0B73B7'
const CATEGORIES = ['Development','Designing','Networking','Entrepreneurship','Vocational Training','Blockchain','General']
const EMPTY = { name:'', category:'Development', status:'open', description:'', duration:'', is_top:false }

export default function AdminCourses() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.courses)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(EMPTY)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchCourses()) }, [dispatch])

  const openAdd  = () => { setForm(EMPTY); setImgFile(null); setImgPreview(null); setModal('add') }
  const openEdit = (c) => { setForm({ name:c.name, category:c.category||'General', status:c.status, description:c.description||'', duration:c.duration||'', is_top:c.is_top||false }); setImgPreview(c.thumbnail_url||null); setImgFile(null); setModal(c) }

  const handleImg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    let result
    if (modal === 'add') {
      result = await dispatch(addCourse({ course: form, imageFile: imgFile }))
    } else {
      result = await dispatch(updateCourse({ id: modal.id, updates: { name: form.name, status: form.status, category: form.category, description: form.description, duration: form.duration, is_top: form.is_top } }))
    }
    setSaving(false)
    if (result.error) { toast.error('Failed to save'); return }
    toast.success(modal === 'add' ? 'Course added!' : 'Course updated!')
    setModal(null)
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Course Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{list.length} courses total</p>
          </div>
          <button onClick={openAdd} style={{ background:B }}
            className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Course
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Thumbnail','Course Name','Category','Duration','Status','Top','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No courses yet. Add one!</td></tr>
                ) : list.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {c.thumbnail_url
                        ? <img src={c.thumbnail_url} alt={c.name} className="w-12 h-10 object-cover rounded-lg" />
                        : <div className="w-12 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background:B }}>{c.name.charAt(0)}</div>
                      }
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 max-w-[180px]">
                      <p className="truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{c.description?.slice(0,50)}{c.description?.length>50?'...':''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-700">{c.category||'General'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.duration||'—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.status==='open'?'bg-green-100 text-green-700':'bg-red-100 text-red-500'}`}>
                        {c.status==='open'?'Open':'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{c.is_top ? '⭐' : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(c)} style={{ color:B }}
                        className="text-xs font-semibold hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal==='add' ? 'Add New Course' : 'Edit Course'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Course Name *</label>
              <input required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                  value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Duration</label>
                <input placeholder="e.g. 6 months" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
                value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                  value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={()=>setForm(f=>({...f,is_top:!f.is_top}))}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                    style={form.is_top?{background:B,borderColor:B}:{borderColor:'#d1d5db'}}>
                    {form.is_top && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Mark as Top Course ⭐</span>
                </label>
              </div>
            </div>
            {modal === 'add' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Thumbnail Image</label>
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-colors">
                  {imgPreview
                    ? <img src={imgPreview} alt="preview" className="w-16 h-12 object-cover rounded-lg" />
                    : <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                  }
                  <div>
                    <p className="text-sm font-medium text-gray-700">{imgFile ? imgFile.name : 'Click to upload thumbnail'}</p>
                    <p className="text-xs text-gray-400">jpg, png, webp — recommended 400×250px</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImg} />
                </label>
              </div>
            )}
            <button type="submit" disabled={saving} style={{ background:B }}
              className="w-full text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
              {saving ? 'Saving...' : modal==='add' ? 'Add Course' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}
