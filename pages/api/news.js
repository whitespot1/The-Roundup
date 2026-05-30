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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 12000,
        messages: [{
          role: 'user',
          content: `Today is ${today}. Generate 50 diverse news stories as a JSON array. Each item must have: headline, summary (2-3 sentences max 60 words), source (one of: Reuters/AP News/BBC/The Guardian/NPR/Financial Times/Nature/WHO/NASA/X), category (one of: Politics/Technology/Science/Business/Health/Sustainability/Supply Chain/Automotive/Social Media/Sport), country (primary country the story is about, full name e.g. "United States"), time (like "2 hours ago"). Spread stories across many different countries worldwide. For Social Media category use source "X", cover trending topics currently on X (Twitter), and ensure these stories span multiple regions: Americas, Europe, Middle East, Asia, Africa, Oceania. Return ONLY the raw JSON array, no markdown, no backticks, no explanation.`
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
