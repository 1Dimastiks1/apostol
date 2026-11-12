import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { clamp, clampOffset, dragRect, fitRect, minScale, type Handle, type Rect } from './crop-math'

const OUT_SIDE = 1400
const MIN = 56 // мінімальний розмір рамки в пікселях екрана
const PAD = 16 // відступ рамки від країв області
const MAX_ZOOM = 6

const ASPECTS: { id: string; label: string; ratio: number | 'free' | 'original' }[] = [
  { id: 'free', label: 'Вільно', ratio: 'free' },
  { id: 'site', label: 'Як на сайті', ratio: 16 / 10 },
  { id: 'original', label: 'Оригінал', ratio: 'original' },
  { id: '1-1', label: 'Квадрат', ratio: 1 },
  { id: '16-9', label: '16:9', ratio: 16 / 9 },
  { id: '4-3', label: '4:3', ratio: 4 / 3 },
  { id: '3-4', label: '3:4', ratio: 3 / 4 },
]

/** Повертає зображення на 90° (за годинниковою стрілкою чи проти) */
function rotate90(img: HTMLImageElement, dir: 1 | -1): string {
  const c = document.createElement('canvas')
  c.width = img.naturalHeight
  c.height = img.naturalWidth
  const ctx = c.getContext('2d')!
  if (dir === 1) { ctx.translate(c.width, 0); ctx.rotate(Math.PI / 2) } else { ctx.translate(0, c.height); ctx.rotate(-Math.PI / 2) }
  ctx.drawImage(img, 0, 0)
  return c.toDataURL('image/jpeg', 0.92)
}

type Drag = { mode: 'pan' | 'resize'; handle: Handle; px: number; py: number; frame: Rect; off: { x: number; y: number } }

/**
 * Редактор фото у стилі iPhone: рамка кадру стоїть, а фото рухається під нею
 * (перетягування, колесо миші чи щипок двома пальцями — масштаб). Кути й сторони рамки змінюють її розмір.
 * Повзунок вирівнює горизонт, кнопки повертають на 90°. Результат — JPEG до 1400 px.
 */
