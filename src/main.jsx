import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import MissingConfigScreen from './components/MissingConfigScreen.jsx'
import { hasSupabaseConfig, supabaseConfigErrorMessage } from './db.js'
import { initTracking } from './utils/tracking.js'

initTracking()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {hasSupabaseConfig ? <App /> : <MissingConfigScreen message={supabaseConfigErrorMessage} />}
    </ErrorBoundary>
    <Analytics />
  </StrictMode>,
)
