import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const B   = '#0B73B7'
const BG  = 'linear-gradient(135deg,#0B73B7 0%,#0a9e6e 100%)'
const GEO = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/pakistan/pakistan-provinces.json'

const CITIES = [
  { id:'karachi',     name:'Karachi',      campuses:14, coords:[67.01,24.86] },
  { id:'faisalabad',  name:'Faisalabad',   campuses:1,  coords:[73.09,31.42] },
  { id:'hyderabad',   name:'Hyderabad',    campuses:3,  coords:[68.37,25.39] },
  { id:'peshawar',    name:'Peshawar',     campuses:1,  coords:[71.54,34.01] },
  { id:'quetta',      name:'Quetta',       campuses:1,  coords:[66.99,30.18] },
  { id:'islamabad',   name:'Islamabad',    campuses:1,  coords:[73.04,33.72] },
  { id:'rawalpindi',  name:'Rawalpindi',   campuses:1,  coords:[73.06,33.60] },
  { id:'gujranwala',  name:'Gujranwala',   campuses:1,  coords:[74.19,32.16] },
  { id:'sukkur',      name:'Sukkur',       campuses:1,  coords:[68.87,27.70] },
  { id:'lakkimarwat', name:'Lakki Marwat', campuses:1,  coords:[70.91,32.61] },
  { id:'multan',      name:'Multan',       campuses:1,  coords:[71.47,30.19] },
  { id:'ghotki',      name:'Ghotki',       campuses:1,  coords:[69.31,28.00] },
  { id:'turbat',      name:'Turbat',       campuses:1,  coords:[63.04,26.00] },
]

const CAMPUS_DETAILS = {
  karachi:    ['Aliabad Female Campus','Gulshan Campus','Korangi Campus','Malir Campus','North Karachi Campus','Orangi Campus','Landhi Campus','Baldia Campus','Lyari Campus','Shah Faisal Campus','Surjani Campus','Clifton Campus','Saddar Campus','Kemari Campus'],
  hyderabad:  ['Latifabad Campus','Qasimabad Campus','City Campus'],
  faisalabad: ['D-Ground Campus'],
  peshawar:   ['Hayatabad Campus'],
  quetta:     ['Satellite Town Campus'],
  islamabad:  ['F-10 Campus'],
  rawalpindi: ['Saddar Campus'],
  gujranwala: ['GT Road Campus'],
  sukkur:     ['Main Campus'],
  lakkimarwat:['Main Campus'],
  multan:     ['Gulgasht Campus'],
  ghotki:     ['Main Campus'],
  turbat:     ['Main Campus'],
}

const totalCampuses = CITIES.reduce((a, c) => a + c.campuses, 0)

