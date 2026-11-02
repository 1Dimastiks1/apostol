import { useEffect, useMemo, useState } from 'react'
import {
  type AdminEvent, type FacebookSnapshot, type ParishPost, type Stream,
  FALLBACK_POSTS, FALLBACK_STREAMS, RETENTION_DAYS,
  embedUrl, formatDateTime, isRecent, timeOf,
} from '@/lib/parish'

const POLL_MS = 60_000

async function fetchFirstArray<T>(paths: string[]): Promise<T[] | null> {
  for (const path of paths) {
    try {
      const res = await fetch(new URL(path, document.baseURI), { cache: 'no-store', headers: { accept: 'application/json' } })
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data)) return data as T[]
    } catch { /* пробуємо наступне джерело */ }
  }
  return null
}

async function fetchFacebook(): Promise<FacebookSnapshot | null> {
  try {
    const base = String(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
    const res = await fetch(`${base}/api/facebook-content`, { cache: 'no-store', headers: { accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function usePolling<T>(load: () => Promise<T>, initial: T) {
  const [value, setValue] = useState<T>(initial)
  useEffect(() => {
    let alive = true
    let last = ''
    const tick = async () => {
      const next = await load()
      const sig = JSON.stringify(next)
      if (alive && sig !== last) { last = sig; setValue(next) }
    }
    tick()
    const timer = window.setInterval(tick, POLL_MS)
    return () => { alive = false; window.clearInterval(timer) }
  }, [load])
  return value
}

function eventImage(item: AdminEvent) {
  if (item.hasImage) return new URL(`api/events/${encodeURIComponent(item.id)}/image?v=${encodeURIComponent(item.imageUpdatedAt || '')}`, document.baseURI).href
  return item.imageUrl ? new URL(item.imageUrl, document.baseURI).href : null
}

const loadEvents = () => fetchFirstArray<AdminEvent>(['api/events', 'events.json', 'data/events.json'])
const loadStreams = () => fetchFirstArray<Stream>(['api/streams', 'data/streams.json', 'streams.json'])

export type Announcement = {
  eyebrow: string
  title: string
  text: string
  rich: boolean
  href?: string
  linkLabel: string
}

export type ParishData = {
  posts: ParishPost[]
  current: Stream | null
  archive: Stream[]
  announcement: Announcement | null
  syncStatus: string
}

export function useParishData(): ParishData {
  const events = usePolling(loadEvents, null)
  const adminStreams = usePolling(loadStreams, null)
  const facebook = usePolling(fetchFacebook, null)

  return useMemo(() => {
    const retention = Number(facebook?.retentionDays) || RETENTION_DAYS
    const fbLive = Boolean(facebook?.configured && facebook.updatedAt && Object.values(facebook.sourceStatus || {}).some(Boolean))

    // Події з адмінки — завжди показуємо, вони керуються вручну
    const adminPosts: ParishPost[] = (events || []).map((item) => ({
      id: item.id,
      date: (item.date || '').slice(0, 10),
      dateLabel: formatDateTime(item.date),
      title: item.title || '',
      text: item.description || '',
      href: item.link || '',
      imageUrl: eventImage(item),
      category: 'schedule',
      type: 'Подія парафії',
      createdAt: item.date || item.createdAt,
      rich: true,
    }))

    const basePosts = (fbLive && facebook?.posts?.length ? facebook.posts : FALLBACK_POSTS)
      .filter((post) => isRecent(post, retention))
      .map((post) => ({ ...post, dateLabel: post.dateLabel || post.date }))
    const adminIds = new Set(adminPosts.map((p) => p.id))
    const posts = [...adminPosts, ...basePosts.filter((p) => !adminIds.has(p.id))]

    // Ефіри: адмінка → Facebook API → статичні записи
    let streams: Stream[] = (adminStreams || []).filter((s) => s && embedUrl(s.videoUrl))
    if (!streams.length && fbLive && facebook?.videos?.length) {
      streams = facebook.videos.filter((v) => isRecent(v, retention)).map((v) => ({
        id: v.id, title: v.title || 'Запис богослужіння', videoUrl: v.href, createdAt: v.createdAt, dateLabel: v.dateLabel,
        isLive: facebook.liveVideo?.id === v.id,
      }))
      if (facebook.liveVideo && !streams.some((s) => s.id === facebook.liveVideo!.id)) {
        const lv = facebook.liveVideo
        streams.unshift({ id: lv.id, title: lv.title || 'Пряма трансляція', videoUrl: lv.href, createdAt: lv.createdAt, isLive: true })
      }
    }
    if (!streams.length) streams = FALLBACK_STREAMS.filter((s) => isRecent(s, retention))

    const sorted = [...streams].sort((a, b) => timeOf(b) - timeOf(a))
    const current = sorted.find((s) => s.isLive) || sorted.find((s) => s.isPrimary) || sorted[0] || null
    const archive = sorted.filter((s) => s !== current).slice(0, 9)

    // Оголошення в першому екрані: найближча подія з адмінки або останній допис про розклад
    const now = Date.now()
    const upcoming = (events || [])
      .filter((e) => { const t = Date.parse(e.date || ''); return !Number.isFinite(t) || t + 4 * 3_600_000 >= now })
      .sort((a, b) => (Date.parse(a.date || '') || 0) - (Date.parse(b.date || '') || 0))
    const nextEvent = upcoming[0] || events?.[0]
    let announcement: Announcement | null = null
    if (nextEvent) {
      announcement = {
        eyebrow: `Оголошення · ${formatDateTime(nextEvent.date)}`,
        title: nextEvent.title || 'Подія парафії',
        text: nextEvent.description || '',
        rich: true,
        href: nextEvent.link || undefined,
        linkLabel: 'Перейти до ефіру / оголошення',
      }
    } else {
      const schedulePost = basePosts.find((p) => p.category === 'schedule')
      if (schedulePost) {
        announcement = {
          eyebrow: `Оголошення · ${schedulePost.dateLabel}`,
          title: schedulePost.title,
          text: schedulePost.text,
          rich: false,
          href: schedulePost.href,
          linkLabel: 'Допис у Facebook',
        }
      }
    }

    let syncStatus = 'Офіційні богослужіння та трансляції · Facebook'
    if (fbLive && facebook?.updatedAt) {
      const time = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' }).format(new Date(facebook.updatedAt))
      syncStatus = Array.isArray(facebook.warnings) && facebook.warnings.length ? `Часткова синхронізація · ${time}` : `Оновлено з Facebook о ${time}`
    } else if (facebook?.configured && facebook.updatedAt) {
      syncStatus = 'Синхронізація очікує дозволів Facebook API'
    }

    return { posts, current, archive, announcement, syncStatus }
  }, [events, adminStreams, facebook])
}
