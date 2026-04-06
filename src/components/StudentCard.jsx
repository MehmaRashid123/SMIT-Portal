import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import smitLogo from '../assets/smit logo.png'
import saylaniLogo from '../assets/saylani_logo.webp'

const B = '#0B73B7'

export default function StudentCard({ student, course, enrollment }) {
  const canvasRef = useRef(null)

  const qrData = JSON.stringify({
    id:        student?.id,
    cnic:      student?.cnic,
    roll:      student?.roll_number,
    name:      student?.name,
    course_id: course?.id,
    course:    course?.name,
  })

  const downloadCard = () => {
    // Use the QR canvas directly + build card on a canvas
    const cardCanvas = document.createElement('canvas')
    const W = 680, H = 420
    cardCanvas.width  = W
    cardCanvas.height = H
    const ctx = cardCanvas.getContext('2d')

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0B73B7')
    grad.addColorStop(1, '#0a5a8f')
    ctx.fillStyle = grad
    roundRect(ctx, 0, 0, W, H, 24)
    ctx.fill()

    // Header strip
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, 0, 0, W, 72, 0)
    ctx.fill()

    // Header text
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('STUDENT ID CARD', W - 20, 30, 260)
    ctx.font = '13px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('Saylani Mass IT Training', W - 20, 52, 260)

    // Student info
    const infoX = 200
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(student?.name || 'Student Name', infoX, 120)

    const fields = [
      ['Roll No', student?.roll_number || '—'],
      ['CNIC',    student?.cnic || '—'],
      ['Course',  course?.name || '—'],
      ['Campus',  enrollment?.campus || 'Main Campus'],
      ['Batch',   enrollment?.batch || '—'],
    ]
    fields.forEach(([label, val], i) => {
      const y = 150 + i * 26
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText(label + ':', infoX, y)
      ctx.fillStyle = '#fff'
      ctx.font = '13px sans-serif'
      ctx.fillText(val, infoX + 70, y)
    })

    // QR white box
    ctx.fillStyle = '#fff'
    roundRect(ctx, W - 180, H - 170, 160, 150, 12)
    ctx.fill()

    // Draw QR from canvas element
    const qrCanvas = canvasRef.current?.querySelector('canvas')
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, W - 170, H - 162, 130, 130)
    }

    // Bottom strip
    const stripGrad = ctx.createLinearGradient(0, H - 8, W, H - 8)
    stripGrad.addColorStop(0, '#0a9e6e')
    stripGrad.addColorStop(1, '#0B73B7')
    ctx.fillStyle = stripGrad
    ctx.fillRect(0, H - 8, W, 8)

    // Photo placeholder or image
    if (student?.picture_url) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.save()
        roundRect(ctx, 28, 90, 144, 176, 12)
        ctx.clip()
        ctx.drawImage(img, 28, 90, 144, 176)
        ctx.restore()
        triggerDownload(cardCanvas, student)
      }
      img.onerror = () => {
        drawPhotoPlaceholder(ctx)
        triggerDownload(cardCanvas, student)
      }
      img.src = student.picture_url
    } else {
      drawPhotoPlaceholder(ctx)
      triggerDownload(cardCanvas, student)
    }
  }

  const drawPhotoPlaceholder = (ctx) => {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    roundRect(ctx, 28, 90, 144, 176, 12)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 3
    roundRect(ctx, 28, 90, 144, 176, 12)
    ctx.stroke()
    // person icon
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.arc(100, 148, 28, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(100, 210, 38, 28, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const triggerDownload = (canvas, student) => {
    const link = document.createElement('a')
    link.download = `SMIT-ID-${student?.roll_number || 'student'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual card preview */}
      <div style={{
        width: 340, background:'linear-gradient(145deg,#0B73B7 0%,#0a5a8f 100%)',
        borderRadius: 16, overflow:'hidden', fontFamily:'sans-serif',
        boxShadow:'0 20px 60px rgba(11,115,183,.35)',
      }}>
        {/* Header */}
        <div style={{ background:'rgba(255,255,255,.12)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <img src={smitLogo} alt="SMIT" style={{ height:30, objectFit:'contain' }} crossOrigin="anonymous" />
          <div style={{ textAlign:'right' }}>
            <p style={{ color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', margin:0 }}>Student ID Card</p>
            <p style={{ color:'rgba(255,255,255,.7)', fontSize:8, margin:0 }}>Saylani Mass IT Training</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
          {/* Photo */}
          <div style={{ flexShrink:0 }}>
            {student?.picture_url ? (
              <img src={student.picture_url} alt="student" crossOrigin="anonymous"
                style={{ width:68, height:84, objectFit:'cover', borderRadius:8, border:'2px solid rgba(255,255,255,.3)' }} />
            ) : (
              <div style={{ width:68, height:84, borderRadius:8, background:'rgba(255,255,255,.15)', border:'2px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:'#fff', fontWeight:800, fontSize:13, lineHeight:1.2, marginBottom:6 }}>{student?.name || 'Student Name'}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {[
                ['Roll No', student?.roll_number || '—'],
                ['CNIC',    student?.cnic || '—'],
                ['Course',  course?.name || '—'],
                ['Campus',  enrollment?.campus || 'Main Campus'],
                ['Batch',   enrollment?.batch || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', gap:4 }}>
                  <span style={{ color:'rgba(255,255,255,.6)', fontSize:8, fontWeight:600, width:38, flexShrink:0 }}>{label}:</span>
                  <span style={{ color:'#fff', fontSize:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR */}
        <div ref={canvasRef} style={{ background:'#fff', margin:'0 12px 12px', borderRadius:8, padding:'8px', display:'flex', alignItems:'center', gap:10 }}>
          <QRCodeCanvas value={qrData} size={68} level="H" />
          <div>
            <p style={{ color:B, fontWeight:800, fontSize:10, margin:0 }}>Scan for Attendance</p>
            <p style={{ color:'#6b7280', fontSize:8, marginTop:2 }}>SMIT Connect Portal</p>
            <p style={{ color:'#9ca3af', fontSize:7, marginTop:3 }}>{new Date().getFullYear()} — {new Date().getFullYear()+1}</p>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ background:'linear-gradient(90deg,#0a9e6e,#0B73B7)', height:5 }} />
      </div>

      {/* Download */}
      <button onClick={downloadCard} style={{ background:B }}
        className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download ID Card
      </button>
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
