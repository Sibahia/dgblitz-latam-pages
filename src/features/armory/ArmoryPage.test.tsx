import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import '../../i18n'
import { ArmoryPage } from './ArmoryPage'

function LocationProbe() {
  const location = useLocation()

  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ArmoryPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('ArmoryPage', () => {
  it('renders the shell with the paladin selected by default', async () => {
    renderAt('/equipo')

    expect(await screen.findByRole('heading', { level: 1, name: 'Armería' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paladín' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('writes the selected class to the URL without losing other filters', async () => {
    const user = userEvent.setup()
    renderAt('/equipo?q=hoja')

    await user.click(await screen.findByRole('button', { name: 'Pícaro' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/equipo?q=hoja&clase=rogue')
    expect(screen.getByRole('button', { name: 'Pícaro' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('falls back to the paladin class for unknown values', async () => {
    renderAt('/equipo?clase=warlock')

    expect(await screen.findByRole('button', { name: 'Paladín' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('renders the paladin weapon slice with the three real icons', async () => {
    renderAt('/equipo')

    expect(await screen.findByText("Farmer's Axe")).toBeInTheDocument()
    expect(screen.getByText("Goblin's Chopper")).toBeInTheDocument()
    expect(screen.getByText('Illyric Axe')).toBeInTheDocument()
    expect(screen.getByText('Vista parcial: 3 de 157')).toBeInTheDocument()
  })

  it('filters by subtype and writes the filter to the URL', async () => {
    const user = userEvent.setup()
    renderAt('/equipo')

    await user.click(await screen.findByRole('button', { name: 'Mazas' }))

    expect(await screen.findByText('Simple Mace')).toBeInTheDocument()
    expect(screen.queryByText("Farmer's Axe")).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/equipo?tipo=mace')
  })

  it('filters by search without losing the selected class', async () => {
    const user = userEvent.setup()
    renderAt('/equipo?clase=paladin')

    const search = await screen.findByRole('searchbox', { name: 'Buscar' })
    await user.type(search, 'goblin')

    expect(await screen.findByText("Goblin's Chopper")).toBeInTheDocument()
    expect(screen.queryByText("Farmer's Axe")).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/equipo?clase=paladin&q=goblin')
  })

  it('switches slots and resets the subtype filter', async () => {
    const user = userEvent.setup()
    renderAt('/equipo?tipo=axe')

    await user.click(await screen.findByRole('button', { name: /Armadura/ }))

    expect(await screen.findByText('Lion Armor')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/equipo?ranura=armor')
  })

  it('expands variants and opens the source dialog from a variant', async () => {
    const user = userEvent.setup()
    renderAt('/equipo')

    await screen.findByText("Farmer's Axe")
    await user.click(screen.getAllByRole('button', { name: 'Ver variantes' })[0])

    const variantRow = (await screen.findByText('Seaside Galestrike')).closest('li')
    expect(variantRow).not.toBeNull()
    await user.click(
      within(variantRow as HTMLElement).getByRole('button', {
        name: 'Ver fuente y misiones',
      }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Fuente y misiones')).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: 'Ghost · Nivel 5' })).toBeInTheDocument()
    expect(within(dialog).getByText('Ghost')).toBeInTheDocument()
    expect(within(dialog).getAllByText("The Dragon's Dream").length).toBeGreaterThan(0)

    await user.click(within(dialog).getAllByRole('button', { name: 'Cerrar' })[0])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
