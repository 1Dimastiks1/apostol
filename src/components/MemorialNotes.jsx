import React, { useState } from 'react'
import { Heart, Send, ShieldCheck, UserRound } from 'lucide-react'

const rectorPage = 'https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA'
const memorialPost = 'https://www.facebook.com/permalink.php?story_fbid=pfbid0wr4Gq5GgukTM1AWhKbAwocCBJEUns2HS39yzNCEGE4MLFctjx4joBaM6xLEXwQP3l&id=100059029128700'

export default function MemorialNotes() {
  const [commemoration, setCommemoration] = useState('health')
  const [names, setNames] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanNames = names.split('\n').map((name) => name.trim()).filter(Boolean)
    if (!cleanNames.length) {
      setStatus('Додайте щонайменше одне ім’я до поминання.')
      return
    }
    if (!consent) {
      setStatus('Підтвердьте згоду на копіювання імен і відкриття Facebook.')
      return
    }
    const kind = commemoration === 'health' ? 'За здоров’я' : 'За упокій'
    const note = `${kind}: ${cleanNames.join(', ')}`
    const destination = commemoration === 'repose' ? memorialPost : rectorPage
    window.open(destination, '_blank', 'noopener,noreferrer')
    try {
      await navigator.clipboard.writeText(note)
      setStatus('Імена скопійовано. У Facebook самостійно вставте їх у коментар до оголошення або приватне повідомлення настоятелю.')
    } catch {
      setStatus('Facebook відкрито. Скопіюйте імена з поля вище та вставте їх у коментар або приватне повідомлення.')
    }
  }

  return <section id="prayer-notes" className="bg-[#f4efe3] px-5 py-20 sm:px-9 sm:py-28 lg:px-16">
    <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-16">
      <div><p className="eyebrow">СПІЛЬНА МОЛИТВА</p><h2 className="font-display mt-3 text-4xl uppercase leading-tight tracking-[.06em] text-[#3a0000] sm:text-5xl">Подати поминання</h2><p className="mt-5 text-lg leading-8 text-[#40372d]">Введіть хрещені імена. Сайт не зберігає їх і не надсилає автоматично: кнопка скопіює текст та відкриє відповідну сторінку Facebook, де ви самі вирішите, куди його вставити.</p><div className="mt-7 flex items-start gap-3 border-l-2 border-[#b28f3d] pl-4 text-sm leading-6 text-slate-600"><ShieldCheck size={18} className="mt-1 shrink-0 text-[#8a6c2f]"/><p>Для поминання за упокій сторінка парафії просить писати в коментарях до оголошення. Для молитви за здоров’я відкриється сторінка настоятеля для приватного звернення.</p></div></div>
      <form onSubmit={handleSubmit} className="border border-[#b28f3d]/65 bg-[#fffdf7] p-5 shadow-[0_20px_60px_rgba(43,0,0,.09)] sm:p-8">
        <fieldset><legend className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-[#795d22]">Оберіть намір молитви</legend><div className="grid gap-3 sm:grid-cols-2">
          <button type="button" aria-pressed={commemoration === 'health'} onClick={() => setCommemoration('health')} className={`flex min-h-14 items-center gap-3 border px-4 py-3 text-left text-sm font-semibold transition ${commemoration === 'health' ? 'border-[#8e111c] bg-[#8e111c] text-white shadow-[0_0_24px_rgba(142,17,28,.22)]' : 'border-[#8e111c]/30 text-[#6e0b13] hover:border-[#8e111c]'}`}><Heart size={18}/>За здоров’я</button>
          <button type="button" aria-pressed={commemoration === 'repose'} onClick={() => setCommemoration('repose')} className={`flex min-h-14 items-center gap-3 border px-4 py-3 text-left text-sm font-semibold transition ${commemoration === 'repose' ? 'border-[#16385e] bg-[#16385e] text-white shadow-[0_0_24px_rgba(22,56,94,.20)]' : 'border-[#16385e]/30 text-[#16385e] hover:border-[#16385e]'}`}><UserRound size={18}/>За упокій</button>
        </div></fieldset>
        <label htmlFor="commemoration-names" className="mt-6 block text-xs font-semibold uppercase tracking-[.16em] text-[#795d22]">Імена для поминання</label>
        <textarea id="commemoration-names" value={names} onChange={(event) => setNames(event.target.value)} maxLength={1200} rows={6} placeholder={'Впишіть хрещені імена — кожне з нового рядка'} className="memorial-paper mt-3 w-full resize-y border border-[#b28f3d]/40 bg-[#fffdf7] px-4 py-3 text-base leading-10 text-[#28221a] outline-none focus:border-[#a07c29] focus:ring-2 focus:ring-[#e5b842]/25" aria-describedby="names-hint"/>
        <p id="names-hint" className="mt-2 text-xs text-slate-500">До 1 200 символів. Імена залишаються у цьому полі, доки ви самостійно не скопіюєте їх у Facebook.</p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 accent-[#660000]"/><span>Погоджуюся скопіювати ці імена в буфер обміну та відкрити Facebook. Публікацію виконаю самостійно.</span></label>
        <button type="submit" className="candle-glow mt-6 inline-flex items-center gap-2 bg-[#3a0000] px-5 py-3.5 text-sm font-semibold text-[#f4df9c] transition hover:bg-[#5a0000]"><Send size={16}/>Скопіювати й відкрити Facebook</button>
        <p aria-live="polite" className="mt-3 min-h-5 text-xs leading-5 text-[#6e0b13]">{status}</p>
      </form>
    </div>
  </section>
}
