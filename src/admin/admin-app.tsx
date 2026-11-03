import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, ClipboardList, ScrollText, ExternalLink, Eye, EyeOff, Loader2, LogOut, Radio, ShieldCheck } from 'lucide-react'
import { Toast, type ToastMessage } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { api, ApiError, session, type Role } from './api'
import { StreamsPanel } from './streams-panel'
import { EventsPanel } from './events-panel'
import { RequestsPanel } from './requests-panel'
import { NotesPanel } from './notes-panel'
import { InstallApp } from '@/components/site/install-app'

type Tab = 'streams' | 'events' | 'requests' | 'notes'

const TABS: { id: Tab; label: string; icon: typeof Radio; roles: Role[] }[] = [
  { id: 'streams', label: 'Ефіри', icon: Radio, roles: ['admin'] },
  { id: 'events', label: 'Події', icon: CalendarDays, roles: ['admin'] },
  { id: 'requests', label: 'Заявки', icon: ClipboardList, roles: ['admin', 'forms'] },
  { id: 'notes', label: 'Записки', icon: ScrollText, roles: ['admin', 'forms'] },
]

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Головний адміністратор',
  forms: 'Адміністратор заявок',
}

export type Notify = (message: ToastMessage) => void

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!password) return setError('Введіть пароль')
    setBusy(true)
    setError('')
    try {
      const data = await api<{ token: string; role: Role }>('admin/login', { method: 'POST', json: { password } })
      session.set(data.token)
      onLogin(data.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося увійти')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grain relative isolate flex min-h-svh items-center justify-center bg-night px-5 py-16 text-ivory">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_20%,rgba(90,20,24,.6),transparent_60%)]" />
      <form onSubmit={submit} noValidate className="glass-panel w-full max-w-sm rounded-[2rem] p-8 sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/50 bg-gradient-to-b from-wine to-wine-deep text-gold-light">
          <svg width="18" height="24" viewBox="0 0 18 24" fill="none" aria-hidden="true"><path d="M9 0v24M3 6h12M5 17l8-3" stroke="currentColor" strokeWidth="1.6" /></svg>
        </span>
        <h1 className="display mt-6 text-center text-4xl">Адмін-панель</h1>
        <p className="mt-2 text-center text-sm text-ivory/60">Петропавлівський храм · Кам’янець-Подільський</p>
        <label className="mt-9 block text-sm font-semibold text-ivory/80" htmlFor="admin-password">Пароль</label>
        <div className="relative mt-2">
          <input id="admin-password" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus className={cn('w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-ivory outline-none transition placeholder:text-ivory/30 focus:border-gold', error ? 'border-red-400' : 'border-white/15')} placeholder="••••••••" />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Сховати пароль' : 'Показати пароль'} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ivory/50 hover:text-ivory">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f3dfa0] to-[#a8853c] py-3.5 font-bold text-night shadow-lg transition hover:brightness-105 disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />}Увійти
        </button>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ivory/40"><ShieldCheck className="size-4" />Доступ залежить від пароля</p>
      </form>
    </div>
  )
}

