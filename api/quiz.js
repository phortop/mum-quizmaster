// Vercel serverless function — generates quiz questions via Claude API
// Environment variable required: ANTHROPIC_API_KEY

const TOPIC_PROMPTS = {
  garden: "English gardening — flowers like roses, sweet peas, foxgloves, wisteria; garden tasks like deadheading and hardening off; famous gardens like Chelsea, Wisley, Sissinghurst; gardeners like Gertrude Jekyll and Capability Brown; kitchen garden vegetables; the seasons in the garden",
  history: "English history — kings and queens from the Normans to the 20th century; famous battles like Hastings and Waterloo; events like the Great Fire of London and the Great Plague; famous figures like Florence Nightingale, Winston Churchill, Edith Cavell; the Magna Carta; suffragettes",
  houses: "Historic houses and castles of northern England — Alnwick Castle, Chatsworth, Bamburgh, Castle Howard, Durham Cathedral, Hadrian's Wall, Blenheim Palace, Hardwick Hall, Cragside, Lindisfarne Castle, Raby Castle, Wallington Hall, Howick Hall; associated families like the Percys and Nevilles",
  radio4: "BBC Radio 4 — The Archers and village of Ambridge; Desert Island Discs; Just a Minute; Woman's Hour; In Our Time; Tweet of the Day; The Today Programme; Sailing By and the Shipping Forecast; Book of the Week; Front Row; presenters like Melvyn Bragg and Lauren Laverne",
  nature: "British nature and wildlife — garden birds like robins, blue tits, wrens; woodland flowers like bluebells and wood anemones; butterflies like the painted lady and comma; mammals like hedgehogs, beavers, red squirrels; seasonal nature; traditional country knowledge and folklore about nature",
  northeast: "The North East of England — Newcastle, Durham, Northumberland; the Venerable Bede and Lindisfarne Gospels; Grace Darling; Hadrian's Wall; the Angel of the North; Geordie dialect; Durham Cathedral; the Gateshead Millennium Bridge; the Durham Miners Gala; Northumberland coast and castles"
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const topic = req.query.topic;
  if (!topic || !TOPIC_PROMPTS[topic]) {
    return res.status(400).json({ error: 'Invalid topic' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `You are generating a quiz for an elderly British lady in her mid-80s who lives near Newcastle.
She enjoys gentle, interesting questions with a warm tone. Topics she loves: ${TOPIC_PROMPTS[topic]}.

Generate exactly 10 multiple-choice quiz questions. Each question should:
- Be clear and not too difficult
- Have 4 options (one correct, three plausible wrong answers)
- Include warm, encouraging feedback for both right and wrong answers
- Include an interesting fact or extra detail that she will enjoy hearing

Return ONLY valid JSON — no other text, no markdown, no code blocks — just the raw JSON array:
[
  {
    "q": "Question text here?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "ans": 0,
    "praise": "Warm, personal congratulations (e.g. 'Quite right — well remembered!')",
    "comfort": "Gentle consolation (e.g. 'Not quite, never mind!')",
    "fact": "An interesting, warm fact about the correct answer (2-3 sentences)"
  }
]

The "ans" field is the zero-based index of the correct option in the "opts" array.
Make every question different — cover a good range of subtopics within the theme.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Question generation failed' });
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid question format returned');
    }

    return res.status(200).json(questions);

  } catch (err) {
    console.error('Quiz generation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
