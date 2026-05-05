// Vercel serverless function — generates quiz questions via Claude API
// Environment variable required: ANTHROPIC_API_KEY

const TOPIC_PROMPTS = {
  garden:    "English gardening — flowers like roses, sweet peas, foxgloves, wisteria, dahlias, peonies, lavender, hollyhocks; garden tasks like deadheading, pruning, hardening off, composting, mulching; famous gardens like Chelsea, Wisley, Sissinghurst, Hidcote, Great Dixter; gardeners like Gertrude Jekyll, Capability Brown, Vita Sackville-West, Beth Chatto; kitchen garden vegetables and fruit; the seasons in the garden; pests and how to deal with them; garden birds and wildlife; the RHS; garden tools and their uses",
  history:   "English history — kings and queens from the Normans to Elizabeth II; famous battles including Hastings, Agincourt, Bosworth, Waterloo, Trafalgar; events like the Great Fire of London, the Black Death, the Gunpowder Plot, the English Civil War, the Blitz; famous figures like Florence Nightingale, Winston Churchill, Elizabeth I, Henry VIII, Nelson, Wellington, Boudicca; the Magna Carta; the suffragettes and Emmeline Pankhurst; Tudor and Victorian life; the British Empire; famous inventions and inventors",
  houses:    "Historic houses and castles of England — Alnwick Castle, Chatsworth House, Bamburgh Castle, Castle Howard, Hadrian's Wall, Blenheim Palace, Hardwick Hall, Cragside, Lindisfarne Castle, Raby Castle, Wallington Hall, Howick Hall, Bolsover Castle, Brancepeth Castle, Hylton Castle, Lumley Castle; Durham Cathedral and its history; associated families like the Percys, Nevilles, Howards, and Cavendishes; National Trust properties; English Heritage; house architecture and style through the ages; famous rooms and collections",
  radio4:    "BBC Radio 4 — The Archers (characters, storylines, the village of Ambridge, the Grundy family, the Archer family); Desert Island Discs and its history; Just a Minute and its rules; Woman's Hour; In Our Time with Melvyn Bragg; Tweet of the Day; The Today Programme; Sailing By and the Shipping Forecast (sea areas); Book of the Week; Front Row; Saturday Live; Gardeners' Question Time; The Reunion; Radio 4 comedy; presenters past and present including John Humphrys, Nick Robinson, Lauren Laverne; the history of BBC Radio",
  nature:    "British nature and wildlife — garden birds like robins, blue tits, wrens, blackbirds, song thrushes, house sparrows, long-tailed tits, goldfinches, great spotted woodpeckers; woodland flowers like bluebells, wood anemones, primroses, wild garlic; butterflies like the painted lady, red admiral, comma, peacock, orange tip; mammals like hedgehogs, beavers, red squirrels, otters, badgers, foxes, dormice; seasonal nature and the countryside calendar; traditional country knowledge; weather lore; trees like oak, ash, beech, hawthorn, elder; bees and pollination; ponds and freshwater life; coastal and seashore wildlife",
  northeast: "The North East of England — Newcastle upon Tyne (its history, the Tyne Bridge, Grainger Town, Grey Street); Durham (the cathedral, the castle, the university, the Miners Gala); Northumberland (Hadrian's Wall, the Northumberland coast, Bamburgh, Alnwick, Holy Island/Lindisfarne); the Venerable Bede and the Lindisfarne Gospels; Grace Darling and the Forfarshire wreck; the Angel of the North by Antony Gormley; Geordie dialect and famous Geordies; the Gateshead Millennium Bridge; the history of coal mining; famous people from the North East including Bobby Charlton, Sting, Ridley Scott, Catherine Cookson; local food and traditions; the River Tyne and the River Wear"
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const topic = req.query.topic;
  if (!topic || !TOPIC_PROMPTS[topic]) {
    return res.status(400).json({ error: 'Invalid topic: ' + topic });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Generate a random seed phrase to ensure variety across sessions
  const seeds = [
    'Focus on facts from the 19th century where possible.',
    'Focus on facts from the 20th century where possible.',
    'Include questions about specific named places, people or dates.',
    'Include some questions that are a little easier than usual.',
    'Include some questions about lesser-known but fascinating details.',
    'Focus on stories and human interest — who did what and why.',
    'Include questions involving numbers, dates or measurements.',
    'Mix easy, medium and slightly harder questions.',
  ];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];

  const prompt = `You are generating a quiz for an elderly British lady in her mid-80s who lives near Newcastle. She enjoys gentle, interesting questions with a warm and encouraging tone.

Topic: ${TOPIC_PROMPTS[topic]}

Generate exactly 15 multiple-choice quiz questions. Each question must:
- Be clear, friendly and not too difficult
- Have exactly 4 answer options (one correct, three plausible wrong answers)
- Cover a DIFFERENT aspect of the topic — do not repeat similar themes
- Include warm, personal praise for a correct answer
- Include gentle consolation for a wrong answer
- Include an interesting, warm fact the listener will enjoy

Additional guidance for variety: ${seed}

Return ONLY a valid JSON array — no markdown, no code fences, no explanation, just the raw JSON:
[
  {
    "q": "The question text?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "ans": 0,
    "praise": "Quite right — well remembered!",
    "comfort": "Never mind — the answer is Option A.",
    "fact": "Two or three warm, interesting sentences about the correct answer."
  }
]

The "ans" field is the zero-based index of the correct answer in "opts". Make all 15 questions distinct.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000); // 28s timeout

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'Question generation failed', detail: errText });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || '';

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```json\s*/k, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid question format: ' + typeof questions);
    }

    // Validate each question has required fields
    const valid = questions.filter(q =>
      q.q && Array.isArray(q.opts) && q.opts.length === 4 &&
      typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3 &&
      q.praise && q.comfort && q.fact
    );

    if (valid.length < 5) {
      throw new Error('Too few valid questions returned: ' + valid.length);
    }

    return res.status(200).json(valid);

  } catch (err) {
    console.error('Quiz generation error for topic', topic, ':', err.name, err.message);
    return res.status(500).json({ error: err.message });
  }
}
