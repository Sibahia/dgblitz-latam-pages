import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useLocale } from './useLocale'

function LocaleHarness() {
  const { locale, switchLocale } = useLocale()
  const location = useLocation()

  return (
    <div>
      <button type="button" onClick={switchLocale}>
        {locale}
      </button>
      <output data-testid="location">
        {location.pathname}
        {location.search}
        {location.hash}
      </output>
    </div>
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleHarness />
    </MemoryRouter>,
  )
}

describe('useLocale', () => {
  it('keeps filters and hash when switching to English', async () => {
    const user = userEvent.setup()
    renderAt('/equipo?clase=rogue&q=garra#resultados')

    await user.click(screen.getByRole('button', { name: 'es' }))

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/en/gear?clase=rogue&q=garra#resultados',
    )
  })

  it('keeps filters and hash when switching to Spanish', async () => {
    const user = userEvent.setup()
    renderAt('/en/gear?clase=mage&q=baston#resultados')

    await user.click(screen.getByRole('button', { name: 'en' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/equipo?clase=mage&q=baston#resultados')
  })
})
