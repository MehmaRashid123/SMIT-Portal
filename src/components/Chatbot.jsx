import { useState, useRef, useEffect } from 'react'

const B  = '#0B73B7'
const BL = '#0d85d4'

const FAQS = [
  { q: 'How to apply for a course?', a: 'Click "Enroll Now" or visit the Courses page, select your course and fill the application form.' },
  { q: 'Are courses free?', a: 'Yes! All SMIT courses are completely free of cost for deserving students.' },
  { q: 'What is the duration?', a: 'Course durations range from 2 to 6 months depending on the program.' },
  { q: 'How to submit leave?', a: 'Login to your student account, go to "My Leaves" and submit a new leave request.' },
  { q: 'Contact SMIT', a: 'You can reach SMIT at info@saylaniwelfare.com or visit the nearest campus.' },
]

const BOT_INTRO = { from: 'bot', text: 'Hi! 👋 Welcome to SMIT Connect. How can I help you today?' }

export default function Chatbot() {
  const [open,    setOpen]    = useState(false)
  const [msgs,    setMsgs]    = useState([BOT_INTRO])
  const [input,   setInput]   = useState('')
  const [typing,  setTyping]  = useState(false)
  const [pulse,   setPulse]   = useState(true)
  const bottomRef = useRef(null)

  // stop pulse after first open
  useEffect(() => { if (open) setPulse(false) }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  const sendMessage = (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setMsgs(m => [...m, { from: 'user', text: userMsg }])
    setTyping(true)

    setTimeout(() => {
      const faq = FAQS.find(f => f.q.toLowerCase().includes(userMsg.toLowerCase()) ||
        userMsg.toLowerCase().includes(f.q.toLowerCase().split(' ').slice(0,2).join(' ')))
      const reply = faq
        ? faq.a
        : "I'm not sure about that. Please contact SMIT directly at info@saylaniwelfare.com or call your nearest campus."
      setTyping(false)
      setMsgs(m => [...m, { from: 'bot', text: reply }])
    }, 1000)
  }

  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { transform:scale(.5) translateY(20px); opacity:0; }
          70%  { transform:scale(1.08) translateY(-4px); opacity:1; }
          100% { transform:scale(1) translateY(0); opacity:1; }
        }
        @keyframes chatSlide {
          from { opacity:0; transform:translateY(16px) scale(.97); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        @keyframes pulseRing {
          0%   { transform:scale(1);   opacity:.7; }
          70%  { transform:scale(1.55);opacity:0; }
          100% { transform:scale(1.55);opacity:0; }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); }
          40%         { transform:translateY(-6px); }
        }
        .chat-fab {
          animation: popIn .5s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        .chat-window {
          animation: chatSlide .25s ease forwards;
        }
        .pulse-ring {
          animation: pulseRing 1.8s ease-out infinite;
        }
        .dot1 { animation: dotBounce 1.2s ease-in-out infinite; }
        .dot2 { animation: dotBounce 1.2s ease-in-out .2s infinite; }
        .dot3 { animation: dotBounce 1.2s ease-in-out .4s infinite; }
      `}</style>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        {/* Chat window */}
        {open && (
          <div className="chat-window w-80 sm:w-96 bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{ height:'480px', boxShadow:'0 20px 60px rgba(11,115,183,.22), 0 4px 20px rgba(0,0,0,.1)' }}>

            {/* Header */}
            <div style={{ background:`linear-gradient(135deg,${B},${BL})` }}
              className="flex items-center justify-between px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">SMIT Assistant</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.from === 'bot' && (
                    <div style={{ background:B }} className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                    </div>
                  )}
                  <div
                    style={m.from === 'user' ? { background:B } : {}}
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                      ${m.from === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100'}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start">
                  <div style={{ background:B }} className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    <span className="dot1 w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"/>
                    <span className="dot2 w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"/>
                    <span className="dot3 w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"/>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick FAQs */}
            <div className="px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {FAQS.map(f => (
                  <button key={f.q} onClick={() => sendMessage(f.q)}
                    style={{ borderColor: B, color: B }}
                    className="text-xs border rounded-full px-2.5 py-1 whitespace-nowrap hover:opacity-80 transition-opacity flex-shrink-0 bg-white">
                    {f.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 transition-colors"
                style={{ '--tw-ring-color': B }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                />
                <button onClick={() => sendMessage()}
                  style={{ background: input.trim() ? B : '#d1d5db' }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAB button */}
        <div className="relative">
          {/* pulse ring when not opened yet */}
          {pulse && (
            <span className="pulse-ring absolute inset-0 rounded-full"
              style={{ background: B, opacity:.4 }} />
          )}
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: open ? '#374151' : `linear-gradient(135deg,${B},${BL})` }}
            className="chat-fab w-14 h-14 rounded-full flex items-center justify-center text-white
              transition-all duration-300 hover:-translate-y-1"
            aria-label="Open chat"
            style={{
              background: open ? '#374151' : `linear-gradient(135deg,${B},${BL})`,
              boxShadow: `0 6px 24px rgba(11,115,183,.4)`
            }}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
