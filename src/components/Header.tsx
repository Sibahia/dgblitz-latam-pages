import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { routePath, type RouteKey } from '@/app/paths'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useLocale } from '@/app/useLocale'
import styles from './Header.module.css'

const NAV_ITEMS: Array<{ route: RouteKey; label: string }> = [
  { route: 'home', label: 'nav.home' },
  { route: 'calculator', label: 'nav.calculator' },
  { route: 'armory', label: 'nav.armory' },
  { route: 'guides', label: 'nav.guides' },
]

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M20.3 15.1A8.6 8.6 0 0 1 8.9 3.7 8.7 8.7 0 1 0 20.3 15.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.55v-2.14c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.4-2.7 5.38-5.28 5.67.41.36.78 1.06.78 2.14v3.18c0 .3.21.66.8.55A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  )
}

export function Header() {
  const { t } = useTranslation()
  const { locale, switchLocale, isEnglish } = useLocale()
  const { theme, toggleTheme } = useTheme()
  const homePath = routePath(locale, 'home')
  const themeLabel = theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.brand} to={homePath}>
          <span className={styles.brandMark} aria-hidden="true">
            <span>DB</span>
          </span>
          <span className={styles.brandText}>
            <strong>DGBLITZ</strong>
            <small>LATAM</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label={t('nav.menu')}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.route}
              to={routePath(locale, item.route)}
              end={item.route === 'home'}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.language}
            onClick={switchLocale}
            title={t('nav.language')}
          >
            <span className="sr-only">{t('nav.language')}</span>
            <span className={!isEnglish ? styles.langActive : undefined}>ES</span>
            <span className={styles.langDivider} aria-hidden="true">
              /
            </span>
            <span className={isEnglish ? styles.langActive : undefined}>EN</span>
          </button>

          <button
            type="button"
            className={styles.iconControl}
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            className={styles.iconControl}
            href="https://github.com/Sibahia/dgblitz-latam-pages"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('nav.github')}
            title={t('nav.github')}
          >
            <GithubIcon />
          </a>
        </div>
      </div>
      <div className={styles.rule} />
    </header>
  )
}
