/** Ті самі правила, що й на сервері (server/parish-api.mjs) — щоб помилки було видно ще до надсилання */
export const REQUEST_TYPES = [
  ['baptism', 'Хрещення'],
  ['wedding', 'Вінчання'],
] as const

export type RequestType = (typeof REQUEST_TYPES)[number][0]

export type RequestForm = {
  type: RequestType
  name: string
  phone: string
  date: string
  intention: string
  consent: boolean
}

export type FieldErrors = Partial<Record<keyof RequestForm, string>>

// Старі заявки могли мати типи, яких на сайті вже немає
const LEGACY_TYPES: Record<string, string> = { liturgy: 'Служба Божа на намір', catechesis: 'Катехеза / бесіда' }
export const requestTypeLabel = (type: string) => REQUEST_TYPES.find(([k]) => k === type)?.[1] ?? LEGACY_TYPES[type] ?? type

export function normalizePhone(value: string) {
  const digits = value.replace(/[\s()\-.]/g, '')
  if (/^\+?380\d{9}$/.test(digits)) return `+${digits.replace(/^\+/, '')}`
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`
  return null
}

/** Лишає лише цифри номера після +38 і форматує як 0XX XXX XX XX (вставлений +380… теж зрозуміє) */
export function formatLocalPhone(input: string) {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('380') && digits.length > 10) digits = digits.slice(2)
  else if (digits.startsWith('38') && digits.length > 10) digits = digits.slice(2)
  digits = digits.slice(0, 10)
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(' ')
}

/** Повний номер для відправки: +38 + 10 цифр */
export const fullPhone = (local: string) => `+38${local.replace(/\D/g, '')}`

/** +380 97 131 28 86 */
export function formatPhone(value: string) {
  const n = normalizePhone(value)
  if (!n) return value
  return `${n.slice(0, 4)} ${n.slice(4, 6)} ${n.slice(6, 9)} ${n.slice(9, 11)} ${n.slice(11)}`
}

export function validateRequest(form: RequestForm): FieldErrors {
  const errors: FieldErrors = {}
  const name = form.name.trim().replace(/\s+/g, ' ')
  if (name.length < 2) errors.name = 'Вкажіть ім’я (щонайменше 2 літери)'
  else if (name.length > 80 || !/^[\p{L}][\p{L}\s'’ʼ.-]*$/u.test(name)) errors.name = 'Ім’я може містити лише літери, пробіл, апостроф чи дефіс'
  const localDigits = form.phone.replace(/\D/g, '')
  if (!localDigits) errors.phone = 'Вкажіть номер телефону, щоб вам могли передзвонити'
  else if (!/^0\d{9}$/.test(localDigits)) errors.phone = localDigits.length < 10 ? 'Введіть усі 10 цифр, починаючи з 0 (наприклад, 097 123 45 67)' : 'Номер має починатися з 0 (наприклад, 097 123 45 67)'
  if (form.date) {
    const d = new Date(`${form.date}T23:59:59`)
    if (Number.isNaN(d.getTime())) errors.date = 'Невірна дата'
    else if (d.getTime() < Date.now() - 86_400_000) errors.date = 'Дата не може бути в минулому'
  }
  if (form.intention.length > 1000) errors.intention = 'Коментар задовгий (до 1000 символів)'
  if (!form.consent) errors.consent = 'Поставте галочку, щоб підтвердити дані'
  return errors
}
