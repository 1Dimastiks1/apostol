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

// Safari та браузери на iPhone/iPad (WebKit) отримують полегшені ефекти, інакше сторінка смикається
const ua = navigator.userAgent
if (/iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || (/Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|Android)/.test(ua))) {
  document.documentElement.classList.add('is-webkit')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
