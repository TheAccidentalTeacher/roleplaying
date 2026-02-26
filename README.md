# AI RPG Dungeon Master

A single-player role-playing game where AI acts as your Dungeon Master.

## Features

- AI-powered Dungeon Master using advanced language models
- Dynamic story generation
- Character creation and progression
- Immersive game world with persistent state
- Multiple AI integrations for enhanced gameplay

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This app is configured for easy deployment on Vercel:

```bash
vercel
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI, Anthropic, and more
- **Deployment**: Vercel
