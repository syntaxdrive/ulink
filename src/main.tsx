import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// @ts-ignore
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() { },
  onOfflineReady() { },
})

// Debug: Check if beforeinstallprompt fires
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🎯 BEFOREINSTALLPROMPT FIRED IN MAIN.TSX!', e);
});

// Debug: Check current state
console.log('🔍 PWA Debug Info:', {
  isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  hasServiceWorker: 'serviceWorker' in navigator,
  currentPrompt: (window as any).deferredPrompt
});

import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)


