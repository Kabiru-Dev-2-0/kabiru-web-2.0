import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI } from '@google/genai';

type SupabaseDocument = {
  id: number;
  content: string;
  metadata: any;
  similarity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = (body?.question as string) || '';
    const top_k = Number(body?.top_k ?? 4);
    const quiz_context = (body?.quiz_context as string) || '';
    const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];

    if (!question.trim()) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: question,
      config: { outputDimensionality: 768 },
    });
    const questionEmbedding = embedRes?.embeddings?.[0]?.values;

    if (!Array.isArray(questionEmbedding)) {
      return NextResponse.json({ error: 'Invalid embedding response' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: documents, error: searchError } = await supabase.rpc(
      process.env.SUPABASE_QUERY_NAME || 'match_documents',
      { query_embedding: questionEmbedding, match_count: top_k },
    );

    if (searchError) {
      return NextResponse.json(
        { error: `Database search failed: ${searchError.message}` },
        { status: 500 },
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer:
          'Saya tidak menemukan informasi yang relevan di dokumen untuk menjawab pertanyaan ini.',
        contexts: [],
      });
    }

    const contexts = (documents as SupabaseDocument[]).map((doc) => doc.content);

    const historyText = history
      .map((m: any) => `${m?.role === 'user' ? 'User' : 'AI'}: ${m?.text ?? ''}`)
      .join('\n');

    const prompt = `Peran: Kamu adalah "Kabi AI Agent", agen pendamping pembelajaran yang sabar dan membantu.

Pertanyaan Pengguna:
${question}

Konteks Soal Saat Ini:
${quiz_context}

Riwayat Percakapan (terbaru → lama):
${historyText}

Cuplikan Materi Terkait (RAG):
${contexts.join('\n\n')}

Panduan Respons:
- Gunakan Bahasa Indonesia kecuali pengguna bertanya dalam bahasa Inggris.
- Berperan sebagai pendamping: berikan petunjuk bertahap, ajukan pertanyaan pemandu, dan dorong cara berpikir yang benar.
- Dasarkan penjelasan pada Konteks Soal dan RAG; jika kurang, jelaskan kekurangan dan beri saran pendekatan.
- Jaga ringkas dan terstruktur: gunakan paragraf pendek atau poin, 3–6 langkah.
- Hindari langsung memberi jawaban akhir kecuali diminta atau pengguna buntu; prioritaskan metode penyelesaian.
- Untuk pilihan ganda, bantu eliminasi opsi salah berdasarkan bukti.
- Untuk kode, jelaskan baris kunci dan prediksi keluaran secara hati‑hati.
- Akhiri dengan satu langkah tindakan yang bisa dicoba pengguna.
- Respons nya jangan terlalu panjang! cukup maksimal 2 paragraf saja.

Format Keluaran (WAJIB):
- Keluarkan dalam HTML saja (tanpa Markdown, tanpa backticks).
- Berikan penekanan seperti strong dan emphasized text untuk kata-kata yang penting
- Pisahkan setiap paragraf dengan tag <p>, dan beri jarak setiap paragraf dengan <br>.
- Gunakan hanya tag: <section>, <h3>, <p>, <ol>, <ul>, <li>, <strong>, <em>, <pre>, <code>.
- Jangan gunakan <script>, <style>, <a>, <img>, atau tag selain yang diizinkan.
- Strukturkan jawaban dengan satu <section> yang berisi, paragraf (<p>), dan poin langkah (<ol>/<ul>). Untuk cuplikan kode gunakan <pre><code>.
- Jangan sebut kalau anda mengambil informasi dari materi atau RAG secara langsung.

Jawaban:`;
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      },
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

    return NextResponse.json({ answer, contexts, documentsFound: (documents as any[]).length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process question' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST method' }, { status: 405 });
}
