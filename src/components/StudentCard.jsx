import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import smitLogo    from '../assets/smit logo.png'
import saylaniLogo from '../assets/saylani_logo.webp'

const B = '#0B73B7'
const G = '#0a9e6e'

export default function StudentCard({ student, course, enrollment }) {
  const qrRef = useRef(null)

  const qrData = JSON.stringify({
    id:        student?.id,
    cnic:      student?.cnic,
    roll:      student?.roll_number,
    name:      student?.name,
    course_id: course?.id,
    course:    course?.name,
  })

  const downloadCard = () => {
    const canvas = document.createElement('canvas')
    // Portrait A6-ish: 400 wide, 560 tall (front) + 560 tall (back) = 1120 total
    const W = 800, H = 560
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    const drawCard = (offsetX, side) => {
      const cw = W / 2 - 10
      const ch = H

      // White background
      ctx.fillStyle = '#fff'
      roundRect(ctx, offsetX, 0, cw, ch, 12)
      ctx.fill()

      // Top blue bar
      ctx.fillStyle = B
      roundRect(ctx, offsetX, 0, cw, 70, 12)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillRect(offsetX, 50, cw, 20)

      // Green corner triangles
      ctx.fillStyle = G
      ctx.beginPath()
      ctx.moveTo(offsetX, ch - 40)
      ctx.lineTo(offsetX, ch)
      ctx.lineTo(offsetX + 60, ch)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(offsetX + cw, ch - 40)
      ctx.lineTo(offsetX + cw, ch)
      ctx.lineTo(offsetX + cw - 60, ch)
      ctx.closePath()
      ctx.fill()

      // Blue corner triangles (top right)
      ctx.fillStyle = B
      ctx.beginPath()
      ctx.moveTo(offsetX + cw - 40, 0)
      ctx.lineTo(offsetX + cw, 0)
      ctx.lineTo(offsetX + cw, 40)
      ctx.closePath()
      ctx.fill()

      if (side === 'front') {
        // SMIT Logo text
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 22px sans-serif'
        ctx.fillText('SMiT', offsetX + 20, 42)

        // "SAYLANI MASS IT TRAINING PROGRAM" box
        ctx.fillStyle = B
        ctx.fillRect(offsetX + 20, 80, cw - 40, 32)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('SAYLANI MASS IT TRAINING PROGRAM', offsetX + cw/2, 100)
        ctx.textAlign = 'left'

        // Photo
        const photoX = offsetX + cw/2 - 45
        const photoY = 125
        const photoW = 90
        const photoH = 110

        if (student?.picture_url) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.save()
            roundRect(ctx, photoX, photoY, photoW, photoH, 4)
            ctx.clip()
            ctx.drawImage(img, photoX, photoY, photoW, photoH)
            ctx.restore()
            // Border
            ctx.strokeStyle = '#ccc'
            ctx.lineWidth = 1
            roundRect(ctx, photoX, photoY, photoW, photoH, 4)
            ctx.stroke()
            triggerDownload(canvas, student)
          }
          img.onerror = () => { drawPhotoBox(ctx, photoX, photoY, photoW, photoH); triggerDownload(canvas, student) }
          img.src = student.picture_url
        } else {
          drawPhotoBox(ctx, photoX, photoY, photoW, photoH)
        }

        // Name
        ctx.fillStyle = '#111'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        const name = student?.name || 'Student Name'
        ctx.fillText(name.length > 22 ? name.slice(0,22)+'...' : name, offsetX + cw/2, 255)

        // Fields
        const fields = [
          ['S/O', student?.father_name || '—'],
          ['Roll No', student?.roll_number || '—'],
          ['Course', course?.name || '—'],
          ['CNIC', student?.cnic || '—'],
        ]
        ctx.textAlign = 'left'
        fields.forEach(([label, val], i) => {
          const y = 278 + i * 28
          ctx.fillStyle = '#555'
          ctx.font = 'bold 9px sans-serif'
          ctx.fillText(label + ':', offsetX + 20, y)
          ctx.fillStyle = '#111'
          ctx.font = '9px sans-serif'
          const v = String(val)
          ctx.fillText(v.length > 28 ? v.slice(0,28)+'...' : v, offsetX + 70, y)
          // underline
          ctx.strokeStyle = '#ddd'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(offsetX + 20, y + 4)
          ctx.lineTo(offsetX + cw - 20, y + 4)
          ctx.stroke()
        })

        // Signature line
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(offsetX + 20, ch - 55)
        ctx.lineTo(offsetX + 100, ch - 55)
        ctx.stroke()
        ctx.fillStyle = '#555'
        ctx.font = '8px sans-serif'
        ctx.fillText('Signature', offsetX + 20, ch - 45)

      } else {
        // BACK SIDE
        // Lines for info
        const lines = [
          student?.name || '—',
          student?.roll_number || '—',
          course?.name || '—',
          student?.cnic || '—',
        ]
        ctx.fillStyle = '#111'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        lines.forEach((line, i) => {
          const y = 80 + i * 30
          ctx.fillText(line, offsetX + cw/2, y)
          ctx.strokeStyle = '#ccc'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(offsetX + 20, y + 6)
          ctx.lineTo(offsetX + cw - 20, y + 6)
          ctx.stroke()
        })

        // QR code
        const qrCanvas = qrRef.current?.querySelector('canvas')
        if (qrCanvas) {
          const qrSize = 100
          ctx.drawImage(qrCanvas, offsetX + cw/2 - qrSize/2, 210, qrSize, qrSize)
        }

        // Saylani logo text
        ctx.fillStyle = '#555'
        ctx.font = '8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Saylani Welfare International Trust', offsetX + cw/2, ch - 55)

        // Signature line
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(offsetX + cw/2 - 40, ch - 65)
        ctx.lineTo(offsetX + cw/2 + 40, ch - 65)
        ctx.stroke()
        ctx.fillStyle = '#555'
        ctx.font = '8px sans-serif'
        ctx.fillText('Authorized Signature', offsetX + cw/2, ch - 55)
      }
    }

    // Draw front (left half)
    drawCard(0, 'front')
    // Draw back (right half)
    drawCard(W/2 + 10, 'back')

    // Dashed divider
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W/2, 0)
    ctx.lineTo(W/2, H)
    ctx.stroke()
    ctx.setLineDash([])

    if (!student?.picture_url) triggerDownload(canvas, student)
  }

  const drawPhotoBox = (ctx, x, y, w, h) => {
    ctx.fillStyle = '#e5e7eb'
    roundRect(ctx, x, y, w, h, 4)
    ctx.fill()
    ctx.fillStyle = '#9ca3af'
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Photo', x + w/2, y + h/2)
    ctx.textAlign = 'left'
  }

  const triggerDownload = (canvas, student) => {
    const link = document.createElement('a')
    link.download = `SMIT-ID-${student?.roll_number || 'student'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Preview — front card */}
      <div className="flex gap-4 items-start">
        {/* Front */}
        <div style={{
          width:200, background:'#fff', borderRadius:10, overflow:'hidden',
          boxShadow:'0 8px 32px rgba(11,115,183,.2)', border:'1px solid #e5e7eb',
        }}>
          {/* Top bar */}
          <div style={{ background:B, padding:'10px 12px', position:'relative' }}>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>SMiT</p>
            <div style={{ position:'absolute', top:0, right:0, width:20, height:20, background:G, clipPath:'polygon(100% 0,100% 100%,0 0)' }}/>
          </div>
          <div style={{ background:B, margin:'0 12px', padding:'4px 0', textAlign:'center', borderRadius:3 }}>
            <p style={{ color:'#fff', fontSize:7, fontWeight:700, margin:0 }}>SAYLANI MASS IT TRAINING PROGRAM</p>
          </div>

          {/* Photo */}
          <div style={{ display:'flex', justifyContent:'center', margin:'10px 0 6px' }}>
            {student?.picture_url ? (
              <img src={student.picture_url} alt="student"
                style={{ width:70, height:85, objectFit:'cover', borderRadius:4, border:'1px solid #ccc' }} />
            ) : (
              <div style={{ width:70, height:85, background:'#e5e7eb', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Name */}
          <p style={{ textAlign:'center', fontWeight:700, fontSize:10, color:'#111', margin:'0 8px 6px' }}>
            {student?.name || 'Student Name'}
          </p>

          {/* Fields */}
          <div style={{ padding:'0 10px 8px', fontSize:8 }}>
            {[['Roll No', student?.roll_number||'—'],['Course', course?.name||'—'],['CNIC', student?.cnic||'—']].map(([l,v])=>(
              <div key={l} style={{ borderBottom:'0.5px solid #eee', paddingBottom:3, marginBottom:3 }}>
                <span style={{ color:'#555', fontWeight:700 }}>{l}: </span>
                <span style={{ color:'#111' }}>{String(v).slice(0,22)}</span>
              </div>
            ))}
          </div>

          {/* Bottom corners */}
          <div style={{ height:20, background:'#fff', position:'relative' }}>
            <div style={{ position:'absolute', bottom:0, left:0, width:30, height:20, background:G, clipPath:'polygon(0 100%,0 0,100% 100%)' }}/>
            <div style={{ position:'absolute', bottom:0, right:0, width:30, height:20, background:G, clipPath:'polygon(100% 100%,100% 0,0 100%)' }}/>
          </div>
        </div>

        {/* Back */}
        <div style={{
          width:200, background:'#fff', borderRadius:10, overflow:'hidden',
          boxShadow:'0 8px 32px rgba(11,115,183,.2)', border:'1px solid #e5e7eb',
        }}>
          <div style={{ background:B, padding:'10px 12px' }}>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>SMiT</p>
          </div>

          <div style={{ padding:'10px', fontSize:8 }}>
            {[student?.name||'—', student?.roll_number||'—', course?.name||'—', student?.cnic||'—'].map((v,i)=>(
              <div key={i} style={{ borderBottom:'0.5px solid #ccc', paddingBottom:4, marginBottom:4, color:'#111' }}>{v}</div>
            ))}
          </div>

          {/* QR */}
          <div ref={qrRef} style={{ display:'flex', justifyContent:'center', padding:'4px 0' }}>
            <QRCodeCanvas value={qrData} size={80} level="H" />
          </div>

          <div style={{ textAlign:'center', padding:'6px 10px 4px', fontSize:7, color:'#555' }}>
            Saylani Welfare International Trust
          </div>

          {/* Signature line */}
          <div style={{ textAlign:'center', padding:'0 10px 6px' }}>
            <div style={{ borderTop:'1px solid #333', width:80, margin:'0 auto 2px' }}/>
            <p style={{ fontSize:7, color:'#555', margin:0 }}>Authorized Signature</p>
          </div>

          <div style={{ height:20, background:'#fff', position:'relative' }}>
            <div style={{ position:'absolute', bottom:0, left:0, width:30, height:20, background:G, clipPath:'polygon(0 100%,0 0,100% 100%)' }}/>
            <div style={{ position:'absolute', bottom:0, right:0, width:30, height:20, background:G, clipPath:'polygon(100% 100%,100% 0,0 100%)' }}/>
          </div>
        </div>
      </div>

      <button onClick={downloadCard} style={{ background:B }}
        className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Download ID Card (Front + Back)
      </button>
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y)
  ctx.quadraticCurveTo(x+w, y, x+w, y+r)
  ctx.lineTo(x+w, y+h-r)
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h)
  ctx.quadraticCurveTo(x, y+h, x, y+h-r)
  ctx.lineTo(x, y+r)
  ctx.quadraticCurveTo(x, y, x+r, y)
  ctx.closePath()
}
