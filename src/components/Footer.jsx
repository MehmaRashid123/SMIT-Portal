import { Link } from 'react-router-dom'
import smitLogo from '../assets/smit logo.png'
import saylaniLogo from '../assets/saylani_logo.webp'

const B = '#0B73B7'

const LINKS = {
  'Quick Links': [
    { label:'Home',         to:'/' },
    { label:'Courses',      to:'/courses' },
    { label:'Register',     to:'/register' },
    { label:'Student Login',to:'/login?role=student' },
    { label:'Teacher Login',to:'/login?role=teacher' },
    { label:'Admin Login',  to:'/login?role=admin' },
  ],
  'Programs': [
    { label:'Web Development',    to:'/courses' },
    { label:'Mobile Development', to:'/courses' },
    { label:'AI & Chatbot',       to:'/courses' },
    { label:'Graphic Designing',  to:'/courses' },
    { label:'Cybersecurity',      to:'/courses' },
    { label:'Networking',         to:'/courses' },
  ],
  'Contact': [
    { label:'📍 Karachi, Pakistan',          href:'#' },
    { label:'📞 +92-21-111-SMIT-00',         href:'tel:+92211117648' },
    { label:'✉️ info@saylaniwelfare.com',     href:'mailto:info@saylaniwelfare.com' },
    { label:'🌐 www.saylanimit.com',          href:'https://www.saylanimit.com' },
  ],
}

const SOCIALS = [
  { label:'Facebook',  href:'https://facebook.com/saylanimit', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
  { label:'YouTube',   href:'https://youtube.com/@saylanimit',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg> },
  { label:'Instagram', href:'https://instagram.com/saylanimit', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
  { label:'LinkedIn',  href:'https://linkedin.com/company/smit', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
]

export default function Footer() {
  return (
    <footer style={{ background:'#0a1628' }} className="text-white">

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={smitLogo} alt="SMIT" className="h-10 object-contain" />
            </div>
            <img src={saylaniLogo} alt="Saylani" className="h-8 object-contain mb-4 opacity-90" />
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Saylani Mass IT Training — Empowering Pakistan's youth with free, world-class IT education since 2017.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background:'rgba(255,255,255,.08)', color:'#94a3b8' }}
                  onMouseEnter={e => { e.currentTarget.style.background = B; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#94a3b8' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p className="font-bold text-white text-sm uppercase tracking-widest mb-5"
                style={{ borderBottom:'2px solid ' + B, paddingBottom:'8px', display:'inline-block' }}>
                {title}
              </p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to}
                        className="text-gray-400 text-sm hover:text-white transition-colors duration-200 flex items-center gap-1.5 group">
                        <span className="w-1 h-1 rounded-full flex-shrink-0 transition-all group-hover:w-2"
                          style={{ background:B }} />
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} target="_blank" rel="noreferrer"
                        className="text-gray-400 text-sm hover:text-white transition-colors duration-200 block">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter strip */}
      <div style={{ background:'rgba(255,255,255,.04)', borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">Stay updated with latest courses & batches</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <input placeholder="Enter your email"
              className="flex-1 sm:w-64 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors" />
            <button style={{ background:B }}
              className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Saylani Welfare International Trust. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
