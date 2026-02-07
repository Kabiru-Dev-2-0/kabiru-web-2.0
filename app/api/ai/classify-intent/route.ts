import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    // Use Gemini Flash for speed
    const prompt = `
    Classify the following user message into one of two intents:
    1. 'STORY': The user is asking to create, write, or tell a story/tale/dongeng/cerpen.
    2. 'QA': The user is asking a question about a lesson, quiz, material, or general knowledge.

    User Message: "${message}"

    Return ONLY a JSON object: { "intent": "STORY" | "QA" }
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      // Fallback if JSON parsing fails
      result = { intent: 'QA' };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Intent classification error:', error);
    // Fail gracefully to QA (safest default)
    return NextResponse.json({ intent: 'QA' });
  }
}
