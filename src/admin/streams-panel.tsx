import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Loader2, Pencil, Plus, Radio, RefreshCw, Star, Trash2 } from 'lucide-react'
import { embedUrl } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { api, formatDateTime, fromLocalInput, toLocalInput, type Stream } from './api'
import type { Notify } from './admin-app'
import { Empty, Field, Modal, PanelHeader, Toggle, btn } from './ui'

type Draft = { id?: string; title: string; videoUrl: string; date: string; description: string; isLive: boolean; isPrimary: boolean }

const blank = (): Draft => ({ title: '', videoUrl: '', date: toLocalInput(new Date().toISOString()), description: '', isLive: false, isPrimary: false })

function validate(d: Draft) {
  const e: Partial<Record<keyof Draft, string>> = {}
  if (!d.title.trim()) e.title = 'Вкажіть назву ефіру'
  if (!d.videoUrl.trim()) e.videoUrl = 'Вставте посилання на відео'
  else if (!embedUrl(d.videoUrl.trim())) e.videoUrl = 'Потрібне посилання на відео Facebook або YouTube'
  return e
}

export function StreamsPanel({ notify, onError }: { notify: Notify; onError: (e: unknown) => void }) {
  const [streams, setStreams] = useState<Stream[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Stream | null>(null)

  const load = useCallback(async () => {
    try { setStreams(await api<Stream[]>('streams')) } catch (err) { onError(err) }
  }, [onError])
  useEffect(() => { load() }, [load])

  const live = streams?.find((s) => s.isLive)

  async function patch(s: Stream, body: Partial<Stream>, message: string) {
    setBusyId(s.id)
    try {
      await api(`streams/${encodeURIComponent(s.id)}`, { method: 'PUT', json: body })
      notify({ kind: 'success', title: message, text: s.title })
      await load()
    } catch (err) { onError(err) } finally { setBusyId(null) }
  }

  async function save() {
    if (!draft) return
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    const body = { title: draft.title.trim(), videoUrl: draft.videoUrl.trim(), date: fromLocalInput(draft.date), description: draft.description.trim(), isLive: draft.isLive, isPrimary: draft.isPrimary }
    try {
      if (draft.id) await api(`streams/${encodeURIComponent(draft.id)}`, { method: 'PUT', json: body })
      else await api('streams', { method: 'POST', json: body })
      notify({ kind: 'success', title: draft.id ? 'Ефір оновлено' : 'Ефір додано', text: body.isLive ? 'Він уже показується на сайті як LIVE.' : body.title })
      setDraft(null)
      await load()
    } catch (err) { onError(err) } finally { setSaving(false) }
  }

  async function remove() {
    if (!toDelete) return
    setBusyId(toDelete.id)
    try {
      await api(`streams/${encodeURIComponent(toDelete.id)}`, { method: 'DELETE' })
      notify({ kind: 'success', title: 'Ефір видалено', text: toDelete.title })
      setToDelete(null)
      await load()
    } catch (err) { onError(err) } finally { setBusyId(null) }
  }

  const edit = (s: Stream) => {
    setErrors({})
    setDraft({ id: s.id, title: s.title, videoUrl: s.videoUrl, date: toLocalInput(s.date || s.createdAt), description: s.description || '', isLive: Boolean(s.isLive), isPrimary: Boolean(s.isPrimary) })
  }

  const [resolving, setResolving] = useState(false)

  /** Посилання «Поділитися» з Facebook не вбудовується — розкриваємо його й підставляємо назву, опис та дату */
  async function resolveLink() {
    if (!draft || resolving || !draft.videoUrl.trim()) return
    setResolving(true)
    try {
      const found = await api<{ videoUrl: string; title: string; description: string; date: string }>('admin/resolve', { method: 'POST', json: { url: draft.videoUrl.trim() } })
      setDraft((d) => d && ({
        ...d,
        videoUrl: found.videoUrl,
        title: d.title.trim() ? d.title : found.title,
        description: d.description.trim() ? d.description : found.description,
        date: found.date && !d.id ? toLocalInput(found.date) : d.date,
      }))
      notify({ kind: 'success', title: 'Дані підтягнуто з Facebook', text: 'Перевірте назву, опис і дату перед збереженням.' })
    } catch (err) { onError(err) } finally { setResolving(false) }
  }

  const preview = draft && embedUrl(draft.videoUrl.trim())

  return (
    <div>
      <PanelHeader
        title="Ефіри"
        lead="Трансляції та записи богослужінь, які показуються на сайті в розділі «Онлайн»."
        actions={<>
          <button type="button" className={btn.ghost} onClick={load}><RefreshCw className="size-4" />Оновити</button>
          <button type="button" className={btn.primary} onClick={() => { setErrors({}); setDraft(blank()) }}><Plus className="size-4" />Додати ефір</button>
        </>}
      />

      <div className={cn('mt-8 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between', live ? 'bg-red-600 text-white' : 'border border-border bg-card')}>
        <div className="flex items-center gap-4">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-full', live ? 'bg-white/20' : 'bg-parchment text-gold-deep')}>
            <Radio className={cn('size-5', live && 'animate-flicker')} />
          </span>
          <div>
            <p className={cn('text-[0.65rem] font-bold uppercase tracking-[0.2em]', live ? 'text-white/80' : 'text-gold-deep')}>{live ? 'Зараз у прямому ефірі' : 'Прямого ефіру зараз немає'}</p>
            <p className="mt-1 font-display text-2xl leading-tight">{live ? live.title : 'Увімкніть LIVE біля потрібного ефіру'}</p>
          </div>
        </div>
        {live && <button type="button" disabled={busyId === live.id} onClick={() => patch(live, { isLive: false }, 'Ефір завершено')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60">Завершити LIVE</button>}
      </div>

      <div className="mt-8 grid gap-4">
        {streams === null && <div className="grid place-items-center py-20 text-gold-deep"><Loader2 className="size-7 animate-spin" /></div>}
        {streams?.length === 0 && <Empty icon={<Radio className="size-6" />} title="Ефірів ще немає" text="Додайте посилання на трансляцію з Facebook або YouTube — вона з’явиться на сайті." action={<button type="button" className={btn.primary} onClick={() => setDraft(blank())}><Plus className="size-4" />Додати ефір</button>} />}
        {streams?.map((s) => (
          <article key={s.id} className={cn('flex flex-col gap-5 rounded-3xl border bg-card p-5 transition sm:flex-row sm:items-center sm:p-6', s.isLive ? 'border-red-300 shadow-[0_20px_50px_-30px_rgba(220,38,38,.5)]' : 'border-border')}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {s.isLive && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-widest text-white"><span className="size-1.5 animate-flicker rounded-full bg-white" />LIVE</span>}
                {s.isPrimary && <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-widest text-gold-deep"><Star className="size-3" />Головний</span>}
                <span className="text-xs text-muted-foreground">{formatDateTime(s.date || s.createdAt)}</span>
              </div>
              <h3 className="mt-2 font-display text-2xl leading-tight text-ink">{s.title}</h3>
              {s.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>}
              <a href={s.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-semibold text-primary hover:underline"><ExternalLink className="size-3.5 shrink-0" /><span className="truncate">{s.videoUrl}</span></a>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {s.isLive
                ? <button type="button" disabled={busyId === s.id} className={btn.ghost} onClick={() => patch(s, { isLive: false }, 'Ефір завершено')}>Завершити LIVE</button>
                : <button type="button" disabled={busyId === s.id} className={btn.live} onClick={() => patch(s, { isLive: true, isPrimary: true }, 'Ефір у LIVE')}><Radio className="size-4" />Увімкнути LIVE</button>}
              {!s.isPrimary && <button type="button" disabled={busyId === s.id} className={btn.ghost} onClick={() => patch(s, { isPrimary: true }, 'Тепер це головний ефір')}><Star className="size-4" />Головний</button>}
              <button type="button" className={btn.ghost} onClick={() => edit(s)} aria-label={`Редагувати: ${s.title}`}><Pencil className="size-4" /></button>
              <button type="button" className={btn.danger} onClick={() => setToDelete(s)} aria-label={`Видалити: ${s.title}`}><Trash2 className="size-4" /></button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        wide
        open={Boolean(draft)}
        title={draft?.id ? 'Редагувати ефір' : 'Новий ефір'}
        onClose={() => setDraft(null)}
        footer={<>
          <button type="button" className={btn.ghost} onClick={() => setDraft(null)}>Скасувати</button>
          <button type="button" className={btn.primary} disabled={saving} onClick={save}>{saving && <Loader2 className="size-4 animate-spin" />}Зберегти</button>
        </>}
      >
        {draft && (
          <div className="grid gap-5">
            <Field label="Назва *" error={errors.title}>
              <input className="field font-normal" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Божественна Літургія · Неділя" maxLength={140} />
            </Field>
            <Field label="Посилання на відео *" hint="Можна вставити й посилання «Поділитися» з Facebook, натисніть «Підтягнути»: адреса, назва, опис і дата заповняться самі" error={errors.videoUrl}>
              <div className="flex gap-2">
                <input className="field min-w-0 flex-1 font-normal" value={draft.videoUrl} onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })} onBlur={() => /facebook\.com\/share\//.test(draft.videoUrl) && resolveLink()} placeholder="https://www.facebook.com/…/videos/…" inputMode="url" />
                <button type="button" className={btn.ghost} onClick={resolveLink} disabled={resolving || !draft.videoUrl.trim()}>{resolving ? 'Зачекайте…' : 'Підтягнути'}</button>
              </div>
            </Field>
            {preview && <div className="video-frame rounded-2xl"><iframe title="Попередній перегляд" src={preview} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>}
            <Field label="Дата та час">
              <input type="datetime-local" className="field font-normal" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Опис">
              <textarea rows={3} className="field resize-y font-normal" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Коротко про богослужіння" maxLength={600} />
            </Field>
            <div className="flex flex-wrap gap-6 rounded-2xl bg-parchment/60 p-4">
              <Toggle tone="red" checked={draft.isLive} onChange={(v) => setDraft({ ...draft, isLive: v, isPrimary: v || draft.isPrimary })} label="Зараз у прямому ефірі (LIVE)" />
              <Toggle checked={draft.isPrimary} onChange={(v) => setDraft({ ...draft, isPrimary: v })} label="Головний на сайті" />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        title="Видалити ефір?"
        onClose={() => setToDelete(null)}
        footer={<>
          <button type="button" className={btn.ghost} onClick={() => setToDelete(null)}>Скасувати</button>
          <button type="button" className={btn.danger} disabled={busyId === toDelete?.id} onClick={remove}><Trash2 className="size-4" />Видалити</button>
        </>}
      >
        <p className="text-ink/80">«{toDelete?.title}» зникне з сайту. Цю дію не можна скасувати.</p>
      </Modal>
    </div>
  )
}
