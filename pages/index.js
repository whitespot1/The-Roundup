import { useState, useEffect } from 'react'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')
  const [active, setActive] = useState('all')
  const cats = ['all','World','Politics','Technology','Science','Business','Health','Climate']

  useEffect(() => { loadNews() }, [])

  async function loadNews() {
    setStatus('loading')
    setArticles([])
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      if (Array.isArray(data)) {
        setArticles(data)
        setStatus('live')
      } else {
        setStatus('error')
      }
    } catch(e) {
      setStatus('error')
    }
  }

  const shown = active === 'all' ? articles : articles.filter(a => a.category === active)

  return (
    <div style={{fontFamily:'Georgia,serif',background:'#f5f0e8',minHeight:'100vh'}}>
      <div style={{textAlign:'center',padding:'1.5rem 1rem',borderBottom:'3px double #ccc',position:'sticky',top:0,background:'#f5f0e8',zIndex:99}}>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'2.5rem',fontWeight:900,margin:'0 0 0.2rem'}}>The Digest</h1>
        <p style={{fontSize:'0.7rem',letterSpacing:'0.2em',color:'#888',textTransform:'uppercase',margin:'0 0 0.8rem'}}>Trusted Sources · Concise Summaries</p>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',borderTop:'1px solid #ddd',paddingTop:'0.6rem',marginBottom:'0.6rem'}}>
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)}
              style={{background:active===c?'#111':'transparent',color:active===c?'#fff':'#888',border:'none',padding:'0.35rem 0.9rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer'}}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={loadNews} disabled={status==='loading'}
          style={{background:'#111',color:'#fff',border:'none',padding:'0.4rem 1.4rem',fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer'}}>
          {status==='loading' ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      <div style={{maxWidth:'1100px',margin:'2rem auto',padding:'0 1rem'}}>
        {status==='error' && <p style={{textAlign:'center',color:'red',fontFamily:'monospace',padding:'2rem'}}>Failed to load. Tap Refresh.</p>}
        {status==='loading' && <p style={{textAlign:'center',color:'#999',fontFamily:'monospace',padding:'2rem'}}>Fetching today's briefing...</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1px',background:'#ccc',border:'1px solid #ccc'}}>
          {shown.map((a, i) => (
            <div key={i} style={{background:'#faf7f2',padding:'1.4rem',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <span style={{background:'#111',color:'#fff',fontFamily:'monospace',fontSize:'0.6rem',padding:'0.15rem 0.4rem',textTransform:'uppercase'}}>{a.source}</span>
                <span style={{color:'#c8392b',fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase'}}>{a.category}</span>
              </div>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',fontWeight:700,lineHeight:1.35,margin:0}}>{a.headline}</h2>
              <p style={{fontSize:'0.85rem',lineHeight:1.65,color:'#444',margin:0}}>{a.summary}</p>
              <p style={{fontFamily:'monospace',fontSize:'0.6rem',color:'#999',margin:'0',paddingTop:'0.5rem',borderTop:'1px solid #e0dbd0'}}>{a.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
