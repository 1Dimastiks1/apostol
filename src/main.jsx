import React from 'react'
import { createRoot } from 'react-dom/client'
import Header from './components/Header.jsx'
import HeroCarousel from './components/HeroCarousel.jsx'
import PrayerActions from './components/PrayerActions.jsx'
import LiveStreams from './components/LiveStreams.jsx'
import FacebookGallery from './components/FacebookGallery.jsx'
import Rector from './components/Rector.jsx'
import Contacts from './components/Contacts.jsx'
import MemorialNotes from './components/MemorialNotes.jsx'
import './style.css'

function App() {
  return <><Header /><main><HeroCarousel /><PrayerActions /><LiveStreams /><Rector /><FacebookGallery /><MemorialNotes /><Contacts /></main><footer className="border-t border-[#e5b842]/30 bg-[#3a0000] px-6 py-7 text-center text-sm text-[#eadfca]"><p>© {new Date().getFullYear()} Храм св. апостолів Петра і Павла · Кам'янець-Подільський</p><p className="mt-1 text-[#e5b842]">Православна Церква України</p></footer></>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
