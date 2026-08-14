// Multilingual offline assistant knowledge base (English, Hindi, Kannada).
// Each intent has trigger keywords (across languages) and replies per language.
// matchIntent(text, lang) returns the best reply in the chosen language.
// No external LLM/API key — safe to run locally. Swap for an LLM later.

export const INTENTS = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'ನಮಸ್ಕಾರ', 'start'],
    reply: {
      en: "Hi! I'm the ReliefLink assistant 🤝 I can help you request help, volunteer, understand matching, or find emergency helplines. What do you need?",
      hi: "नमस्ते! मैं ReliefLink सहायक हूँ 🤝 मैं आपकी मदद माँगने, स्वयंसेवा करने, मैचिंग समझने या आपातकालीन हेल्पलाइन खोजने में मदद कर सकता हूँ। आपको क्या चाहिए?",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ReliefLink ಸಹಾಯಕ 🤝 ಸಹಾಯ ಕೇಳಲು, ಸ್ವಯಂಸೇವಕರಾಗಲು, ಮ್ಯಾಚಿಂಗ್ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಅಥವಾ ತುರ್ತು ಸಹಾಯವಾಣಿ ಹುಡುಕಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಿಮಗೆ ಏನು ಬೇಕು?",
    },
  },
  {
    id: 'get-help',
    keywords: ['need help', 'get help', 'help me', 'request', 'emergency', 'require', 'madad', 'मदद', 'सहायता', 'ಸಹಾಯ', 'ಬೇಕು'],
    reply: {
      en: "To request help: tap **“Request Help”** in the top bar. Add what you need, your location and phone. It appears live on the map and nearby skilled volunteers get an alert.",
      hi: "मदद माँगने के लिए: ऊपर **“Request Help”** पर टैप करें। आपको क्या चाहिए, अपना स्थान और फ़ोन नंबर भरें। यह नक़्शे पर तुरंत दिखता है और आस-पास के कुशल स्वयंसेवकों को सूचना मिलती है।",
      kn: "ಸಹಾಯ ಕೇಳಲು: ಮೇಲ್ಭಾಗದ **“Request Help”** ಒತ್ತಿರಿ. ನಿಮಗೆ ಏನು ಬೇಕು, ನಿಮ್ಮ ಸ್ಥಳ ಮತ್ತು ಫೋನ್ ನಮೂದಿಸಿ. ಇದು ನಕ್ಷೆಯಲ್ಲಿ ತಕ್ಷಣ ಕಾಣಿಸುತ್ತದೆ ಮತ್ತು ಹತ್ತಿರದ ನುರಿತ ಸ್ವಯಂಸೇವಕರಿಗೆ ಎಚ್ಚರಿಕೆ ಸಿಗುತ್ತದೆ.",
    },
  },
  {
    id: 'volunteer',
    keywords: ['volunteer', 'help others', 'join', 'sign up', 'register', 'contribute', 'svayamsevak', 'स्वयंसेवक', 'स्वयंसेवा', 'ಸ್ವಯಂಸೇವಕ', 'ಸ್ವಯಂಸೇವೆ'],
    reply: {
      en: "To volunteer: sign up as a **Volunteer**, add your skills, availability and location. Then open **Find Tasks** to see your best matches. You'll get a live alert with a sound 🔔 when a nearby task appears.",
      hi: "स्वयंसेवा के लिए: **Volunteer** के रूप में साइन अप करें, अपने कौशल, उपलब्धता और स्थान भरें। फिर **Find Tasks** खोलें और अपने सर्वोत्तम मैच देखें। पास में नया काम आने पर आपको आवाज़ के साथ सूचना 🔔 मिलेगी।",
      kn: "ಸ್ವಯಂಸೇವಕರಾಗಲು: **Volunteer** ಆಗಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ, ನಿಮ್ಮ ಕೌಶಲ್ಯ, ಲಭ್ಯತೆ ಮತ್ತು ಸ್ಥಳ ಸೇರಿಸಿ. ನಂತರ **Find Tasks** ತೆರೆದು ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಗಳನ್ನು ನೋಡಿ. ಹತ್ತಿರ ಹೊಸ ಕೆಲಸ ಬಂದಾಗ ಶಬ್ದದೊಂದಿಗೆ ಎಚ್ಚರಿಕೆ 🔔 ಸಿಗುತ್ತದೆ.",
    },
  },
  {
    id: 'matching',
    keywords: ['match', 'matching', 'score', 'algorithm', 'how does it work', 'how it works', 'मैच', 'मैचिंग', 'ಮ್ಯಾಚಿಂಗ್', 'ಹೊಂದಾಣಿಕೆ'],
    reply: {
      en: "Matching uses **skill overlap (60%) + proximity (30%) + urgency (10%)**. Distance is real GPS distance. So the closest, best-skilled volunteer for the most urgent need scores highest — shown as a match %.",
      hi: "मैचिंग में **कौशल मेल (60%) + नज़दीकी (30%) + तात्कालिकता (10%)** का उपयोग होता है। दूरी असली GPS दूरी है। इसलिए सबसे ज़रूरी काम के लिए सबसे पास और कुशल स्वयंसेवक को सबसे ज़्यादा स्कोर मिलता है — मैच % के रूप में।",
      kn: "ಮ್ಯಾಚಿಂಗ್ **ಕೌಶಲ್ಯ ಹೊಂದಾಣಿಕೆ (60%) + ಸಾಮೀಪ್ಯ (30%) + ತುರ್ತು (10%)** ಬಳಸುತ್ತದೆ. ದೂರವು ನಿಜವಾದ GPS ದೂರ. ಆದ್ದರಿಂದ ಅತ್ಯಂತ ತುರ್ತು ಕೆಲಸಕ್ಕೆ ಹತ್ತಿರದ, ನುರಿತ ಸ್ವಯಂಸೇವಕರಿಗೆ ಹೆಚ್ಚಿನ ಸ್ಕೋರ್ — ಮ್ಯಾಚ್ % ಆಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    },
  },
  {
    id: 'categories',
    keywords: ['category', 'categories', 'food', 'medical', 'shelter', 'education', 'type', 'श्रेणी', 'भोजन', 'चिकित्सा', 'ವರ್ಗ', 'ಆಹಾರ', 'ವೈದ್ಯಕೀಯ'],
    reply: {
      en: "Needs fall into four categories: 🍲 **Food**, ⚕️ **Medical**, 🏠 **Shelter**, and 📚 **Education**. Each has an urgency: 🔴 high, 🟡 medium, 🟢 low — shown as color-coded pins on the map.",
      hi: "ज़रूरतें चार श्रेणियों में होती हैं: 🍲 **भोजन**, ⚕️ **चिकित्सा**, 🏠 **आश्रय**, और 📚 **शिक्षा**। हर एक की तात्कालिकता होती है: 🔴 उच्च, 🟡 मध्यम, 🟢 निम्न — नक़्शे पर रंगीन पिन के रूप में।",
      kn: "ಅಗತ್ಯಗಳು ನಾಲ್ಕು ವರ್ಗಗಳಲ್ಲಿ: 🍲 **ಆಹಾರ**, ⚕️ **ವೈದ್ಯಕೀಯ**, 🏠 **ಆಶ್ರಯ**, ಮತ್ತು 📚 **ಶಿಕ್ಷಣ**. ಪ್ರತಿಯೊಂದಕ್ಕೂ ತುರ್ತು: 🔴 ಹೆಚ್ಚು, 🟡 ಮಧ್ಯಮ, 🟢 ಕಡಿಮೆ — ನಕ್ಷೆಯಲ್ಲಿ ಬಣ್ಣದ ಪಿನ್‌ಗಳಾಗಿ.",
    },
  },
  {
    id: 'whatsapp',
    keywords: ['whatsapp', 'chat', 'contact', 'phone', 'call', 'message', 'व्हाट्सएप', 'संपर्क', 'ಸಂಪರ್ಕ', 'ಫೋನ್'],
    reply: {
      en: "You can connect over WhatsApp 💬 — tap **Chat on WhatsApp** below to message our support number. When a volunteer accepts your need, they can WhatsApp you directly using the number you provide.",
      hi: "आप WhatsApp पर जुड़ सकते हैं 💬 — नीचे **Chat on WhatsApp** पर टैप करके हमारे सपोर्ट नंबर पर संदेश भेजें। जब कोई स्वयंसेवक आपकी ज़रूरत स्वीकार करेगा, वह आपके दिए नंबर पर सीधे WhatsApp कर सकता है।",
      kn: "ನೀವು WhatsApp ಮೂಲಕ ಸಂಪರ್ಕಿಸಬಹುದು 💬 — ಕೆಳಗಿನ **Chat on WhatsApp** ಒತ್ತಿ ನಮ್ಮ ಬೆಂಬಲ ಸಂಖ್ಯೆಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ. ಸ್ವಯಂಸೇವಕರು ನಿಮ್ಮ ಅಗತ್ಯ ಸ್ವೀಕರಿಸಿದಾಗ, ನೀವು ನೀಡಿದ ಸಂಖ್ಯೆಗೆ ನೇರವಾಗಿ WhatsApp ಮಾಡಬಹುದು.",
    },
  },
  {
    id: 'schemes',
    keywords: ['scheme', 'schemes', 'government', 'welfare', 'benefit', 'subsidy', 'yojana', 'aid', 'योजना', 'सरकारी', 'ಯೋಜನೆ', 'ಸರ್ಕಾರಿ'],
    reply: {
      en: "Common government relief schemes people ask about: **PM Garib Kalyan Anna Yojana** (free foodgrains), **Ayushman Bharat / PM-JAY** (health cover), **PMAY** (housing), and state disaster-relief funds. Eligibility varies — please verify on the official portal or ask a local NGO.",
      hi: "आम सरकारी राहत योजनाएँ: **पीएम गरीब कल्याण अन्न योजना** (मुफ़्त अनाज), **आयुष्मान भारत / PM-JAY** (स्वास्थ्य कवर), **पीएमएवाई** (आवास), और राज्य आपदा राहत कोष। पात्रता अलग-अलग होती है — कृपया आधिकारिक पोर्टल पर जाँचें या स्थानीय NGO से पूछें।",
      kn: "ಸಾಮಾನ್ಯ ಸರ್ಕಾರಿ ಪರಿಹಾರ ಯೋಜನೆಗಳು: **ಪಿಎಂ ಗರೀಬ್ ಕಲ್ಯಾಣ್ ಅನ್ನ ಯೋಜನೆ** (ಉಚಿತ ಆಹಾರಧಾನ್ಯ), **ಆಯುಷ್ಮಾನ್ ಭಾರತ್ / PM-JAY** (ಆರೋಗ್ಯ ರಕ್ಷಣೆ), **PMAY** (ವಸತಿ), ಮತ್ತು ರಾಜ್ಯ ವಿಪತ್ತು ಪರಿಹಾರ ನಿಧಿ. ಅರ್ಹತೆ ಬದಲಾಗುತ್ತದೆ — ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಸ್ಥಳೀಯ NGO ಕೇಳಿ.",
    },
  },
  {
    id: 'helplines',
    keywords: ['helpline', 'helplines', 'ambulance', 'police', 'fire', 'women', 'child', 'number', 'sos', 'हेल्पलाइन', 'एम्बुलेंस', 'पुलिस', 'ಸಹಾಯವಾಣಿ', 'ಆಂಬ್ಯುಲೆನ್ಸ್'],
    reply: {
      en: "📞 **Common India helplines** — Emergency (all): **112** · Ambulance: **108** · Police: **100** · Fire: **101** · Women: **181** · Child: **1098** · Disaster (NDMA): **1078** · Mental health (KIRAN): **1800-599-0019**. In a life-threatening emergency, call these first.",
      hi: "📞 **आम भारत हेल्पलाइन** — आपातकाल (सभी): **112** · एम्बुलेंस: **108** · पुलिस: **100** · अग्निशमन: **101** · महिला: **181** · बच्चा: **1098** · आपदा (NDMA): **1078** · मानसिक स्वास्थ्य (KIRAN): **1800-599-0019**। जान के ख़तरे में पहले इन्हें कॉल करें।",
      kn: "📞 **ಸಾಮಾನ್ಯ ಭಾರತ ಸಹಾಯವಾಣಿ** — ತುರ್ತು (ಎಲ್ಲ): **112** · ಆಂಬ್ಯುಲೆನ್ಸ್: **108** · ಪೊಲೀಸ್: **100** · ಅಗ್ನಿಶಾಮಕ: **101** · ಮಹಿಳೆ: **181** · ಮಗು: **1098** · ವಿಪತ್ತು (NDMA): **1078** · ಮಾನಸಿಕ ಆರೋಗ್ಯ (KIRAN): **1800-599-0019**. ಜೀವಕ್ಕೆ ಅಪಾಯವಿದ್ದರೆ ಮೊದಲು ಇವುಗಳಿಗೆ ಕರೆ ಮಾಡಿ.",
    },
  },
  {
    id: 'thanks',
    keywords: ['thanks', 'thank you', 'great', 'awesome', 'cool', 'dhanyavaad', 'धन्यवाद', 'शुक्रिया', 'ಧನ್ಯವಾದ'],
    reply: {
      en: "You're welcome! 🙌 Stay safe. Ask me anything else whenever you need.",
      hi: "आपका स्वागत है! 🙌 सुरक्षित रहें। जब भी ज़रूरत हो, कुछ भी पूछें।",
      kn: "ಸ್ವಾಗತ! 🙌 ಸುರಕ್ಷಿತವಾಗಿರಿ. ಯಾವಾಗ ಬೇಕಾದರೂ ಕೇಳಿ.",
    },
  },
]

