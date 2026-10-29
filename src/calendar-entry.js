import officialDailyData from '../calendar-module/calendar-2026.json'
import '../calendar-module/styles.css'

window.__CHURCH_CALENDAR_OFFICIAL_DATA__ = officialDailyData

try {
  await import('../calendar-module/app.js')
  if (typeof window.mountChurchCalendar === 'function' && document.querySelector('#church-calendar-widget')) {
    window.mountChurchCalendar('#church-calendar-widget')
  }
} catch {
  const host = document.querySelector('#church-calendar-widget')
  if (host && !host.textContent.trim()) {
    host.innerHTML = '<p class="cc-calendar-fallback">Церковний календар тимчасово недоступний. Звірте день на pomisna.info.</p>'
  }
}
