export const PARISH_PAGE = 'https://www.facebook.com/profile.php?id=100074930874982'
export const PARISH_ALBUMS = 'https://www.facebook.com/profile.php?id=100074930874982&sk=photos_albums'
export const RECTOR_PAGE = 'https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA'
export const RECTOR_VIDEOS = 'https://www.facebook.com/protoierej.oleksandr.cisar/videos'
export const SCHEDULE_POST = 'https://www.facebook.com/permalink.php?story_fbid=pfbid0wr4Gq5GgukTM1AWhKbAwocCBJEUns2HS39yzNCEGE4MLFctjx4joBaM6xLEXwQP3l&id=100059029128700'
export const PHONE = '+380971312886'
export const PHONE_LABEL = '+38 (097) 131-28-86'
export const ADDRESS = 'м. Кам’янець-Подільський, вул. Татарська, 9'
export const MAPS_URL = "https://maps.google.com/?q=Татарська+9,+Кам'янець-Подільський"
export const MAPS_EMBED = 'https://maps.google.com/maps?q=%D0%A5%D1%80%D0%B0%D0%BC%20%D1%81%D0%B2%D1%8F%D1%82%D0%B8%D1%85%20%D0%B0%D0%BF%D0%BE%D1%81%D1%82%D0%BE%D0%BB%D1%96%D0%B2%20%D0%9F%D0%B5%D1%82%D1%80%D0%B0%20%D1%96%20%D0%9F%D0%B0%D0%B2%D0%BB%D0%B0%2C%20%D0%A2%D0%B0%D1%82%D0%B0%D1%80%D1%81%D1%8C%D0%BA%D0%B0%209%2C%20%D0%9A%D0%B0%D0%BC%E2%80%99%D1%8F%D0%BD%D0%B5%D1%86%D1%8C-%D0%9F%D0%BE%D0%B4%D1%96%D0%BB%D1%8C%D1%81%D1%8C%D0%BA%D0%B8%D0%B9&z=16&output=embed'
export const PAYMENT_URL = 'https://next.privat24.ua/send/4yhx3'
export const MONO_URL = 'https://send.monobank.ua/'
export const REVIEWS_URL = 'https://list.in.ua/94606/%D0%A5%D1%80%D0%B0%D0%BC-%D1%81%D0%B2%D1%8F%D1%82%D0%B8%D1%85-%D0%B0%D0%BF%D0%BE%D1%81%D1%82%D0%BE%D0%BB%D1%96%D0%B2-%D0%9F%D0%B5%D1%82%D1%80%D0%B0-%D1%96-%D0%9F%D0%B0%D0%B2%D0%BB%D0%B0-%D0%9A%D0%B0%D0%BC%27%D1%8F%D0%BD%D0%B5%D1%86%D1%8C-%D0%9F%D0%BE%D0%B4%D1%96%D0%BB%D1%8C%D1%81%D1%8C%D0%BA%D0%B8%D0%B9'

/** Скільки днів показуємо дописи й записи ефірів (як і раніше) */
export const RETENTION_DAYS = 14

/** Власні світлини парафії з public/images */
export const photo = (file: string) => `${import.meta.env.BASE_URL}images/${file}`

/** Атмосферні світлини з Unsplash (вільна ліцензія). Це НЕ фото нашого храму. */
export const stock = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const STOCK = {
  candlesGold: '1782235795572-1baf562edc06',
  candelabrumIcons: '1783701075353-1cdae6042b32',
  iconCandlesStone: '1789322650815-50a353f748cf',
  candlesChurch: '1697926156905-c4fcd0504936',
  iconostasisGold: '1763787465403-a29212e79df1',
  frescoInterior: '1787933611140-f11a46244c03',
  iconostasisDome: '1790611371795-3d501b935c3f',
  stoneChurch: '1759306695248-d266836d624b',
  christMosaic: '1602802490525-79e3e5062d1b',
  theotokos: '1790703660597-76079f851cb1',
  gospel: '1504052434569-70ad5836ab65',
} as const

export type ParishPost = {
  id: string
  date: string
  dateLabel: string
  title: string
  text: string
  href?: string
  imageUrl?: string | null
  category: 'schedule' | 'service' | 'volunteer' | string
  type: string
  createdAt?: string
  rich?: boolean
}

export type Stream = {
  id: string
  title: string
  description?: string
  videoUrl: string
  date?: string
  dateLabel?: string
  isLive?: boolean
  isPrimary?: boolean
  createdAt?: string
}

export type AdminEvent = {
  id: string
  title?: string
  description?: string
  date?: string
  link?: string
  hasImage?: boolean
  imageUpdatedAt?: string
  /** Статичне фото з початкових даних (шлях відносно сайту) */
  imageUrl?: string
  createdAt?: string
}

