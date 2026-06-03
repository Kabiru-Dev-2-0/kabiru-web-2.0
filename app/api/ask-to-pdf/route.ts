import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

type SupabaseDocument = {
  id: number;
  content: string;
  metadata: any;
  similarity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = (body?.question as string) || "";
    const top_k_raw = Number(body?.top_k ?? 4);
    const top_k = Number.isFinite(top_k_raw)
      ? Math.max(1, Math.min(10, top_k_raw))
      : 4;
    const quiz_context = (body?.quiz_context as string) || "";
    const story_context_raw =
      typeof body?.story_context === "string" ? body.story_context.trim() : "";
    const story_context = story_context_raw.slice(0, 16000);
    const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];

    if (!question.trim()) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY not configured" },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let questionEmbedding: number[] | null = null;
    const testFlags: any =
      process.env.NODE_ENV !== "production" && (body?.test_flags || body?.test)
        ? body?.test_flags || body?.test
        : null;
    const forceNoEmbedding = !!(testFlags && testFlags.force_no_embedding);
    if (!forceNoEmbedding) {
      try {
        const embedRes = await ai.models.embedContent({
          model: "gemini-embedding-001",
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
          "Saya tidak menemukan informasi yang relevan di dokumen untuk menjawab pertanyaan ini.",
        contexts: [],
      });
    }

    if (Array.isArray(questionEmbedding)) {
      attemptedSearch = true;
      const { data: docs, error: searchError } = await supabase.rpc(
        process.env.SUPABASE_QUERY_NAME || "match_documents",
        { query_embedding: questionEmbedding, match_count: top_k },
      );

      if (searchError) {
        return NextResponse.json(
          { error: `Database search failed: ${searchError.message}` },
          { status: 500 },
        );
      }

      documents = Array.isArray(docs) ? docs : [];
      if (documents.length === 0 && !story_context) {
        return NextResponse.json({
          answer:
            "Saya tidak menemukan informasi yang relevan di dokumen untuk menjawab pertanyaan ini.",
          contexts: [],
        });
      }
    }

    let contexts = (documents as SupabaseDocument[]).map((doc) => doc.content);
    if (story_context) {
      contexts = [
        `[Cerita / narasi dari AI Chat (bukan dokumen PDF)]\n${story_context}`,
        ...contexts,
      ];
    }

    const historyText = history
      .map(
        (m: any) => `${m?.role === "user" ? "User" : "AI"}: ${m?.text ?? ""}`,
      )
      .join("\n");

    let groundTruthText = "";
    try {
      const jenisMatch = quiz_context.match(/Jenis:\s*([^\n]+)/i);
      const pertanyaanMatch = quiz_context.match(/Pertanyaan:\s*([^\n]+)/i);
      const promptMatch = quiz_context.match(/Prompt:\s*([^\n]+)/i);
      const jenisLabel = jenisMatch?.[1]?.trim().toLowerCase() || "";
      const mapJenis: Record<string, string> = {
        "pilihan ganda (checkbox)": "checkbox",
        "pilihan ganda": "multiple_choice",
        isian: "fill_in_the_blank",
        mengurutkan: "sorting",
        kelompokkan: "drag_and_drop",
        "menebak output": "guessing",
      };
      const mappedType = mapJenis[jenisLabel] || "";
      let query = supabase
        .from("latihans")
        .select("id,type,pertanyaan,prompt,template_code,data")
        .limit(1);
      if (mappedType) {
        query = query.eq("type", mappedType);
      }
      const pertanyaanVal = pertanyaanMatch?.[1]?.trim() || "";
      const promptVal = promptMatch?.[1]?.trim() || "";
      if (pertanyaanVal) {
        query = query.or(
          `pertanyaan.ilike.%${pertanyaanVal.replace(/%/g, "")}%,data->>question.ilike.%${pertanyaanVal.replace(/%/g, "")}%`,
        );
      } else if (promptVal) {
        query = query.ilike("prompt", `%${promptVal.replace(/%/g, "")}%`);
      }
      const { data: latihans } = await query;
      const lat =
        Array.isArray(latihans) && latihans.length > 0
          ? (latihans[0] as any)
          : null;
      if (lat && lat.data) {
        let payload: any = {};
        if (
          lat.type === "multiple_choice" &&
          typeof lat.data?.correct === "string"
        ) {
          payload = { type: lat.type, correct: lat.data.correct };
        } else if (
          lat.type === "fill_in_the_blank" &&
          Array.isArray(lat.data?.correct_answers)
        ) {
          payload = {
            type: lat.type,
            correct_answers: lat.data.correct_answers,
          };
        } else if (
          lat.type === "checkbox" &&
          Array.isArray(lat.data?.correct_options)
        ) {
          payload = {
            type: lat.type,
            correct_options: lat.data.correct_options,
          };
        } else if (
          lat.type === "sorting" &&
          Array.isArray(lat.data?.correct_order)
        ) {
          payload = { type: lat.type, correct_order: lat.data.correct_order };
        } else if (
          lat.type === "drag_and_drop" &&
          lat.data?.correct_assignment
        ) {
          payload = {
            type: lat.type,
            correct_assignment: lat.data.correct_assignment,
          };
        } else if (
          typeof lat.correct_solution === "string" &&
          lat.correct_solution
        ) {
          payload = { type: lat.type, correct_solution: lat.correct_solution };
        }
        if (Object.keys(payload).length > 0) {
          groundTruthText = `\n\nKunci Jawaban Internal (rahasia, gunakan hanya untuk memeriksa kebenaran dan jangan diungkapkan kecuali pengguna memintanya):\n${JSON.stringify(payload)}\n`;
        }
      }
    } catch {}

    const prompt = `Peran: Kamu adalah "Kabi AI Agent", agen pendamping pembelajaran yang sabar, fokus MENGGEMBANGKAN PEMAHAMAN SISWA, JANGAN PERNAH MEMBERIKAN JAWABAN AKHIR SECARA LANGSUNG!

Pertanyaan Pengguna:
${question}

Konteks Soal Saat Ini:
${quiz_context}

Riwayat Percakapan (terbaru → lama):
${historyText}

Cuplikan Materi Terkait (RAG dan/atau cerita dari chat):
${contexts.length ? contexts.join("\n\n") : "(tidak ada cuplikan — jawab singkat bahwa konteks kurang, atau gunakan cerita dari chat jika tersedia di atas.)"}
${groundTruthText}

ATURAN UTAMA (WAJIB DITAATI SELALU DENGAN KETAT):
1. PERTAMA SEKALI: Cek apakah pertanyaan pengguna SAMA SEKALI tidak terkait dengan Konteks Soal, cuplikan materi, atau riwayat percakapan.
   - JIKA YA: LANGSUNG TOLAK dengan kalimat ini TANPA BERBICARA TENTANG HAL LAIN: "Maaf, saya hanya bisa membantu dengan pertanyaan yang terkait dengan materi atau soal yang sedang dipelajari saat ini."
   - JIKA TIDAK: Lanjutkan ke aturan berikutnya
2. TIDAK BOLEH MEMBERIKAN JAWABAN AKHIR SECARA LANGSUNG! Tujuanmu adalah MENGAJAR CARA BERPIKIR, bukan memberikan jawaban.
3. BERPERANLAH SEBAGAI GURU YANG SABAR:
   - Untuk **soal pilihan ganda/checkbox**: 
     - Jelaskan terlebih dahulu konsep inti dari materi yang ditanyakan (berdasarkan Konteks Soal atau cuplikan RAG)
     - Lalu bahas SATU PER SATU setiap pilihan dengan cara menjelaskan MAKSUD dari pilihan tersebut, tanpa mengatakan "sesuai", "tidak sesuai", "benar", atau "salah" secara langsung
     - Biarkan siswa sendiri yang menarik kesimpulan hubungan antara konsep dan pilihan
   - Untuk jenis soal lain: Berikan petunjuk bertahap, ajukan pertanyaan pemandu untuk memancing pemikiran siswa, jelaskan konsep dasar yang relevan
4. JANGAN PERNAH MENGGUNAKAN FRASE SEPERTI: "ini sesuai dengan deskripsi", "ini tidak tepat", "pilihan ini cocok", atau apapun yang secara langsung menunjukkan jawaban. Fokuslah menjelaskan KONSEP dan MAKSUD dari setiap pilihan.
5. Gunakan Bahasa Indonesia kecuali pengguna bertanya dalam bahasa Inggris.
6. Dasarkan semua penjelasan HANYA pada Konteks Soal, cuplikan RAG, dan bagian "[Cerita / narasi dari AI Chat]" jika ada.
7. Jika hanya ada cerita dari chat (tanpa cuplikan RAG), jawab dari cerita tersebut dengan ringkas.
8. Jaga ringkas dan terstruktur: gunakan paragraf pendek atau poin.
9. Untuk kode: Jelaskan konsep di baliknya dan cara memprediksi keluaran, JANGAN BERIKAN SOLUSI KODE LENGKAP.
10. Akhiri dengan satu langkah tindakan yang bisa dicoba pengguna untuk menemukan jawaban sendiri.
11. Jangan sebut kalau anda mengambil informasi dari materi atau RAG secara langsung.
12. Kunci Jawaban Internal (jika ada) HANYA untuk memeriksa kebenaran pemahamanmu, JANGAN PERNAH DIUNGKAPKAN KEPADA PENGGUNA!

Format Keluaran (WAJIB):
- Keluarkan dalam HTML saja (tanpa Markdown, tanpa backticks).
- Berikan penekanan seperti strong dan emphasized text untuk kata-kata yang penting
- Pisahkan setiap paragraf dengan tag <p>, dan beri jarak setiap paragraf dengan <br>.
- Gunakan hanya tag: <section>, <h3>, <p>, <ol>, <ul>, <li>, <strong>, <em>, <pre>, <code>.
- Jangan gunakan <script>, <style>, <a>, <img>, atau tag selain yang diizinkan.
- Strukturkan jawaban dengan satu <section> yang berisi, paragraf (<p>), dan poin langkah (<ol>/<ul>). Untuk cuplikan kode gunakan <pre><code>.

Jawaban:`;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY not configured" },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: deepseekApiKey,
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
    });

    const raw = completion.choices[0].message.content || "";
    const answer = (raw || "")
      .replace(/^```(?:html|HTML)?\s*/g, "")
      .replace(/\s*```$/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json({
      answer,
      contexts,
      documentsFound: (documents as any[]).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process question" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST method" }, { status: 405 });
}
