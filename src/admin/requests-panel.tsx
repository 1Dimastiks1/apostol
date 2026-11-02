import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ClipboardList, Copy, Inbox, Loader2, Phone, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react'
import { REQUEST_TYPES, formatPhone, requestTypeLabel } from '@/lib/request-validation'
import { copyText } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { api, formatDateTime, formatDay, type ParishRequest, type Role } from './api'
import type { Notify } from './admin-app'
import { Empty, Modal, PanelHeader, btn } from './ui'

const POLL_MS = 30_000
const DELETE_WORD = 'видалити'

const TYPE_TONE: Record<string, string> = {
  baptism: 'bg-sky-100 text-sky-800',
  wedding: 'bg-rose-100 text-rose-800',
  liturgy: 'bg-amber-100 text-amber-900',
  catechesis: 'bg-emerald-100 text-emerald-800', // лише для старих заявок
}

type StatusFilter = 'new' | 'done' | 'all'

export function RequestsPanel({ role, notify, onError }: { role: Role; notify: Notify; onError: (e: unknown) => void }) {
  const [items, setItems] = useState<ParishRequest[] | null>(null)
  const [type, setType] = useState<string>('all')
  const [status, setStatus] = useState<StatusFilter>('new')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<ParishRequest | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const load = useCallback(async () => {
    try { setItems(await api<ParishRequest[]>('requests')) } catch (err) { onError(err) }
  }, [onError])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, POLL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  const counts = useMemo(() => {
    const list = items || []
    return {
      new: list.filter((r) => r.status !== 'done').length,
      done: list.filter((r) => r.status === 'done').length,
      all: list.length,
      byType: Object.fromEntries(REQUEST_TYPES.map(([k]) => [k, list.filter((r) => r.type === k && r.status !== 'done').length])),
    }
  }, [items])

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('uk-UA')
    const digits = q.replace(/\D/g, '')
    return (items || []).filter((r) =>
      (type === 'all' || r.type === type) &&
      (status === 'all' || (status === 'done' ? r.status === 'done' : r.status !== 'done')) &&
      (!q || r.name.toLocaleLowerCase('uk-UA').includes(q) || (digits.length > 2 && r.phone.replace(/\D/g, '').includes(digits)) || (r.intention || '').toLocaleLowerCase('uk-UA').includes(q)))
  }, [items, type, status, query])

  async function setDone(r: ParishRequest, done: boolean) {
    setBusyId(r.id)
    try {
      await api(`requests/${encodeURIComponent(r.id)}`, { method: 'PUT', json: { status: done ? 'done' : 'new' } })
      notify({ kind: 'success', title: done ? 'Позначено як опрацьовану' : 'Повернуто в нові', text: `${requestTypeLabel(r.type)} · ${r.name}` })
      await load()
    } catch (err) { onError(err) } finally { setBusyId(null) }
  }

  async function remove() {
    if (!toDelete) return
    setBusyId(toDelete.id)
    try {
      await api(`requests/${encodeURIComponent(toDelete.id)}`, { method: 'DELETE' })
      notify({ kind: 'success', title: 'Заявку видалено' })
      setToDelete(null)
      await load()
    } catch (err) { onError(err) } finally { setBusyId(null) }
  }

  return (
    <div>
      <PanelHeader
        title="Заявки"
        lead="Хрещення та вінчання — з форми на сайті. Оновлюється автоматично."
        actions={<button type="button" className={btn.ghost} onClick={load}><RefreshCw className="size-4" />Оновити</button>}
      />

      <div className="mt-8 grid grid-cols-2 gap-3">
        {REQUEST_TYPES.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setType(type === key ? 'all' : key)} aria-pressed={type === key} className={cn('rounded-2xl border bg-card p-4 text-left transition hover:border-gold', type === key ? 'border-gold ring-2 ring-gold/30' : 'border-border')}>
            <p className="text-xs font-semibold text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl text-ink">{counts.byType[key] ?? 0}<span className="ml-1.5 font-sans text-xs font-semibold text-muted-foreground">нових</span></p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Статус">
          {([['new', 'Нові', counts.new], ['done', 'Опрацьовані', counts.done], ['all', 'Усі', counts.all]] as const).map(([key, label, n]) => (
            <button key={key} type="button" onClick={() => setStatus(key)} aria-pressed={status === key} className={cn('rounded-lg px-3.5 py-2 text-sm font-semibold transition', status === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-ink')}>{label} <span className="opacity-70">{n}</span></button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <span className="sr-only">Пошук</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ім’я, телефон або текст" className="field !py-2.5 !pl-10" />
        </label>
      </div>

      <div className="mt-6 grid gap-4">
        {items === null && <div className="grid place-items-center py-20 text-gold-deep"><Loader2 className="size-7 animate-spin" /></div>}
        {items && visible.length === 0 && (
          items.length === 0
            ? <Empty icon={<Inbox className="size-6" />} title="Заявок ще немає" text="Щойно хтось заповнить форму «Замовити богослужіння» на сайті, заявка з’явиться тут." />
            : <Empty icon={<ClipboardList className="size-6" />} title="Нічого не знайдено" text="Змініть фільтр або пошуковий запит." />
        )}
        {visible.map((r) => {
          const done = r.status === 'done'
          return (
            <article key={r.id} className={cn('rounded-3xl border bg-card p-5 transition sm:p-6', done ? 'border-border opacity-70' : 'border-gold/40 shadow-[0_20px_50px_-35px_rgba(74,15,18,.5)]')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider', TYPE_TONE[r.type] || 'bg-muted text-ink')}>{requestTypeLabel(r.type)}</span>
                {done ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-800"><Check className="size-3" />Опрацьовано</span>
                  : <span className="rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">Нова</span>}
                <span className="ml-auto text-xs text-muted-foreground">надійшла {formatDateTime(r.createdAt)}</span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <h3 className="font-display text-[1.75rem] leading-tight text-ink">{r.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><Phone className="size-4" />{formatPhone(r.phone)}</a>
                    <button type="button" onClick={async () => notify((await copyText(r.phone)) ? { kind: 'success', title: 'Номер скопійовано' } : { kind: 'error', title: 'Не вдалося скопіювати' })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-ink"><Copy className="size-3.5" />Копіювати</button>
                    {r.date && <span className="inline-flex items-center gap-2 text-ink/80"><CalendarDays className="size-4 text-gold-deep" />Бажана дата: <b>{formatDay(r.date)}</b></span>}
                  </div>
                  {r.intention && <p className="mt-4 whitespace-pre-line rounded-2xl bg-parchment/60 p-4 text-sm leading-relaxed text-ink/85">{r.intention}</p>}
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                  {done
                    ? <button type="button" disabled={busyId === r.id} className={btn.ghost} onClick={() => setDone(r, false)}><RotateCcw className="size-4" />Повернути в нові</button>
                    : <button type="button" disabled={busyId === r.id} className={btn.primary} onClick={() => setDone(r, true)}><Check className="size-4" />Опрацьовано</button>}
                  {role === 'admin' && done && <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-red-50 hover:text-red-700" onClick={() => { setConfirmText(''); setToDelete(r) }} aria-label={`Видалити заявку: ${r.name}`}><Trash2 className="size-4" />Видалити назавжди…</button>}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <Modal open={Boolean(toDelete)} title="Видалити заявку назавжди?" onClose={() => setToDelete(null)} footer={<>
        <button type="button" className={btn.ghost} onClick={() => setToDelete(null)}>Скасувати</button>
        <button type="button" className={btn.danger} disabled={confirmText.trim().toLocaleLowerCase('uk-UA') !== DELETE_WORD || busyId === toDelete?.id} onClick={remove}><Trash2 className="size-4" />Видалити назавжди</button>
      </>}>
        {toDelete && (
          <div className="grid gap-5">
            <div className="rounded-2xl bg-parchment/60 p-4 text-sm">
              <p className="font-display text-xl text-ink">{toDelete.name}</p>
              <p className="mt-1 text-muted-foreground">{requestTypeLabel(toDelete.type)} · {formatPhone(toDelete.phone)}</p>
            </div>
            <p className="text-sm leading-relaxed text-ink/80">Заявку буде видалено без можливості відновити. Щоб підтвердити, введіть слово <b className="rounded bg-red-50 px-1.5 py-0.5 text-red-700">{DELETE_WORD}</b>.</p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmText.trim().toLocaleLowerCase('uk-UA') === DELETE_WORD && remove()} className="field" placeholder={DELETE_WORD} autoComplete="off" aria-label="Слово підтвердження" />
          </div>
        )}
      </Modal>
    </div>
  )
}