const FALLBACK = {
  en: "I'm not sure about that yet. I can help with: requesting help, volunteering, how matching works, categories, government schemes, or emergency helplines. Try a quick option below 👇",
  hi: "मुझे इसका ठीक पता नहीं। मैं इनमें मदद कर सकता हूँ: मदद माँगना, स्वयंसेवा, मैचिंग, श्रेणियाँ, सरकारी योजनाएँ, या आपातकालीन हेल्पलाइन। नीचे कोई विकल्प चुनें 👇",
  kn: "ಅದು ನನಗೆ ಇನ್ನೂ ಖಚಿತವಿಲ್ಲ. ನಾನು ಇವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ: ಸಹಾಯ ಕೇಳುವುದು, ಸ್ವಯಂಸೇವೆ, ಮ್ಯಾಚಿಂಗ್, ವರ್ಗಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಅಥವಾ ತುರ್ತು ಸಹಾಯವಾಣಿ. ಕೆಳಗೆ ಆಯ್ಕೆ ಮಾಡಿ 👇",
}

export function matchIntent(text, lang = 'en') {
  const t = (text || '').toLowerCase()
  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    let score = 0
    for (const k of intent.keywords) if (t.includes(k.toLowerCase())) score += k.length
    if (score > bestScore) {
      bestScore = score
      best = intent
    }
  }
  const pick = (r) => r[lang] || r.en
  return best && bestScore > 0 ? pick(best.reply) : pick(FALLBACK)
}

