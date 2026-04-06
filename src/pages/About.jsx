import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import smitLogo    from '../assets/smit logo.png'
import saylaniLogo from '../assets/saylani_logo.webp'
import icon1 from '../assets/1.webp'
import icon2 from '../assets/2.webp'
import icon3 from '../assets/3.webp'
import icon4 from '../assets/4.webp'
import apprenticeship from '../assets/apprenticeship.webp'

const B  = '#0B73B7'
const BG = 'linear-gradient(135deg,#0B73B7 0%,#0a9e6e 100%)'

const STATS = [
  { val:'200,000+', label:'Students Trained' },
  { val:'400+',     label:'Expert Trainers' },
  { val:'70%',      label:'Employment Rate' },
  { val:'150+',     label:'Startups Launched' },
]

const VALUES = [
  { icon:'🎓', title:'Free Education',      desc:'All courses are completely free for deserving students — no fees, no hidden charges.' },
  { icon:'💼', title:'Job-Ready Skills',    desc:'Practical, industry-aligned curriculum that prepares students for real-world employment.' },
  { icon:'🌍', title:'Inclusive Access',    desc:'Open to all backgrounds, genders, and regions across Pakistan and beyond.' },
  { icon:'🚀', title:'Innovation Focus',    desc:'Cutting-edge courses in AI, Web, Mobile, Cybersecurity, and emerging technologies.' },
]

const TEAM = [
  { name:'Maulana Bashir Farooqi', role:'Founder & Chairman', initial:'M' },
  { name:'Zubair Ahmed',           role:'CEO, SMIT',          initial:'Z' },
  { name:'Dr. Amjad Saqib',        role:'Patron-in-Chief',    initial:'D' },
  { name:'Saylani Welfare Trust',  role:'Parent Organization', initial:'S' },
]

const MILESTONES = [
  { year:'2017', event:'SMIT founded under Saylani Welfare International Trust' },
  { year:'2018', event:'First 1,000 students enrolled across Karachi campuses' },
  { year:'2019', event:'Expanded to Lahore, Islamabad and 5 more cities' },
  { year:'2020', event:'Launched online learning during COVID-19 pandemic' },
  { year:'2021', event:'50,000+ students trained milestone achieved' },
  { year:'2022', event:'International partnerships with Cisco, Microsoft & Google' },
  { year:'2023', event:'100,000+ alumni placed in tech industry globally' },
  { year:'2024', event:'200,000+ students trained across 30+ campuses' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Banner ── */}
      <div style={{ background: BG }} className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <span>›</span>
            <span className="text-white font-medium">About Us</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">About SMIT</h1>
          <p className="text-white/80 text-lg">Empowering individuals through world-class IT education</p>
        </div>
      </div>

      {/* ── Our Foundation ── */}
      <section className="py-20 px-4" style={{ background:'#f8fbff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#0a9e6e' }}>
                OUR FOUNDATION
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-5">
                Bridging the Digital Divide<br/>Through Education
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                SMIT, an initiative of <strong>Saylani Welfare International Trust</strong>, is dedicated to providing
                <strong> high-quality, modern IT training</strong> to underprivileged and aspiring students across the globe.
                Our mission is simple: to equip the next generation with the coding and digital skills necessary to thrive
                in the 21st-century economy, irrespective of their financial background.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                We believe access to top-tier technological education is a right, not a privilege. By focusing intensely on
                <strong> practical application and job readiness</strong>, we ensure our graduates are prepared to compete
                in the global marketplace.
              </p>
              <img src={saylaniLogo} alt="Saylani" className="h-10 object-contain" />
            </div>

            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ background:'linear-gradient(135deg,#0B73B7,#0a9e6e)', minHeight:320 }}>
                <img src={apprenticeship} alt="SMIT Campus"
                  className="w-full h-80 object-cover mix-blend-overlay opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-4"
                  style={{ background:'linear-gradient(0deg,rgba(0,0,0,.7),transparent)' }}>
                  <p className="text-white text-xs font-bold uppercase tracking-widest">QUETTA CAMPUS</p>
                  <p className="text-white/80 text-xs">WEB & APP DEVELOPMENT HACKATHON</p>
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background:B }}>
                <div className="text-center">
                  <p className="text-white font-extrabold text-lg leading-none">30+</p>
                  <p className="text-white/80 text-xs">Campuses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-8" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-white font-extrabold leading-none" style={{ fontSize:'clamp(2rem,4vw,2.8rem)' }}>{s.val}</p>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl p-8 border-2" style={{ borderColor:B, background:'#e8f4fc' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:B }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To empower <strong>10 million IT experts</strong> to drive Pakistan's $100 billion digital economy,
              making Pakistan a global technology hub by 2030.
            </p>
          </div>
          <div className="rounded-2xl p-8 border-2" style={{ borderColor:'#0a9e6e', background:'#e8faf4' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:'#0a9e6e' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To provide <strong>free, world-class IT education</strong> to deserving students regardless of financial
              background, equipping them with practical skills for the modern digital economy.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-20 px-4" style={{ background:'#f8fbff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>What We Stand For</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{v.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Icons ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>Why Choose SMIT?</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Empowering You with World-Class IT Training</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { img:icon1, title:'Affordable &', sub:'Accessible', note:'Education for All' },
              { img:icon4, title:'150+ Startups', sub:'Launched', note:'Globally' },
              { img:icon3, title:'Recognized by Cisco', sub:'&', note:'Global Tech Giants' },
              { img:icon2, title:"Pakistan's Largest IT", sub:'Training Provider', note:'' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mb-3"
                  style={{ boxShadow:'0 4px 16px rgba(11,115,183,.12)' }}>
                  <img src={item.img} alt={item.title} className="w-14 h-14 object-contain" />
                </div>
                <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                <p className="font-bold text-sm" style={{ color:B }}>{item.sub}</p>
                {item.note && <p className="text-gray-400 text-xs mt-0.5">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 px-4" style={{ background:'#f8fbff' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>Our Journey</p>
            <h2 className="text-3xl font-extrabold text-gray-900">SMIT Milestones</h2>
          </div>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-16 top-0 bottom-0 w-0.5" style={{ background:'#e5e7eb' }} />
            <div className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className="w-14 text-right flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color:B }}>{m.year}</span>
                  </div>
                  {/* dot */}
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 relative z-10"
                    style={{ background:'#fff', borderColor:B }} />
                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm flex-1">
                    <p className="text-sm text-gray-700">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Leadership ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:B }}>Leadership</p>
            <h2 className="text-3xl font-extrabold text-gray-900">The People Behind SMIT</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TEAM.map(t => (
              <div key={t.name} className="text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-3 shadow-lg"
                  style={{ background: BG }}>
                  {t.initial}
                </div>
                <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                <p className="text-xs mt-0.5" style={{ color:B }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4" style={{ background: BG }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Join Pakistan's Tech Revolution –<br/>Enroll Today & Build Your Future!
          </h2>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-white font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity mt-2"
            style={{ color:B }}>
            Enroll Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </Link>
        </div>
      </section>

    </div>
  )
}
