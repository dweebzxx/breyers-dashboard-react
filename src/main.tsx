import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('[main] Script loaded')

window.addEventListener('error', (e) => {
  console.error('[main] Global error:', e.message, e.filename, e.lineno, e.error)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[main] Unhandled rejection:', e.reason)
})

const rootEl = document.getElementById('root')
console.log('[main] Root element:', rootEl)

if (!rootEl) {
  document.body.innerHTML = '<pre style="color:red;padding:20px">ERROR: #root element not found</pre>'
} else {
  try {
    console.log('[main] Creating React root...')
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('[main] React root rendered')
  } catch (err) {
    console.error('[main] Failed to render:', err)
    rootEl.innerHTML = `<pre style="color:red;padding:20px">Render error: ${err}</pre>`
  }
}
