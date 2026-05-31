const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://www.arabnews.com/rss.xml', source: 'Arab News' },
]

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = xml.match(re)
  if (!m) return ''
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim()
}

function timeAgo(dateStr) {
  if (!dateStr) return 'recently'
  const d = new Date(dateStr)
  if (isNaN(d)) return 'recently'
  const diff = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff} minute${diff === 1 ? '' : 's'} ago`
  if (diff < 1440) return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) === 1 ? '' : 's'} ago`
  return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) === 1 ? '' : 's'} ago`
}

async function fetchFeed({ url, source }) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 5000)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TheRoundup/1.0)' }
    })
    clearTimeout(timer)
    const xml = await res.text()
    const items = []
    const re = /<item>([\s\S]*?)<\/item>/g
    let m
    while ((m = re.exec(xml)) !== null) {
      const item = m[1]
      const title = extractTag(item, 'title')
      const desc = extractTag(item, 'description') || extractTag(item, 'content:encoded')
      const pub = extractTag(item, 'pubDate') || extractTag(item, 'dc:date')
      if (title && title.length > 15 && desc && desc.length > 20) {
        items.push({ title, summary: desc.slice(0, 300), source, time: timeAgo(pub) })
      }
    }
    return items
  } catch { clearTimeout(timer); return [] }
}

export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'No API key' })

  try {
    const results = await Promise.allSettled(RSS_FEEDS.map(f => fetchFeed(f)))
    const all = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value)

    const seen = new Set()
    const raw = all.filter(a => {
      if (seen.has(a.title)) return false
      seen.add(a.title)
      return true
    }).slice(0, 60)

    if (raw.length === 0) return res.status(500).json({ error: 'No articles fetched' })

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `For each article below assign a category and the primary country it is about. Return ONLY a JSON array: [{"idx":0,"category":"...","country":"Full Country Name"},...]

Categories: Politics, Technology, Science, Business, Health, Sustainability, Supply Chain, Automotive, Social Media, Sport
- Sustainability: green energy, climate, conservation, environmental policy
- Supply Chain: logistics, trade routes, procurement, reshoring, supply security
- Technology: software, AI, electronics, cybersecurity (NOT supply chain stories)
- Social Media: news about social media platforms or viral social trends

Articles:
${raw.map((a, i) => `[${i}] ${a.title}`).join('\n')}`
        }]
      })
    })

    const d = await r.json()
    const text = d.content[0].text.replace(/```json|```/gi, '').trim()
    const cats = JSON.parse(text)

    const articles = cats
      .filter(c => raw[c.idx])
      .map(({ idx, category, country }) => ({
        headline: raw[idx].title,
        summary: raw[idx].summary,
        source: raw[idx].source,
        time: raw[idx].time,
        category,
        country
      }))

    res.status(200).json(articles)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
