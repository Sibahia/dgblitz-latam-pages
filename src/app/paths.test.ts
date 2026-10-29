import { describe, expect, it } from 'vitest'
import { guideAnchor, routePath } from './paths'

describe('routePath', () => {
  it('maps the armory to its localized routes', () => {
    expect(routePath('es', 'armory')).toBe('/equipo')
    expect(routePath('en', 'armory')).toBe('/en/gear')
  })

  it('keeps the existing localized routes', () => {
    expect(routePath('es', 'home')).toBe('/')
    expect(routePath('es', 'calculator')).toBe('/calculadora')
    expect(routePath('es', 'guides')).toBe('/guias')
    expect(routePath('en', 'home')).toBe('/en')
    expect(routePath('en', 'calculator')).toBe('/en/calculator')
    expect(routePath('en', 'guides')).toBe('/en/guides')
  })
})

describe('guideAnchor', () => {
  it('builds links against the localized guides route', () => {
    expect(guideAnchor('es', 'talents')).toBe('/guias#talents')
    expect(guideAnchor('en', 'talents')).toBe('/en/guides#talents')
  })
})
