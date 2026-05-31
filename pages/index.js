import { useState, useEffect, useRef } from 'react'

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
  const countryRef = useRef(null)
  const sourceRef = useRef(null)
  const cats = ['all','Politics','Technology','Science','Business','Health','Sustainability','Supply Chain','Automotive','Social Media','Sport']

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

  useEffect(() => { loadNews() }, [])

  useEffect(() => {
    function handleClick(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false)
        setCountrySearch('')
      }
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setSourceOpen(false)
        setSourceSearch('')
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

  async function loadNews() {
    setStatus('loading')
    setArticles([])
    setActiveCountry('all')
    setActiveSource('all')
    try {
      const res = await fetch('/api/news')
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

  const countries = ['all', ...[...new Set(articles.map(a => a.country).filter(c => c && c !== 'Multiple'))].sort()]
  const filteredCountries = countries.filter(c => c === 'all' || c.toLowerCase().includes(countrySearch.toLowerCase()))
  const sources = ['all', ...[...new Set(articles.map(a => a.source).filter(Boolean))].sort()]
  const filteredSources = sources.filter(s => s === 'all' || s.toLowerCase().includes(sourceSearch.toLowerCase()))
  const shown = articles
    .filter(a => active === 'all' || a.category === active)
    .filter(a => activeCountry === 'all' || a.country === activeCountry || a.category === 'Social Media')
    .filter(a => activeSource === 'all' || a.source === activeSource)
    .sort((a, b) => sortOrder === 'newest' ? parseTime(a.time) - parseTime(b.time) : parseTime(b.time) - parseTime(a.time))

  return (
    <div style={{fontFamily:'Georgia,serif',background:t.bg,minHeight:'100vh',color:t.text,transition:'all 0.3s'}}>

      {/* HEADER */}
      <div style={{textAlign:'center',padding:'1.5rem 1rem',borderBottom:`3px double ${t.border}`,position:'sticky',top:0,background:t.bg,zIndex:99,transition:'all 0.3s'}}>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'0.5rem'}}>
          <button onClick={() => setDark(!dark)} style={{background:'none',border:`1px solid ${t.border}`,color:t.text,padding:'0.3rem 0.8rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer',minWidth:'5.5rem',textAlign:'center'}}>
            {dark ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'2.5rem',fontWeight:900,margin:'0 0 0.2rem',color:t.text}}>The Roundup</h1>
        <p style={{fontSize:'0.7rem',letterSpacing:'0.2em',color:t.muted,textTransform:'uppercase',margin:'0 0 0.8rem'}}>Trusted Sources · Concise Summaries</p>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',borderTop:`1px solid ${t.border}`,paddingTop:'0.6rem',marginBottom:'0.3rem'}}>
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)}
              style={{background:active===c?t.btn:'transparent',color:active===c?t.btnText:t.muted,border:'none',padding:'0.35rem 0.9rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer'}}>
              {c}
            </button>
          ))}
        </div>
        {articles.length > 0 && (
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',alignItems:'center',gap:'0.5rem',borderTop:`1px solid ${t.border}`,paddingTop:'0.4rem',marginBottom:'0.6rem'}}>

            {/* Country */}
            <span style={{color:t.muted,fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase'}}>Country:</span>
            <div ref={countryRef} style={{position:'relative'}}>
              <button onClick={() => setCountryOpen(!countryOpen)}
                style={{background:activeCountry!=='all'?t.btn:'transparent',color:activeCountry!=='all'?t.btnText:t.muted,border:`1px solid ${t.border}`,padding:'0.3rem 0.8rem',fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                {activeCountry === 'all' ? 'All Countries & Global' : activeCountry} <span style={{fontSize:'0.5rem'}}>▾</span>
              </button>
              {countryOpen && (
                <div style={{position:'absolute',top:'calc(100% + 2px)',left:0,background:t.card,border:`1px solid ${t.border}`,zIndex:200,minWidth:'220px',boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}}>
                  <input autoFocus value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                    placeholder="Search country..."
                    style={{width:'100%',background:t.bg,color:t.text,border:'none',borderBottom:`1px solid ${t.border}`,padding:'0.45rem 0.6rem',fontFamily:'monospace',fontSize:'0.65rem',outline:'none',boxSizing:'border-box'}} />
                  <div style={{maxHeight:'200px',overflowY:'auto'}}>
                    {filteredCountries.map(c => (
                      <div key={c} onClick={() => { setActiveCountry(c); setCountryOpen(false); setCountrySearch('') }}
                        style={{padding:'0.4rem 0.6rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer',background:activeCountry===c?t.btn:'transparent',color:activeCountry===c?t.btnText:t.text}}>
                        {c === 'all' ? 'All Countries & Global' : c}
                      </div>
                    ))}
                    {filteredCountries.length === 0 && <div style={{padding:'0.4rem 0.6rem',fontFamily:'monospace',fontSize:'0.65rem',color:t.muted}}>No results</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Source */}
            <span style={{color:t.muted,fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',marginLeft:'0.5rem'}}>Source:</span>
            <div ref={sourceRef} style={{position:'relative'}}>
              <button onClick={() => setSourceOpen(!sourceOpen)}
                style={{background:activeSource!=='all'?t.btn:'transparent',color:activeSource!=='all'?t.btnText:t.muted,border:`1px solid ${t.border}`,padding:'0.3rem 0.8rem',fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                {activeSource === 'all' ? 'All Sources' : activeSource} <span style={{fontSize:'0.5rem'}}>▾</span>
              </button>
              {sourceOpen && (
                <div style={{position:'absolute',top:'calc(100% + 2px)',left:0,background:t.card,border:`1px solid ${t.border}`,zIndex:200,minWidth:'200px',boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}}>
                  <input autoFocus value={sourceSearch} onChange={e => setSourceSearch(e.target.value)}
                    placeholder="Search source..."
                    style={{width:'100%',background:t.bg,color:t.text,border:'none',borderBottom:`1px solid ${t.border}`,padding:'0.45rem 0.6rem',fontFamily:'monospace',fontSize:'0.65rem',outline:'none',boxSizing:'border-box'}} />
                  <div style={{maxHeight:'200px',overflowY:'auto'}}>
                    {filteredSources.map(s => (
                      <div key={s} onClick={() => { setActiveSource(s); setSourceOpen(false); setSourceSearch('') }}
                        style={{padding:'0.4rem 0.6rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer',background:activeSource===s?t.btn:'transparent',color:activeSource===s?t.btnText:t.text}}>
                        {s === 'all' ? 'All Sources' : s}
                      </div>
                    ))}
                    {filteredSources.length === 0 && <div style={{padding:'0.4rem 0.6rem',fontFamily:'monospace',fontSize:'0.65rem',color:t.muted}}>No results</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <button onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
              style={{background:'transparent',color:t.muted,border:`1px solid ${t.border}`,padding:'0.3rem 0.8rem',fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',cursor:'pointer',marginLeft:'0.5rem'}}>
              {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
            </button>

          </div>
        )}
        <button onClick={loadNews} disabled={status==='loading'}
          style={{background:t.btn,color:t.btnText,border:'none',padding:'0.4rem 1.4rem',fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer'}}>
          {status==='loading' ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* CONTENT */}
      <div style={{background:t.bg,minHeight:'100vh',padding:'2rem 0',transition:'all 0.3s'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 1rem'}}>
          {status==='error' && <p style={{textAlign:'center',color:'red',fontFamily:'monospace',padding:'2rem'}}>Failed to load. Tap Refresh.</p>}
          {status==='loading' && <p style={{textAlign:'center',color:t.muted,fontFamily:'monospace',padding:'2rem'}}>Fetching today's briefing...</p>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1px',background:t.border,border:`1px solid ${t.border}`}}>
            {shown.map((a, i) => (
              <div key={i} style={{background:t.card,padding:'1.4rem',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
                  <span style={{background:t.badge,color:t.badgeText,fontFamily:'monospace',fontSize:'0.6rem',padding:'0.15rem 0.4rem',textTransform:'uppercase'}}>{a.source}</span>
                  <span style={{color:t.accent,fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase'}}>{a.category}</span>
                  {a.country && <span style={{color:t.muted,fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',marginLeft:'auto'}}>📍 {a.country}</span>}
                </div>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',fontWeight:700,lineHeight:1.35,margin:0,color:t.text}}>{a.headline}</h2>
                <p style={{fontSize:'0.85rem',lineHeight:1.65,color:t.summary,margin:0}}>{a.summary}</p>
                <p style={{fontFamily:'monospace',fontSize:'0.6rem',color:t.muted,margin:0,paddingTop:'0.5rem',borderTop:`1px solid ${t.border}`}}>{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
