import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext(null)
const KEY = 'reliefLink:lang'

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(KEY) || 'en')

  useEffect(() => {
    localStorage.setItem(KEY, lang)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
