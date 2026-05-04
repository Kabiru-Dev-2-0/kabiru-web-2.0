import { NextResponse } from 'next/server';

/** Skripsi / story-agent backend: safe production default when env is not configurable. */
const STORY_AGENT_DEFAULT_VERCEL_URL = 'https://agentic-ai-story-based-learning.vercel.app';
const STORY_AGENT_DEFAULT_LOCAL_URL = 'http://127.0.0.1:8000';
const STORY_AGENT_DEFAULT_DUMMY_KEY = 'dummy';

function storyAgentBaseUrl(): string {
  const fromEnv = process.env.STORY_AGENT_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  // IMPORTANT: Production must not default to localhost.
  // If the hosting platform does not allow setting env vars, keep this hardcoded fallback.
  if (process.env.NODE_ENV === 'production') {
    return STORY_AGENT_DEFAULT_VERCEL_URL.replace(/\/$/, '');
  }
  return STORY_AGENT_DEFAULT_LOCAL_URL.replace(/\/$/, '');
}

function storyAgentApiKey(): string {
  const fromEnv = process.env.STORY_AGENT_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') return STORY_AGENT_DEFAULT_DUMMY_KEY;
  return '';
}

interface ChatTurn {
  role: string;
  text: string;
}

interface PriorStoryRef {
  title: string;
  excerpt: string;
}

interface StoryRequest {
  prompt: string;
  thread_id?: string;
  target_age?: string;
  language?: string;
  story_length?: string;
  active_writers?: string[];
  hitl_resume?: string;
  /** Recent UI messages for supervisor context (in-memory; no DB). */
  history?: ChatTurn[];
  /** Earlier completed stories in this tab (title + excerpt) for supervisor recall. */
  prior_stories?: PriorStoryRef[];
}

export async function POST(req: Request) {
  try {
    const body: StoryRequest = await req.json();

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const STORY_AGENT_API_URL = storyAgentBaseUrl();
    const STORY_AGENT_API_KEY = storyAgentApiKey();
    if (process.env.NODE_ENV === 'production' && !process.env.STORY_AGENT_API_URL?.trim() && STORY_AGENT_API_KEY === STORY_AGENT_DEFAULT_DUMMY_KEY) {
      console.warn(
        '[Story API] STORY_AGENT_API_URL unset: using built-in Vercel default. STORY_AGENT_API_KEY unset: using dummy key.'
      );
    }

    console.log('[Story API] Connecting to backend:', STORY_AGENT_API_URL);
    console.log('[Story API] Received Enriched Prompt:\n', body.prompt);

    // Generate thread_id jika tidak dikirim client (untuk sesi baru)
    const thread_id = body.thread_id || crypto.randomUUID();

    // Forward request to Skripsi backend
    let response: Response;
    try {
      response = await fetch(`${STORY_AGENT_API_URL}/api/interactive/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(STORY_AGENT_API_KEY ? { 'X-API-Key': STORY_AGENT_API_KEY } : {}),
        },
        body: JSON.stringify({
          user_message: body.prompt,
          thread_id,
          target_age: body.target_age || '15-18',
          language: body.language || 'Indonesian',
          story_length: body.story_length || 'medium',
          active_writers: body.active_writers || null,
          hitl_resume: body.hitl_resume || null,
          history: Array.isArray(body.history) ? body.history : null,
          prior_stories: Array.isArray(body.prior_stories) ? body.prior_stories : null,
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
