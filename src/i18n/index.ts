import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import es from './es'

function detectLocale(): 'es' | 'en' {
  if (typeof window === 'undefined') return 'es'
  const base = import.meta.env.BASE_URL
  const path = window.location.pathname
  const relative = base !== '/' && path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '')
  return relative === 'en' || relative.startsWith('en/') ? 'en' : 'es'
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: detectLocale(),
  fallbackLng: 'en',
  supportedLngs: ['es', 'en'],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})

export default i18n