export function PhotoCropper({ src, onCancel, onDone }: { src: string; onCancel: () => void; onDone: (dataUrl: string) => void }) {
  const [source, setSource] = useState(src)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [angle, setAngle] = useState(0)
  const [aspectId, setAspectId] = useState('site')
  const [stage, setStage] = useState({ w: 320, h: 420 })
  const [frame, setFrame] = useState<Rect>({ x: 0, y: 0, w: 100, h: 100 })
  const [scale, setScale] = useState(1)
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; scale: number } | null>(null)

  useEffect(() => {
    let alive = true
    const el = new Image()
    el.onload = () => { if (alive) { setImg(el); setAngle(0) } }
    el.src = source
    return () => { alive = false }
  }, [source])

  useLayoutEffect(() => {
    const measure = () => {
      const r = stageRef.current?.getBoundingClientRect()
      if (r) setStage({ w: Math.max(200, r.width), h: Math.max(200, r.height) })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Esc закриває лише редактор, а не форму під ним
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); onCancel() } }
    window.addEventListener('keydown', onKey, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = prev }
  }, [onCancel])

  const nw = img?.naturalWidth || 1
  const nh = img?.naturalHeight || 1
  const bounds = { x: PAD, y: PAD, w: stage.w - PAD * 2, h: stage.h - PAD * 2 }
  const contain = Math.min(bounds.w / nw, bounds.h / nh) // масштаб, при якому все фото видно
  const lo = minScale(frame, nw, nh) // менше фото не масштабується: воно має закривати рамку
  const left = stage.w / 2 + off.x - (nw * scale) / 2
  const top = stage.h / 2 + off.y - (nh * scale) / 2

  const ratioOf = useCallback((id: string) => {
    const a = ASPECTS.find((x) => x.id === id)!
    if (a.ratio === 'free') return null
    if (a.ratio === 'original') return nw / nh
    return a.ratio
  }, [nw, nh])
  const ratio = ratioOf(aspectId)

  // Фото вписано в область, рамка — найбільша з потрібними пропорціями всередині фото
  const resetAll = useCallback((id: string) => {
    const iw = nw * contain
    const ih = nh * contain
    const f = fitRect(ratioOf(id), iw, ih)
    setScale(contain)
    setOff({ x: 0, y: 0 })
    setFrame({ x: stage.w / 2 - iw / 2 + f.x, y: stage.h / 2 - ih / 2 + f.y, w: f.w, h: f.h })
  }, [nw, nh, contain, stage.w, stage.h, ratioOf])

  useEffect(() => { if (img) resetAll(aspectId) }, [img, aspectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Зміна розміру вікна (поворот телефона): не скидаємо роботу, а пропорційно переносимо рамку й фото
  const prevStage = useRef(stage)
  useEffect(() => {
    const prev = prevStage.current
    prevStage.current = stage
    if (!img || (prev.w === stage.w && prev.h === stage.h)) return
    const k = Math.min((stage.w - PAD * 2) / (prev.w - PAD * 2), (stage.h - PAD * 2) / (prev.h - PAD * 2))
    const map = (v: number, c0: number, c1: number) => c1 + (v - c0) * k
    const nf = { x: map(frame.x, prev.w / 2, stage.w / 2), y: map(frame.y, prev.h / 2, stage.h / 2), w: frame.w * k, h: frame.h * k }
    setFrame(nf)
    setScale(scale * k)
    setOff({ x: off.x * k, y: off.y * k })
  }, [stage.w, stage.h]) // eslint-disable-line react-hooks/exhaustive-deps

  // Колесо миші та щипок на тачпаді: без збільшення всієї сторінки браузера
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const stop = (e: WheelEvent) => e.preventDefault()
    el.addEventListener('wheel', stop, { passive: false })
    return () => el.removeEventListener('wheel', stop)
  }, [])

  // Фото з урахуванням вирівнювання горизонту (з мінімальним збільшенням, щоб не було порожніх кутів)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    canvas.width = nw
    canvas.height = nh
    const ctx = canvas.getContext('2d')!
    const th = (angle * Math.PI) / 180
    const s = Math.cos(Math.abs(th)) + Math.sin(Math.abs(th)) * Math.max(nw / nh, nh / nw)
    ctx.save()
    ctx.translate(nw / 2, nh / 2)
    ctx.rotate(th)
    ctx.scale(s, s)
    ctx.drawImage(img, -nw / 2, -nh / 2)
    ctx.restore()
  }, [img, angle, nw, nh])

  /** Змінює масштаб так, щоб точка (px, py) області лишалась на місці */
  function zoomAbout(next: number, px: number, py: number, f = frame, s = scale, o = off) {
    const floor = minScale(f, nw, nh)
    const ns = clamp(next, floor, Math.max(contain, floor) * MAX_ZOOM)
    const cx = stage.w / 2 + o.x
    const cy = stage.h / 2 + o.y
    const k = ns / s
    const ncx = px + (cx - px) * k
    const ncy = py + (cy - py) * k
    setScale(ns)
    setOff(clampOffset({ x: ncx - stage.w / 2, y: ncy - stage.h / 2 }, ns, f, nw, nh, stage.w, stage.h))
  }

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    stageRef.current?.setPointerCapture(e.pointerId)
    setActive(true)
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale }
      drag.current = null
      return
    }
    const handle = ((e.target as HTMLElement).dataset.handle as Handle | undefined) ?? 'move'
    drag.current = { mode: handle === 'move' ? 'pan' : 'resize', handle, px: p.x, py: p.y, frame, off }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return
    const p = local(e)
    pointers.current.set(e.pointerId, p)

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1
      zoomAbout(pinch.current.scale * (dist / pinch.current.dist), (a.x + b.x) / 2, (a.y + b.y) / 2)
      return
    }
    const d = drag.current
    if (!d) return
    const dx = p.x - d.px
    const dy = p.y - d.py
    if (d.mode === 'pan') {
      setOff(clampOffset({ x: d.off.x + dx, y: d.off.y + dy }, scale, frame, nw, nh, stage.w, stage.h))
      return
    }
    // Зміна розміру рамки (у координатах області з відступом)
    const rel = dragRect(d.handle, { ...d.frame, x: d.frame.x - PAD, y: d.frame.y - PAD }, dx, dy, ratio, bounds.w, bounds.h, MIN)
    const nf = { x: rel.x + PAD, y: rel.y + PAD, w: rel.w, h: rel.h }
    // Якщо рамка більша за фото — фото збільшується, щоб її закрити
    const ns = Math.max(scale, minScale(nf, nw, nh))
    setFrame(nf)
    if (ns !== scale) setScale(ns)
    setOff((o) => clampOffset(o, ns, nf, nw, nh, stage.w, stage.h))
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    pinch.current = null
    if (pointers.current.size === 0) { drag.current = null; setActive(false) }
    else {
      // Після відпускання одного пальця продовжуємо перетягування іншим
      const [rest] = [...pointers.current.values()]
      drag.current = { mode: 'pan', handle: 'move', px: rest.x, py: rest.y, frame, off }
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 40 : 10
    const pan = (dx: number, dy: number) => { e.preventDefault(); setOff(clampOffset({ x: off.x + dx, y: off.y + dy }, scale, frame, nw, nh, stage.w, stage.h)) }
    const cx = frame.x + frame.w / 2
    const cy = frame.y + frame.h / 2
    if (e.key === 'ArrowLeft') pan(step, 0)
    else if (e.key === 'ArrowRight') pan(-step, 0)
    else if (e.key === 'ArrowUp') pan(0, step)
    else if (e.key === 'ArrowDown') pan(0, -step)
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAbout(scale * 1.1, cx, cy) }
    else if (e.key === '-') { e.preventDefault(); zoomAbout(scale / 1.1, cx, cy) }
  }

  function onWheel(e: React.WheelEvent) {
    const p = local(e)
    zoomAbout(scale * Math.exp(-e.deltaY * 0.0015), p.x, p.y)
  }

  function done() {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const sx = (frame.x - left) / scale
    const sy = (frame.y - top) / scale
    const sw = frame.w / scale
    const sh = frame.h / scale
    const k = Math.min(1, OUT_SIDE / Math.max(sw, sh))
    const out = document.createElement('canvas')
    out.width = Math.max(1, Math.round(sw * k))
    out.height = Math.max(1, Math.round(sh * k))
    const ctx = out.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.imageSmoothingQuality = 'high'
    try {
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, out.width, out.height)
      // Сервер приймає фото до 1,5 МБ: якщо завелике — трохи знижуємо якість
      let quality = 0.86
      let url = out.toDataURL('image/jpeg', quality)
      while (url.length * 0.75 > 1_350_000 && quality > 0.5) { quality -= 0.08; url = out.toDataURL('image/jpeg', quality) }
      onDone(url)
    } catch {
      window.alert('Не вдалося обробити це фото в браузері. Завантажте його ще раз кнопкою «Замінити».')
    }
  }

  const reset = () => { setAngle(0); resetAll(aspectId) }
  const changed = angle !== 0 || scale !== contain || off.x !== 0 || off.y !== 0

  const hit = 'absolute touch-none'
  const bracket = 'pointer-events-none absolute size-5 border-white'
  const zoomValue = clamp(scale / lo, 1, 1000)
  const zoomMax = (Math.max(contain, lo) * MAX_ZOOM) / lo

  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Редактор фото">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <button type="button" onClick={onCancel} className="min-h-10 px-2 text-base text-white/80 hover:text-white">Скасувати</button>
        <span className="text-sm font-semibold text-white/70">Редагувати</span>
        <button type="button" onClick={done} disabled={!img} className="min-h-10 rounded-full bg-[#ffd60a] px-4 text-base font-bold text-black disabled:opacity-50">Готово</button>
      </div>

      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden outline-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Фото під рамкою: тягніть, щоб посунути; стрілки зсувають, плюс і мінус масштабують"
      >
        {/* Фото рухається під рамкою */}
        <canvas ref={canvasRef} className="pointer-events-none absolute max-w-none" style={{ left, top, width: nw * scale, height: nh * scale }} />

        {/* Рамка кадру: усе поза нею затемнене */}
        <div
          className="pointer-events-none absolute"
          style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h, boxShadow: '0 0 0 9999px rgba(0,0,0,.66)', outline: '1px solid rgba(255,255,255,.9)' }}
        >
          <div className={cn('absolute inset-0 transition-opacity', active ? 'opacity-100' : 'opacity-0')} style={{ backgroundImage: 'linear-gradient(to right, transparent calc(33.33% - .5px), rgba(255,255,255,.6) calc(33.33% - .5px) calc(33.33% + .5px), transparent calc(33.33% + .5px), transparent calc(66.66% - .5px), rgba(255,255,255,.6) calc(66.66% - .5px) calc(66.66% + .5px), transparent calc(66.66% + .5px)), linear-gradient(to bottom, transparent calc(33.33% - .5px), rgba(255,255,255,.6) calc(33.33% - .5px) calc(33.33% + .5px), transparent calc(33.33% + .5px), transparent calc(66.66% - .5px), rgba(255,255,255,.6) calc(66.66% - .5px) calc(66.66% + .5px), transparent calc(66.66% + .5px))' }} />
          <span className={cn(bracket, '-left-[2px] -top-[2px] border-l-[3px] border-t-[3px]')} />
          <span className={cn(bracket, '-right-[2px] -top-[2px] border-r-[3px] border-t-[3px]')} />
          <span className={cn(bracket, '-bottom-[2px] -left-[2px] border-b-[3px] border-l-[3px]')} />
          <span className={cn(bracket, '-bottom-[2px] -right-[2px] border-b-[3px] border-r-[3px]')} />

          {/* Зони захоплення (збільшені для пальця) */}
          <span data-handle="nw" className={cn(hit, 'pointer-events-auto -left-4 -top-4 size-10 cursor-nwse-resize')} />
          <span data-handle="ne" className={cn(hit, 'pointer-events-auto -right-4 -top-4 size-10 cursor-nesw-resize')} />
          <span data-handle="sw" className={cn(hit, 'pointer-events-auto -bottom-4 -left-4 size-10 cursor-nesw-resize')} />
          <span data-handle="se" className={cn(hit, 'pointer-events-auto -bottom-4 -right-4 size-10 cursor-nwse-resize')} />
          {!ratio && <>
            <span data-handle="n" className={cn(hit, 'pointer-events-auto left-6 right-6 -top-4 h-8 cursor-ns-resize')} />
            <span data-handle="s" className={cn(hit, 'pointer-events-auto left-6 right-6 -bottom-4 h-8 cursor-ns-resize')} />
            <span data-handle="w" className={cn(hit, 'pointer-events-auto bottom-6 top-6 -left-4 w-8 cursor-ew-resize')} />
            <span data-handle="e" className={cn(hit, 'pointer-events-auto bottom-6 top-6 -right-4 w-8 cursor-ew-resize')} />
          </>}
        </div>
      </div>

      <div className="px-4 pt-3 sm:px-6" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto flex max-w-xl flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-16 text-right text-xs font-semibold text-white/60">Масштаб</span>
            <input type="range" min={1} max={zoomMax} step={0.01} value={Math.min(zoomValue, zoomMax)} onChange={(e) => zoomAbout(lo * Number(e.target.value), frame.x + frame.w / 2, frame.y + frame.h / 2)} aria-label="Масштаб" className="h-2 w-full accent-[#ffd60a]" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-right text-xs font-semibold text-white/60">Горизонт <span className="tabular-nums text-[#ffd60a]">{angle > 0 ? '+' : ''}{angle.toFixed(0)}°</span></span>
            <input type="range" min={-30} max={30} step={0.5} value={angle} onChange={(e) => setAngle(Number(e.target.value))} onDoubleClick={() => setAngle(0)} aria-label="Вирівняти горизонт" className="h-2 w-full accent-[#ffd60a]" />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => img && setSource(rotate90(img, -1))} aria-label="Повернути проти годинникової" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20"><RotateCcw className="size-5" /></button>
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1" role="radiogroup" aria-label="Пропорції кадру">
              {ASPECTS.map((a) => (
                <button key={a.id} type="button" role="radio" aria-checked={aspectId === a.id} onClick={() => setAspectId(a.id)} className={cn('min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition', aspectId === a.id ? 'bg-[#ffd60a] text-black' : 'bg-white/10 text-white hover:bg-white/20')}>{a.label}</button>
              ))}
            </div>
            <button type="button" onClick={() => img && setSource(rotate90(img, 1))} aria-label="Повернути за годинниковою" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20"><RotateCw className="size-5" /></button>
          </div>

          <div className="flex items-center justify-between text-xs text-white/55">
            <span>Тягніть фото, щоб посунути; колесо миші чи два пальці — масштаб; кути рамки — розмір.</span>
            {changed && <button type="button" onClick={reset} className="shrink-0 pl-3 font-semibold text-[#ffd60a]">Скинути</button>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