export type FacebookSnapshot = {
  configured?: boolean
  updatedAt?: string
  retentionDays?: number
  posts?: ParishPost[]
  videos?: { id: string; href: string; title?: string; dateLabel?: string; createdAt?: string }[]
  liveVideo?: { id: string; href: string; title?: string; dateLabel?: string; createdAt?: string } | null
  sourceStatus?: Record<string, boolean>
  warnings?: unknown[]
}

/* ── Статичні дані, що показуються, поки немає даних з адмінки чи Facebook ── */

/** Події та оголошення керуються з адмінки (events.json) і Facebook; власних прикладів у коді більше немає */
export const FALLBACK_POSTS: ParishPost[] = []

// Ефіри керуються через адмін-панель (streams.json — лише початкові дані)
export const FALLBACK_STREAMS: Stream[] = []

export const SUNDAY_SCHEDULE = [
  { time: '08:00', title: 'Сповідь', text: 'Таїнство сповіді для тих, хто готується до Святого Причастя в неділю чи свято.' },
  { time: '09:00', title: 'Божественна Літургія', text: 'Урочиста Літургія за участю парафіяльного хору. Транслюється наживо на сторінці настоятеля.', live: true },
  { time: '11:00', title: 'Молебень за Україну', text: 'Молитва за здоров’я воїнів-захисників, мир на рідній землі, окроплення освяченою водою.' },
]

/* ── Утиліти ── */

const dateFmt = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

export const formatDate = (value?: string) => {
  const t = Date.parse(value || '')
  return Number.isFinite(t) ? dateFmt.format(new Date(t)) : (value || '')
}
export const formatDateTime = (value?: string) => {
  const t = Date.parse(value || '')
  return Number.isFinite(t) ? dateTimeFmt.format(new Date(t)) : (value || '')
}

export const timeOf = (item: { date?: string; createdAt?: string }) => {
  const t = Date.parse(item.createdAt || item.date || '')
  return Number.isFinite(t) ? t : 0
}

export const isRecent = (item: { date?: string; createdAt?: string }, days = RETENTION_DAYS) => {
  const t = Date.parse(item.createdAt || (item.date ? `${item.date}T23:59:59+03:00` : ''))
  return Number.isFinite(t) && t >= Date.now() - days * 86_400_000
}

export function safeHttpUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value, document.baseURI)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

export function safeImageUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value, document.baseURI)
    // Власні світлини з /images/ та фото подій, які віддає наш API
    const sameOrigin = url.origin === window.location.origin && (url.pathname.includes('/images/') || /\/api\/events\/[^/]+\/image$/.test(url.pathname))
    const fbCdn = url.protocol === 'https:' && url.hostname.endsWith('fbcdn.net')
    return sameOrigin || fbCdn ? url.href : null
  } catch {
    return null
  }
}

/** Посилання для вбудовування відео Facebook або YouTube */
export function embedUrl(value?: string) {
  const href = safeHttpUrl(value)
  if (!href) return null
  const url = new URL(href)
  const host = url.hostname.replace(/^(www|m)\./u, '')
  if (host === 'facebook.com' || host === 'fb.watch') {
    const embed = new URL('https://www.facebook.com/plugins/video.php')
    embed.searchParams.set('href', href)
    embed.searchParams.set('show_text', 'false')
    embed.searchParams.set('width', '560')
    return embed.href
  }
  if (host === 'youtube.com' || host === 'youtu.be') {
    let id = url.searchParams.get('v')
    if (!id && host === 'youtu.be') id = url.pathname.slice(1)
    if (!id) id = url.pathname.match(/\/(?:embed|live|shorts)\/([\w-]+)/u)?.[1] ?? null
    if (id && /^[\w-]+$/u.test(id)) return `https://www.youtube.com/embed/${id}`
  }
  return null
}

/** Пропускає лише безпечні теги з опису події, створеного в адмінці */
export function sanitizeRichHtml(input?: string) {
  if (!input) return ''
  const doc = new DOMParser().parseFromString(String(input), 'text/html')
  const allowed = new Set(['A', 'B', 'STRONG', 'I', 'EM', 'BR', 'SPAN', 'P'])
  const clean = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue
      if (child.nodeType !== Node.ELEMENT_NODE || !allowed.has(child.nodeName)) {
        node.replaceChild(document.createTextNode(child.textContent || ''), child)
        continue
      }
      const el = child as Element
      for (const attr of [...el.attributes]) {
        if (el.nodeName === 'A' && ['href', 'title'].includes(attr.name)) continue
        el.removeAttribute(attr.name)
      }
      if (el.nodeName === 'A') {
        el.setAttribute('href', safeHttpUrl(el.getAttribute('href')) || '#')
        el.setAttribute('target', '_blank')
        el.setAttribute('rel', 'noopener noreferrer')
      }
      clean(el)
    }
  }
  clean(doc.body)
  return doc.body.innerHTML
}

export async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* перейдемо до запасного способу */ }
  const field = document.createElement('textarea')
  field.value = text
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.append(field)
  field.select()
  const ok = document.execCommand('copy')
  field.remove()
  return ok
}
