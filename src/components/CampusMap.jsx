import { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps"

const B = "#0B73B7"

// Pakistan provinces TopoJSON from Natural Earth
const GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/pakistan/pakistan-provinces.json"

const CITIES = [
  { id:"karachi",     name:"Karachi",      campuses:14, coords:[67.01, 24.86] },
  { id:"hyderabad",   name:"Hyderabad",    campuses:3,  coords:[68.37, 25.39] },
  { id:"sukkur",      name:"Sukkur",       campuses:1,  coords:[68.87, 27.70] },
  { id:"ghotki",      name:"Ghotki",       campuses:1,  coords:[69.31, 28.00] },
  { id:"quetta",      name:"Quetta",       campuses:1,  coords:[66.99, 30.18] },
  { id:"turbat",      name:"Turbat",       campuses:1,  coords:[63.04, 26.00] },
  { id:"multan",      name:"Multan",       campuses:1,  coords:[71.47, 30.19] },
  { id:"faisalabad",  name:"Faisalabad",   campuses:1,  coords:[73.09, 31.42] },
  { id:"gujranwala",  name:"Gujranwala",   campuses:1,  coords:[74.19, 32.16] },
  { id:"rawalpindi",  name:"Rawalpindi",   campuses:1,  coords:[73.06, 33.60] },
  { id:"islamabad",   name:"Islamabad",    campuses:1,  coords:[73.04, 33.72] },
  { id:"peshawar",    name:"Peshawar",     campuses:1,  coords:[71.54, 34.01] },
  { id:"lakkimarwat", name:"Lakki Marwat", campuses:1,  coords:[70.91, 32.61] },
]

export default function CampusMap() {
  const [selected, setSelected] = useState(null)
  const [hovered,  setHovered]  = useState(null)

  return (
    <section className="py-16 px-4" style={{background:"linear-gradient(180deg,#f0f8ff 0%,#e8f4fc 100%)"}}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4" style={{background:B}}>Join the revolution</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Find Saylani Campuses Near You</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">Campuses of Saylani Welfare Trust are located in various cities across Pakistan. Select your city and view the nearest campus details.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center:[69.5, 29.5], scale: 1600 }}
              style={{width:"100%", height:"auto"}}
              height={480}>
              <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map(geo => (
                      <Geography key={geo.rsmKey} geography={geo}
                        fill="#dbeafe" stroke="#0B73B7" strokeWidth={0.8}
                        style={{
                          default:{ outline:"none" },
                          hover:  { fill:"#bfdbfe", outline:"none" },
                          pressed:{ outline:"none" },
                        }}/>
                    ))
                  }
                </Geographies>
                {CITIES.map(city => {
                  const active = selected?.id===city.id || hovered===city.id
                  return (
                    <Marker key={city.id} coordinates={city.coords}
                      onClick={()=>setSelected(selected?.id===city.id?null:city)}
                      onMouseEnter={()=>setHovered(city.id)}
                      onMouseLeave={()=>setHovered(null)}
                      style={{cursor:"pointer"}}>
                      {active && (
                        <circle r="14" fill={B} opacity="0.15">
                          <animate attributeName="r" values="10;18;10" dur="1.5s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.2;0;0.2" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                      )}
                      <path d="M 0 0 C 0 0 -7 -12 -7 -17 A 7 7 0 1 1 7 -17 C 7 -12 0 0 0 0 Z"
                        fill={active?B:"#fff"} stroke={B} strokeWidth="1.5"
                        style={{filter:active?`drop-shadow(0 2px 5px ${B}88)`:"none",transition:"all .2s"}}/>
                      <circle cy="-17" r="3" fill={active?"#fff":B} style={{transition:"all .2s"}}/>
                      <text y="10" textAnchor="middle" fontSize="5.5" fontWeight="700"
                        fill={active?B:"#1e3a5f"} style={{userSelect:"none",pointerEvents:"none"}}>
                        {city.name}
                      </text>
                    </Marker>
                  )
                })}
            </ComposableMap>
          </div>
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50" style={{background:"linear-gradient(135deg,#e8f4fc,#fff)"}}>
                <p className="font-extrabold text-gray-800">SMIT Campuses</p>
                <p className="text-xs text-gray-400 mt-0.5">{CITIES.reduce((a,c)=>a+c.campuses,0)} campuses across Pakistan</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {CITIES.map(city=>(
                  <button key={city.id} onClick={()=>setSelected(selected?.id===city.id?null:city)}
                    className="w-full flex items-center justify-between px-5 py-3 text-left transition-all duration-200 hover:bg-blue-50"
                    style={selected?.id===city.id?{background:"#e8f4fc"}:{}}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={selected?.id===city.id?{background:B}:{background:"#e8f4fc"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={selected?.id===city.id?"#fff":B} strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-semibold" style={{color:selected?.id===city.id?B:"#1f2937"}}>{city.name}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{background:selected?.id===city.id?B:"#e8f4fc",color:selected?.id===city.id?"#fff":B}}>
                      {city.campuses} {city.campuses===1?"Campus":"Campuses"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {selected && (
              <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm" style={{border:`1.5px solid ${B}33`}}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:B}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900">{selected.name}</p>
                    <p className="text-xs font-semibold" style={{color:B}}>{selected.campuses} {selected.campuses===1?"Campus":"Campuses"}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">SMIT has {selected.campuses} active {selected.campuses===1?"campus":"campuses"} in {selected.name} offering free IT courses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}