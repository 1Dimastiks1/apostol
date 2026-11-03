import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarDays, ExternalLink, Eraser, ImagePlus, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, formatDateTime, fromLocalInput, toLocalInput, type ParishEvent } from './api'
import type { Notify } from './admin-app'
import { compressImage, eventImageSrc } from './image'
import { Empty, Field, Modal, PanelHeader, btn } from './ui'

type Draft = {
  id?: string; title: string; date: string; description: string; link: string
  /** Поточне фото, що показується у формі (існуюче або щойно обране) */
  imageSrc: string | null
  /** Нове фото у вигляді data URL — надсилається на сервер лише якщо змінене */
  newImage: string | null
  removeImage: boolean
}

const blank = (): Draft => ({ title: '', date: '', description: '', link: '', imageSrc: null, newImage: null, removeImage: false })
const isPast = (value: string) => { const t = Date.parse(value); return Number.isFinite(t) && t < Date.now() }

export function EventsPanel({ notify, onError }: { notify: Notify; onError: (e: unknown) => void }) {
  const [events, setEvents] = useState<ParishEvent[] | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<ParishEvent | null>(null)
  const [imageBusy, setImageBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try { setEvents(await api<ParishEvent[]>('events')) } catch (err) { onError(err) }
  }, [onError])
  useEffect(() => { load() }, [load])

  const [resolving, setResolving] = useState(false)

  /** Посилання на допис чи відео з Facebook → підставляємо чисте посилання, назву, текст і дату (якщо вони є) */
  async function resolveLink() {
    if (!draft || resolving || !draft.link.trim()) return
    setResolving(true)
    try {
      const found = await api<{ kind: 'post' | 'video'; link?: string; videoUrl?: string; title: string; description: string; date: string }>('admin/resolve', { method: 'POST', json: { url: draft.link.trim() } })
      setDraft((d) => d && ({
        ...d,
        link: found.link || found.videoUrl || d.link,
        title: d.title.trim() ? d.title : found.title,
        description: d.description.trim() ? d.description : found.description,
        date: d.date || (found.date ? toLocalInput(found.date) : ''),
      }))
      notify({ kind: 'success', title: 'Дані підтягнуто з Facebook', text: 'Перевірте назву, опис і дату перед збереженням. Facebook віддає лише початок тексту.' })
    } catch (err) { onError(err) } finally { setResolving(false) }
  }

  const sorted = [...(events || [])].sort((a, b) => (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0))
  const pastCount = sorted.filter((e) => isPast(e.date)).length

  async function save() {
    if (!draft) return
    const found: typeof errors = {}
    if (!draft.title.trim()) found.title = 'Вкажіть назву події'
    if (!draft.date) found.date = 'Вкажіть дату й час'
    if (draft.link.trim() && !/^https?:\/\//i.test(draft.link.trim())) found.link = 'Посилання має починатися з https://'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    const body = {
      title: draft.title.trim(), date: fromLocalInput(draft.date), description: draft.description.trim(), link: draft.link.trim(),
      ...(draft.newImage ? { image: draft.newImage } : {}),
      ...(draft.removeImage && !draft.newImage ? { removeImage: true } : {}),
    }
    try {
      if (draft.id) await api(`events/${encodeURIComponent(draft.id)}`, { method: 'PUT', json: body })
      else await api('events', { method: 'POST', json: body })
      notify({ kind: 'success', title: draft.id ? 'Подію оновлено' : 'Подію додано', text: body.title })
      setDraft(null)
      await load()
    } catch (err) { onError(err) } finally { setSaving(false) }
  }

  async function pickImage(file?: File) {
    if (!file || !draft) return
    setImageBusy(true)
    try {
      const dataUrl = await compressImage(file)
      setDraft((d) => d && ({ ...d, imageSrc: dataUrl, newImage: dataUrl, removeImage: false }))
    } catch (err) {
      notify({ kind: 'error', title: 'Не вдалося додати фото', text: err instanceof Error ? err.message : undefined })
    } finally {
      setImageBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function remove() {
    if (!toDelete) return
    try {
      await api(`events/${encodeURIComponent(toDelete.id)}`, { method: 'DELETE' })
      notify({ kind: 'success', title: 'Подію видалено', text: toDelete.title })
      setToDelete(null)
      await load()
    } catch (err) { onError(err) }
  }

  async function cleanup() {
    try {
      const res = await api<{ message: string }>('events/expired', { method: 'DELETE' })
      notify({ kind: 'success', title: 'Готово', text: res.message })
      await load()
    } catch (err) { onError(err) }
  }

  return (
    <div>
      <PanelHeader
        title="Події"
        lead="Оголошення парафії: показуються на сайті в «Подіях», а найближча — на першому екрані."
        actions={<>
          <button type="button" className={btn.ghost} onClick={load}><RefreshCw className="size-4" />Оновити</button>
          {pastCount > 0 && <button type="button" className={btn.ghost} onClick={cleanup}><Eraser className="size-4" />Прибрати минулі ({pastCount})</button>}
          <button type="button" className={btn.primary} onClick={() => { setErrors({}); setDraft(blank()) }}><Plus className="size-4" />Додати подію</button>
        </>}
      />

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4">
        {events === null && <div className="grid place-items-center py-20 text-gold-deep"><Loader2 className="size-7 animate-spin" /></div>}
        {events?.length === 0 && <Empty icon={<CalendarDays className="size-6" />} title="Подій ще немає" text="Додайте оголошення про богослужіння чи подію парафії." action={<button type="button" className={btn.primary} onClick={() => setDraft(blank())}><Plus className="size-4" />Додати подію</button>} />}
        {sorted.map((e) => (
          <article key={e.id} className={cn('flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6', isPast(e.date) && 'opacity-60')}>
            {eventImageSrc(e) && <img src={eventImageSrc(e)!} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover sm:aspect-square sm:w-24" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">{formatDateTime(e.date)}{isPast(e.date) && ' · минула'}</p>
              <h3 className="mt-1.5 font-display text-2xl leading-tight text-ink">{e.title}</h3>
              {e.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.description.replace(/<[^>]+>/g, ' ')}</p>}
              {e.link && <a href={e.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><ExternalLink className="size-3.5" />Посилання</a>}
            </div>
            <div className="flex gap-2">
              <button type="button" className={btn.ghost} onClick={() => { setErrors({}); setDraft({ id: e.id, title: e.title, date: toLocalInput(e.date), description: e.description || '', link: e.link || '', imageSrc: eventImageSrc(e), newImage: null, removeImage: false }) }} aria-label={`Редагувати: ${e.title}`}><Pencil className="size-4" /></button>
              <button type="button" className={btn.danger} onClick={() => setToDelete(e)} aria-label={`Видалити: ${e.title}`}><Trash2 className="size-4" /></button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        wide
        open={Boolean(draft)}
        title={draft?.id ? 'Редагувати подію' : 'Нова подія'}
        onClose={() => setDraft(null)}
        footer={<>
          <button type="button" className={btn.ghost} onClick={() => setDraft(null)}>Скасувати</button>
          <button type="button" className={btn.primary} disabled={saving} onClick={save}>{saving && <Loader2 className="size-4 animate-spin" />}Зберегти</button>
        </>}
      >
        {draft && (
          <div className="grid gap-5">
            <Field label="Назва *" error={errors.title}><input className="field font-normal" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Престольне свято" maxLength={140} /></Field>
            <Field label="Дата та час *" error={errors.date}><input type="datetime-local" className="field font-normal" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
            <Field label="Опис" hint="Можна виділяти слова тегами <b> та <i>, додавати посилання <a>"><textarea rows={4} className="field resize-y font-normal" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Сповідь о 08:30, Божественна Літургія о 09:00…" /></Field>
            <div className="grid gap-1.5">
              <span className="text-sm font-semibold text-ink">Фото</span>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="event-photo" onChange={(e) => pickImage(e.target.files?.[0])} />
              {draft.imageSrc ? (
                <div className="relative overflow-hidden rounded-2xl border border-border">
                  <img src={draft.imageSrc} alt="Попередній перегляд фото" className="aspect-[16/9] w-full object-cover" />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <label htmlFor="event-photo" className="cursor-pointer rounded-xl bg-night/80 px-3 py-2 text-xs font-bold text-ivory backdrop-blur hover:bg-night">Замінити</label>
                    <button type="button" onClick={() => setDraft({ ...draft, imageSrc: null, newImage: null, removeImage: true })} className="grid size-8 place-items-center rounded-xl bg-red-600 text-white hover:bg-red-700" aria-label="Прибрати фото"><X className="size-4" /></button>
                  </div>
                </div>
              ) : (
                <label htmlFor="event-photo" className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gold/50 bg-parchment/40 px-4 py-8 text-center text-sm font-semibold text-gold-deep transition hover:border-gold hover:bg-parchment">
                  {imageBusy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
                  {imageBusy ? 'Обробляємо фото…' : 'Додати фото події'}
                  <span className="text-xs font-normal text-muted-foreground">JPG, PNG або WebP. Фото буде автоматично зменшено.</span>
                </label>
              )}
            </div>
            <Field label="Посилання" hint="Допис чи відео з Facebook: вставте посилання й натисніть «Підтягнути», і назва, текст та дата заповняться самі" error={errors.link}>
              <div className="flex gap-2">
                <input className="field min-w-0 flex-1 font-normal" value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} onBlur={() => /facebook\.com\/share\//.test(draft.link) && resolveLink()} placeholder="https://" inputMode="url" />
                <button type="button" className={btn.ghost} onClick={resolveLink} disabled={resolving || !draft.link.trim()}>{resolving ? 'Зачекайте…' : 'Підтягнути'}</button>
              </div>
            </Field>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(toDelete)} title="Видалити подію?" onClose={() => setToDelete(null)} footer={<>
        <button type="button" className={btn.ghost} onClick={() => setToDelete(null)}>Скасувати</button>
        <button type="button" className={btn.danger} onClick={remove}><Trash2 className="size-4" />Видалити</button>
      </>}>
        <p className="text-ink/80">«{toDelete?.title}» зникне з сайту. Цю дію не можна скасувати.</p>
      </Modal>
    </div>
  )
}
