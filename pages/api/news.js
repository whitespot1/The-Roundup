export default async function handler(req, res) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const prompt = `You are a senior editor at a world-class news agency. Today is ${today}.

Generate a realistic news briefing of 9 important, plausible, and diverse current news stories across these categories: World, Politics, Technology, Science, Business, Health, Climate.

Return ONLY a valid JSON array with NO preamble, NO markdown, NO backticks. Each item must have:
- "headline": compelling, factual headline (max 12 words)
- "summary": 2-3 sentence summary, factual and neutral in tone (max 60 words)
- "source": one of: Reuters, AP News, BBC, The Guardian, NPR, Financial Times, Nature, WHO, NASA, Science
- "category": one of: World, Politics, Technology, Science, Business, Health, Climate
- "time": realistic time like "2 hours ago" or "4 hours ago"
- "url": empty string ""`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Anthropic error', details: data });
    }

    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'Empty response', data });
    }

    const text = data.content[0].text;
    const clean = text.replace(/```json|```/gi, '').trim();
    const articles = JSON.parse(clean);
    res.status(200).json(articles);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
