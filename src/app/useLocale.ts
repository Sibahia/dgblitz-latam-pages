import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import i18n from '@/i18n'

export type Locale = 'es' | 'en'

export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es'
}

const ROUTE_PAIRS: ReadonlyArray<readonly [spanish: string, english: string]> = [
  ['/calculadora', '/en/calculator'],
  ['/guias', '/en/guides'],
  ['/equipo', '/en/gear'],
]

function englishPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return '/en'
  const pair = ROUTE_PAIRS.find(([spanish]) => spanish === pathname)
  if (pair) return pair[1]
  if (pathname === '/en' || pathname.startsWith('/en/')) return pathname
  return '/en'
}

function spanishPath(pathname: string): string {
  if (pathname === '/en') return '/'
  const pair = ROUTE_PAIRS.find(([, english]) => english === pathname)
  if (pair) return pair[0]
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
    navigate(`${target}${location.search}${location.hash}`, { replace: true })
  }

  return { locale, switchLocale, isEnglish: locale === 'en' }
}
