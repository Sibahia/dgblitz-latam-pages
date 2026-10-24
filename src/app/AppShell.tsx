import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop__image" />
        <div className="backdrop__scrim" />
        <div className="backdrop__glow" />
      </div>
      <a className="skipLink" href="#main-content">
        {t('common.skipToContent')}
      </a>
      <div className="page">
        <Header />
        <main id="main-content" className="pageMain" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
      <ScrollToTop />
    </>
  )
}
