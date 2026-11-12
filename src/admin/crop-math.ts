export type Rect = { x: number; y: number; w: number; h: number }
export type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Найбільший кадр із заданими пропорціями, вписаний по центру у фото dw × dh (ratio = null — усе фото) */
export function fitRect(ratio: number | null, dw: number, dh: number): Rect {
  if (!ratio) return { x: 0, y: 0, w: dw, h: dh }
  let w = dw
  let h = w / ratio
  if (h > dh) { h = dh; w = h * ratio }
  return { x: (dw - w) / 2, y: (dh - h) / 2, w, h }
}

/** Рамка після перетягування ручки на (dx, dy) від початкового стану `s`. Не виходить за фото і не менша за `min`. */
export function dragRect(handle: Handle, s: Rect, dx: number, dy: number, ratio: number | null, dw: number, dh: number, min: number): Rect {
  if (handle === 'move') {
    return { ...s, x: clamp(s.x + dx, 0, dw - s.w), y: clamp(s.y + dy, 0, dh - s.h) }
  }
  const left = handle.includes('w')
  const right = handle.includes('e')
  const top = handle.includes('n')
  const bottom = handle.includes('s')
  const corner = (left || right) && (top || bottom)

  if (ratio && corner) {
    // Кут із фіксованими пропорціями: протилежний кут стоїть на місці, розмір — середнє між рухом по X та по Y
    const ax = left ? s.x + s.w : s.x
    const ay = top ? s.y + s.h : s.y
    const byX = s.w + (left ? -dx : dx)
    const byY = (s.h + (top ? -dy : dy)) * ratio
    let w = (byX + byY) / 2
    const maxW = Math.min(left ? ax : dw - ax, (top ? ay : dh - ay) * ratio)
    w = Math.min(w, maxW)
    w = Math.max(w, min, min * ratio)
    w = Math.min(w, maxW)
    const h = w / ratio
    return { x: left ? ax - w : ax, y: top ? ay - h : ay, w, h }
  }

  // Вільна зміна розміру (кути й сторони)
  let x1 = s.x, y1 = s.y, x2 = s.x + s.w, y2 = s.y + s.h
  if (left) x1 = clamp(s.x + dx, 0, x2 - min)
  if (right) x2 = clamp(s.x + s.w + dx, x1 + min, dw)
  if (top) y1 = clamp(s.y + dy, 0, y2 - min)
  if (bottom) y2 = clamp(s.y + s.h + dy, y1 + min, dh)
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

/** Найменший масштаб, при якому фото ще повністю закриває рамку */
export const minScale = (f: Rect, nw: number, nh: number) => Math.max(f.w / nw, f.h / nh)

/** Зсув фото (від центру області) так, щоб воно не залишало порожнього місця в рамці */
export function clampOffset(off: { x: number; y: number }, s: number, f: Rect, nw: number, nh: number, stageW: number, stageH: number) {
  const hx = (nw * s) / 2
  const hy = (nh * s) / 2
  return {
    x: clamp(off.x, f.x + f.w - stageW / 2 - hx, f.x - stageW / 2 + hx),
    y: clamp(off.y, f.y + f.h - stageH / 2 - hy, f.y - stageH / 2 + hy),
  }
}
