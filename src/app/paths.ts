import type { Locale } from './useLocale'

export type RouteKey = 'home' | 'calculator' | 'guides'

export function routePath(locale: Locale, route: RouteKey): string {
  if (locale === 'en') {
    if (route === 'calculator') return '/en/calculator'
    if (route === 'guides') return '/en/guides'
    return '/en'
  }
  if (route === 'calculator') return '/calculadora'
  if (route === 'guides') return '/guias'
  return '/'
}

export function guideAnchor(locale: Locale, anchor: string): string {
  return `${routePath(locale, 'guides')}#${anchor}`
}
