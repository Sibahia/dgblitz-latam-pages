import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import i18n from '../i18n'

export type Locale = 'es' | 'en'

export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es'
}

function englishPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return '/en'
  if (pathname === '/calculadora') return '/en/calculator'
  if (pathname === '/guias') return '/en/guides'
  if (pathname === '/en' || pathname.startsWith('/en/')) return pathname
  return '/en'
}

function spanishPath(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname === '/en/calculator') return '/calculadora'
  if (pathname === '/en/guides') return '/guias'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname
}

export function useLocale() {
  const location = useLocation()
  const navigate = useNavigate()
  const locale = localeFromPath(location.pathname)

  useEffect(() => {
    if (i18n.resolvedLanguage !== locale) {
      void i18n.changeLanguage(locale)
    }
    document.documentElement.lang = locale
  }, [locale])

  const switchLocale = () => {
    const target = locale === 'es' ? englishPath(location.pathname) : spanishPath(location.pathname)
    navigate(`${target}${location.hash}`, { replace: true })
  }

  return { locale, switchLocale, isEnglish: locale === 'en' }
}
