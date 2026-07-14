import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import RoutePreloader from '@/components/ui/Loader/RoutePreloader.jsx'
import Router from './Router.jsx'
import '@/theme/reset.css'
import '@/theme/main.css'

// Solução para erro de módulos ausentes pós-deploy (Vite chunk load error)
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoutePreloader />
      <Router />
    </BrowserRouter>
  </StrictMode>,
)
