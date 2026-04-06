import { useState } from 'react'
import PortalLayout from '../../components/PortalLayout'
import QRScanner from '../../components/QRScanner'

const G = '#0e9f6e'
const NAV = [
  { to:'/teacher',             label:'Dashboard',   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:'/teacher/attendance',  label:'Attendance',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to:'/teacher/assignments', label:'Assignments', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { to:'/teacher/quiz',        label:'Quizzes',     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { to:'/teacher/students',    label:'Students',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

export default function ScanAttendance() {
  const [scanning, setScanning] = useState(false)

  return (
    <PortalLayout links={NAV} accentColor={G}>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">QR Attendance</h1>
        <p className="text-sm text-gray-400 mb-8">Scan student ID cards to mark attendance</p>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background:'#e8faf4' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 0V6m0 2v2M3 16h2m0 0v2m0-2h2M7 4h2m0 0V2m0 2v2"/>
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Scan QR Code</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
            Open the scanner and point your camera at the student's ID card QR code to mark attendance instantly.
          </p>
          <button onClick={() => setScanning(true)}
            style={{ background:G }}
            className="text-white font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V6a3 3 0 013-3h3M3 15v3a3 3 0 003 3h3m6-18h3a3 3 0 013 3v3m0 6v3a3 3 0 01-3 3h-3"/>
            </svg>
            Open Scanner
          </button>
        </div>
      </div>
      {scanning && <QRScanner onClose={() => setScanning(false)} />}
    </PortalLayout>
  )
}
