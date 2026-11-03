import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  index?: string
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  dark?: boolean
  aside?: ReactNode
  className?: string
}

/** Заголовок секції: номер, рубрика, великий serif-заголовок і підводка */
export function SectionHeading({ index, eyebrow, title, lead, align = 'left', dark, aside, className }: Props) {
  const centered = align === 'center'
  return (
    <div className={cn('reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between', centered && 'items-center text-center lg:flex-col lg:items-center', className)}>
      <div className={cn('max-w-3xl', centered && 'mx-auto')}>
        <p className={cn('eyebrow', dark && 'on-dark')}>
          {index && <span className="font-display text-sm tracking-normal opacity-80">{index}</span>}
          {eyebrow}
        </p>
        <h2 className={cn('display mt-5 text-[clamp(2.4rem,5.4vw,4.6rem)]', dark ? 'text-ivory' : 'text-ink')}>{title}</h2>
        {lead && <p className={cn('mt-6 max-w-2xl text-[1.05rem] leading-relaxed', centered && 'mx-auto', dark ? 'text-ivory/70' : 'text-muted-foreground')}>{lead}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}

/** Невеликий орнаментальний роздільник — хрест між золотими лініями */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-4 text-gold', className)} aria-hidden="true">
      <span className="hairline w-24" />
      <svg width="18" height="24" viewBox="0 0 18 24" fill="none"><path d="M9 0v24M3 6h12M5 17l8-3" stroke="currentColor" strokeWidth="1.4" /></svg>
      <span className="hairline w-24" />
    </div>
  )
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn('group inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-[6px] hover:underline', className)}>
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
    </a>
  )
}

export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