export default function Campus() {
  const [selected,  setSelected]  = useState(null)
  const [hovered,   setHovered]   = useState(null)
  const [cityFilter,setCityFilter] = useState('')

  const filtered = cityFilter
    ? CITIES.filter(c => c.id === cityFilter)
    : CITIES

  const handleCityClick = (city) => {
    setSelected(selected?.id === city.id ? null : city)
    setCityFilter(city.id)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div style={{ background: BG }} className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <span>›</span>
            <span className="text-white font-medium">Campuses</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Our Campuses</h1>
          <p className="text-white/80 text-base max-w-md">
            Find SMIT training centers across Pakistan — bringing quality IT education closer to you.
          </p>
        </div>
      </div>

      {/* ── Map ── */}
      <section className="py-10 px-4" style={{ background:'#f0f8ff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center:[69.5,29.5], scale:1600 }}
              style={{ width:'100%', height:'auto' }}
              height={480}>
              <Geographies geography={GEO}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography key={geo.rsmKey} geography={geo}
                      fill="#dbeafe" stroke="#0B73B7" strokeWidth={0.8}
                      style={{
                        default:{ outline:'none' },
                        hover:  { fill:'#bfdbfe', outline:'none' },
                        pressed:{ outline:'none' },
                      }}/>
                  ))
                }
              </Geographies>

              {CITIES.map(city => {
                const active = selected?.id === city.id || hovered === city.id
                return (
                  <Marker key={city.id} coordinates={city.coords}
                    onClick={() => handleCityClick(city)}
                    onMouseEnter={() => setHovered(city.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor:'pointer' }}>
                    {active && (
                      <circle r="14" fill={B} opacity="0.15">
                        <animate attributeName="r" values="10;18;10" dur="1.5s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.2;0;0.2" dur="1.5s" repeatCount="indefinite"/>
                      </circle>
                    )}
                    <path d="M 0 0 C 0 0 -7 -12 -7 -17 A 7 7 0 1 1 7 -17 C 7 -12 0 0 0 0 Z"
                      fill={active ? B : '#fff'} stroke={B} strokeWidth="1.5"
                      style={{ filter:active?`drop-shadow(0 2px 5px ${B}88)`:'none', transition:'all .2s' }}/>
                    <circle cy="-17" r="3" fill={active ? '#fff' : B} style={{ transition:'all .2s' }}/>
                    <text y="10" textAnchor="middle" fontSize="5.5" fontWeight="700"
                      fill={active ? B : '#1e3a5f'} style={{ userSelect:'none', pointerEvents:'none' }}>
                      {city.name} ({city.campuses})
                    </text>
                  </Marker>
                )
              })}
            </ComposableMap>
          </div>
        </div>
      </section>

      {/* ── Filter + Grid ── */}
      <section className="py-10 px-4" style={{ background:'#f8fbff' }}>
        <div className="max-w-6xl mx-auto">

          {/* Filter row */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="relative w-64">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Select a City to View Campuses
              </label>
              <div className="relative">
                <select
                  value={cityFilter}
                  onChange={e => {
                    setCityFilter(e.target.value)
                    setSelected(e.target.value ? CITIES.find(c => c.id === e.target.value) : null)
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white appearance-none cursor-pointer"
                  onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor='#e5e7eb'}>
                  <option value="">Choose a city...</option>
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            {/* Stats badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background:'#e8f4fc', color:B }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {CITIES.length} Cities
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background:'#e8f4fc', color:B }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                {totalCampuses} Campuses
              </div>
              {cityFilter && (
                <button onClick={() => { setCityFilter(''); setSelected(null) }}
                  className="text-xs font-semibold px-3 py-2 rounded-full border transition-colors hover:bg-gray-50"
                  style={{ borderColor:'#e5e7eb', color:'#6b7280' }}>
                  Clear ✕
                </button>
              )}
            </div>
          </div>

          {/* City cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filtered.map(city => (
              <button key={city.id}
                onClick={() => handleCityClick(city)}
                className="text-left bg-white rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={selected?.id === city.id
                  ? { borderColor:B, background:'#e8f4fc' }
                  : { borderColor:'#e5e7eb' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={selected?.id === city.id ? B : '#9ca3af'} strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="font-bold text-gray-800 text-sm">{city.name}</span>
                </div>
                <p className="text-2xl font-extrabold" style={{ color:B }}>{city.campuses}</p>
                <p className="text-xs text-gray-400 mt-0.5">{city.campuses === 1 ? 'Campus' : 'Campuses'}</p>
              </button>
            ))}
          </div>

          {/* Campus list for selected city */}
          {selected && CAMPUS_DETAILS[selected.id] && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3"
                style={{ background:'linear-gradient(135deg,#e8f4fc,#fff)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:B }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold text-gray-900">{selected.name} Campuses</p>
                  <p className="text-xs" style={{ color:B }}>{selected.campuses} {selected.campuses===1?'Campus':'Campuses'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
                {CAMPUS_DETAILS[selected.id].map((campus, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ background:B }}>{i+1}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{campus}</p>
                      <p className="text-xs text-gray-400">{selected.name}, Pakistan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4" style={{ background: BG }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-white mb-2">Find Your Nearest Campus</h2>
          <p className="text-white/80 text-sm mb-6">
            With {totalCampuses} campuses across {CITIES.length} cities, quality IT education is always close to you.
          </p>
          <a href="/register"
            className="inline-flex items-center gap-2 bg-white font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
            style={{ color:B }}>
            Enroll Now →
          </a>
        </div>
      </section>

    </div>
  )
}
