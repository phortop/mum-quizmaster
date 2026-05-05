import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOPIC_PROMPTS = {
  garden: "English gardening, plants, flowers, garden history, famous English gardens such as Sissinghurst and Hidcote, gardening techniques, garden design, seasonal planting",
  history: "English and British history, kings and queens, Tudor period, Victorian era, both World Wars, famous historical figures and events in Britain, British Empire",
  houses: "Historic houses and castles of England especially the North of England, National Trust properties, stately homes, English architecture, famous gardens attached to great houses",
  radio4: "BBC Radio 4 programmes including The Archers, Desert Island Discs, Just a Minute, Woman's Hour, Today programme, In Our Time, Gardeners' Question Time, famous Radio 4 presenters",
  nature: "British wildlife, birds of Britain, wild flowers, British trees, countryside and seasons in England, hedgerows, woodland creatures, coastal wildlife",
  northeast: "The North East of England including Newcastle, Northumberland, County Durham, the Yorkshire Dales, Hadrian's Wall, local history, landmarks and famous people from the region"
};
export default async function handler(req, res) {
  const topic = req.query.topic || 'garden';
  const topicDescription = TOPIC_PROMPTS[topic] || TOPIC_PROMPTS.garden;

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json');

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 5000,
      messages: [{
        role: 'user',
        content: `Generate exactly 25 multiple-choice quiz questions about: ${topicDescription}.

This quiz is for a much-loved elderly lady in her mid-eighties near Newcastle, England. Use warm encouraging language and British English spelling.

Return ONLY a valid JSON array of exactly 25 objects with these fields:
- "q": the question
- "opts": array of exactly 4 answer options
- "ans": index (0-3) of correct answer
- "praise": short warm phrase for correct answer
- "comfort": one gentle sentence for wrong answer
- "fact": 2-3 sentences of interesting follow-up

Return ONLY the JSON array, no other text.`
      }]
    });

    const text = message.content[0].text.trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in API response');

    const questions = JSON.parse(match[0]);
    if (!Array.isArray(questions) || questions.length < 10) throw new Error('Invalid question array');

    res.status(200).json(questions);
  } catch (err) {
    console.error('Quiz API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
