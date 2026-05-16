# 🎙️ Mum's Quizmaster

A voice-enabled, iPad-optimised quiz app built for an elderly lady in her mid-eighties living near Newcastle in the North East of England.

**Live app:** [mum-quizmaster.vercel.app](https://mum-quizmaster.vercel.app)

---

## What it does

The Quizmaster reads every question aloud using the browser's built-in speech synthesis — no typing required. Just listen and tap your answer. Warm, encouraging feedback is spoken after every question whether the answer is right or wrong.

- 🎙️ **Fully voiced** — questions, options, and feedback all read aloud
- 📱 **iPad-optimised** — the whole app fits on one screen with no scrolling
- ✅ **Fact-checked** — all 60 questions verified against Wikipedia and the BBC
- 🔀 **Shuffled every time** — questions are randomised so each session feels fresh
- 🌐 **No internet needed to play** — all questions are bundled in the file

---

## Topics

| Topic | Focus |
|---|---|
| 🌷 Gardening | Roses, Chelsea Flower Show, Capability Brown, foxgloves, wisteria, Sissinghurst |
| ⚔️ English History | Victoria, Hastings, Magna Carta, Florence Nightingale, VE Day, the Armada |
| 🏰 Historic Houses | Alnwick, Castle Howard, Chatsworth, Bamburgh, Blenheim, Durham Cathedral |
| 📻 BBC Radio 4 | The Archers, Desert Island Discs, Just a Minute, In Our Time, Woman's Hour |
| 🦢 Nature & Wildlife | Robins, bluebells, red squirrels, hedgehogs, ospreys, the Comma butterfly |
| ⛪ The North East | Grace Darling, the Angel of the North, Hadrian's Wall, the Jarrow March, Bede |

---

## How to use

1. Open [mum-quizmaster.vercel.app](https://mum-quizmaster.vercel.app) in Chrome, Edge, or Safari
2. Make sure the sound is turned on
3. Tap a topic
4. Press **Start the Quiz**
5. Listen to the question, then tap your answer
6. Press 🔊 at any time to hear the question again

---

## Technical notes

- **Single HTML file** — the entire app is `index.html`, with no dependencies or build step
- **Speech synthesis** — uses the Web Speech API (`SpeechSynthesisUtterance`). Prefers a British English female voice where available (Kate, Serena, Amy, Emma)
- **No API calls** — all questions are embedded directly in the file; no network requests during play
- **iPad viewport** — layout uses `100vh`, `clamp()`, and `overflow: hidden` on `html/body` to lock to the screen without scrolling
- **Deployed on Vercel** — auto-deploys on every push to `main`

---

## Project structure

```
mum-quizmaster/
├── index.html        # The complete app — HTML, CSS, JS and all questions in one file
├── vercel.json       # Vercel deployment config
├── package.json      # Minimal package config for Vercel
└── README.md         # This file
```

---

## Question quality

All 60 questions (10 per topic) have been fact-checked against Wikipedia and BBC sources. Specific details verified include:

- Precise dates (VE Day: 8 May 1945; Magna Carta: 15 June 1215; Battle of Hastings: 14 October 1066)
- Accurate statistics (Britain holds ~50% of world's native bluebells; hedgehogs fallen from 30 million to ~1 million)
- Correct attributions (Desert Island Discs first castaway: Vic Oliver; ospreys returned to Loch Garten 1954; Lindisfarne Gospels created by Eadfrith c.715 AD)
- Rich contextual facts designed to be interesting and satisfying to hear

---

## Built with

- Vanilla HTML, CSS, and JavaScript — no frameworks
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for text-to-speech
- [Google Fonts](https://fonts.google.com/) — Playfair Display & Lato
- [Vercel](https://vercel.com/) for hosting
- Built with the help of [Claude](https://claude.ai) by Anthropic
