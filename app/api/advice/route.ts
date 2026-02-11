import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wrongPrompts = Array.isArray(body?.wrong_prompts) ? body.wrong_prompts : [];
    const modul = typeof body?.modul === 'string' ? body.modul : '';
    const bagian = typeof body?.bagian === 'string' ? body.bagian : '';

    if (wrongPrompts.length === 0) {
      return NextResponse.json({ answer: '' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DEEPSEEK_API_KEY not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });

    const topics = wrongPrompts.join('\n- ');
    const prompt = `Peran: AIZone Study Companion yang memberi dorongan singkat.

Konteks:
Modul: ${modul}
Bagian: ${bagian}
Topik yang perlu diperkuat:
- ${topics}

Instruksi keluaran:
- Tulis 2–3 kalimat dalam Bahasa Indonesia sebagai teks biasa (tanpa HTML/Markdown/backticks).
- Gunakan pola kalimat: "Cobalah memahami ... serta ..." lalu lanjutkan dengan "Pelajari secara bertahap, nikmati prosesnya, dan jangan ragu untuk mengeksplorasi! yang penting kamu terus berkembang.".
- Gabungkan topik ke level konsep umum, bukan detail teknis spesifik.
- Hindari daftar, simbol-simbol khusus, atau kutipan.

Jawaban:`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'deepseek-chat',
    });

    const raw = completion.choices[0].message.content || '';
    const answer = (raw || '')
      .replace(/^```(?:html|HTML)?\s*/g, '')
      .replace(/\s*```$/g, '')
      .replace(/```/g, '')
      .trim();

    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate advice' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST method' }, { status: 405 });
}
