import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-orchestrator'

// image_scene / image_character → gpt-image-1 (highest quality)
// image_item / image_location   → dall-e-3  (reliable, fast)
export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      task = 'image_scene',
      size = '1024x1024',
      quality = 'hd',
      style = 'vivid',
    } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateImage(task, prompt, { size, quality, style })

    return NextResponse.json({
      imageUrl: result.url,
      revisedPrompt: result.revisedPrompt,
      model: result.model,
    })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}
