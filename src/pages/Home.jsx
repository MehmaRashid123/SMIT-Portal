import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchCourses } from "../store/slices/coursesSlice"
import CampusMap from "../components/CampusMap"
import saylaniLogo    from "../assets/saylani_logo.webp"
import upArrow        from "../assets/up_arrow.webp"
import globeIcon      from "../assets/globe_icon.webp"
import laptopIcon     from "../assets/laptop_icon.webp"
import maleFreelancer from "../assets/male_freelancer.webp"
import apprenticeship from "../assets/apprenticeship.webp"
import icon1 from "../assets/1.webp"
import icon2 from "../assets/2.webp"
import icon3 from "../assets/3.webp"
import icon4 from "../assets/4.webp"

const B = "#0B73B7"

function useCountUp(target, duration, started) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let s = null
    const step = (ts) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])
  return val
}

const STATS = [
  { target:200000, suffix:"+", label:"STUDENTS TRAINED" },
  { target:400,    suffix:"+", label:"TRAINERS" },
  { target:70,     suffix:"%", label:"EMPLOYMENT SUCCESS" },
  { target:150,    suffix:"+", label:"STARTUPS LAUNCHED" },
]

function StatItem({ target, suffix, label, started }) {
  const val = useCountUp(target, 2200, started)
  const fmt = val >= 1000 ? Math.floor(val/1000) + "," + String(val%1000).padStart(3,"0") : String(val)
  return (
    <div className="text-center py-2">
      <p className="text-white font-extrabold tabular-nums" style={{ fontSize:"clamp(2.2rem,4.5vw,3.2rem)", lineHeight:1 }}>
        {fmt}{suffix}
      </p>
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-3">{label}</p>
    </div>
  )
}

function StatsBar() {
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const el = document.getElementById("stats-bar")
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div id="stats-bar" className="w-full py-14 grid grid-cols-2 sm:grid-cols-4 gap-4 px-8"
      style={{ background:"linear-gradient(135deg,#0B73B7 0%,#0a9e6e 100%)" }}>
      {STATS.map((s,i) => <StatItem key={i} {...s} started={started} />)}
    </div>
  )
}

function useInView(threshold) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold: threshold || 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

function FeaturesSection() {
  const [ref, inView] = useInView(0.15)
  const cards = [
    { img: apprenticeship, title:"Hands-On Training &", sub:"Real-World Projects" },
    { img: maleFreelancer, title:"70% Employment &",    sub:"Freelancing Success Rate" },
  ]
  return (
    <section ref={ref} className="py-14 px-4 overflow-hidden bg-white">
      <style>{`
        @keyframes cardLeft  { 0%{opacity:0;transform:translateX(-60px);filter:blur(8px)} 100%{opacity:1;transform:translateX(0);filter:blur(0)} }
        @keyframes cardRight { 0%{opacity:0;transform:translateX(60px);filter:blur(8px)}  100%{opacity:1;transform:translateX(0);filter:blur(0)} }
        .card-left  { opacity:0 }
        .card-right { opacity:0 }
        .card-left.visible  { animation: cardLeft  .8s cubic-bezier(.22,1,.36,1) forwards }
        .card-right.visible { animation: cardRight .8s cubic-bezier(.22,1,.36,1) .18s forwards }
      `}</style>
      <div className="flex items-start justify-center gap-16">
        {cards.map((c, i) => (
          <div key={i}
            className={`${i===0?"card-left":"card-right"} ${inView?"visible":""} flex flex-col items-center text-center`}>
            {/* icon box */}
            <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mb-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ boxShadow:'0 4px 16px rgba(11,115,183,.12)' }}>
              <img src={c.img} alt={c.title} className="w-12 h-12 object-contain" />
            </div>
            <p className="font-bold text-gray-800 text-sm">{c.title}</p>
            <p className="text-gray-500 text-xs mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const FLOATERS = [
  { src:laptopIcon, alt:"laptop", delay:0,   floatDelay:900,  side:"left",  pos:{ top:"8%",    left:"3%"  }, size:150, anim:"floatLaptop", dur:4 },
  { src:upArrow,    alt:"arrow1", delay:150, floatDelay:1050, side:"right", pos:{ top:"6%",    right:"7%" }, size:85,  anim:"floatArr1",   dur:6 },
  { src:upArrow,    alt:"arrow2", delay:300, floatDelay:1200, side:"left",  pos:{ bottom:"12%",left:"5%"  }, size:75,  anim:"floatArr2",   dur:7 },
  { src:globeIcon,  alt:"globe",  delay:100, floatDelay:1000, side:"right", pos:{ bottom:"6%", right:"3%" }, size:135, anim:"floatGlobe",  dur:5 },
]

function FloatImg({ src, alt, delay, floatDelay, side, pos, size, anim, dur }) {
  const [phase, setPhase] = useState("hidden")
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("entering"), delay)
    const t2 = setTimeout(() => setPhase("floating"), floatDelay)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <img src={src} alt={alt} style={{
      position:"absolute", width:size, pointerEvents:"none", userSelect:"none", ...pos,
      opacity: phase==="hidden" ? 0 : 1,
      animation: phase==="entering"
        ? `${side==="left"?"flyLeft":"flyRight"} 0.85s cubic-bezier(.22,1,.36,1) forwards`
        : phase==="floating" ? `${anim} ${dur}s ease-in-out infinite` : "none",
      filter:"drop-shadow(0 6px 18px rgba(11,115,183,.18))",
    }} />
  )
}

