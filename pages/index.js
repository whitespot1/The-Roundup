import { useState, useEffect } from 'react'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')
  const [active, setActive] = useState('all')
  const [activeCountry, setActiveCountry] = useState('all')
  const [dark, setDark] = useState(true)
  const cats = ['all','Politics','Technology','Science','Business','Health','Sustainability','Supply Chain','Automotive','Social Media']

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
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      if (Array.isArray(data)) { setArticles(data); setStatus('live') }
      else setStatus('error')
    } catch(e) { setStatus('error') }
  }

  const countries = ['all', ...new Set(articles.map(a => a.country).filter(Boolean))]
  const shown = articles
    .filter(a => active === 'all' || a.category === active)
    .filter(a => activeCountry === 'all' || a.country === activeCountry)

  return (
    <div style={{fontFamily:'Georgia,serif',background:t.bg,minHeight:'100vh',color:t.text,transition:'all 0.3s'}}>

      {/* HEADER */}
      <div style={{textAlign:'center',padding:'1.5rem 1rem',borderBottom:`3px double ${t.border}`,position:'sticky',top:0,background:t.bg,zIndex:99,transition:'all 0.3s'}}>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'0.5rem'}}>
          <button onClick={() => setDark(!dark)} style={{background:'none',border:`1px solid ${t.border}`,color:t.text,padding:'0.3rem 0.8rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer'}}>
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
        {countries.length > 1 && (
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',borderTop:`1px solid ${t.border}`,paddingTop:'0.4rem',marginBottom:'0.6rem'}}>
            <span style={{color:t.muted,fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',padding:'0.35rem 0.5rem',alignSelf:'center'}}>Country:</span>
            {countries.map(c => (
              <button key={c} onClick={() => setActiveCountry(c)}
                style={{background:activeCountry===c?t.btn:'transparent',color:activeCountry===c?t.btnText:t.muted,border:'none',padding:'0.3rem 0.7rem',fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase',cursor:'pointer'}}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
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
