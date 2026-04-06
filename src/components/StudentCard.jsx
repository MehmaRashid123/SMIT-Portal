import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const B = '#0B73B7'
const G = '#0a9e6e'

export default function StudentCard({ student, course, enrollment }) {
  const qrRef    = useRef(null)
  const cardRef  = useRef(null)

  const qrData = JSON.stringify({
    id:        student?.id,
    cnic:      student?.cnic,
    roll:      student?.roll_number,
    name:      student?.name,
    course_id: course?.id,
    course:    course?.name,
  })

  // ── build canvas (shared by PNG + PDF) ──────────────────────────────────
  const buildCanvas = () => new Promise((resolve) => {
    const SCALE = 3          // 3x for crisp print quality
    const W = 800, H = 560
    const canvas = document.createElement('canvas')
    canvas.width  = W * SCALE
    canvas.height = H * SCALE
    const ctx = canvas.getContext('2d')
    ctx.scale(SCALE, SCALE)  // all drawing coords stay the same

    const drawCard = (offsetX, side) => {
      const cw = W / 2 - 10, ch = H
      ctx.fillStyle = '#fff'; roundRect(ctx, offsetX, 0, cw, ch, 12); ctx.fill()
      ctx.fillStyle = B;      roundRect(ctx, offsetX, 0, cw, 70, 12); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.fillRect(offsetX, 50, cw, 20)
      ctx.fillStyle = G
      ctx.beginPath(); ctx.moveTo(offsetX, ch-40); ctx.lineTo(offsetX, ch); ctx.lineTo(offsetX+60, ch); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(offsetX+cw, ch-40); ctx.lineTo(offsetX+cw, ch); ctx.lineTo(offsetX+cw-60, ch); ctx.closePath(); ctx.fill()
      ctx.fillStyle = B
      ctx.beginPath(); ctx.moveTo(offsetX+cw-40, 0); ctx.lineTo(offsetX+cw, 0); ctx.lineTo(offsetX+cw, 40); ctx.closePath(); ctx.fill()

      if (side === 'front') {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.fillText('SMiT', offsetX+20, 42)
        ctx.fillStyle = B; ctx.fillRect(offsetX+20, 80, cw-40, 32)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('SAYLANI MASS IT TRAINING PROGRAM', offsetX+cw/2, 100); ctx.textAlign = 'left'
        const photoX = offsetX+cw/2-45, photoY = 125, photoW = 90, photoH = 110
        const drawRest = () => {
          ctx.fillStyle = '#111'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'
          const name = student?.name || 'Student Name'
          ctx.fillText(name.length>22?name.slice(0,22)+'...':name, offsetX+cw/2, 255)
          const fields = [['S/O',student?.father_name||'—'],['Roll No',student?.roll_number||'—'],['Course',course?.name||'—'],['CNIC',student?.cnic||'—']]
          ctx.textAlign = 'left'
          fields.forEach(([label,val],i) => {
            const y = 278+i*28
            ctx.fillStyle='#555'; ctx.font='bold 9px sans-serif'; ctx.fillText(label+':', offsetX+20, y)
            ctx.fillStyle='#111'; ctx.font='9px sans-serif'
            const v = String(val); ctx.fillText(v.length>28?v.slice(0,28)+'...':v, offsetX+70, y)
            ctx.strokeStyle='#ddd'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(offsetX+20,y+4); ctx.lineTo(offsetX+cw-20,y+4); ctx.stroke()
          })
          ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(offsetX+20,ch-55); ctx.lineTo(offsetX+100,ch-55); ctx.stroke()
          ctx.fillStyle='#555'; ctx.font='8px sans-serif'; ctx.fillText('Signature', offsetX+20, ch-45)
        }
        if (student?.picture_url) {
          const img = new Image(); img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.save(); roundRect(ctx,photoX,photoY,photoW,photoH,4); ctx.clip()
            ctx.drawImage(img,photoX,photoY,photoW,photoH); ctx.restore()
            ctx.strokeStyle='#ccc'; ctx.lineWidth=1; roundRect(ctx,photoX,photoY,photoW,photoH,4); ctx.stroke()
            drawRest()
          }
          img.onerror = () => { drawPhotoBox(ctx,photoX,photoY,photoW,photoH); drawRest() }
          img.src = student.picture_url
        } else { drawPhotoBox(ctx,photoX,photoY,photoW,photoH); drawRest() }
      } else {
        const lines = [student?.name||'—',student?.roll_number||'—',course?.name||'—',student?.cnic||'—']
        ctx.fillStyle='#111'; ctx.font='10px sans-serif'; ctx.textAlign='center'
        lines.forEach((line,i) => {
          const y = 80+i*30; ctx.fillText(line, offsetX+cw/2, y)
          ctx.strokeStyle='#ccc'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(offsetX+20,y+6); ctx.lineTo(offsetX+cw-20,y+6); ctx.stroke()
        })

        // Draw QR — use the hidden high-res QR canvas (300px)
        const qrCanvas = qrRef.current?.querySelector('canvas')
        if (qrCanvas) {
          const qrSize = 130
          ctx.imageSmoothingEnabled = false  // keep QR pixels sharp
          ctx.drawImage(qrCanvas, offsetX+cw/2-qrSize/2, 200, qrSize, qrSize)
        }

        ctx.fillStyle='#555'; ctx.font='8px sans-serif'; ctx.textAlign='center'
        ctx.fillText('Saylani Welfare International Trust', offsetX+cw/2, ch-55)
        ctx.strokeStyle='#333'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(offsetX+cw/2-40,ch-65); ctx.lineTo(offsetX+cw/2+40,ch-65); ctx.stroke()
        ctx.fillText('Authorized Signature', offsetX+cw/2, ch-55)
      }
    }

    drawCard(0, 'front')
    drawCard(W/2+10, 'back')
    ctx.setLineDash([4,4]); ctx.strokeStyle='#ccc'; ctx.lineWidth=1
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([])

    // Wait for async image loads
    setTimeout(() => resolve(canvas), student?.picture_url ? 600 : 50)
  })

  const downloadPNG = async () => {
    const canvas = await buildCanvas()
    const link = document.createElement('a')
    link.download = `SMIT-ID-${student?.roll_number||'student'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadPDF = async () => {
    const canvas = await buildCanvas()
    const { jsPDF } = await import('jspdf')
    // A4 landscape fits both cards side by side nicely
    const pdf = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgData = canvas.toDataURL('image/png')
    // Center on page with margin
    const margin = 10
    const imgW = pageW - margin * 2
    const imgH = (canvas.height / canvas.width) * imgW
    const y = (pageH - imgH) / 2
    pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH)
    pdf.save(`SMIT-ID-${student?.roll_number||'student'}.pdf`)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 items-start flex-wrap justify-center">
        {/* Front */}
        <div style={{ width:200, background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 8px 32px rgba(11,115,183,.2)', border:'1px solid #e5e7eb' }}>
          <div style={{ background:B, padding:'10px 12px', position:'relative' }}>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>SMiT</p>
            <div style={{ position:'absolute', top:0, right:0, width:20, height:20, background:G, clipPath:'polygon(100% 0,100% 100%,0 0)' }}/>
          </div>
          <div style={{ background:B, margin:'0 12px', padding:'4px 0', textAlign:'center', borderRadius:3 }}>
            <p style={{ color:'#fff', fontSize:7, fontWeight:700, margin:0 }}>SAYLANI MASS IT TRAINING PROGRAM</p>
          </div>
          <div style={{ display:'flex', justifyContent:'center', margin:'10px 0 6px' }}>
            {student?.picture_url
              ? <img src={student.picture_url} alt="student" style={{ width:70, height:85, objectFit:'cover', borderRadius:4, border:'1px solid #ccc' }}/>
              : <div style={{ width:70, height:85, background:'#e5e7eb', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>}
          </div>
          <p style={{ textAlign:'center', fontWeight:700, fontSize:10, color:'#111', margin:'0 8px 6px' }}>{student?.name||'Student Name'}</p>
          <div style={{ padding:'0 10px 8px', fontSize:8 }}>
            {[['Roll No',student?.roll_number||'—'],['Course',course?.name||'—'],['CNIC',student?.cnic||'—']].map(([l,v])=>(
              <div key={l} style={{ borderBottom:'0.5px solid #eee', paddingBottom:3, marginBottom:3 }}>
                <span style={{ color:'#555', fontWeight:700 }}>{l}: </span>
                <span style={{ color:'#111' }}>{String(v).slice(0,22)}</span>
              </div>
            ))}
          </div>
          <div style={{ height:20, background:'#fff', position:'relative' }}>
            <div style={{ position:'absolute', bottom:0, left:0, width:30, height:20, background:G, clipPath:'polygon(0 100%,0 0,100% 100%)' }}/>
            <div style={{ position:'absolute', bottom:0, right:0, width:30, height:20, background:G, clipPath:'polygon(100% 100%,100% 0,0 100%)' }}/>
          </div>
        </div>

        {/* Back */}
        <div style={{ width:200, background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 8px 32px rgba(11,115,183,.2)', border:'1px solid #e5e7eb' }}>
          <div style={{ background:B, padding:'10px 12px' }}>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0 }}>SMiT</p>
          </div>
          <div style={{ padding:'10px', fontSize:8 }}>
            {[student?.name||'—',student?.roll_number||'—',course?.name||'—',student?.cnic||'—'].map((v,i)=>(
              <div key={i} style={{ borderBottom:'0.5px solid #ccc', paddingBottom:4, marginBottom:4, color:'#111' }}>{v}</div>
            ))}
          </div>
          {/* QR — high-res hidden (for download), small visible (for preview) */}
          <div style={{ display:'flex', justifyContent:'center', padding:'4px 0', position:'relative' }}>
            <QRCodeCanvas value={qrData} size={80} level="H" includeMargin={true}/>
            {/* Hidden high-res QR for canvas drawing */}
            <div ref={qrRef} style={{ position:'absolute', opacity:0, pointerEvents:'none', left:'-9999px' }}>
              <QRCodeCanvas value={qrData} size={300} level="H" includeMargin={true}/>
            </div>
          </div>
          <div style={{ textAlign:'center', padding:'6px 10px 4px', fontSize:7, color:'#555' }}>Saylani Welfare International Trust</div>
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

      {/* Download buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={downloadPDF} style={{ background:B }}
          className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Download PDF
        </button>
        <button onClick={downloadPNG}
          className="flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-sm border-2 transition-opacity hover:opacity-80"
          style={{ borderColor:B, color:B }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Download PNG
        </button>
      </div>
    </div>
  )
}

function drawPhotoBox(ctx, x, y, w, h) {
  ctx.fillStyle = '#e5e7eb'; roundRect(ctx, x, y, w, h, 4); ctx.fill()
  ctx.fillStyle = '#9ca3af'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('Photo', x+w/2, y+h/2); ctx.textAlign = 'left'
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y)
  ctx.quadraticCurveTo(x+w, y, x+w, y+r); ctx.lineTo(x+w, y+h-r)
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h); ctx.lineTo(x+r, y+h)
  ctx.quadraticCurveTo(x, y+h, x, y+h-r); ctx.lineTo(x, y+r)
  ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath()
}


