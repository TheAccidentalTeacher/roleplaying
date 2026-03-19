# Deployment Guide

Live URL: **https://roleplaying-nu.vercel.app**  
Git repo: **https://github.com/TheAccidentalTeacher/roleplaying**  
*Last updated: March 19, 2026*

---

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables (or in `.env.local` for local dev).

### Core — Required

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | DM narration (GPT-4o), TTS-1, DALL-E 3 image generation |
| `ANTHROPIC_API_KEY` | Claude as alternate DM model (extended output beta, 128k tokens) |

### TTS Providers

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | ElevenLabs ultra-realistic voices (Gollum, Sage Wizard) |
| `AZURE_SPEECH_KEY` | Azure Cognitive Services Speech key (rotate if exposed) |
| `AZURE_SPEECH_REGION` | Azure region, e.g. `westus` |

### AI — Oracle & Eval

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq Llama 3.3 70B — Oracle route + eval endpoint (rotate if exposed) |

### Images

| Variable | Description |
|----------|-------------|
| `STABILITY_API_KEY` | Stability AI SDXL — style-locked scene images |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` — CDN storage for images |

### Persistence

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side writes |

### Observability

| Variable | Description |
|----------|-------------|
| `LANGFUSE_SECRET_KEY` | Langfuse server key (token cost + prompt version tracking) |
| `LANGFUSE_PUBLIC_KEY` | Langfuse public key |
| `LANGFUSE_BASE_URL` | e.g. `https://us.cloud.langfuse.com` |

### Ambient Audio

| Variable | Description |
|----------|-------------|
| `FREESOUND_API_KEY` | Freesound API — CC0 ambient audio loops |

---

## Local Development

```bash
cp .env.example .env.local
# fill in OPENAI_API_KEY at minimum; add others for full feature set

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
| OpenAI TTS not working | `OPENAI_API_KEY` missing or rate-limited | Check key and usage dashboard |
| Azure TTS not working | `AZURE_SPEECH_KEY` or `AZURE_SPEECH_REGION` missing | Add both vars; region must match your Azure resource |
| ElevenLabs TTS not working | `ELEVENLABS_API_KEY` missing or credits exhausted | Add key; check credits at elevenlabs.io |
| Oracle answers very slow | Groq key missing — falling back to GPT-4o | Add `GROQ_API_KEY` |
| Scene images not persisting across sessions | `CLOUDINARY_URL` not set — storing base64 in state | Add Cloudinary URL; images will be stored as CDN URLs |

---

## Cost Estimates (personal use)

| Service | Typical monthly cost |
|---------|----------------------|
| Vercel (hobby) | Free |
| OpenAI GPT-4o | ~$5–20 depending on session length |
| OpenAI TTS-1 | ~$15/1M chars |
| DALL-E 3 images | ~$0.04/image |
| Azure Speech | **Free** up to 500K chars/month, then $16/1M |
| ElevenLabs | Free tier = 10K chars/month; Creator = $22/mo |
| Groq | ~$0 (Oracle + eval — Llama 3.3 is near-free) |
| Stability AI | ~$0.002–0.02/image |
| Cloudinary | Free tier: 25GB storage, 25GB bandwidth/month |
| Freesound | Free (CC0 audio) |
| Supabase | Free tier sufficient for personal use |
| Langfuse | Free tier sufficient |

---

## Security

- `.env.local` is in `.gitignore` — never commit it
- **Rotate any key that was exposed in git history** (Azure Speech + Groq keys were redacted from history on 2026-03-18 — rotate them if you haven't already)
- Monitor OpenAI usage dashboard for unexpected activity
- Before opening to external users: add Azure Content Safety middleware on `/api/dm`