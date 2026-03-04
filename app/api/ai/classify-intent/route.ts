import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const prompt = `
    Classify the following user message into one of two intents:
    1. 'STORY': The user is asking to create, write, or tell a story/tale/dongeng/cerpen.
    2. 'QA': The user is asking a question about a lesson, quiz, material, or general knowledge.

    User Message: "${message}"

    Return ONLY a JSON object: { "intent": "STORY" | "QA" }
    `;

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (deepseekKey) {
      try {
        const openai = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: deepseekKey });
        const completion = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
        });
        const text = completion.choices?.[0]?.message?.content || '';
        try {
          const result = JSON.parse(text);
          return NextResponse.json(result);
        } catch {}
      } catch {}
    }

    const geminiKey = process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        try {
          const result = JSON.parse(text);
          return NextResponse.json(result);
        } catch {}
      }
    }

    return NextResponse.json({ intent: 'QA' });
  } catch (error: any) {
    return NextResponse.json({ intent: 'QA' });
  }
}
