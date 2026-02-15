import { NextResponse } from 'next/server';

const STORY_AGENT_API_URL = process.env.STORY_AGENT_API_URL || 'http://127.0.0.1:8000';

interface StoryRequest {
  prompt: string;
  target_age?: string;
  language?: string;
  story_length?: string;
  active_writers?: string[];
}

export async function POST(req: Request) {
  try {
    const body: StoryRequest = await req.json();

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('[Story API] Connecting to backend:', STORY_AGENT_API_URL);
    console.log('[Story API] Received Enriched Prompt:\n', body.prompt);

    // Forward request to Skripsi backend
    let response: Response;
    try {
      response = await fetch(`${STORY_AGENT_API_URL}/api/workflow/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: body.prompt,
          target_age: body.target_age || '15-18',
          language: body.language || 'Indonesian',
          story_length: body.story_length || 'medium',
          active_writers: body.active_writers || null,
        }),
      });
    } catch (fetchError: any) {
      console.error('[Story API] Backend connection failed:', fetchError.message);
      return NextResponse.json(
        {
          error: 'Cannot connect to Story Agent backend',
          details: `Make sure Skripsi backend is running at ${STORY_AGENT_API_URL}. Error: ${fetchError.message}`
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Story API] Backend returned error:', response.status, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    // Stream SSE response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e) {
          console.error('Stream error:', e);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('Story generate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST method' }, { status: 405 });
}