export function AdminApp() {
  const [role, setRole] = useState<Role | null>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('streams')
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const notify: Notify = useCallback((m) => setToast(m), [])
  const closeToast = useCallback(() => setToast(null), [])

  const enter = useCallback((r: Role) => {
    setRole(r)
    setTab(r === 'forms' ? 'requests' : 'streams')
  }, [])

  useEffect(() => {
    if (!session.get()) { setChecking(false); return }
    api<{ role: Role }>('admin/verify')
      .then((d) => enter(d.role))
      .catch(() => session.set(null))
      .finally(() => setChecking(false))
  }, [enter])

  const logout = async () => {
    try { await api('admin/logout', { method: 'POST' }) } catch { /* сесія могла вже минути */ }
    session.set(null)
    setRole(null)
  }

  /** Якщо сесія скінчилася посеред роботи — повертаємо на вхід */
  const onError = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) { setRole(null); notify({ kind: 'error', title: 'Сесію завершено', text: 'Увійдіть знову.' }); return }
    notify({ kind: 'error', title: 'Помилка', text: err instanceof Error ? err.message : 'Щось пішло не так' })
  }, [notify])

  if (checking) return <div className="grid min-h-svh place-items-center bg-night text-gold-light"><Loader2 className="size-8 animate-spin" /></div>
  if (!role) return <><Toast message={toast} onClose={closeToast} /><Login onLogin={enter} /></>

  const tabs = TABS.filter((t) => t.roles.includes(role))
  const siteUrl = new URL('./', document.baseURI).href

  const logo = (
    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold/50 bg-gradient-to-b from-wine to-wine-deep text-gold-light">
      <svg width="14" height="20" viewBox="0 0 18 24" fill="none" aria-hidden="true"><path d="M9 0v24M3 6h12M5 17l8-3" stroke="currentColor" strokeWidth="1.8" /></svg>
    </span>
  )

  return (
    <div className="min-h-svh bg-ivory md:grid md:grid-cols-[96px_1fr] lg:grid-cols-[264px_1fr]">
      <Toast message={toast} onClose={closeToast} />

      {/* Телефон: верхня панель, як у програми */}
      <header className="grain sticky top-0 z-40 flex items-center justify-between gap-3 bg-night/95 px-4 pb-3 text-ivory backdrop-blur-xl md:hidden" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex min-w-0 items-center gap-3">
          {logo}
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-lg">{tabs.find((t) => t.id === tab)?.label ?? 'Адмін-панель'}</p>
            <p className="truncate text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-light/70">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <InstallApp compact icon={`${import.meta.env.BASE_URL}icons/admin-192.png`} title="Встановіть адмінку" />
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="grid size-11 place-items-center rounded-full border border-white/15 text-ivory/70" aria-label="Відкрити сайт"><ExternalLink className="size-4" /></a>
          <button type="button" onClick={logout} className="grid size-11 place-items-center rounded-full border border-white/15 text-ivory/70" aria-label="Вийти"><LogOut className="size-4" /></button>
        </div>
      </header>

      {/* Планшет: вузька бічна панель; комп'ютер: повна */}
      <aside className="grain sticky top-0 z-40 hidden h-svh flex-col bg-night text-ivory md:flex">
        <div className="flex flex-col items-center gap-3 px-3 py-6 lg:flex-row lg:items-center lg:px-6 lg:py-8">
          {logo}
          <div className="hidden leading-tight lg:block">
            <p className="font-display text-lg">Адмін-панель</p>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold-light/70">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 lg:px-4" aria-label="Розділи">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id} className={cn('flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[0.68rem] font-semibold transition lg:flex-row lg:gap-3 lg:rounded-xl lg:px-4 lg:text-sm', tab === id ? 'bg-white/10 text-ivory' : 'text-ivory/60 hover:bg-white/5 hover:text-ivory')}>
              <Icon className={cn('size-5 lg:size-4', tab === id ? 'text-gold-light' : '')} />{label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-2 lg:p-4">
          <div className="flex justify-center lg:hidden"><InstallApp compact icon={`${import.meta.env.BASE_URL}icons/admin-192.png`} title="Встановіть адмінку" /></div>
          <div className="hidden px-2 pb-1 lg:block"><InstallApp icon={`${import.meta.env.BASE_URL}icons/admin-192.png`} title="Встановіть адмінку" /></div>
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[0.68rem] font-semibold text-ivory/60 hover:bg-white/5 hover:text-ivory lg:flex-row lg:gap-3 lg:rounded-xl lg:px-4 lg:text-sm"><ExternalLink className="size-5 lg:size-4" />Сайт</a>
          <button type="button" onClick={logout} className="flex w-full flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[0.68rem] font-semibold text-ivory/60 hover:bg-white/5 hover:text-ivory lg:flex-row lg:gap-3 lg:rounded-xl lg:px-4 lg:text-sm"><LogOut className="size-5 lg:size-4" />Вийти</button>
        </div>
      </aside>

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 md:pb-12 lg:py-12">
        {tab === 'streams' && role === 'admin' && <StreamsPanel notify={notify} onError={onError} />}
        {tab === 'events' && role === 'admin' && <EventsPanel notify={notify} onError={onError} />}
        {tab === 'requests' && <RequestsPanel role={role} notify={notify} onError={onError} />}
        {tab === 'notes' && <NotesPanel role={role} notify={notify} onError={onError} />}
      </main>

      {/* Телефон: нижнє меню вкладок */}
      <nav aria-label="Розділи" className="fixed inset-x-3 z-40 grid rounded-2xl border border-white/10 bg-night/92 p-1.5 shadow-2xl backdrop-blur-xl md:hidden" style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => { setTab(id); window.scrollTo({ top: 0 }) }} aria-current={tab === id} className={cn('flex flex-col items-center gap-1 rounded-xl py-2 text-[0.66rem] font-semibold transition', tab === id ? 'bg-white/10 text-ivory' : 'text-ivory/60')}>
            <Icon className={cn('size-5', tab === id ? 'text-gold-light' : '')} strokeWidth={1.7} />{label}
          </button>
        ))}
      </nav>
    </div>
  )
}
