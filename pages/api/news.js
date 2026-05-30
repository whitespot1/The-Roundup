export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'No API key' })

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Today is ${today}. Generate 9 diverse news stories as a JSON array. Each item must have: headline, summary (2-3 sentences max 60 words), source (one of: Reuters/AP News/BBC/The Guardian/NPR/Financial Times/Nature/WHO/NASA), category (one of: World/Politics/Technology/Science/Business/Health/Climate), time (like "2 hours ago"). Return ONLY the raw JSON array, no markdown, no backticks, no explanation.`
        }]
      })
    })

    const d = await r.json()
    if (!d.content || !d.content[0]) return res.status(500).json({ error: 'Bad response', d })
    const text = d.content[0].text.replace(/```json|```/gi, '').trim()
    const articles = JSON.parse(text)
    res.status(200).json(articles)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
