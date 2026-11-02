import { useParishData } from '@/hooks/use-parish-data'
import { SiteHeader } from '@/components/site/site-header'
import { Hero, Marquee } from '@/components/site/hero'
import { Schedule, ScriptureBanner } from '@/components/site/schedule'
import { Worship } from '@/components/site/worship'
import { CalendarSection } from '@/components/site/calendar-section'
import { Feasts } from '@/components/site/feasts'
import { Rector } from '@/components/site/rector'
import { Gallery } from '@/components/site/gallery'
import { Pilgrimage } from '@/components/site/pilgrimage'
import { Sacraments } from '@/components/site/sacraments'
import { News } from '@/components/site/news'
import { Communities } from '@/components/site/communities'
import { ServicesForm } from '@/components/site/services-form'
import { Memorial } from '@/components/site/memorial'
import { Prayers } from '@/components/site/prayers'
import { Faq } from '@/components/site/faq'
import { Donate } from '@/components/site/donate'
import { Contacts } from '@/components/site/contacts'
import { PageChrome, SiteFooter } from '@/components/site/site-footer'

export default function App() {
  const { posts, current, archive, announcement, syncStatus } = useParishData()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ivory focus:px-4 focus:py-2">Перейти до вмісту</a>
      <SiteHeader />
      <main id="main">
        <Hero announcement={announcement} />
        <Marquee />
        <Schedule />
        <Worship current={current} archive={archive} syncStatus={syncStatus} />
        <CalendarSection />
        <ScriptureBanner />
        <Feasts />
        <Rector />
        <Gallery />
        <Pilgrimage />
        <News posts={posts} />
        <Communities />
        <Sacraments />
        <ServicesForm />
        <Memorial />
        <Prayers />
        <Faq />
        <Donate />
        <Contacts />
      </main>
      <SiteFooter />
      <PageChrome />
    </>
  )
}
