import { useCallback, useEffect, useState } from 'react'
import { Toast, type ToastMessage } from '@/components/ui/toast'
import { flushOutbox, onOutboxSent } from '@/lib/outbox'

/** Фоново допомагає відправити те, що накопичилось без інтернету: при запуску та коли зв'язок повертається */
export function OutboxSync() {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const close = useCallback(() => setToast(null), [])

  useEffect(() => {
    flushOutbox()
    const onOnline = () => { flushOutbox() }
    window.addEventListener('online', onOnline)
    const off = onOutboxSent((n) => setToast({ kind: 'success', title: 'Надіслано', text: n === 1 ? 'Збережену раніше заявку чи записку надіслано парафії.' : `Збережені раніше заявки та записки (${n}) надіслано парафії.` }))
    return () => { window.removeEventListener('online', onOnline); off() }
  }, [])

  return <Toast message={toast} onClose={close} />
}