export const QUICK_REPLIES = [
  { text: 'I need help', label: { en: 'How to get help', hi: 'मदद कैसे पाएँ', kn: 'ಸಹಾಯ ಹೇಗೆ' } },
  { text: 'How do I volunteer', label: { en: 'Become a volunteer', hi: 'स्वयंसेवक बनें', kn: 'ಸ್ವಯಂಸೇವಕರಾಗಿ' } },
  { text: 'How does matching work', label: { en: 'How matching works', hi: 'मैचिंग कैसे काम करती है', kn: 'ಮ್ಯಾಚಿಂಗ್ ಹೇಗೆ' } },
  { text: 'Tell me about government schemes', label: { en: 'Govt schemes', hi: 'सरकारी योजनाएँ', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' } },
  { text: 'Show helplines', label: { en: 'Emergency helplines', hi: 'आपातकालीन हेल्पलाइन', kn: 'ತುರ್ತು ಸಹಾಯವಾಣಿ' } },
]

// UI strings for the chat widget, per language.
export const UI = {
  title: { en: 'ReliefLink Assistant', hi: 'ReliefLink सहायक', kn: 'ReliefLink ಸಹಾಯಕ' },
  subtitle: {
    en: 'Ask about help, volunteering & schemes',
    hi: 'मदद, स्वयंसेवा और योजनाओं के बारे में पूछें',
    kn: 'ಸಹಾಯ, ಸ್ವಯಂಸೇವೆ ಮತ್ತು ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ',
  },
  placeholder: { en: 'Type your question…', hi: 'अपना सवाल लिखें…', kn: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ…' },
  send: { en: 'Send', hi: 'भेजें', kn: 'ಕಳುಹಿಸಿ' },
  whatsapp: { en: 'Chat on WhatsApp', hi: 'WhatsApp पर चैट करें', kn: 'WhatsApp ನಲ್ಲಿ ಚಾಟ್' },
  requestHelp: { en: 'Request help', hi: 'मदद माँगें', kn: 'ಸಹಾಯ ಕೇಳಿ' },
}
