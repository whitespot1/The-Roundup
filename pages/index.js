import { useState, useEffect, useRef } from 'react'

const ALL_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
  'Brunei','Bulgaria','Cambodia','Cameroon','Canada','Chile','China','Colombia','Croatia','Cuba',
  'Cyprus','Czech Republic','Denmark','Ecuador','Egypt','El Salvador','Estonia','Ethiopia',
  'Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Hungary','Iceland','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan',
  'Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Libya','Lithuania','Luxembourg',
  'Malaysia','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Mongolia','Montenegro',
  'Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua',
  'Nigeria','North Korea','Norway','Oman','Pakistan','Palestine','Panama','Paraguay','Peru',
  'Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal',
  'Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','South Sudan',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand',
  'Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
]

const i18n = {
  en: {
    subtitle: 'Trusted Sources · Concise Summaries',
    light: '☀ Light', dark: '☾ Dark', langToggle: 'العربية',
    refresh: '↻ Refresh', loading: 'Loading...',
    fetching: "Fetching today's briefing...", failed: 'Failed to load. Tap Refresh.',
    country: 'Country:', source: 'Source:',
    allCountries: 'All Countries & Global', allSources: 'All Sources',
    searchCountry: 'Search country...', searchSource: 'Search source...',
    noResults: 'No results', newest: '↓ Newest', oldest: '↑ Oldest',
    cats: { all:'All', Politics:'Politics', Technology:'Technology', Science:'Science',
      Business:'Business', Health:'Health', Sustainability:'Sustainability',
      'Supply Chain':'Supply Chain', Automotive:'Automotive',
      'Social Media':'Social Media', Sport:'Sport' }
  },
  ar: {
    subtitle: 'مصادر موثوقة · ملخصات موجزة',
    light: '☀ فاتح', dark: '☾ داكن', langToggle: 'English',
    refresh: '↻ تحديث', loading: 'جار التحميل...',
    fetching: 'جار تحميل الأخبار...', failed: 'فشل التحميل. اضغط تحديث.',
    country: 'الدولة:', source: 'المصدر:',
    allCountries: 'جميع الدول والعالمي', allSources: 'جميع المصادر',
    searchCountry: 'ابحث عن دولة...', searchSource: 'ابحث عن مصدر...',
    noResults: 'لا توجد نتائج', newest: '↓ الأحدث', oldest: '↑ الأقدم',
    cats: { all:'الكل', Politics:'سياسة', Technology:'تقنية', Science:'علوم',
      Business:'أعمال', Health:'صحة', Sustainability:'استدامة',
      'Supply Chain':'سلسلة الإمداد', Automotive:'سيارات',
      'Social Media':'وسائل التواصل', Sport:'رياضة' }
  }
}

function localizeTime(str, isAr) {
  if (!isAr) return str
  const m1 = str.match(/^(\d+) minutes? ago$/)
  const m2 = str.match(/^(\d+) hours? ago$/)
  const m3 = str.match(/^(\d+) days? ago$/)
  if (str === 'just now') return 'الآن'
  if (str === 'recently') return 'مؤخراً'
  if (m1) return `منذ ${m1[1]} دقيقة`
  if (m2) return `منذ ${m2[1]} ساعة`
  if (m3) return `منذ ${m3[1]} يوم`
  return str
}