const FB_POSTS = [
  { id:1, text:"SMIT is offering free IT courses for youth. Apply now and transform your future!", date:"March 28, 2026", likes:342 },
  { id:2, text:"New batch starting for Web & Mobile App Development. Limited seats available.",    date:"March 20, 2026", likes:218 },
  { id:3, text:"Congratulations to our graduates! 500+ students placed in top companies.",        date:"March 10, 2026", likes:891 },
]

const PORTALS = [
  { role:"student", label:"Student Portal", badge:"Student", color:"#0B73B7", bg:"#e8f4fc", desc:"View courses, apply for admissions, submit leave requests",
    icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg> },
  { role:"teacher", label:"Teacher Portal", badge:"Teacher", color:"#0e9f6e", bg:"#e8faf4", desc:"Manage classes, mark attendance, track student progress",
    icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  { role:"admin",   label:"Admin Portal",   badge:"Admin",   color:"#7c3aed", bg:"#f3eeff", desc:"Full system control � students, courses, leaves & admins",
    icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
]

/* -- Why SMIT Section -- */
const WHY_ITEMS = [
  { img: icon1, title:"Affordable &",      sub:"Accessible",              note:"Education for All",        pos:"left-top" },
  { img: icon4, title:"150+ Startups",     sub:"Launched",                note:"Globally",                 pos:"right-top" },
  { img: icon3, title:"Recognized by Cisco", sub:"&",                     note:"Global Tech Giants",       pos:"left-bottom" },
  { img: icon2, title:"Pakistan's Largest IT", sub:"Training Provider",   note:"",                         pos:"right-bottom" },
]

/* ── Top Courses Section ── */
const GRAD = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
]

function TopCoursesSection() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.courses)
  const [activeTab, setActiveTab] = useState('open')
  const navigate = useNavigate()

  useEffect(() => { dispatch(fetchCourses()) }, [dispatch])

  const categories = ['open', ...new Set(list.map(c => c.category || 'General').filter(Boolean))]

  const filtered = list.filter(c => {
    if (activeTab === 'open') return c.status === 'open'
    return (c.category || 'General') === activeTab
  }).slice(0, 3)

  return (
    <section className="py-16 px-4" style={{ background:'#f0f8ff' }}>
      <div className="max-w-6xl mx-auto">
        {/* heading */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Browse Our <span style={{ color:'#0B73B7' }}>Top Courses</span>
        </h2>

        {/* filter tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-10">
          {categories.map((cat, i) => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={activeTab === cat
                ? { background:'#0B73B7', color:'#fff', boxShadow:'0 4px 14px rgba(11,115,183,.35)' }
                : { background:'transparent', color:'#374151' }}>
              {cat === 'open' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={activeTab==='open'?'#fff':'#0B73B7'} strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
                </svg>
              )}
              {cat === 'open' ? 'Admissions Open' : cat}
            </button>
          ))}
        </div>

        {/* course cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"/>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"/>
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {filtered.map((course, idx) => (
              <div key={course.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/register?course=${course.id}`)}>
                {/* thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center p-4"
                        style={{ background: GRAD[idx % GRAD.length] }}>
                        <p className="text-white font-extrabold text-lg text-center uppercase tracking-wide leading-tight drop-shadow">
                          {course.name}
                        </p>
                      </div>
                  }
                  {/* admission ribbon */}
                  <div className="absolute top-3 right-0 flex flex-col items-center">
                    <div className="text-white text-xs font-extrabold px-3 py-1 leading-tight text-center"
                      style={{
                        background: course.status==='open' ? '#0B73B7' : '#ef4444',
                        clipPath:'polygon(0 0,100% 0,100% 80%,50% 100%,0 80%)',
                        minWidth:'52px', paddingBottom:'10px'
                      }}>
                      <div>ADMISSION</div>
                      <div>{course.status==='open'?'OPEN':'CLOSED'}</div>
                    </div>
                  </div>
                </div>
                {/* body */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-base leading-snug">{course.name}</h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{course.description || course.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* view all */}
        <div className="text-center mt-8">
          <button onClick={() => navigate('/courses')}
            style={{ border:'2px solid #0B73B7', color:'#0B73B7' }}
            className="font-bold px-8 py-3 rounded-full text-sm bg-white hover:bg-blue-50 transition-all duration-200">
            View All Courses →
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Student Reviews ── */
const REVIEWS = [
  { name:"Ahmed Raza",      course:"Flutter App Development", city:"Karachi",   rating:5, text:"SMIT changed my life completely. I got a job at a software house within 2 months of completing my course. The trainers are world-class and the environment is amazing." },
  { name:"Fatima Noor",     course:"Graphic Designing",       city:"Lahore",    rating:5, text:"As a female student, I felt very safe and welcomed at SMIT. The course content is practical and I'm now freelancing on Fiverr earning well." },
  { name:"Usman Tariq",     course:"Cybersecurity",           city:"Islamabad", rating:5, text:"The cybersecurity course was incredibly detailed. I passed my CEH exam on the first attempt. SMIT's free education is a blessing for Pakistan's youth." },
  { name:"Sana Malik",      course:"Python Programming",      city:"Peshawar",  rating:5, text:"I had zero programming knowledge before joining SMIT. Now I build AI projects. The step-by-step teaching approach is perfect for beginners." },
  { name:"Bilal Hussain",   course:"Web Development",         city:"Multan",    rating:5, text:"Best decision of my life. The hands-on projects prepared me for real industry work. I'm now working remotely for a UK-based company." },
  { name:"Zainab Sheikh",   course:"3D Animation",            city:"Hyderabad", rating:5, text:"The 3D animation course is top-notch. I've already started getting freelance projects. SMIT truly empowers students with practical skills." },
]

function ReviewsSection() {
  const [ref, inView] = useInView(0.1)
  return (
    <section ref={ref} className="py-16 px-4 overflow-hidden" style={{ background:"#fff" }}>
      <style>{`
        @keyframes reviewIn { 0%{opacity:0;transform:translateY(30px);filter:blur(6px)} 100%{opacity:1;transform:translateY(0);filter:blur(0)} }
        .review-card { opacity:0 }
        .review-card.on { animation: reviewIn .7s ease forwards }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>Student Reviews</p>
          <h2 className="text-3xl font-extrabold text-gray-900">What Our Students Say About Us</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <div key={i}
              className={`review-card ${inView?"on":""} bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              style={{ animationDelay:`${i*0.1}s`, boxShadow:"0 2px 16px rgba(11,115,183,.06)" }}>
              {/* stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(r.rating)].map((_,si) => (
                  <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{r.text}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background:B }}>{r.name.charAt(0)}</div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.course} · {r.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Success Stories Banner ── */
function SuccessBanner() {
  const [ref, inView] = useInView(0.2)
  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden"
      style={{ background:`linear-gradient(135deg, ${B} 0%, #0a9e6e 100%)` }}>
      <style>{`
        @keyframes bannerIn { 0%{opacity:0;transform:translateY(40px);filter:blur(8px)} 100%{opacity:1;transform:translateY(0);filter:blur(0)} }
        .banner-in { opacity:0 }
        .banner-in.on { animation: bannerIn .9s ease forwards }
      `}</style>
      {/* bg decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background:"#fff", transform:"translate(30%,-30%)" }}/>
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background:"#fff", transform:"translate(-30%,30%)" }}/>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className={`banner-in ${inView?"on":""} text-white/80 text-sm font-bold uppercase tracking-widest mb-4`}>
          We don't just teach IT
        </p>
        <h2 className={`banner-in ${inView?"on":""} text-white font-extrabold leading-tight mb-6`}
          style={{ fontSize:"clamp(2rem,4vw,3rem)", animationDelay:".1s" }}>
          We manufacture success stories
        </h2>
        <p className={`banner-in ${inView?"on":""} text-white/80 text-base leading-relaxed max-w-2xl mx-auto mb-10`}
          style={{ animationDelay:".2s" }}>
          Thousands of our alumni are powering the digital economy with innovation, skill, and passion.
        </p>
        <div className={`banner-in ${inView?"on":""} grid grid-cols-2 sm:grid-cols-4 gap-6`}
          style={{ animationDelay:".3s" }}>
          {[
            { num:"200,000+", label:"Alumni Trained" },
            { num:"70%",      label:"Employment Rate" },
            { num:"150+",     label:"Startups Launched" },
            { num:"400+",     label:"Expert Trainers" },
          ].map((s,i) => (
            <div key={i} className="text-center">
              <p className="text-white font-extrabold" style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)" }}>{s.num}</p>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── SMIT Vision ── */
function VisionSection() {
  const [ref, inView] = useInView(0.2)
  return (
    <section ref={ref} className="py-20 px-4" style={{ background:"linear-gradient(180deg,#f0f8ff 0%,#fff 100%)" }}>
      <style>{`
        @keyframes visionIn { 0%{opacity:0;transform:translateY(30px);filter:blur(6px)} 100%{opacity:1;transform:translateY(0);filter:blur(0)} }
        .vision-in { opacity:0 }
        .vision-in.on { animation: visionIn .8s ease forwards }
      `}</style>
      <div className="max-w-4xl mx-auto text-center">
        <div className={`vision-in ${inView?"on":""} inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6`}
          style={{ background:"#e8f4fc", color:B }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          SMIT Vision
        </div>
        <h2 className={`vision-in ${inView?"on":""} font-extrabold text-gray-900 leading-tight mb-6`}
          style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", animationDelay:".1s" }}>
          Empowering <span style={{ color:B }}>10 million</span> IT experts to drive<br/>
          Pakistan's <span style={{ color:"#0a9e6e" }}>$100 billion</span> digital economy
        </h2>
        <p className={`vision-in ${inView?"on":""} text-gray-500 text-base leading-relaxed max-w-2xl mx-auto mb-10`}
          style={{ animationDelay:".2s" }}>
          Be a Part of This Vision. Join thousands of students who are already transforming their careers and contributing to Pakistan's digital future.
        </p>
        <div className={`vision-in ${inView?"on":""} flex items-center justify-center gap-4 flex-wrap`}
          style={{ animationDelay:".3s" }}>
          <a href="/register" style={{ background:B }}
            className="text-white font-bold px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg">
            Enroll Now
          </a>
          <a href="/courses" style={{ border:`2px solid ${B}`, color:B }}
            className="font-bold px-8 py-3 rounded-full text-sm tracking-widest uppercase bg-white hover:bg-blue-50 transition-all duration-300">
            Explore Courses
          </a>
        </div>
      </div>
    </section>
  )
}

function WhySmitSection() {
  const [ref, inView] = useInView(0.15)
  return (
    <section ref={ref} className="relative py-16 px-4 overflow-hidden"
      style={{ background:"linear-gradient(180deg,#f0f8ff 0%,#e8f4fc 100%)" }}>
      <style>{`
        @keyframes blurFadeUp    { 0%{opacity:0;transform:translateY(40px);filter:blur(10px)} 100%{opacity:1;transform:translateY(0);filter:blur(0)} }
        @keyframes blurFadeLeft  { 0%{opacity:0;transform:translateX(-50px);filter:blur(10px)} 100%{opacity:1;transform:translateX(0);filter:blur(0)} }
        @keyframes blurFadeRight { 0%{opacity:0;transform:translateX(50px);filter:blur(10px)}  100%{opacity:1;transform:translateX(0);filter:blur(0)} }
        @keyframes iconFloat1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes iconFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-3deg)} }
        @keyframes iconFloat3 { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-12px) rotate(3deg)} 66%{transform:translateY(-4px) rotate(-2deg)} }
        @keyframes iconFloat4 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(-4deg)} }
        .why-center { opacity:0 }
        .why-lt     { opacity:0 }
        .why-rt     { opacity:0 }
        .why-lb     { opacity:0 }
        .why-rb     { opacity:0 }
        .why-center.on { animation: blurFadeUp    .8s ease forwards }
        .why-lt.on     { animation: blurFadeLeft  .8s ease .1s forwards }
        .why-rt.on     { animation: blurFadeRight .8s ease .2s forwards }
        .why-lb.on     { animation: blurFadeLeft  .8s ease .3s forwards }
        .why-rb.on     { animation: blurFadeRight .8s ease .4s forwards }
        .float-1 { animation: iconFloat1 3.5s ease-in-out infinite }
        .float-2 { animation: iconFloat2 4.2s ease-in-out infinite }
        .float-3 { animation: iconFloat3 3.8s ease-in-out infinite }
        .float-4 { animation: iconFloat4 4.5s ease-in-out infinite }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* top row: icon-left | heading | icon-right */}
        <div className="flex items-start justify-between gap-4 mb-10">

          {/* left icon */}
          <div className={`why-lt ${inView?"on":""} flex flex-col items-center text-center w-28 flex-shrink-0`}>
            <div className={`w-24 h-24 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 ${inView?"float-1":""}`}
              style={{ boxShadow:"0 4px 16px rgba(11,115,183,.12)" }}>
              <img src={WHY_ITEMS[0].img} alt="" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-bold text-gray-800 text-xs leading-snug">{WHY_ITEMS[0].title}</p>
            <p className="font-bold text-xs" style={{ color:B }}>{WHY_ITEMS[0].sub}</p>
            <p className="text-gray-400 text-xs mt-0.5">{WHY_ITEMS[0].note}</p>
          </div>

          {/* center heading */}
          <div className={`why-center ${inView?"on":""} flex-1 text-center`}>
            <span className="inline-block text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4"
              style={{ background:B }}>Why Choose SMIT?</span>
            <h2 className="font-extrabold text-gray-900 leading-tight"
              style={{ fontSize:"clamp(1.6rem,3.5vw,2.4rem)" }}>
              Empowering You with World-Class<br/>IT Training & Proven Success
            </h2>
          </div>

          {/* right icon */}
          <div className={`why-rt ${inView?"on":""} flex flex-col items-center text-center w-28 flex-shrink-0`}>
            <div className={`w-24 h-24 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 ${inView?"float-2":""}`}
              style={{ boxShadow:"0 4px 16px rgba(11,115,183,.12)" }}>
              <img src={WHY_ITEMS[1].img} alt="" className="w-16 h-16 object-contain" />
            </div>
            <p className="font-bold text-gray-800 text-xs leading-snug">{WHY_ITEMS[1].title}</p>
            <p className="font-bold text-xs" style={{ color:B }}>{WHY_ITEMS[1].sub}</p>
            <p className="text-gray-400 text-xs mt-0.5">{WHY_ITEMS[1].note}</p>
          </div>
        </div>

        {/* bottom row: 2 icons centered */}
        <div className="flex items-start justify-center gap-24">
          {[WHY_ITEMS[2], WHY_ITEMS[3]].map((item, i) => (
            <div key={i}
              className={`${i===0?"why-lb":"why-rb"} ${inView?"on":""} flex flex-col items-center text-center w-32`}>
              <div className={`w-24 h-24 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 ${inView?(i===0?"float-3":"float-4"):""}`}
                style={{ boxShadow:"0 4px 16px rgba(11,115,183,.12)" }}>
                <img src={item.img} alt="" className="w-16 h-16 object-contain" />
              </div>
              <p className="font-bold text-gray-800 text-xs leading-snug">{item.title}</p>
              <p className="font-bold text-xs" style={{ color:B }}>{item.sub}</p>
              {item.note && <p className="text-gray-400 text-xs mt-0.5">{item.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes flyLeft  {0%{opacity:0;transform:translateX(-130px) scale(.65);filter:blur(14px)}55%{opacity:1;filter:blur(0)}100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}}
        @keyframes flyRight {0%{opacity:0;transform:translateX(130px) scale(.65);filter:blur(14px)}55%{opacity:1;filter:blur(0)}100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}}
        @keyframes floatLaptop{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-18px) rotate(5deg)}}
        @keyframes floatGlobe {0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-15px) rotate(-4deg)}}
        @keyframes floatArr1  {0%,100%{transform:translate(0,0) rotate(-12deg)}33%{transform:translate(10px,-13px) rotate(-5deg)}66%{transform:translate(-7px,8px) rotate(-19deg)}}
        @keyframes floatArr2  {0%,100%{transform:translate(0,0) rotate(168deg)}33%{transform:translate(-11px,11px) rotate(175deg)}66%{transform:translate(7px,-9px) rotate(161deg)}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(28px);filter:blur(5px)}100%{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes orbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes blobPulse{0%,100%{opacity:.07;transform:scale(1)}50%{opacity:.13;transform:scale(1.08)}}
        .fade-up{opacity:0;animation:fadeUp .75s ease forwards}
        .blob{animation:blobPulse 5s ease-in-out infinite}
      `}</style>

      <section className="relative overflow-hidden"
        style={{ background:"linear-gradient(150deg,#eef6fd 0%,#e4f1fb 45%,#f4faff 100%)", minHeight:"90vh" }}>
        <div className="blob absolute rounded-full pointer-events-none" style={{ width:520,height:520,background:B,top:-140,left:-120,filter:"blur(70px)" }}/>
        <div className="blob absolute rounded-full pointer-events-none" style={{ width:380,height:380,background:"#22c55e",bottom:-90,right:-90,filter:"blur(65px)",animationDelay:"1.2s" }}/>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity:.12 }}>
          <div style={{ width:"70%",height:"55%",border:`1.5px dashed ${B}`,borderRadius:"50%",animation:"orbitSpin 30s linear infinite" }}/>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center"
          style={{ minHeight:"90vh",paddingTop:"2rem",paddingBottom:"3rem" }}>
          {FLOATERS.map(f => <FloatImg key={f.alt} {...f} />)}
          <div className="relative z-10 max-w-2xl">
            <h1 className="fade-up font-extrabold leading-tight text-gray-900" style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)",animationDelay:".25s" }}>Building Pakistan's</h1>
            <h1 className="fade-up font-extrabold leading-tight" style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)",color:B,animationDelay:".4s" }}>Tech Future</h1>
            <p className="fade-up text-gray-500 mt-4 text-lg" style={{ animationDelay:".55s" }}>Changing Lives. Building Careers. Shaping the Future.</p>
            <div className="fade-up flex justify-center mt-5" style={{ animationDelay:".7s" }}>
              <img src={saylaniLogo} alt="Saylani" className="h-10 object-contain"/>
            </div>
            <div className="fade-up flex items-center justify-center gap-4 mt-8 flex-wrap" style={{ animationDelay:".85s" }}>
              <Link to="/register" style={{ background:B }}
                className="text-white font-bold px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg">
                Enroll Now
              </Link>
              <Link to="/courses" style={{ border:`2px solid ${B}`,color:B }}
                className="font-bold px-8 py-3 rounded-full text-sm tracking-widest uppercase bg-white hover:bg-blue-50 transition-all duration-300">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4" style={{ background:"linear-gradient(180deg,#f4faff 0%,#fff 100%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>Access Your Portal</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Choose Your Role</h2>
          <p className="text-gray-400 mb-10 text-sm">Select your portal to login or sign up</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PORTALS.map(p => (
              <Link key={p.role} to={`/login?role=${p.role}`}
                className="group flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                style={{ borderColor:"#e5e7eb",background:"#fff" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color;e.currentTarget.style.boxShadow=`0 20px 50px ${p.color}22`}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.boxShadow="none"}}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background:p.bg,color:p.color }}>{p.icon}</div>
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background:p.bg,color:p.color }}>{p.badge}</span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{p.label}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-300" style={{ color:p.color }}>
                  Login / Sign Up
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StatsBar />
      <FeaturesSection />
      <TopCoursesSection />
      <ReviewsSection />
      <WhySmitSection />
      <CampusMap />
      <SuccessBanner />
      <VisionSection />
    </div>
  )
}
