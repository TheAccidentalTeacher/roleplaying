# Deployment Guide

Live URL: **https://roleplaying-nu.vercel.app**
Git repo: **https://github.com/TheAccidentalTeacher/roleplaying**

---

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables (or in `.env` for local dev).

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | DM narration, world genesis, image generation (DALL-E) |
| `ANTHROPIC_API_KEY` | Optional | Claude as alternate DM model |
| `ELEVENLABS_API_KEY` | Optional | TTS narration voice |
| `ELEVENLABS_VOICE_ID` | Optional | Specific ElevenLabs voice ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL for cloud saves |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |

---

## Local Development

```bash
cp .env.example .env
# fill in at least OPENAI_API_KEY

npm install
npm run dev
# → http://localhost:3000
```

---

## Deploying to Vercel

### Automatic (recommended)

Every push to `main` triggers a Vercel build automatically.

```bash
git add .
git commit -m "your changes"
git push
```

### Manual deploy via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Public Assets — Dice

The 3D dice library (`@3d-dice/dice-box`) loads workers and WASM physics from `public/dice/`. These files **must** be present at build time:

```
public/dice/
├── world.offscreen.js       # physics web worker (offscreen canvas path)
├── world.onscreen.js
├── world.none.js
├── Dice.js                  # die mesh worker
├── ammo/
│   ├── ammo.wasm.js
│   └── ammo.wasm.wasm       # Bullet physics WASM binary
└── themes/
    └── default/             # die face textures
```

`assetPath` in `DiceBoxCanvas.tsx` is set to `'/dice/'`. If you rename or move these, update that config.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Dice not visible | `.dice-box-canvas` CSS not loaded | Check `globals.css` has the `position:fixed` rule |
| Dice in top-left corner | Canvas `clientWidth/clientHeight` = 0 at init | The CSS rule must be in the stylesheet **before** `DiceBox.init()` runs |
| Dice values don't match display | Pre-computed random used instead of physics result | `handleDiceResult` must read from `onRollComplete` callback |
| "Missing API Key" error | Env var not set in Vercel | Add to Vercel Dashboard and redeploy |
| Build fails on `@3d-dice/dice-box` | Worker files missing from public/ | Copy from `node_modules/@3d-dice/dice-box/dist/` |
| TTS not working | Missing ElevenLabs keys | Add `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` |

---

## Cost Estimates (personal use)

| Service | Typical monthly cost |
|---------|----------------------|
| Vercel (hobby) | Free |
| OpenAI GPT-4o | ~$5–20 depending on session length |
| DALL-E 3 images | ~$0.04/image |
| ElevenLabs | Free tier = 10k chars/month |
| Supabase | Free tier sufficient |

---

## Security

- `.env` is in `.gitignore` — never commit it
- Rotate any key that appears in a commit or log
- Monitor OpenAI usage dashboard for unexpected activity

