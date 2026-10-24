import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cinzel/latin-400.css'
import '@fontsource/cinzel/latin-600.css'
import '@fontsource/cinzel/latin-700.css'
import '@fontsource/alegreya-sans/latin-400.css'
import '@fontsource/alegreya-sans/latin-500.css'
import '@fontsource/alegreya-sans/latin-700.css'
import './styles/tokens.css'
import './styles/global.css'
import './i18n'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
