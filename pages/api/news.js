const RSS_FEEDS = [
  // Global news
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  { url: 'https://www.theguardian.com/technology/rss', source: 'The Guardian' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'https://rss.dw.com/xml/rss-en-all', source: 'Deutsche Welle' },
  { url: 'https://www.france24.com/en/rss', source: 'France 24' },
  { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC' },
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
  // Middle East / Saudi focus
  { url: 'https://www.arabnews.com/rss.xml', source: 'Arab News' },
  { url: 'https://www.spa.gov.sa/rss/rss.php?lang=en', source: 'Saudi Press Agency' },
  // Governmental / IGO
  { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', source: 'UN News' },
  { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA' },
  { url: 'https://www.who.int/rss-feeds/news-english.xml', source: 'WHO' },
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

  const isArabic = req.query.lang === 'ar'

  try {
    const results = await Promise.allSettled(RSS_FEEDS.map(f => fetchFeed(f)))
    const buckets = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.slice(0, 5))
      .filter(b => b.length > 0)

    // Interleave: take one article from each source in rotation
    const interleaved = []
    const maxLen = Math.max(...buckets.map(b => b.length))
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (bucket[i]) interleaved.push(bucket[i])
      }
    }

    const seen = new Set()
    const raw = interleaved.filter(a => {
      if (seen.has(a.title)) return false
      seen.add(a.title)
      return true
    }).slice(0, 100)

    if (raw.length === 0) return res.status(500).json({ error: 'No articles fetched' })

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10000,
        messages: [{
          role: 'user',
          content: `You have ${raw.length} news items below. Select the best 50 and for each: ${isArabic
            ? 'translate the headline to Arabic and write a clean 2-3 sentence summary IN ARABIC (max 60 words),'
            : 'write a clean 2-3 sentence summary (max 60 words),'
          } assign a category, and identify the primary country.

CRITICAL DISTRIBUTION RULE: The 10 categories below must each appear AT LEAST 5 times in your 50 selected items (≥10% each). If a category is under-represented among natural fits, re-assign the most borderline articles to fill it. Every category must reach 5.

Return ONLY a JSON array of exactly 50 items: [{"idx":0,${isArabic ? '"headline":"العنوان بالعربية",' : ''}"summary":"...","category":"...","country":"Full English Country Name"},...]

Categories (always return these exact English values):
- Politics: government, elections, diplomacy, international relations
- Technology: software, AI, electronics, cybersecurity (NOT supply chain)
- Science: research, discoveries, space, medicine breakthroughs
- Business: markets, economy, companies, finance, trade
- Health: public health, diseases, medical policy, WHO updates
- Sustainability: green energy, climate, conservation, environmental policy
- Supply Chain: logistics, trade routes, procurement, reshoring, supply security
- Automotive: cars, EVs, auto industry, transportation
- Social Media: ONLY news specifically about X (Twitter) — trending topics, platform updates, viral X content. Set source to "X" for these.
- Sport: sports events, athletes, tournaments, leagues

News items:
${raw.map((a, i) => `[${i}] TITLE: ${a.title}\nCONTEXT: ${a.summary}`).join('\n\n')}`
        }]
      })
    })

    const d = await r.json()
    const text = d.content[0].text.replace(/```json|```/gi, '').trim()
    const cats = JSON.parse(text)

    const articles = cats
      .filter(c => raw[c.idx])
      .map(({ idx, headline, summary, category, country }) => ({
        headline: headline || raw[idx].title,
        summary,
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
