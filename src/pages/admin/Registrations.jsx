import { useEffect, useState } from "react"
import AdminLayout from "../../components/AdminLayout"
import Modal from "../../components/Modal"
import { supabase } from "../../lib/supabaseClient"
import { sendTestScheduleEmail } from "../../lib/emailService"
import toast from "react-hot-toast"

const B = "#0B73B7"
const STATUS_COLORS = { pending:"bg-yellow-100 text-yellow-700", approved:"bg-green-100 text-green-700", rejected:"bg-red-100 text-red-500" }

export default function AdminRegistrations() {
  const [regs,setRegs]=useState([])
  const [loading,setLoading]=useState(true)
  const [selected,setSelected]=useState(null)
  const [updating,setUpdating]=useState(false)
  const [filter,setFilter]=useState("all")
  const [approveModal,setApproveModal]=useState(null)   // single approve
  const [testDate,setTestDate]=useState("")
  const [sendingEmail,setSendingEmail]=useState(false)

  // bulk selection
  const [checkedIds,setCheckedIds]=useState([])
  const [bulkModal,setBulkModal]=useState(false)
  const [bulkDate,setBulkDate]=useState("")
  const [bulkProgress,setBulkProgress]=useState(null) // {done,total}

  useEffect(()=>{fetchRegs()},[])

  const fetchRegs=async()=>{
    setLoading(true)
    const{data,error}=await supabase.from("registrations").select("*,courses(name)").order("created_at",{ascending:false})
    setLoading(false)
    if(!error)setRegs(data||[])
  }

  // ── single approve ──────────────────────────────────────────────────────────
  const handleApprove=async()=>{
    if(!testDate){toast.error("Please set a test date");return}
    const reg=approveModal
    setUpdating(true)

    const{error:updateErr}=await supabase.from("registrations").update({status:"approved",test_date:testDate}).eq("id",reg.id)
    if(updateErr){
      toast.error("Update failed: "+updateErr.message+" — Check Supabase RLS policy for registrations table")
      setUpdating(false);return
    }

    let roll=null
    const{data:existing}=await supabase.from("students").select("id,roll_number").eq("cnic",reg.id_number).single()
    if(!existing){
      roll=`SMIT-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`
      const{error:insertErr}=await supabase.from("students").insert([{name:reg.full_name,cnic:reg.id_number,roll_number:roll,phone:reg.phone}])
      if(insertErr)console.error("Student insert error:",insertErr.message)
      await supabase.from("registrations").update({roll_number:roll}).eq("id",reg.id)
    }else{roll=existing.roll_number}

    setSendingEmail(true)
    if(reg.email){
      const r=await sendTestScheduleEmail({toEmail:reg.email,toName:reg.full_name,testDate,courseName:reg.courses?.name||"SMIT Course"})
      if(r.success){await supabase.from("registrations").update({test_email_sent:true}).eq("id",reg.id);toast.success("Approved! Email sent. Roll: "+roll)}
      else toast.success("Approved! Roll: "+roll+" (Email failed)")
    }else{toast.success("Approved! Roll: "+roll+" (No email on file)")}

    setSendingEmail(false);setUpdating(false)
    setRegs(r=>r.map(x=>x.id===reg.id?{...x,status:"approved",test_date:testDate,roll_number:roll}:x))
    setApproveModal(null);setTestDate("")
    if(selected?.id===reg.id)setSelected(s=>({...s,status:"approved",test_date:testDate,roll_number:roll}))
  }

  const handleReject=async(id)=>{
    setUpdating(true)
    const{error:rejectErr}=await supabase.from("registrations").update({status:"rejected"}).eq("id",id)
    if(rejectErr){toast.error("Reject failed: "+rejectErr.message);setUpdating(false);return}
    setUpdating(false);toast.success("Rejected")
    setRegs(r=>r.map(x=>x.id===id?{...x,status:"rejected"}:x))
    if(selected?.id===id)setSelected(s=>({...s,status:"rejected"}))
  }

  // ── bulk approve ────────────────────────────────────────────────────────────
  const pendingFiltered = filter==="all"?regs.filter(r=>r.status==="pending"||!r.status):regs.filter(r=>(r.status===filter)||(filter==="pending"&&!r.status))

  const toggleCheck=(id)=>setCheckedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const toggleAll=()=>{
    const pendingIds=filtered.filter(r=>r.status==="pending"||!r.status).map(r=>r.id)
    setCheckedIds(p=>p.length===pendingIds.length?[]:pendingIds)
  }

  const handleBulkApprove=async()=>{
    if(!bulkDate){toast.error("Please set a test date");return}
    const targets=regs.filter(r=>checkedIds.includes(r.id))
    setBulkProgress({done:0,total:targets.length})
    let successCount=0
    for(let i=0;i<targets.length;i++){
      const reg=targets[i]
      try{
        await supabase.from("registrations").update({status:"approved",test_date:bulkDate}).eq("id",reg.id)
        let roll=null
        const{data:existing}=await supabase.from("students").select("id,roll_number").eq("cnic",reg.id_number).single()
        if(!existing){
          roll=`SMIT-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`
          await supabase.from("students").insert([{name:reg.full_name,cnic:reg.id_number,roll_number:roll,phone:reg.phone}])
          await supabase.from("registrations").update({roll_number:roll}).eq("id",reg.id)
        }else{roll=existing.roll_number}
        if(reg.email){
          const r=await sendTestScheduleEmail({toEmail:reg.email,toName:reg.full_name,testDate:bulkDate,courseName:reg.courses?.name||"SMIT Course"})
          if(r.success)await supabase.from("registrations").update({test_email_sent:true}).eq("id",reg.id)
        }
        setRegs(prev=>prev.map(x=>x.id===reg.id?{...x,status:"approved",test_date:bulkDate,roll_number:roll}:x))
        successCount++
      }catch(e){console.error("Bulk approve error for",reg.id,e)}
      setBulkProgress({done:i+1,total:targets.length})
    }
    toast.success(`${successCount} applications approved!`)
    setBulkModal(false);setBulkDate("");setCheckedIds([]);setBulkProgress(null)
  }

  const filtered=filter==="all"?regs:regs.filter(r=>r.status===filter)
  const pendingInView=filtered.filter(r=>r.status==="pending"||!r.status)
  const allPendingChecked=pendingInView.length>0&&pendingInView.every(r=>checkedIds.includes(r.id))

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Registrations</h1>
            <p className="text-sm text-gray-400 mt-0.5">{regs.length} total applications</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {checkedIds.length>0&&(
              <button onClick={()=>setBulkModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
                style={{background:"#0e9f6e"}}>
                ✓ Approve ({checkedIds.length})
              </button>
            )}
            {["all","pending","approved","rejected"].map(f=>(
              <button key={f} onClick={()=>{setFilter(f);setCheckedIds([])}}
                className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                style={filter===f?{background:B,color:"#fff"}:{background:"#f3f4f6",color:"#6b7280"}}>
                {f} ({f==="all"?regs.length:regs.filter(r=>r.status===f||(f==="pending"&&!r.status)).length})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {label:"Pending",val:regs.filter(r=>r.status==="pending"||!r.status).length,color:"#f59e0b"},
            {label:"Approved",val:regs.filter(r=>r.status==="approved").length,color:"#0e9f6e"},
            {label:"Rejected",val:regs.filter(r=>r.status==="rejected").length,color:"#ef4444"},
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold" style={{color:s.color}}>{s.val}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {loading?<div className="text-center py-20 text-gray-400">Loading...</div>:(
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 w-10">
                    {pendingInView.length>0&&(
                      <input type="checkbox" checked={allPendingChecked} onChange={toggleAll}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"/>
                    )}
                  </th>
                  {["Name","CNIC","Course","Email","Test Date","Status","Action"].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0?<tr><td colSpan={8} className="text-center py-12 text-gray-400">No registrations.</td></tr>
                :filtered.map(r=>{
                  const isPending=r.status==="pending"||!r.status
                  return(
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {isPending&&(
                        <input type="checkbox" checked={checkedIds.includes(r.id)} onChange={()=>toggleCheck(r.id)}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"/>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.id_number}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{r.courses?.name||"—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.email||"—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {r.test_date?<span className="font-semibold" style={{color:B}}>{r.test_date}</span>:<span className="text-gray-300">Not set</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={"text-xs px-2.5 py-1 rounded-full font-semibold capitalize "+(STATUS_COLORS[r.status]||"bg-yellow-100 text-yellow-700")}>
                        {r.status||"pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={()=>setSelected(r)} style={{color:B}} className="text-xs font-semibold hover:underline">View</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* ── single detail modal ── */}
      {selected&&(
        <Modal title={"Registration: "+selected.full_name} onClose={()=>setSelected(null)}>
          <div className="space-y-3 text-sm max-h-[65vh] overflow-y-auto pr-1">
            {selected.picture_url&&<div className="flex justify-center mb-2"><img src={selected.picture_url} alt="applicant" className="w-20 h-20 rounded-2xl object-cover border-2" style={{borderColor:B}}/></div>}
            <div className="grid grid-cols-2 gap-2">
              {[["Full Name",selected.full_name],["Father Name",selected.father_name],["CNIC",selected.id_number],["Email",selected.email],["Phone",selected.phone],["Gender",selected.gender],["City",selected.city],["Campus",selected.campus],["Course",selected.courses?.name],["Qualification",selected.qualification],["Has Laptop",selected.has_laptop?"Yes":"No"],["Test Date",selected.test_date||"Not set"],["Roll Number",selected.roll_number||"Not assigned"]].map(([l,v])=>v?(
                <div key={l} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{l}</p>
                  <p className="font-semibold text-gray-800 text-xs mt-0.5">{v}</p>
                </div>
              ):null)}
            </div>
            {selected.status==="approved"&&(
              <div className="p-4 rounded-2xl border-2" style={{background:"#e8f4fc",borderColor:B}}>
                <p className="text-xs font-bold text-blue-800 mb-1">✓ Approved</p>
                {selected.roll_number&&<div className="flex items-center gap-2"><span className="text-xs text-gray-600">Roll:</span><span className="font-extrabold text-lg" style={{color:B}}>{selected.roll_number}</span><button onClick={()=>{navigator.clipboard.writeText(selected.roll_number);toast.success("Copied!")}} className="text-xs text-blue-600 hover:underline">Copy</button></div>}
                {selected.test_date&&<p className="text-xs text-gray-600 mt-1">Test Date: <strong>{selected.test_date}</strong></p>}
              </div>
            )}
            {(selected.status==="pending"||!selected.status)&&(
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button disabled={updating} onClick={()=>{setApproveModal(selected);setSelected(null)}}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{background:"#0e9f6e"}}>
                  ✓ Approve & Set Test Date
                </button>
                <button disabled={updating} onClick={()=>handleReject(selected.id)}
                  className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{background:"#ef4444"}}>
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── single approve modal ── */}
      {approveModal&&(
        <Modal title={"Approve: "+approveModal.full_name} onClose={()=>{setApproveModal(null);setTestDate("")}}>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800 border border-green-100">
              <p className="font-bold mb-1">Approval will:</p>
              <ul className="text-xs space-y-1"><li>✓ Create student account with roll number</li><li>✓ Set entry test date</li><li>✓ Send email notification to student</li></ul>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Entry Test Date *</label>
              <input type="date" required value={testDate} min={new Date().toISOString().split("T")[0]} onChange={e=>setTestDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            {approveModal.email
              ?<div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 border border-blue-100">📧 Email will be sent to: <strong>{approveModal.email}</strong></div>
              :<div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700 border border-yellow-100">⚠️ No email on file</div>}
            <div className="flex gap-3">
              <button onClick={()=>{setApproveModal(null);setTestDate("")}} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button disabled={!testDate||updating||sendingEmail} onClick={handleApprove}
                className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{background:"#0e9f6e"}}>
                {updating||sendingEmail?"Processing...":"✓ Approve & Send Email"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── bulk approve modal ── */}
      {bulkModal&&(
        <Modal title={`Bulk Approve (${checkedIds.length} applications)`} onClose={()=>{if(!bulkProgress){setBulkModal(false);setBulkDate("")}}}>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800 border border-green-100">
              <p className="font-bold mb-1">{checkedIds.length} applications will be approved</p>
              <ul className="text-xs space-y-1"><li>✓ Student accounts created (if not exist)</li><li>✓ Roll numbers assigned</li><li>✓ Emails sent to all applicants with email</li></ul>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Entry Test Date for All *</label>
              <input type="date" required value={bulkDate} min={new Date().toISOString().split("T")[0]} onChange={e=>setBulkDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                onFocus={e=>e.target.style.borderColor=B} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            {bulkProgress&&(
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Processing...</span>
                  <span>{bulkProgress.done}/{bulkProgress.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{background:"#0e9f6e",width:`${(bulkProgress.done/bulkProgress.total)*100}%`}}/>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button disabled={!!bulkProgress} onClick={()=>{setBulkModal(false);setBulkDate("")}} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button disabled={!bulkDate||!!bulkProgress} onClick={handleBulkApprove}
                className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{background:"#0e9f6e"}}>
                {bulkProgress?`Processing ${bulkProgress.done}/${bulkProgress.total}...`:`✓ Approve All ${checkedIds.length}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}
