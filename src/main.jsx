import React from 'react'
import { createRoot } from 'react-dom/client'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import LiveStreams from './components/LiveStreams.jsx'
import FacebookFeed from './components/FacebookFeed.jsx'
import Rector from './components/Rector.jsx'
import Contacts from './components/Contacts.jsx'
import './style.css'

function App() {
  return <><Header /><main><Hero /><LiveStreams /><FacebookFeed /><Rector /><Contacts /></main><footer className="border-t border-slate-200 bg-white px-6 py-7 text-center text-sm text-slate-500"><p>© {new Date().getFullYear()} Храм св. апостолів Петра і Павла · Кам'янець-Подільський</p><p className="mt-1">Православна Церква України</p></footer></>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
