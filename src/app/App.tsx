import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ThemeProvider } from '@/app/providers/ThemeProvider'

const HomePage = lazy(() =>
  import('@/features/home/HomePage').then((module) => ({ default: module.HomePage })),
)
const CalculatorPage = lazy(() =>
  import('@/features/calculator/CalculatorPage').then((module) => ({
    default: module.CalculatorPage,
  })),
)
const GuidesPage = lazy(() =>
  import('@/features/guides/GuidesPage').then((module) => ({ default: module.GuidesPage })),
)
const ArmoryPage = lazy(() =>
  import('../features/armory/ArmoryPage').then((module) => ({ default: module.ArmoryPage })),
)
const NotFoundPage = lazy(() =>
  import('@/features/not-found/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

const configuredBase = import.meta.env.BASE_URL
const basename = configuredBase === '/' ? undefined : configuredBase.replace(/\/$/, '')

function PageLoading() {
  const { t } = useTranslation()

  return (
    <div className="routeLoading" role="status" aria-live="polite">
      {t('common.loading')}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <AppShell>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/calculadora" element={<CalculatorPage />} />
              <Route path="/guias" element={<GuidesPage />} />
              <Route path="/equipo" element={<ArmoryPage />} />
              <Route path="/en" element={<HomePage />} />
              <Route path="/en/calculator" element={<CalculatorPage />} />
              <Route path="/en/guides" element={<GuidesPage />} />
              <Route path="/en/gear" element={<ArmoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}
