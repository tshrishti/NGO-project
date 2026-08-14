import { SUPPORT_WHATSAPP } from '../config'

// Build a click-to-chat WhatsApp deep link (wa.me). Works with no API keys:
// it opens WhatsApp (app or web) with the recipient and a prefilled message.
// Swap this for the WhatsApp Business Cloud API later without touching callers.
export function waLink(phone, text = '') {
  const number = String(phone || SUPPORT_WHATSAPP).replace(/[^\d]/g, '')
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${number}${q}`
}

const pick = (obj, lang) => obj[lang] || obj.en

// Prefilled message a volunteer sends when accepting a need (localized).
export function volunteerMessage(need, volunteerName, lang = 'en') {
  const name = volunteerName || 'ReliefLink volunteer'
  const who = need.requesterName
  const templates = {
    en: `Hi${who ? ' ' + who : ''}, this is ${name}. I'm nearby and can help with "${need.title}"${need.category ? ' (' + need.category + ')' : ''}. When works for you?`,
    hi: `नमस्ते${who ? ' ' + who : ''}, मैं ${name} हूँ। मैं पास में हूँ और "${need.title}"${need.category ? ' (' + need.category + ')' : ''} में मदद कर सकता/सकती हूँ। आपके लिए कौन-सा समय ठीक रहेगा?`,
    kn: `ನಮಸ್ಕಾರ${who ? ' ' + who : ''}, ನಾನು ${name}. ನಾನು ಹತ್ತಿರದಲ್ಲಿದ್ದೇನೆ ಮತ್ತು "${need.title}"${need.category ? ' (' + need.category + ')' : ''} ನಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮಗೆ ಯಾವ ಸಮಯ ಸೂಕ್ತ?`,
  }
  return pick(templates, lang)
}

// Prefilled message a community member sends to request help via support (localized).
export function helpRequestMessage({ title, category, urgency, requesterName }, lang = 'en') {
  const name = requesterName || '—'
  const templates = {
    en: `Hi, I need help.\nName: ${name}\nNeed: ${title}\nType: ${category || '—'} · Urgency: ${urgency || '—'}\nPlease connect me with a nearby volunteer.`,
    hi: `नमस्ते, मुझे मदद चाहिए।\nनाम: ${name}\nज़रूरत: ${title}\nप्रकार: ${category || '—'} · तात्कालिकता: ${urgency || '—'}\nकृपया मुझे पास के किसी स्वयंसेवक से जोड़ें।`,
    kn: `ನಮಸ್ಕಾರ, ನನಗೆ ಸಹಾಯ ಬೇಕು.\nಹೆಸರು: ${name}\nಅಗತ್ಯ: ${title}\nಪ್ರಕಾರ: ${category || '—'} · ತುರ್ತು: ${urgency || '—'}\nದಯವಿಟ್ಟು ನನ್ನನ್ನು ಹತ್ತಿರದ ಸ್ವಯಂಸೇವಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ.`,
  }
  return pick(templates, lang)
}
