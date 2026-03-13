import { NextRequest, NextResponse } from 'next/server';

const SCENE_QUERIES: Record<string, string> = {
  tavern:     'tavern inn ambient fireplace',
  dungeon:    'dungeon underground ambience',
  wilderness: 'forest birds nature outdoor ambient',
  combat:     'battle fight sword clash action',
  town:       'town city market crowd ambient',
  cave:       'cave echo dripping underground',
  ocean:      'ocean waves sea ambient',
  storm:      'storm rain thunder ambient',
  default:    'fantasy ambient background',
};

interface FreesoundResult {
  id: number;
  name: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
  };
}

interface FreesoundResponse {
  results: FreesoundResult[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.FREESOUND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FREESOUND_API_KEY not configured' }, { status: 500 });
  }

  let sceneType = 'default';
  try {
    const body = await req.json();
    if (body.sceneType && typeof body.sceneType === 'string') {
      sceneType = body.sceneType.toLowerCase();
    }
  } catch {
    // use default
  }

  const query = SCENE_QUERIES[sceneType] ?? SCENE_QUERIES.default;

  const params = new URLSearchParams({
    query,
    // Freesound API token auth
    token: apiKey,
    filter: 'license:"Creative Commons 0"',
    fields: 'id,name,previews',
    page_size: '10',
    sort: 'rating_desc',
  });

  try {
    const res = await fetch(`https://freesound.org/apiv2/search/text/?${params}`);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Freesound error: ${res.status}`, detail: text }, { status: 502 });
    }

    const data = (await res.json()) as FreesoundResponse;
    const results = data.results ?? [];

    if (results.length === 0) {
      return NextResponse.json({ error: 'No results found for scene type' }, { status: 404 });
    }

    // Pick a random result from the top 5 for variety
    const pool = results.slice(0, Math.min(5, results.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const previewUrl = pick.previews['preview-hq-mp3'] ?? pick.previews['preview-lq-mp3'];

    return NextResponse.json({ previewUrl, title: pick.name, id: pick.id, sceneType });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
