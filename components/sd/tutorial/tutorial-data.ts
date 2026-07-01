// ======================================
// TYPES
// ======================================

export type TutorialStep = {
  target: string;

  title: string;

  description: string;

  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right";
};

// ======================================
// TUTORIAL DATA
// ======================================

export const tutorialData = {
  // ======================================
  // DRAG & DROP
  // ======================================

  drag_and_drop: (
  buckets: string[] = []
): TutorialStep[] => [
  {
    target: "drag-item-area",
    title: "Kartu Soal",
    description:
      "Klik dan seret kartu ke dalam kotak kategori yang sesuai.",
    placement: "top",
  },

  ...buckets.map(
    (bucket, index) => ({
      target: `bucket-${index}`,

      title: bucket,

      description: `Masukkan kartu yang termasuk kategori ${bucket} ke dalam kotak ini.`,

      placement: "bottom" as const,
    })
  ),

  {
    target: "scrollbar",
    title: "Geser Halaman ke Atas-Bawah",
    description:
      "Jika isi soal belum terlihat seluruhnya, geser halaman ke atas-bawah menggunakan scroll mouse atau klik dan seret roda putih ke atas/bawah.",
    placement: "left",
  },

  {
    target: "btn-check",
    title: "Periksa Jawaban",
    description:
      "Klik tombol PERIKSA JAWABAN untuk memeriksa jawaban.",
    placement: "top",
  },

  {
      target: "btn-help",

      title: "Petunjuk",

      description:
        "Tutorial ini bisa dibuka kembali kapan saja melalui tombol Petunjuk.",

      placement: "top",
  },
],

  // ======================================
  // PATTERN PAINTER
  // ======================================

  pattern_painter: (): TutorialStep[] => [
    {
      target: "question-area",

      title: "Amati Polanya",

      description:
        "Perhatikan gambar atau bentuk yang ditampilkan. Cobalah mencari hubungan atau pola yang muncul.",

      placement: "bottom",
    },

    {
      target: "answer-options",

      title: "Pilih Jawaban",

      description:
        "Klik jawaban yang menurutmu paling sesuai untuk melanjutkan pola tersebut.",

      placement: "top",
    },

    {
      target: "scrollbar",
      title: "Geser Halaman ke Atas-Bawah",
      description:
        "Jika isi soal belum terlihat seluruhnya, geser halaman ke atas-bawah menggunakan scroll mouse atau klik dan seret roda putih ke atas/bawah.",
      placement: "left",
    },

    {
      target: "btn-check",

      title: "Periksa Jawaban",

      description:
        "Setelah memilih jawaban, klik tombol ini untuk memeriksa hasilnya.",

      placement: "top",
    },

    {
      target: "btn-help",

      title: "Petunjuk",

      description:
        "Tutorial ini bisa dibuka kembali kapan saja melalui tombol Petunjuk.",

      placement: "top",
    },
  ],

  // ======================================
  // MAZE RUNNER
  // ======================================

  maze_runner: (): TutorialStep[] => [
    {
      target: "maze-board",

      title: "Papan Labirin",

      description:
        "Tugasmu adalah membantu robot mencapai tujuan dengan membuat urutan langkah yang benar.",

      placement: "right",
    },

    {
      target: "control-buttons",

      title: "Blok Kode",

      description:
        "Klik dan geser tombol arah untuk menyusun jalur yang akan dilalui karakter ke Area Instruksi di atas.",

      placement: "top",
    },

    {
      target: "instruction-list",

      title: "Area Instruksi",

      description:
        "Semua langkah yang kamu pilih akan muncul di sini secara berurutan. Jika kamu ingin mengubah arah nya, timpa dan lakukan hal sebelumnya.",

      placement: "left",
    },

    {
      target: "scrollbar",
      title: "Geser Halaman ke Atas-Bawah",
      description:
        "Jika isi soal belum terlihat seluruhnya, geser halaman ke atas-bawah menggunakan scroll mouse atau klik dan seret roda putih ke atas/bawah.",
      placement: "left",
    },

    {
      target: "btn-check",

      title: "Jalankan Program",

      description:
        "Klik tombol PERIKSA JAWABAN untuk menjalankan instruksi yang sudah kamu susun.",

      placement: "top",
    },

    {
      target: "btn-help",

      title: "Petunjuk",

      description:
        "Klik tombol Petunjuk jika ingin melihat tutorial lagi.",

      placement: "top",
    },
  ],

  // ======================================
  // SORTING / SEQUENCE
  // ======================================

  sorting: (): TutorialStep[] => [
    {
      target: "sequence-items",

      title: "Kartu Langkah",

      description:
        "Susun kartu-kartu di bawah ini hingga membentuk urutan yang benar.",

      placement: "top",
    },

    {
      target: "sequence-area",

      title: "Tombol Geser",

      description:
        "Geser ke atas atau bawah untuk memindahkan kartu langkah.",

      placement: "top",
    },

    {
      target: "scrollbar",
      title: "Geser Halaman ke Atas-Bawah",
      description:
        "Jika isi soal belum terlihat seluruhnya, geser halaman ke atas-bawah menggunakan scroll mouse atau klik dan seret roda putih ke atas/bawah.",
      placement: "left",
    },

    {
      target: "btn-check",

      title: "Periksa Jawaban",

      description:
        "Jika urutan sudah selesai disusun, klik tombol PERIKSA JAWABAN untuk memeriksa jawabanmu.",

      placement: "top",
    },

    {
      target: "btn-help",

      title: "Petunjuk",

      description:
        "Tutorial dapat dibuka kembali kapan saja melalui tombol Petunjuk.",

      placement: "top",
    },
  ],

  // ======================================
  // CODE DEBUGGER
  // ======================================

  code_debugger: (): TutorialStep[] => [
    {
      target: "step-list",

      title: "Langkah Program",

      description:
        "Klik langkah yang menurutmu tidak sesuai.",

      placement: "right",
    },

    {
      target: "remove-button",

      title: "Hapus Langkah",

      description:
        "Kemudian Klik tombol Hapus untuk menghilangkan langkah yang salah.",

      placement: "bottom",
    },

    {
      target: "scrollbar",
      title: "Geser Halaman ke Atas-Bawah",
      description:
        "Jika isi soal belum terlihat seluruhnya, geser halaman ke atas-bawah menggunakan scroll mouse atau klik dan seret roda putih ke atas/bawah.",
      placement: "left",
    },

    {
      target: "btn-check",

      title: "Periksa Program",

      description:
        "Klik tombol PERIKSA JAWABAN untuk mengecek apakah program sudah diperbaiki dengan benar.",

      placement: "top",
    },

    {
      target: "btn-help",

      title: "Petunjuk",

      description:
        "Klik tombol Petunjuk jika ingin melihat tutorial kembali.",

      placement: "top",
    },
  ],
};