import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

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
    const top_k_raw = Number(body?.top_k ?? 4);
    const top_k = Number.isFinite(top_k_raw) ? Math.max(1, Math.min(10, top_k_raw)) : 4;
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
    let questionEmbedding: number[] | null = null;
    const testFlags: any =
      process.env.NODE_ENV !== 'production' && (body?.test_flags || body?.test)
        ? body?.test_flags || body?.test
        : null;
    const forceNoEmbedding = !!(testFlags && testFlags.force_no_embedding);
    if (!forceNoEmbedding) {
      try {
        const embedRes = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: question,
          config: { outputDimensionality: 768 },
        });
        const vals = embedRes?.embeddings?.[0]?.values as unknown;
        if (Array.isArray(vals)) {
          questionEmbedding = vals as number[];
        }
      } catch {}
    }

    const supabase = await createClient();
    let documents: any[] = [];
    let attemptedSearch = false;

    if (testFlags && testFlags.force_no_documents) {
      return NextResponse.json({
        answer:
          'Saya tidak menemukan informasi yang relevan di dokumen untuk menjawab pertanyaan ini.',
        contexts: [],
      });
    }

    if (Array.isArray(questionEmbedding)) {
      attemptedSearch = true;
      const { data: docs, error: searchError } = await supabase.rpc(
        process.env.SUPABASE_QUERY_NAME || 'match_documents',
        { query_embedding: questionEmbedding, match_count: top_k },
      );

      if (searchError) {
        return NextResponse.json(
          { error: `Database search failed: ${searchError.message}` },
          { status: 500 },
        );
      }

      documents = Array.isArray(docs) ? docs : [];
      if (documents.length === 0) {
        return NextResponse.json({
          answer:
            'Saya tidak menemukan informasi yang relevan di dokumen untuk menjawab pertanyaan ini.',
          contexts: [],
        });
      }
    }

    const contexts = (documents as SupabaseDocument[]).map((doc) => doc.content);

    const historyText = history
      .map((m: any) => `${m?.role === 'user' ? 'User' : 'AI'}: ${m?.text ?? ''}`)
      .join('\n');

    let groundTruthText = '';
    try {
      const jenisMatch = quiz_context.match(/Jenis:\s*([^\n]+)/i);
      const pertanyaanMatch = quiz_context.match(/Pertanyaan:\s*([^\n]+)/i);
      const promptMatch = quiz_context.match(/Prompt:\s*([^\n]+)/i);
      const jenisLabel = jenisMatch?.[1]?.trim().toLowerCase() || '';
      const mapJenis: Record<string, string> = {
        'pilihan ganda (checkbox)': 'checkbox',
        'pilihan ganda': 'multiple_choice',
        isian: 'fill_in_the_blank',
        mengurutkan: 'sorting',
        kelompokkan: 'drag_and_drop',
        'menebak output': 'guessing',
      };
      const mappedType = mapJenis[jenisLabel] || '';
      let query = supabase
        .from('latihans')
        .select('id,type,pertanyaan,prompt,template_code,data')
        .limit(1);
      if (mappedType) {
        query = query.eq('type', mappedType);
      }
      const pertanyaanVal = pertanyaanMatch?.[1]?.trim() || '';
      const promptVal = promptMatch?.[1]?.trim() || '';
      if (pertanyaanVal) {
        query = query.or(
          `pertanyaan.ilike.%${pertanyaanVal.replace(/%/g, '')}%,data->>question.ilike.%${pertanyaanVal.replace(/%/g, '')}%`,
        );
      } else if (promptVal) {
        query = query.ilike('prompt', `%${promptVal.replace(/%/g, '')}%`);
      }
      const { data: latihans } = await query;
      const lat = Array.isArray(latihans) && latihans.length > 0 ? (latihans[0] as any) : null;
      if (lat && lat.data) {
        let payload: any = {};
        if (lat.type === 'multiple_choice' && typeof lat.data?.correct === 'string') {
          payload = { type: lat.type, correct: lat.data.correct };
        } else if (lat.type === 'fill_in_the_blank' && Array.isArray(lat.data?.correct_answers)) {
          payload = { type: lat.type, correct_answers: lat.data.correct_answers };
        } else if (lat.type === 'checkbox' && Array.isArray(lat.data?.correct_options)) {
          payload = { type: lat.type, correct_options: lat.data.correct_options };
        } else if (lat.type === 'sorting' && Array.isArray(lat.data?.correct_order)) {
          payload = { type: lat.type, correct_order: lat.data.correct_order };
        } else if (lat.type === 'drag_and_drop' && lat.data?.correct_assignment) {
          payload = { type: lat.type, correct_assignment: lat.data.correct_assignment };
        } else if (typeof lat.correct_solution === 'string' && lat.correct_solution) {
          payload = { type: lat.type, correct_solution: lat.correct_solution };
        }
        if (Object.keys(payload).length > 0) {
          groundTruthText = `\n\nKunci Jawaban Internal (rahasia, gunakan hanya untuk memeriksa kebenaran dan jangan diungkapkan kecuali pengguna memintanya):\n${JSON.stringify(payload)}\n`;
        }
      }
    } catch {}

    const prompt = `Peran: Kamu adalah "Kabi AI Agent", agen pendamping pembelajaran yang sabar dan membantu.

Pertanyaan Pengguna:
${question}

Konteks Soal Saat Ini:
${quiz_context}

Riwayat Percakapan (terbaru → lama):
${historyText}

Cuplikan Materi Terkait (RAG):
${contexts.join('\n\n')}
${groundTruthText}

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
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return NextResponse.json({ error: 'DEEPSEEK_API_KEY not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: deepseekApiKey,
    });

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
