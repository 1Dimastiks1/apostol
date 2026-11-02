import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Copy, Inbox, Loader2, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import { copyText } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { api, formatDateTime, type ParishNote, type Role } from './api'
import type { Notify } from './admin-app'
import { Empty, Modal, PanelHeader, btn } from './ui'

const POLL_MS = 30_000
const DELETE_WORD = 'видалити'
type StatusFilter = 'new' | 'done' | 'all'
const kindLabel = (k: string) => (k === 'health' ? 'За здоров’я' : 'За упокій')

export function NotesPanel({ role, notify, onError }: { role: Role; notify: Notify; onError: (e: unknown) => void }) {
  const [items, setItems] = useState<ParishNote[] | null>(null)
  const [status, setStatus] = useState<StatusFilter>('new')
  const [kind, setKind] = useState<'all' | 'health' | 'repose'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<ParishNote | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const load = useCallback(async () => {
    try { setItems(await api<ParishNote[]>('notes')) } catch (err) { onError(err) }
  }, [onError])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, POLL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  const counts = useMemo(() => {
    const list = items || []
    return { new: list.filter((n) => n.status !== 'done').length, done: list.filter((n) => n.status === 'done').length, all: list.length }
  }, [items])

  const visible = useMemo(() => (items || []).filter((n) =>
    (kind === 'all' || n.kind === kind) && (status === 'all' || (status === 'done' ? n.status === 'done' : n.status !== 'done'))), [items, kind, status])

  async function setDone(n: ParishNote, done: boolean) {
    setBusyId(n.id)
    try {
      await api(`notes/${encodeURIComponent(n.id)}`, { method: 'PUT', json: { status: done ? 'done' : 'new' } })
      notify({ kind: 'success', title: done ? 'Записку опрацьовано' : 'Повернуто в нові' })
      await load()
    } catch (err) { onError(err) } finally { setBusyId(null) }
  }

  async function remove() {
    if (!toDelete) return
    setBusyId(toDelete.id)
    try {
      await api(`notes/${encodeURIComponent(toDelete.id)}`, { method: 'DELETE' })
      notify({ kind: 'success', title: 'Записку видалено' })
      setToDelete(null)
      await load()
    } catch (err) { onError(err) } finally { setBusyId(null) }
  }

  return (
    <div>
      <PanelHeader title="Записки" lead="Імена для поминання «за здоров’я» та «за упокій», подані через сайт. Оновлюється автоматично." actions={<button type="button" className={btn.ghost} onClick={load}><RefreshCw className="size-4" />Оновити</button>} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Статус">
          {([['new', 'Нові', counts.new], ['done', 'Опрацьовані', counts.done], ['all', 'Усі', counts.all]] as const).map(([key, label, n]) => (
            <button key={key} type="button" onClick={() => setStatus(key)} aria-pressed={status === key} className={cn('rounded-lg px-3.5 py-2 text-sm font-semibold transition', status === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-ink')}>{label} <span className="opacity-70">{n}</span></button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Тип">
          {([['all', 'Усі'], ['health', 'За здоров’я'], ['repose', 'За упокій']] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setKind(key)} aria-pressed={kind === key} className={cn('rounded-lg px-3.5 py-2 text-sm font-semibold transition', kind === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-ink')}>{label}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {items === null && <div className="grid place-items-center py-20 text-gold-deep"><Loader2 className="size-7 animate-spin" /></div>}
        {items && visible.length === 0 && <Empty icon={<Inbox className="size-6" />} title={items.length === 0 ? 'Записок ще немає' : 'Нічого не знайдено'} text={items.length === 0 ? 'Щойно хтось подасть записку на сайті, вона з’явиться тут.' : 'Змініть фільтр.'} />}
        {visible.map((n) => {
          const done = n.status === 'done'
          const living = n.kind === 'health'
          return (
            <article key={n.id} className={cn('rounded-3xl border bg-card p-5 sm:p-6', done ? 'border-border opacity-70' : 'border-gold/40 shadow-[0_20px_50px_-35px_rgba(74,15,18,.5)]')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider', living ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800')}>{kindLabel(n.kind)}</span>
                {done ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-800"><Check className="size-3" />Опрацьовано</span>
                  : <span className="rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">Нова</span>}
                <span className="ml-auto text-xs text-muted-foreground">надійшла {formatDateTime(n.createdAt)}</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <ol className="flex flex-wrap gap-2">
                  {n.names.map((name, i) => <li key={i} className="rounded-xl bg-parchment/70 px-3.5 py-2 font-display text-xl text-ink">{name}</li>)}
                </ol>
                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                  <button type="button" className={btn.ghost} onClick={async () => notify((await copyText(`${kindLabel(n.kind)}: ${n.names.join(', ')}`)) ? { kind: 'success', title: 'Скопійовано' } : { kind: 'error', title: 'Не вдалося скопіювати' })}><Copy className="size-4" />Копіювати</button>
                  {done
                    ? <button type="button" disabled={busyId === n.id} className={btn.ghost} onClick={() => setDone(n, false)}><RotateCcw className="size-4" />Повернути в нові</button>
                    : <button type="button" disabled={busyId === n.id} className={btn.primary} onClick={() => setDone(n, true)}><Check className="size-4" />Опрацьовано</button>}
                  {role === 'admin' && done && <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-red-50 hover:text-red-700" onClick={() => { setConfirmText(''); setToDelete(n) }}><Trash2 className="size-4" />Видалити назавжди…</button>}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <Modal open={Boolean(toDelete)} title="Видалити записку назавжди?" onClose={() => setToDelete(null)} footer={<>
        <button type="button" className={btn.ghost} onClick={() => setToDelete(null)}>Скасувати</button>
        <button type="button" className={btn.danger} disabled={confirmText.trim().toLocaleLowerCase('uk-UA') !== DELETE_WORD || busyId === toDelete?.id} onClick={remove}><Trash2 className="size-4" />Видалити назавжди</button>
      </>}>
        {toDelete && (
          <div className="grid gap-5">
            <p className="rounded-2xl bg-parchment/60 p-4 text-sm text-ink">{kindLabel(toDelete.kind)}: {toDelete.names.join(', ')}</p>
            <p className="text-sm leading-relaxed text-ink/80">Записку буде видалено без можливості відновити. Щоб підтвердити, введіть слово <b className="rounded bg-red-50 px-1.5 py-0.5 text-red-700">{DELETE_WORD}</b>.</p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmText.trim().toLocaleLowerCase('uk-UA') === DELETE_WORD && remove()} className="field" placeholder={DELETE_WORD} autoComplete="off" aria-label="Слово підтвердження" />
          </div>
        )}
      </Modal>
    </div>
  )
}
