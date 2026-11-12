import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { inject } from '@vercel/analytics'
import './index.css'

// Анонімна статистика відвідувань без cookie (Vercel Web Analytics: вмикається в панелі Vercel → Analytics)
if (import.meta.env.PROD) inject({ mode: 'production' })

// Робота без інтернету та встановлення як програми (лише у зібраній версії)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* без службового файлу сайт просто працює як звичайно */ })
  })
}

// Safari та браузери на iPhone/iPad (WebKit) отримують полегшені ефекти, інакше сторінка смикається
const ua = navigator.userAgent
if (/iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || (/Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|Android)/.test(ua))) {
  document.documentElement.classList.add('is-webkit')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
