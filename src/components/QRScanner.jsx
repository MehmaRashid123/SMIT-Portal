import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const B = '#0B73B7'

export default function QRScanner({ onClose }) {
  const videoRef  = useRef(null)
  const readerRef = useRef(null)
  const [scanning, setScanning]   = useState(true)
  const [lastScan, setLastScan]   = useState(null)
  const [marking,  setMarking]    = useState(false)
  const [history,  setHistory]    = useState([])

  useEffect(() => {
    const reader = new BrowserQRCodeReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
      if (result && scanning) {
        setScanning(false)
        const text = result.getText()
        try {
          const data = JSON.parse(text)
          await markAttendance(data)
        } catch {
          toast.error('Invalid QR code')
          setTimeout(() => setScanning(true), 2000)
        }
      }
    }).catch(() => {})

    return () => { try { reader.reset() } catch {} }
  }, [])

  const markAttendance = async (data) => {
    setMarking(true)
    const today = new Date().toISOString().split('T')[0]

    // Check already marked today
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', data.id)
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      toast('Already marked today!', { icon:'ℹ️' })
      setLastScan({ ...data, status:'already', time: new Date().toLocaleTimeString() })
      setMarking(false)
      setTimeout(() => setScanning(true), 2000)
      return
    }

    // Get course_id from enrollment if not in QR
    let courseId = data.course_id
    if (!courseId) {
      const { data: enroll } = await supabase
        .from('enrollments').select('course_id').eq('student_id', data.id).maybeSingle()
      courseId = enroll?.course_id || null
    }

    const { error } = await supabase.from('attendance').insert([{
      student_id: data.id,
      course_id:  courseId,
      date:       today,
      status:     'present',
      marked_by:  'qr',
    }])

    setMarking(false)
    if (error) {
      console.error('Attendance error:', error.message)
      toast.error('Failed: ' + error.message)
    } else {
      toast.success(`✓ ${data.name} — Present!`)
      const record = { ...data, status:'present', time: new Date().toLocaleTimeString() }
      setLastScan(record)
      setHistory(h => [record, ...h.slice(0, 9)])
    }
    setTimeout(() => setScanning(true), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${B},#0d85d4)` }} className="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-extrabold text-lg">QR Attendance Scanner</h2>
            <p className="text-white/70 text-xs mt-0.5">Point camera at student ID card</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Camera */}
        <div className="relative bg-black" style={{ height:280 }}>
          <video ref={videoRef} className="w-full h-full object-cover" />
          {/* scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48">
              {/* corners */}
              {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],
                ['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos,cls],i)=>(
                <div key={i} className={`absolute w-6 h-6 ${pos} ${cls}`} style={{ borderColor:B }} />
              ))}
              {/* scan line */}
              {scanning && (
                <div className="absolute left-0 right-0 h-0.5 animate-bounce" style={{ background:B, top:'50%' }} />
              )}
            </div>
          </div>
          {/* status overlay */}
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                {marking ? (
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ background: lastScan?.status==='already' ? '#f59e0b' : '#0e9f6e' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                )}
                {lastScan && !marking && (
                  <p className="text-white font-bold text-sm">{lastScan.name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Last scan info */}
        {lastScan && (
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3"
            style={{ background: lastScan.status==='already' ? '#fffbeb' : '#f0fdf4' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: lastScan.status==='already' ? '#f59e0b' : '#0e9f6e' }}>
              {lastScan.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{lastScan.name}</p>
              <p className="text-xs text-gray-500">{lastScan.roll} · {lastScan.time}</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full"
              style={lastScan.status==='already'
                ? { background:'#fef3c7', color:'#92400e' }
                : { background:'#dcfce7', color:'#166534' }}>
              {lastScan.status==='already' ? 'Already Marked' : '✓ Present'}
            </span>
          </div>
        )}

        {/* History */}
        <div className="px-5 py-3 max-h-40 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Today's Scans ({history.length})</p>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No scans yet</p>
          ) : history.map((h,i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <p className="text-sm text-gray-700 font-medium">{h.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{h.time}</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
