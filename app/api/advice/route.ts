import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wrongPrompts = Array.isArray(body?.wrong_prompts) ? body.wrong_prompts : [];
    const modul = typeof body?.modul === 'string' ? body.modul : '';
    const bagian = typeof body?.bagian === 'string' ? body.bagian : '';

    if (wrongPrompts.length === 0) {
      return NextResponse.json({ answer: '' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

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
- Hindari daftar, simbol khusus, atau kutipan.

Jawaban:`;

    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      }
    );
    if (!genRes.ok) {
      return NextResponse.json({ error: 'Generation request failed' }, { status: 500 });
    }
    const genJson = await genRes.json();
    const parts = genJson?.candidates?.[0]?.content?.parts || [];
    const raw = Array.isArray(parts)
      ? parts
          .map((p: any) => p?.text)
          .filter(Boolean)
          .join('\n')
      : '';
    const answer = (raw || '')
      .replace(/^```(?:html|HTML)?\s*/g, '')
      .replace(/\s*```$/g, '')
      .replace(/```/g, '')
      .trim();

    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate advice' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST method' }, { status: 405 });
}
