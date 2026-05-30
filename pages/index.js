import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [status, setStatus] = useState('loading');
  const [time, setTime] = useState('');

  const categories = ['all', 'World', 'Politics', 'Technology', 'Science', 'Business', 'Health', 'Climate'];
  const sources = ['Reuters', 'AP News', 'BBC', 'The Guardian', 'NPR', 'Financial Times', 'Nature', 'WHO', 'NASA'];

  useEffect(() => {
    setTime(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    loadNews();
  }, []);

  async function loadNews() {
    setStatus('loading');
    setArticles([]);
    setFiltered([]);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setArticles(data);
      setFiltered(data);
      setStatus('live');
    } catch {
      setStatus('error');
    }
  }

  function filterCategory(cat) {
    setActiveCategory(cat);
    setFiltered(cat === 'all' ? articles : articles.filter(a => a.category === cat));
  }

  return (
    <>
      <Head>
        <title>The Digest</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        :root {
          --ink: #0f0e0c; --paper: #f5f0e8; --cream: #ede8dc;
          --accent: #c8392b; --muted: #7a7368; --border: #d4cfc4; --card: #faf7f2;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; font-weight: 300; }
        header { border-bottom: 3px double var(--border); padding: 0 2rem; background: var(--paper); position: sticky; top: 0; z-index: 100; }
        .header-top { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0 0.5rem; }
        .dateline { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
        .masthead { text-align: center; flex: 1; }
        .masthead h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem,5vw,3.5rem); font-weight: 900; line-height: 1; }
        .masthead p { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--muted); margin-top: 0.2rem; }
        .refresh-btn { background: var(--ink); color: var(--paper); border: none; padding: 0.5rem 1.1rem; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
        .refresh-btn:hover { background: var(--accent); }
        .refresh-btn:disabled { opacity: 0.5; }
        .cat-nav { display: flex; border-top: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
        .cat-nav::-webkit-scrollbar { display: none; }
        .cat-btn { background: none; border: none; border-right: 1px solid var(--border); padding: 0.55rem 1.2rem; font-family: 'DM Mono', monospace; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; color: var(--muted); white-space: nowrap; }
        .cat-btn:hover { background: var(--cream); color: var(--ink); }
        .cat-btn.active { background: var(--ink); color: var(--paper); }
        main { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
        .status-bar { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.8rem; font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--muted); }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #aaa; flex-shrink: 0; }
        .dot.live { background: #2ecc71; animation: pulse 2s infinite; }
        .dot.loading { background: var(--accent); animation: pulse 0.8s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); }
        .card { background: var(--card); padding: 1.4rem 1.6rem; display: flex; flex-direction: column; gap: 0.7rem; animation: fadeUp 0.4s ease both; }
        .card:hover { background: #fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .card-source { display: flex; align-items: center; gap: 0.5rem; }
        .badge { font-family: 'DM Mono', monospace; font-size: 0.63rem; text-transform: uppercase; letter-spacing: 0.1em; background: var(--ink); color: var(--paper); padding: 0.18rem 0.5rem; }
        .cat-tag { font-family: 'DM Mono', monospace; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); }
        .headline { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; line-height: 1.35; }
        .summary { font-size: 0.85rem; line-height: 1.65; color: #3a3830; font-weight: 300; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border); }
        .card-time { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: var(--muted); }
        .skel-card { background: var(--card); padding: 1.4rem 1.6rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .skel { background: linear-gradient(90deg, var(--cream) 25%, var(--border) 50%, var(--cream) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 2px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .skel-sm{height:12px;width:40%} .skel-lg{height:18px;width:90%} .skel-md{height:18px;width:70%} .skel-line{height:11px;width:100%} .skel-line2{height:11px;width:85%}
        footer { text-align: center; padding: 2.5rem 1rem; border-top: 3px double var(--border); font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 3rem; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 0.8rem; }
        .source-tag { background: var(--cream); border: 1px solid var(--border); padding: 0.2rem 0.6rem; font-size: 0.6rem; }
        @media(max-width:600px){ header{padding:0 1rem} .header-top{flex-direction:column;gap:0.5rem;text-align:center} .dateline{display:none} main{padding:1.2rem 0.8rem} .grid{grid-template-columns:1fr} }
      `}</style>

      <header>
        <div className="header-top">
          <div className="dateline">{time}</div>
          <div className="masthead">
            <h1>The Digest</h1>
            <p>Trusted Sources · Concise Summaries · No Noise</p>
          </div>
          <button className="refresh-btn" onClick={loadNews} disabled={status === 'loading'}>↻ Refresh</button>
        </div>
        <nav className="cat-nav">
          {categories.map(cat => (
            <button key={cat} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => filterCategory(cat)}>
              {cat}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <div className="status-bar">
          <div className={`dot ${status}`}></div>
          <span>
            {status === 'loading' && 'Fetching today\'s briefing...'}
            {status === 'live' && `Briefing updated · ${articles.length} stories · ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
            {status === 'error' && 'Failed to load — click Refresh to try again'}
          </span>
        </div>

        <div className="grid">
          {status === 'loading' && [1,2,3,4,5,6].map(i => (
            <div key={i} className="skel-card">
              <div className="skel skel-sm"></div>
              <div className="skel skel-lg"></div>
              <div className="skel skel-md"></div>
              <div className="skel skel-line"></div>
              <div className="skel skel-line2"></div>
            </div>
          ))}
          {filtered.map((a, i) => (
            <article key={i} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="card-source">
                <span className="badge">{a.source}</span>
                <span className="cat-tag">{a.category}</span>
              </div>
              <h2 className="headline">{a.headline}</h2>
              <p className="summary">{a.summary}</p>
              <div className="card-footer">
                <span className="card-time">{a.time}</span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer>
        <div>Powered by AI · Sources curated for accuracy &amp; reliability</div>
        <div className="source-tags">
          {sources.map(s => <span key={s} className="source-tag">{s}</span>)}
        </div>
      </footer>
    </>
  );
}
