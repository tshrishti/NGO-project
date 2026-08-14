import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchIntent, QUICK_REPLIES, UI } from '../lib/botKnowledge'
import { waLink } from '../lib/whatsapp'
import { useLanguage } from '../context/LanguageContext'

// Renders **bold** and line breaks in bot replies.
function format(text) {
  return text.split('\n').map((line, i) => (
    <p key={i} style={{ margin: i ? '6px 0 0' : 0 }}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={j}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </p>
  ))
}

export default function ChatBot() {
  const { lang, setLang, languages } = useLanguage()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'bot', text: matchIntent('hi', lang) }])
  const [input, setInput] = useState('')
  const bodyRef = useRef(null)
  const navigate = useNavigate()
  const t = (obj) => obj[lang] || obj.en

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, open])

  // Reset the greeting when the language changes.
  useEffect(() => {
    setMessages([{ from: 'bot', text: matchIntent('hi', lang) }])
  }, [lang])

  function send(text) {
    const q = (text ?? input).trim()
    if (!q) return
    setMessages((m) => [...m, { from: 'user', text: q }])
    setInput('')
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: matchIntent(q, lang) }])
    }, 300)
  }

  return (
    <>
      <button className={`chat-fab ${open ? 'hidden' : ''}`} onClick={() => setOpen(true)} aria-label="Open assistant">
        💬
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <strong>{t(UI.title)}</strong>
              <div className="chat-sub">{t(UI.subtitle)}</div>
            </div>
            <div className="chat-head-right">
              <div className="lang-switch">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    className={lang === l.code ? 'on' : ''}
                    onClick={() => setLang(l.code)}
                    title={l.label}
                  >
                    {l.short}
                  </button>
                ))}
              </div>
              <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>
                {m.from === 'bot' ? format(m.text) : m.text}
              </div>
            ))}
          </div>

          <div className="chat-quick">
            {QUICK_REPLIES.map((q) => (
              <button key={q.text} className="chip" onClick={() => send(q.text)}>
                {t(q.label)}
              </button>
            ))}
          </div>

          <div className="chat-actions">
            <a className="btn secondary small-btn" href={waLink()} target="_blank" rel="noreferrer">
              💬 {t(UI.whatsapp)}
            </a>
            <button className="btn small-btn" onClick={() => { setOpen(false); navigate('/request-help') }}>
              ➕ {t(UI.requestHelp)}
            </button>
          </div>

          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send() }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(UI.placeholder)} />
            <button className="btn" type="submit">{t(UI.send)}</button>
          </form>
        </div>
      )}
    </>
  )
}
