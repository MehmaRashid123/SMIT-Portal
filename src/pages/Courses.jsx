import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCourses } from '../store/slices/coursesSlice'

const B = '#0B73B7'

// category badge colors
const CAT_COLORS = {
  Development:        { bg:'#dbeafe', color:'#1d4ed8' },
  Designing:          { bg:'#fce7f3', color:'#be185d' },
  Networking:         { bg:'#d1fae5', color:'#065f46' },
  Entrepreneurship:   { bg:'#fef3c7', color:'#92400e' },
  'Vocational Training': { bg:'#ede9fe', color:'#5b21b6' },
  Blockchain:         { bg:'#e0f2fe', color:'#0369a1' },
  General:            { bg:'#f3f4f6', color:'#374151' },
}

// placeholder gradient thumbnails when no image
const GRAD = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
]

export default function Courses() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { list, loading } = useSelector(s => s.courses)

  const [search,   setSearch]   = useState('')
  const [catFilter,setCatFilter]= useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // all | open | closed

  useEffect(() => { dispatch(fetchCourses()) }, [dispatch])

  const categories = useMemo(() => ['all', ...new Set(list.map(c => c.category || 'General'))], [list])

  const filtered = useMemo(() => list.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'all' || c.category === catFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchCat && matchStatus
  }), [list, search, catFilter, statusFilter])

  return (
    <div className="min-h-screen" style={{ background:'#f0f6fb' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex gap-6">

          {/* ── Sidebar ── */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">

              {/* Filter header */}
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2.5">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span className="font-bold text-gray-800">Filters</span>
              </div>

              {/* Search */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Search Courses</p>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by course name..."
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none transition-all"
                    onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
                </div>
              </div>

              {/* Status filter */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Course Categories</p>
                <button onClick={() => setStatusFilter(statusFilter==='open'?'all':'open')}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-2 font-semibold text-sm transition-all"
                  style={statusFilter==='open'
                    ? { background:B, color:'#fff' }
                    : { background:'#e8f4fc', color:B }}>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
                    </svg>
                    Admissions Open
                  </div>
                  <div className="w-4 h-4 rounded border-2 flex items-center justify-center"
                    style={statusFilter==='open' ? { borderColor:'#fff', background:'#fff' } : { borderColor:B }}>
                    {statusFilter==='open' && <div className="w-2 h-2 rounded-sm" style={{ background:B }} />}
                  </div>
                </button>

                {/* All categories */}
                <button onClick={() => setCatFilter('all')}
                  className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all mb-1"
                  style={catFilter==='all' ? { background:B, color:'#fff' } : { background:'#f3f4f6', color:'#374151' }}>
                  All Categories
                </button>

                {/* Category list */}
                <div className="space-y-1 mt-2">
                  {categories.filter(c=>c!=='all').map(cat => (
                    <button key={cat} onClick={() => setCatFilter(cat)}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm transition-all"
                      style={catFilter===cat ? { background:'#e8f4fc', color:B, fontWeight:600 } : { color:'#6b7280' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">

            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-extrabold text-gray-900">All Courses</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Showing {filtered.length} of {list.length} courses
              </p>
            </div>

            {/* Found badge */}
            {!loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5"
                style={{ background:'#e8f4fc', color:B }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {filtered.length} Courses Found
              </div>
            )}

            {/* Mobile search */}
            <div className="lg:hidden mb-4 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses..."
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none bg-white" />
            </div>

            {/* Mobile category pills */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={catFilter===cat ? { background:B, color:'#fff' } : { background:'#fff', color:'#6b7280', border:'1px solid #e5e7eb' }}>
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_,i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                </svg>
                <p className="text-gray-400 font-medium">No courses found</p>
                <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((course, idx) => {
                  const catStyle = CAT_COLORS[course.category] || CAT_COLORS.General
                  const grad = GRAD[idx % GRAD.length]
                  return (
                    <div key={course.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-250 flex flex-col group">

                      {/* Thumbnail */}
                      <div className="relative h-44 overflow-hidden">
                        {course.thumbnail_url
                          ? <img src={course.thumbnail_url} alt={course.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center" style={{ background: grad }}>
                              <p className="text-white font-extrabold text-xl text-center px-4 leading-tight uppercase tracking-wide drop-shadow">
                                {course.name}
                              </p>
                            </div>
                        }
                        {/* Category badge */}
                        <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: catStyle.bg, color: catStyle.color }}>
                          {course.category || 'General'}
                        </span>
                        {/* Admission status ribbon */}
                        {course.status === 'open' && (
                          <div className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-bold text-white"
                            style={{ background:'linear-gradient(90deg,#0B73B7,#0d85d4)' }}>
                            ADMISSION OPEN
                          </div>
                        )}
                        {course.status === 'closed' && (
                          <div className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-bold text-white"
                            style={{ background:'linear-gradient(90deg,#ef4444,#f87171)' }}>
                            ADMISSION CLOSED
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
                          {course.name}
                        </h3>

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          {course.duration && (
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {course.duration}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                            </svg>
                            Course
                          </span>
                        </div>

                        <p className="text-gray-500 text-xs leading-relaxed flex-1 line-clamp-2 mb-4">
                          {course.description || 'No description available.'}
                        </p>

                        <button
                          disabled={course.status !== 'open'}
                          onClick={() => navigate(`/register?course=${course.id}`)}
                          className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                          style={course.status === 'open'
                            ? { background:B, color:'#fff' }
                            : { background:'#f3f4f6', color:'#9ca3af', cursor:'not-allowed' }}>
                          {course.status === 'open' ? 'Apply Now' : 'Admissions Closed'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
