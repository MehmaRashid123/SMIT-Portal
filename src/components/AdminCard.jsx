import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import smitLogo from '../assets/smit logo.png'

const B = '#0B73B7'

export default function AdminCard({ admin }) {
  const cardRef = useRef(null)

  const qrData = JSON.stringify({
    id:       admin?.id,
    username: admin?.username,
    name:     admin?.name,
    role:     'admin',
    portal:   'SMIT Connect',
  })

  const downloadCard = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null })
    const link = document.createElement('a')
    link.download = `SMIT-Admin-${admin?.username || 'admin'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={cardRef}
        style={{
          width: 340,
          background: 'linear-gradient(145deg,#1e1b4b 0%,#312e81 100%)',
          borderRadius: 16, overflow: 'hidden', fontFamily: 'sans-serif',
          boxShadow: '0 20px 60px rgba(49,46,129,.4)',
        }}>

        {/* Header */}
        <div style={{ background: 'rgba(255,255,255,.1)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src={smitLogo} alt="SMIT" style={{ height: 32, objectFit: 'contain' }} />
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Admin ID Card</p>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 9 }}>SMIT Connect Portal</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: '3px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>
              {(admin?.name || admin?.username || 'A').charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{admin?.name || 'Admin'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                ['Username', admin?.username || '—'],
                ['Role',     'System Administrator'],
                ['Access',   'Full System Control'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: 6 }}>
                  <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 9, fontWeight: 600, width: 50, flexShrink: 0 }}>{label}:</span>
                  <span style={{ color: '#fff', fontSize: 9 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR */}
        <div style={{ background: '#fff', margin: '0 14px 14px', borderRadius: 10, padding: '10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <QRCodeSVG value={qrData} size={72} level="H" />
          <div>
            <p style={{ color: '#1e1b4b', fontWeight: 800, fontSize: 11 }}>Admin Access Card</p>
            <p style={{ color: '#6b7280', fontSize: 9, marginTop: 2 }}>SMIT Connect Portal</p>
            <p style={{ color: '#9ca3af', fontSize: 8, marginTop: 4 }}>{new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ background: 'linear-gradient(90deg,#7c3aed,#0B73B7)', height: 6 }} />
      </div>

      <button onClick={downloadCard} style={{ background: '#312e81' }}
        className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download Admin Card
      </button>
    </div>
  )
}
