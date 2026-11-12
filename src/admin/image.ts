const MAX_SIDE = 1400

/** Зменшує фото до 1400 px (або до вказаного розміру) і перекодовує в JPEG, щоб воно важило ~150–400 КБ */
export async function compressImage(file: File, maxSide = MAX_SIDE, quality = 0.82): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Оберіть фото у форматі JPG, PNG або WebP')
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Браузер не може обробити фото')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}

/** Адреса фото події: власне (із сервера) або статичне з початкових даних */
export function eventImageSrc(event: { id: string; hasImage?: boolean; imageUpdatedAt?: string; imageUrl?: string }) {
  if (event.hasImage) return new URL(`api/events/${encodeURIComponent(event.id)}/image?v=${encodeURIComponent(event.imageUpdatedAt || '')}`, document.baseURI).href
  if (event.imageUrl) return new URL(event.imageUrl, document.baseURI).href
  return null
}
