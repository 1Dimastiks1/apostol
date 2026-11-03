/** Експорт у CSV (відкривається в Excel / Google Таблицях). Клітинки, що починаються з = + - @, екрануються, щоб у таблиці не виконалась формула. */
const cell = (value: unknown) => {
  let text = String(value ?? '').replace(/\r?\n/g, ' ')
  if (/^[=+\-@\t]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadCsv(filename: string, header: string[], rows: unknown[][]) {
  const body = [header, ...rows].map((row) => row.map(cell).join(';')).join('\r\n')
  const blob = new Blob([`﻿${body}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const stamp = () => new Date().toISOString().slice(0, 10)