export default function Home() {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')
  const [active, setActive] = useState('all')
  const [activeCountry, setActiveCountry] = useState('all')
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [activeSource, setActiveSource] = useState('all')
  const [sourceOpen, setSourceOpen] = useState(false)
  const [sourceSearch, setSourceSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [dark, setDark] = useState(true)
  const [lang, setLang] = useState('en')
  const countryRef = useRef(null)
  const sourceRef = useRef(null)
  const cats = ['all','Politics','Technology','Science','Business','Health','Sustainability','Supply Chain','Automotive','Social Media','Sport']

  const tr = i18n[lang]
  const isRTL = lang === 'ar'

  const t = dark ? {
    bg: '#111', header: '#111', card: '#1a1a1a',
    text: '#e8e4dc', muted: '#666', border: '#2a2a2a',
    badge: '#e8e4dc', badgeText: '#111',
    btn: '#2a2a2a', btnText: '#e8e4dc',
    accent: '#e05a4e', summary: '#999'
  } : {
    bg: '#f5f0e8', header: '#f5f0e8', card: '#faf7f2',
    text: '#0f0e0c', muted: '#7a7368', border: '#d4cfc4',
    badge: '#0f0e0c', badgeText: '#f5f0e8',
    btn: '#0f0e0c', btnText: '#f5f0e8',
    accent: '#c8392b', summary: '#3a3830'
  }

  useEffect(() => {
    function handleClick(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false); setCountrySearch('')
      }
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setSourceOpen(false); setSourceSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const bg = dark ? '#111' : '#f5f0e8'
    document.documentElement.style.background = bg
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.background = bg
  }, [dark])

  useEffect(() => { loadNews() }, [lang])

  async function loadNews() {
    setStatus('loading')
    setArticles([])
    setActiveCountry('all')
    setActiveSource('all')
    try {
      const res = await fetch('/api/news?lang=' + lang)
      const data = await res.json()
      if (Array.isArray(data)) { setArticles(data); setStatus('live') }
      else setStatus('error')
    } catch(e) { setStatus('error') }
  }

  function parseTime(str) {
    const m = (str || '').match(/(\d+)\s+(minute|hour|day|week)/)
    if (!m) return 0
    const n = parseInt(m[1])
    if (m[2] === 'minute') return n
    if (m[2] === 'hour') return n * 60
    if (m[2] === 'day') return n * 1440
    if (m[2] === 'week') return n * 10080
    return 0
  }

  const articleCountries = articles.map(a => a.country).filter(c => c && c !== 'Multiple' && c !== 'Global')
  const countries = ['all', ...[...new Set([...ALL_COUNTRIES, ...articleCountries])].sort()]
  const filteredCountries = countries.filter(c => c === 'all' || c.toLowerCase().includes(countrySearch.toLowerCase()))
  const sources = ['all', ...[...new Set(articles.map(a => a.source).filter(Boolean))].sort()]
  const filteredSources = sources.filter(s => s === 'all' || s.toLowerCase().includes(sourceSearch.toLowerCase()))
  const shown = articles
    .filter(a => active === 'all' || a.category === active)
    .filter(a => activeCountry === 'all' || a.country === activeCountry)
    .filter(a => activeSource === 'all' || a.source === activeSource)
    .sort((a, b) => sortOrder === 'newest' ? parseTime(a.time) - parseTime(b.time) : parseTime(b.time) - parseTime(a.time))

  const btnStyle = { background:'none', border:`1px solid ${t.border}`, color:t.text,
    padding:'0.3rem 0.8rem', fontFamily:'monospace', fontSize:'0.65rem',
    textTransform:'uppercase', cursor:'pointer', minWidth:'5.5rem', textAlign:'center' }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{fontFamily: isRTL ? 'Tahoma,Arial,sans-serif' : 'Georgia,serif', background:t.bg, minHeight:'100vh', color:t.text, transition:'all 0.3s'}}>

      {/* HEADER */}
      <div style={{textAlign:'center', padding:'1.5rem 1rem', borderBottom:`3px double ${t.border}`, position:'sticky', top:0, background:t.bg, zIndex:99, transition:'all 0.3s'}}>
        <div style={{display:'flex', justifyContent:'flex-end', gap:'0.4rem', marginBottom:'0.5rem'}}>
          <button onClick={() => setDark(!dark)} style={btnStyle}>
            {dark ? tr.light : tr.dark}
          </button>
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} style={btnStyle}>
            {tr.langToggle}
          </button>
        </div>
        <h1 style={{fontFamily: isRTL ? 'Tahoma,Arial,sans-serif' : 'Georgia,serif', fontSize:'2.5rem', fontWeight:900, margin:'0 0 0.2rem', color:t.text}}>The Roundup</h1>
        <p style={{fontSize:'0.7rem', letterSpacing:'0.2em', color:t.muted, textTransform:'uppercase', margin:'0 0 0.8rem'}}>{tr.subtitle}</p>

        {/* Category filter */}
        <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', borderTop:`1px solid ${t.border}`, paddingTop:'0.6rem', marginBottom:'0.3rem'}}>
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)}
              style={{background:active===c?t.btn:'transparent', color:active===c?t.btnText:t.muted, border:'none', padding:'0.35rem 0.9rem', fontFamily:'monospace', fontSize:'0.65rem', textTransform:'uppercase', cursor:'pointer'}}>
              {tr.cats[c]}
            </button>
          ))}
        </div>

        {/* Country / Source / Sort filters */}
        {articles.length > 0 && (
          <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', alignItems:'center', gap:'0.5rem', borderTop:`1px solid ${t.border}`, paddingTop:'0.4rem', marginBottom:'0.6rem'}}>

            <span style={{color:t.muted, fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase'}}>{tr.country}</span>
            <div ref={countryRef} style={{position:'relative'}}>
              <button onClick={() => setCountryOpen(!countryOpen)}
                style={{background:activeCountry!=='all'?t.btn:'transparent', color:activeCountry!=='all'?t.btnText:t.muted, border:`1px solid ${t.border}`, padding:'0.3rem 0.8rem', fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                {activeCountry === 'all' ? tr.allCountries : activeCountry} <span style={{fontSize:'0.5rem'}}>▾</span>
              </button>
              {countryOpen && (
                <div style={{position:'absolute', top:'calc(100% + 2px)', left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', background:t.card, border:`1px solid ${t.border}`, zIndex:200, minWidth:'220px', boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}}>
                  <input autoFocus value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                    placeholder={tr.searchCountry}
                    style={{width:'100%', background:t.bg, color:t.text, border:'none', borderBottom:`1px solid ${t.border}`, padding:'0.45rem 0.6rem', fontFamily:'monospace', fontSize:'0.65rem', outline:'none', boxSizing:'border-box', direction: isRTL ? 'rtl' : 'ltr'}} />
                  <div style={{maxHeight:'200px', overflowY:'auto'}}>
                    {filteredCountries.map(c => (
                      <div key={c} onClick={() => { setActiveCountry(c); setCountryOpen(false); setCountrySearch('') }}
                        style={{padding:'0.4rem 0.6rem', fontFamily:'monospace', fontSize:'0.65rem', textTransform:'uppercase', cursor:'pointer', background:activeCountry===c?t.btn:'transparent', color:activeCountry===c?t.btnText:t.text}}>
                        {c === 'all' ? tr.allCountries : c}
                      </div>
                    ))}
                    {filteredCountries.length === 0 && <div style={{padding:'0.4rem 0.6rem', fontFamily:'monospace', fontSize:'0.65rem', color:t.muted}}>{tr.noResults}</div>}
                  </div>
                </div>
              )}
            </div>

            <span style={{color:t.muted, fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase', marginLeft: isRTL ? 0 : '0.5rem', marginRight: isRTL ? '0.5rem' : 0}}>{tr.source}</span>
            <div ref={sourceRef} style={{position:'relative'}}>
              <button onClick={() => setSourceOpen(!sourceOpen)}
                style={{background:activeSource!=='all'?t.btn:'transparent', color:activeSource!=='all'?t.btnText:t.muted, border:`1px solid ${t.border}`, padding:'0.3rem 0.8rem', fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                {activeSource === 'all' ? tr.allSources : activeSource} <span style={{fontSize:'0.5rem'}}>▾</span>
              </button>
              {sourceOpen && (
                <div style={{position:'absolute', top:'calc(100% + 2px)', left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', background:t.card, border:`1px solid ${t.border}`, zIndex:200, minWidth:'200px', boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}}>
                  <input autoFocus value={sourceSearch} onChange={e => setSourceSearch(e.target.value)}
                    placeholder={tr.searchSource}
                    style={{width:'100%', background:t.bg, color:t.text, border:'none', borderBottom:`1px solid ${t.border}`, padding:'0.45rem 0.6rem', fontFamily:'monospace', fontSize:'0.65rem', outline:'none', boxSizing:'border-box', direction: isRTL ? 'rtl' : 'ltr'}} />
                  <div style={{maxHeight:'200px', overflowY:'auto'}}>
                    {filteredSources.map(s => (
                      <div key={s} onClick={() => { setActiveSource(s); setSourceOpen(false); setSourceSearch('') }}
                        style={{padding:'0.4rem 0.6rem', fontFamily:'monospace', fontSize:'0.65rem', textTransform:'uppercase', cursor:'pointer', background:activeSource===s?t.btn:'transparent', color:activeSource===s?t.btnText:t.text}}>
                        {s === 'all' ? tr.allSources : s}
                      </div>
                    ))}
                    {filteredSources.length === 0 && <div style={{padding:'0.4rem 0.6rem', fontFamily:'monospace', fontSize:'0.65rem', color:t.muted}}>{tr.noResults}</div>}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
              style={{background:'transparent', color:t.muted, border:`1px solid ${t.border}`, padding:'0.3rem 0.8rem', fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase', cursor:'pointer', marginLeft: isRTL ? 0 : '0.5rem', marginRight: isRTL ? '0.5rem' : 0}}>
              {sortOrder === 'newest' ? tr.newest : tr.oldest}
            </button>

          </div>
        )}

        <button onClick={loadNews} disabled={status==='loading'}
          style={{background:t.btn, color:t.btnText, border:'none', padding:'0.4rem 1.4rem', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.08em', cursor:'pointer'}}>
          {status==='loading' ? tr.loading : tr.refresh}
        </button>
      </div>

      {/* CONTENT */}
      <div style={{background:t.bg, minHeight:'100vh', padding:'2rem 0', transition:'all 0.3s'}}>
        <div style={{maxWidth:'1100px', margin:'0 auto', padding:'0 1rem'}}>
          {status==='error' && <p style={{textAlign:'center', color:'red', fontFamily:'monospace', padding:'2rem'}}>{tr.failed}</p>}
          {status==='loading' && <p style={{textAlign:'center', color:t.muted, fontFamily:'monospace', padding:'2rem'}}>{tr.fetching}</p>}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1px', background:t.border, border:`1px solid ${t.border}`}}>
            {shown.map((a, i) => (
              <div key={i} style={{background:t.card, padding:'1.4rem', display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap'}}>
                  <span style={{background:t.badge, color:t.badgeText, fontFamily:'monospace', fontSize:'0.6rem', padding:'0.15rem 0.4rem', textTransform:'uppercase'}}>{a.source}</span>
                  <span style={{color:t.accent, fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase'}}>{tr.cats[a.category] || a.category}</span>
                  {a.country && <span style={{color:t.muted, fontFamily:'monospace', fontSize:'0.6rem', textTransform:'uppercase', marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0}}>📍 {a.country}</span>}
                </div>
                <h2 style={{fontFamily: isRTL ? 'Tahoma,Arial,sans-serif' : 'Georgia,serif', fontSize:'1.05rem', fontWeight:700, lineHeight:1.5, margin:0, color:t.text}}>{a.headline}</h2>
                <p style={{fontSize:'0.85rem', lineHeight:1.65, color:t.summary, margin:0}}>{a.summary}</p>
                <p style={{fontFamily:'monospace', fontSize:'0.6rem', color:t.muted, margin:0, paddingTop:'0.5rem', borderTop:`1px solid ${t.border}`}}>{localizeTime(a.time, isRTL)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
