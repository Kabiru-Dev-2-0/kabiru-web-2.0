import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ongoingCourses, completedModules, username } = body;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DEEPSEEK_API_KEY not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });

    // Format progress data for the prompt
    // Hanya ambil 1 modul terbaru yang sedang dikerjakan sesuai permintaan user
    const latestOngoing = ongoingCourses && ongoingCourses.length > 0 ? ongoingCourses[0] : null;

    const completedList =
      completedModules && completedModules.length > 0
        ? completedModules.map((m: any) => m.judul).join(', ')
        : 'Belum ada modul yang selesai';

    const ongoingText = latestOngoing
      ? `${latestOngoing.title} (${latestOngoing.progress}%)`
      : 'Belum ada modul yang sedang dikerjakan';

    const prompt = `Peran: AIZone Study Companion yang ramah dan suportif untuk website belajar koding 'Kabiru'.
    
Data Siswa (${username || 'Teman'}):
- Modul Selesai: ${completedList}
- Fokus Saat Ini: ${ongoingText}

Tugas:
Buatlah 2 variasi kalimat penyemangat singkat (maksimal 30 kata per kalimat) untuk siswa ini.
Konten harus mencakup:
1. Apresiasi spesifik terhadap progress mereka.
2. Dorongan untuk lanjut belajar pada modul fokus saat ini.
3. Nada bicara santai, ceria, dan memotivasi. Gunakan emoji yang relevan.
4. Paparkan juga progress terkini mereka dan berikan saran konkret untuk meningkatkan mereka.

Format Output Wajib: JSON Array of Strings.
PENTING: Pastikan format JSON valid, jangan gunakan markdown block, dan escape karakter quote (") di dalam string jika ada.
Contoh:
["Kalimat saran 1... 🚀", "Kalimat saran 2... 🎉"]`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'deepseek-chat',
      max_tokens: 2000,
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content || '';

    let adviceArray = [];
    try {
      // Bersihkan string JSON dari potensi markdown atau whitespace
      let cleanJson = (raw || '').trim();

      // Hapus markdown wrapper jika ada (contoh: ```json ... ```)
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }

      adviceArray = JSON.parse(cleanJson);

      // Validasi array
      if (!Array.isArray(adviceArray)) {
        // Jika hasil parse bukan array, bungkus jadi array
        adviceArray = [String(adviceArray)];
      }
    } catch (e) {
      console.error('JSON Parse Error for raw output:', raw);
      console.error('Parse Error details:', e);

      // Fallback manual jika parse gagal total
      adviceArray = [
        'Hebat, kamu sudah memahami dasar logika dengan baik! 🎉 Yuk lanjut lagi belajarnya! 🚀',
        'Keren banget progress belajarnya! Tetap semangat ya! 💪',
        'Sedikit lagi makin jago! Jangan lupa istirahat kalau lelah ya. ☕',
      ];
    }

    return NextResponse.json({ advice: adviceArray });
  } catch (error: any) {
    console.error('Dashboard Advice Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate advice' },
      { status: 500 },
    );
  }
}
