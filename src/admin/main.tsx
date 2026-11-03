import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AdminApp } from './admin-app'
import '../index.css'

// Той самий службовий файл, що й на сайті: робить адмінку програмою (адмінку й /api він не кешує)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* без нього адмінка працює як звичайно */ })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
