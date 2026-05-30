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
      setArticles(data)
      setStatus('live')
    } catch(e) {
      setStatus('error')
    }
  }

  const shown = active === 'all' ? articles : articles.filter(a => a.category === active)

  return (
    <div style={{fontFamily:'Georgia,serif',background:'#f5f0e8',minHeight:'100vh'}}>
      <div style={{borderBottom:'3px double #ccc',padding:'1rem 2rem',textAlign:'center',background:'#f5f0e8',position:'sticky',top:0,zIndex:99}}>
        <h1 style={{fontSize:'2.5rem',fontWeight:900,margin:0}}>The Digest</h1>
        <p style={{fontSize:'0.7rem',letterSpacing:'0.2em',color:'#888',textTransform:'uppercase',margin:'0.2rem 0 0.8rem'}}>Trusted Sources · Concise Summaries</p>
        <div style={{display:'flex',gap:0,justifyContent:'center',flexWrap:'wrap',borderTop:'1px solid #ddd',paddingTop:'0.5rem'}}>
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)} style={{background: active===c ? '#111':'none',color:active===c?'#f5f0e8':'#888',border:'none',padding:'0.4rem 1rem',fontFamily:'monospace',fontSize:'0.65rem',textTransform:'uppercase',cursor:'pointer',letterSpacing:'0.08em'}}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={loadNews} disabled={status==='loading'} style={{marginTop:'0.6rem',background:'#111',color:'#f5f0e8',border:'none',padding:'0.4rem 1.2rem',fontSize:'0.75rem',textTransform:'uppercase',letterSpacing:'0.08em',cursor:'pointer'}}>
          ↻ Refresh
        </button>
      </div>

      <div style={{maxWidth:'1100px',margin:'2rem auto',padding:'0 1rem'}}>
        {status==='loading' && <p style={{textAlign:'center',color:'#888',fontFamily:'monospace',fontSize:'0.8rem'}}>Loading briefing...</p>}
        {status==='error' && <p style={{textAlign:'center',color:'red',fontFamily:'monospace',fontSize:'0.8rem'}}>Failed to load. Tap Refresh.</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1px',background:'#ddd',border:'1px solid #ddd'}}>
          {shown.map((a,i) => (
            <div key={i} style={{background:'#faf7f2',padding:'1.4rem 1.6rem',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                <span style={{background:'#111',color:'#f5f0e8',fontFamily:'monospace',fontSize:'0.6rem',padding:'0.15rem 0.4rem',textTransform:'uppercase'}}>{a.source}</span>
                <span style={{color:'#c8392b',fontFamily:'monospace',fontSize:'0.6rem',textTransform:'uppercase'}}>{a.category}</span>
              </div>
              <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',fontWeight:700,lineHeight:1.35,margin:0}}>{a.headline}</h2>
              <p style={{fontSize:'0.85rem',lineHeight:1.65,color:'#3a3830',margin:0,fontWeight:300}}>{a.summary}</p>
              <p style={{fontFamily:'monospace',fontSize:'0.6rem',color:'#999',margin:0,borderTop:'1px solid #e0dbd0',paddingTop:'0.5rem'}}>{a.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
