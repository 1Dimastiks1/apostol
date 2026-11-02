import { cn } from '@/lib/utils'

// Фіксований набір, щоб розмітка не «стрибала» між рендерами
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 2 + (i % 3),
  delay: `${-((i * 1.7) % 12)}s`,
  duration: `${9 + (i % 5) * 2}s`,
  drift: `${((i % 7) - 3) * 14}px`,
}))

/** Золоті іскри, що повільно здіймаються вгору, як дим від кадила */
export function Embers({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {EMBERS.map((e, i) => (
        <span key={i} className="ember" style={{ left: e.left, width: e.size, height: e.size, animationDelay: e.delay, animationDuration: e.duration, ['--drift' as string]: e.drift }} />
      ))}
    </div>
  )
}
