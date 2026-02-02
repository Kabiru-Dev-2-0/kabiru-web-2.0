"use client";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  ProgressBar,
  Select,
  RadioGroup,
  Radio,
  makeStyles,
} from "@fluentui/react-components";
import Editor from "@monaco-editor/react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDroppable,
  DragOverlay,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckmarkCircleRegular,
  ChevronRightRegular,
  DismissCircleRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";

const richTextStyles = `
  .prose {
    max-width: 100%;
  }
  .prose p {
    margin: 0.5em 0;
    line-height: 1.5;
  }
  .prose strong { font-weight: 600; }
  .prose em { font-style: italic; }
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
    margin: 0.5em 0 0.25em 0;
    font-weight: 600;
  }
  .prose pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5em 0;
  }
  .ql-editor { max-width: 100%; }
`;

const useStyles = makeStyles({
  select: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #E8E8E8",
    fontSize: "14px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  feedback: {
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "16px",
  },
  feedbackCorrect: {
    color: "#22c55e",
  },
  feedbackIncorrect: {
    color: "#ef4444",
  },
  droppable: {
    padding: "16px",
    border: "1px solid #E8E8E8",
    borderRadius: "4px",
    marginBottom: "16px",
    backgroundColor: "#f9fafb",
    height: "fit-content",
  },
  draggable: {
    padding: "8px",
    backgroundColor: "white",
    border: "1px solid #E8E8E8",
    borderRadius: "4px",
    marginBottom: "8px",
    cursor: "grab",
  },
});

// Komponen Container untuk Drag and Drop - ARSITEKTUR BARU
const DroppableContainer = ({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const styles = useStyles();

  return (
    <div
      ref={setNodeRef}
      className={styles.droppable}
      style={{
        backgroundColor: isOver ? "#e0f2fe" : "#f9fafb",
        minHeight: "80px",
      }}
    >
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-gray-400 text-sm italic py-2">
            Kosong - drag items ke sini
          </div>
        ) : (
          items.map((item) => (
            <DraggableItem key={item} id={item} content={item} />
          ))
        )}
      </div>
    </div>
  );
};

// Komponen Item yang bisa di-drag - SESUAI FIGMA
const DraggableItem = ({
  id,
  content,
  isCorrect,
}: {
  id: string;
  content: string;
  isCorrect?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const combinedStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    boxShadow: isCorrect
      ? "0px 4px 0px 0px rgba(23, 201, 100, 1)"
      : "0px 4px 0px 0px rgba(228, 228, 231, 1)",
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`border-2 rounded-[14px] px-6 py-3.5 flex items-center justify-center gap-5 transition-colors ${
        isCorrect
          ? "bg-[#E8FAF0] border-[#17C964] hover:border-[#17C964]"
          : "bg-white border-[#E4E4E7] hover:border-[#3674B5]"
      }`}
    >
      <p
        className={`text-xl font-medium text-center leading-[1.6em] ${
          isCorrect ? "text-[#12A150]" : "text-[#3F3F46]"
        }`}
      >
        {content}
      </p>
    </div>
  );
};

// Komponen Footer dengan Robot dan Tooltip - SESUAI FIGMA
export const FooterWithRobot = ({
  onSubmit,
  feedback,
  isCorrect,
  showNextButton = false,
  onNext,
  onAgentClick,
}: {
  onSubmit: () => void;
  feedback: string;
  isCorrect: boolean;
  showNextButton?: boolean;
  onNext?: () => void;
  onAgentClick?: () => void;
}) => {
  const [isFinishing, setIsFinishing] = useState(false);
  const robotImgSrc = feedback
    ? isCorrect
      ? "/imageAssets/correct.png"
      : "/imageAssets/wrong.png"
    : "/imageAssets/ask-ai.png";
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white px-12 py-3.5 flex items-center justify-center gap-5 ${
        feedback
          ? isCorrect
            ? "border-t border-[#17C964]"
            : "border-t border-[#F31260]"
          : "border-t border-[#D4D4D8]"
      }`}
    >
      {/* Robot Container */}
      <button
        type="button"
        aria-label="Buka AI Chat"
        onClick={onAgentClick}
        className="relative w-[99px] h-[104px] cursor-pointer bg-transparent border-none outline-none"
        style={{ padding: 0 }}
      >
        <img
          src={robotImgSrc}
          alt="Robot"
          className="w-[110px] h-[110px] absolute -left-4 -top-1"
        />
      </button>

      {/* Tooltip - Muncul saat ada feedback */}
      {feedback && (
        <div className="absolute left-[150px] bottom-[8px] flex flex-row items-end">
          {/* Arrow - mengarah ke robot (ke kiri) */}
          <div
            className={`w-[19.66px] h-[19.66px] rotate-45 mr-[-10px] mb-[70px] z-10 ${
              isCorrect ? "bg-[#205994]" : "bg-[#205994]"
            }`}
            style={{ borderRadius: "2.035px" }}
          />

          {/* Tooltip Content */}
          <div
            className={`rounded-[14.32px] px-3.5 py-3.5 flex flex-col gap-1 min-w-[280px] ${
              isCorrect ? "bg-[#205994]" : "bg-[#205994]"
            }`}
          >
            <p
              className={`text-2xl font-semibold leading-[1.25em] ${
                isCorrect ? "text-[#74DFA2]" : "text-[#FCA5A5]"
              }`}
            >
              {isCorrect ? "Jawaban benar!" : "Jawaban salah!"}
            </p>
            <p className="text-base font-medium text-white leading-[1.25em]">
              {isCorrect
                ? "Kamu sudah memahami konsepnya, ayo lanjut ke soal berikutnya"
                : "Coba periksa lagi jawabanmu dan pastikan semuanya sudah benar"}
            </p>
            {!isCorrect && (
              <button
                type="button"
                aria-label="Buka AI Chat"
                onClick={onAgentClick}
                className="bg-[#ffffff] text-[#3674B5] font-semibold px-4 py-2 rounded-xl hover:bg-[#b1b1b1] cursor-pointer w-fit"
                style={{ boxShadow: "0px 3px 0px 0px #bababa" }}
              >
                Tanya Asisten
              </button>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Button */}
      {showNextButton && isCorrect ? (
        <button
          onClick={onNext}
          className="bg-[#3674B5] text-white font-semibold text-lg px-5 py-2.5 rounded-xl hover:bg-[#2d5d94] transition-colors flex items-center gap-2"
          style={{
            boxShadow: "0px 3px 0px 0px rgba(32, 89, 148, 1)",
          }}
        >
          Selanjutnya
          <ChevronRightRegular className="w-8 h-8 text-[#FFFFFF]" />
        </button>
      ) : (
        <button
          onClick={() => {
            if (!showNextButton && isCorrect && isFinishing) return;
            if (!showNextButton && isCorrect) setIsFinishing(true);
            onSubmit();
          }}
          disabled={!showNextButton && isCorrect && isFinishing}
          className="bg-[#3674B5] text-white font-semibold text-lg px-5 py-2.5 rounded-xl hover:bg-[#2d5d94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: "0px 3px 0px 0px rgba(32, 89, 148, 1)",
          }}
        >
          {showNextButton ? "Periksa" : "Selesaikan"}
        </button>
      )}
    </div>
  );
};

export default function ExerciseRenderer({
  exercises,
  currentIndex = 0,
  onNext,
  onComplete,
  onAgentClick,
  onFooterPropsChange,
  onWrong,
}: {
  exercises: any[];
  currentIndex?: number;
  onNext?: () => void;
  onComplete?: (isCorrect: boolean) => void;
  onAgentClick?: () => void;
  onFooterPropsChange?: (props: {
    onSubmit: () => void;
    feedback: string;
    isCorrect: boolean;
  }) => void;
  onWrong?: (prompt: string) => void;
}) {
  const styles = useStyles();
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const exercise = exercises[currentIndex];

  // Helper function to extract question from various field formats
  const getQuestionHtml = (exercise: any): string => {
    // Check multiple possible locations and formats
    const sources = [
      exercise.pertanyaan,
      exercise.data?.pertanyaan,
      exercise.question,
      exercise.data?.question,
    ];

    for (const src of sources) {
      if (!src) continue;
      if (typeof src === 'string' && src.trim()) {
        return src;
      }
      if (Array.isArray(src) && src.length > 0) {
        return src.map(String).join('<br/>');
      }
      if (typeof src === 'object' && src !== null) {
        if (src.question && typeof src.question === 'string') return src.question;
        if (src.pertanyaan && typeof src.pertanyaan === 'string') return src.pertanyaan;
      }
    }
    return '';
  };

  // Inject rich text styles for rendered HTML prompts/questions
  useEffect(() => {
    try {
      const styleElement = document.createElement("style");
      styleElement.textContent = richTextStyles;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    } catch (e) {
      // ignore on server
    }
  }, []);

  // ⬆️ Taruh ini di bagian atas komponen ExerciseRenderer (sebelum switch)
  const [editorValue, setEditorValue] = useState("");
  const [totalBlanks, setTotalBlanks] = useState(0);

  // Set initial editor value & blank count tiap kali exercise berubah
  useEffect(() => {
    if (exercise.type === "fill_in_the_blank") {
      setEditorValue(exercise.template_code.replace(/\\n/g, "\n"));
      setTotalBlanks((exercise.template_code.match(/____/g) || []).length);
    }
    // Reset state saat exercise berubah
    setAnswers({});
    setFeedback("");
    setIsCorrect(false);
  }, [exercise]);

  // Handler untuk klik jawaban - BARU untuk inline blanks
  const handleOptionClick = (opt: string, blankIndex?: number) => {
    if (exercise.type !== "fill_in_the_blank") return;

    setAnswers((prev) => {
      // Jika blankIndex diberikan (klik pada blank), isi blank tersebut
      if (blankIndex !== undefined) {
        return { ...prev, [blankIndex]: opt };
      }

      // Jika tidak, cari blank pertama yang kosong
      const blanks = exercise.data.blanks || [];
      for (let i = 0; i < blanks.length; i++) {
        if (!prev[i]) {
          return { ...prev, [i]: opt };
        }
      }

      return prev;
    });
  };

  // Handler untuk clear blank
  const handleClearBlank = (blankIndex: number) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[blankIndex];
      return updated;
    });
  };

  const handleReset = () => {
    setAnswers({});
    if (exercise.type === "fill_in_the_blank") {
      setEditorValue(exercise.template_code.replace(/\\n/g, "\n"));
    }
  };

  const handleSubmit = (userAnswer: any) => {
    let correct = false;
    if (exercise.type === "fill_in_the_blank") {
      // Pastikan semua blank terisi dan jumlahnya sesuai
      const expectedLength = exercise.data.correct_answers.length;
      const userAnswerArray = Array.isArray(userAnswer)
        ? userAnswer
        : Object.values(userAnswer);

      // Filter undefined/null values
      const filledAnswers = userAnswerArray.filter(
        (ans: any) => ans !== undefined && ans !== null && ans !== "",
      );

      // Cek: jumlah jawaban harus sama dengan jumlah blank yang diharapkan
      if (filledAnswers.length !== expectedLength) {
        correct = false;
      } else {
        // Cek setiap jawaban sesuai dengan correct_answers
        correct = filledAnswers.every(
          (ans: string, idx: number) =>
            ans === exercise.data.correct_answers[idx],
        );
      }
    } else if (exercise.type === "drag_and_drop") {
      const buckets = Object.keys(exercise.data.correct_assignment);
      correct = buckets.every((bucket: string) => {
        const correctAns = exercise.data.correct_assignment[bucket];
        const user = userAnswer[bucket] || [];
        if (!Array.isArray(correctAns) || !Array.isArray(user)) return false;
        if (user.length !== correctAns.length) return false;
        // Bandingkan hasil sort (urutan tidak penting)
        return [...user]
          .sort()
          .every((itm, idx) => itm === [...correctAns].sort()[idx]);
      });
      // PERBAIKAN: Juga pastikan container 'items' kosong (semua sudah dipindahkan)
      if (correct && userAnswer["items"] && userAnswer["items"].length > 0) {
        correct = false;
      }
    } else if (exercise.type === "sorting") {
      correct = userAnswer.join(",") === exercise.data.correct_order.join(",");
    } else if (
      exercise.type === "guessing" ||
      exercise.type === "multiple_choice"
    ) {
      correct = userAnswer === exercise.data.correct;
    } else if (exercise.type === "checkbox") {
      const correctOptions = exercise.data.correct_options || [];
      const userSelected = Array.isArray(userAnswer) ? userAnswer : [];
      // Cek jumlah sama dan setiap pilihan user ada di jawaban benar
      if (userSelected.length !== correctOptions.length) {
        correct = false;
      } else {
        correct = userSelected.every((opt: string) =>
          correctOptions.includes(opt),
        );
      }
    }

    setIsCorrect(correct);
    const exerciseSummary = "Benar! +" + exercise.points + " poin 🏆";
    setFeedback(correct ? exerciseSummary : "Salah, coba lagi! 😔");

    if (correct) {
      // Panggil onComplete untuk menandai soal selesai dan kirim status benar
      if (onComplete) onComplete(true);

      // Auto next ke soal berikutnya setelah 5 detik
      if (currentIndex < exercises.length - 1 && onNext) {
        setTimeout(() => {
          onNext();
        }, 5000);
      }
    } else {
      if (onWrong) onWrong(exercise?.prompt || "");
      // Jika salah, hilangkan tooltip setelah 3 detik
      setTimeout(() => {
        setFeedback("");
      }, 3000);
    }
  };

  const footerOnSubmit = useCallback(() => {
    if (exercise.type === "fill_in_the_blank") {
      return handleSubmit(Object.values(answers));
    }
    if (exercise.type === "drag_and_drop") {
      return handleSubmit(answers as any);
    }
    if (exercise.type === "sorting") {
      return handleSubmit(answers.items || exercise.data.code_lines);
    }
    if (exercise.type === "guessing" || exercise.type === "multiple_choice") {
      return handleSubmit(answers.answer);
    }
    if (exercise.type === "checkbox") {
      return handleSubmit(answers.selected || []);
    }
    return handleSubmit(answers);
  }, [exercise, answers]);

  useEffect(() => {
    if (onFooterPropsChange) {
      onFooterPropsChange({ onSubmit: footerOnSubmit, feedback, isCorrect });
    }
  }, [footerOnSubmit, feedback, isCorrect, onFooterPropsChange]);

  // HANDLER BARU - Lebih sederhana dan robust
  const handleDragEndNew = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedItemId = active.id.toString();
    const targetContainerId = over.id.toString();

    // Cek apakah target adalah container atau item
    // Jika target adalah item, ambil container parent-nya
    const buckets = exercise.data.buckets || [];
    const allContainers = ["items", ...buckets];

    let finalTargetContainer = targetContainerId;

    // Jika yang di-drop adalah item (bukan container), cari container-nya
    if (!allContainers.includes(targetContainerId)) {
      // Target adalah item, cari di container mana item ini berada
      for (const container of allContainers) {
        const containerItems = answers[container] || [];
        if (containerItems.includes(targetContainerId)) {
          finalTargetContainer = container;
          break;
        }
      }
      // Jika tidak ditemukan di answers, cek di items awal
      if (!allContainers.includes(finalTargetContainer)) {
        const initialItems = exercise.data.items || [];
        if (initialItems.includes(targetContainerId)) {
          finalTargetContainer = "items";
        }
      }
    }

    // Buat copy dari answers
    const newAnswers: { [key: string]: string[] } = {};

    // Inisialisasi semua containers
    allContainers.forEach((container) => {
      newAnswers[container] = answers[container] ? [...answers[container]] : [];
    });

    // Jika 'items' belum ada di answers, inisialisasi dengan semua items
    if (!answers["items"]) {
      newAnswers["items"] = [...(exercise.data.items || [])];
    }

    // Hapus item dari semua containers
    allContainers.forEach((container) => {
      newAnswers[container] = newAnswers[container].filter(
        (item) => item !== draggedItemId,
      );
    });

    // Tambahkan item ke target container
    if (!newAnswers[finalTargetContainer]) {
      newAnswers[finalTargetContainer] = [];
    }
    newAnswers[finalTargetContainer].push(draggedItemId);

    setAnswers(newAnswers);
  };

  const handleDragEnd = (event: DragEndEvent, type: string) => {
    const { active, over } = event;
    if (!over) return;

    if (type === "drag_and_drop") {
      handleDragEndNew(event);
    } else if (type === "sorting") {
      const items = Array.from(answers.items || exercise.data.code_lines);
      const sourceIndex = active.data.current?.sortable.index;
      const destIndex =
        over.data.current?.sortable.index || items.indexOf(over.id);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);
      setAnswers({ items });
    }
  };

  switch (exercise.type) {
    case "fill_in_the_blank":
      // Parse template_code untuk mendapatkan parts dan blanks
      // Ganti \\n dengan newline yang sebenarnya
      const normalizedCode = exercise.template_code.replace(/\\n/g, "\n");
      const templateParts = normalizedCode.split("____");
      const blanksCount = templateParts.length - 1;

      // Cek apakah ini kode multi-line (ada newline)
      const isMultiLine = normalizedCode.includes("\n");

      return (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          layout
        >
          {/* Instruction Card - Sesuai Figma */}
          <div className="bg-white border-2 border-[#3674B5] rounded-[14px] px-8 py-2 flex flex-col gap-2">
            <div
              className="text-lg font-medium text-[#27272A] leading-[1em] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.prompt || "" }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8">
            {isMultiLine ? (
              /* Code Block Style untuk multi-line code */
              <div className="bg-[#1e1e1e] rounded-[14px] p-6 font-mono text-base">
                {templateParts.map((part: string, idx: number) => (
                  <span key={idx}>
                    {/* Text part dengan preserved whitespace */}
                    <span
                      className="text-[#d4d4d4]"
                      style={{ whiteSpace: "pre" }}
                    >
                      {part}
                    </span>

                    {/* Blank (jika bukan part terakhir) */}
                    {idx < blanksCount && (
                      <span
                        className={`inline-block min-w-[80px] px-3 py-1.5 mx-1 rounded-lg cursor-pointer transition-all ${
                          answers[idx]
                            ? "bg-[#3674B5] border-2 border-[#205994]"
                            : "bg-[#374151] border-b-2 border-[#6b7280]"
                        }`}
                        style={{
                          color: answers[idx] ? "#ffffff" : "#9ca3af",
                          boxShadow: answers[idx]
                            ? "0px 2px 0px 0px rgba(32, 89, 148, 1)"
                            : "none",
                        }}
                        onClick={() => answers[idx] && handleClearBlank(idx)}
                      >
                        {answers[idx] || "____"}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              /* Inline Style untuk single-line text */
              <div className="flex flex-wrap items-center gap-3.5">
                {templateParts.map((part: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    {/* Text part */}
                    {part && (
                      <span className="text-xl font-medium text-[#27272A] leading-[1.2em]">
                        {part}
                      </span>
                    )}

                    {/* Blank (jika bukan part terakhir) */}
                    {idx < blanksCount && (
                      <div
                        className={`flex items-center justify-center min-w-[90px] h-auto cursor-pointer transition-all ${
                          answers[idx]
                            ? "bg-[#3674B5] border-2 border-[#205994] rounded-[14px] px-4 py-2"
                            : "border-b-2 border-black px-2 py-1 hover:border-[#3674B5]"
                        }`}
                        style={{
                          boxShadow: answers[idx]
                            ? "0px 3px 0px 0px rgba(32, 89, 148, 1)"
                            : "none",
                        }}
                        onClick={() => answers[idx] && handleClearBlank(idx)}
                      >
                        {answers[idx] ? (
                          <span className="text-xl font-semibold text-white">
                            {answers[idx]}
                          </span>
                        ) : (
                          <span className="text-xl font-medium text-transparent">
                            ____
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Options - Card Style seperti Figma */}
            <div className="flex flex-wrap gap-3.5">
              {exercise.data.options.map((opt: string) => {
                const isUsed = Object.values(answers).includes(opt);
                const showCorrect = isCorrect && isUsed;
                return (
                  <button
                    key={opt}
                    onClick={() => !isUsed && handleOptionClick(opt)}
                    disabled={isUsed}
                    className={`border-2 rounded-[14px] px-6 py-3.5 flex items-center justify-center gap-5 transition-all ${
                      showCorrect
                        ? "bg-[#E8FAF0] border-[#17C964] cursor-not-allowed"
                        : isUsed
                          ? "bg-white border-[#E4E4E7] opacity-50 cursor-not-allowed"
                          : "bg-white border-[#E4E4E7] hover:border-[#3674B5] cursor-pointer"
                    }`}
                    style={{
                      boxShadow: showCorrect
                        ? "0px 4px 0px 0px rgba(23, 201, 100, 1)"
                        : isUsed
                          ? "none"
                          : "0px 4px 0px 0px rgba(228, 228, 231, 1)",
                    }}
                  >
                    <p
                      className={`text-xl font-medium text-center leading-[1.6em] ${
                        showCorrect ? "text-[#12A150]" : "text-[#3F3F46]"
                      }`}
                    >
                      {opt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      );

    case "drag_and_drop":
      // LOGIKA BARU - Lebih sederhana
      const buckets = exercise.data.buckets || [];
      const allContainers = ["items", ...buckets];

      // Inisialisasi containers
      const containerItems: { [key: string]: string[] } = {};

      // Jika answers kosong, semua items ada di 'items'
      if (Object.keys(answers).length === 0) {
        containerItems["items"] = [...(exercise.data.items || [])];
        buckets.forEach((bucket: string) => {
          containerItems[bucket] = [];
        });
      } else {
        // Gunakan data dari answers
        allContainers.forEach((container) => {
          containerItems[container] = answers[container] || [];
        });

        // Pastikan tidak ada item yang hilang atau duplikat
        const allAssignedItems = new Set<string>();
        allContainers.forEach((container) => {
          containerItems[container].forEach((item) =>
            allAssignedItems.add(item),
          );
        });

        // Tambahkan items yang belum ter-assign ke 'items'
        exercise.data.items.forEach((item: string) => {
          if (!allAssignedItems.has(item)) {
            containerItems["items"].push(item);
          }
        });
      }

      return (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          layout
        >
          {/* Instruction Card - Sesuai Figma */}
          <div className="bg-white border-2 border-[#3674B5] rounded-[14px] px-8 py-2 flex flex-col gap-2">
            <div
              className="text-lg font-medium text-[#27272A] leading-[1em] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.prompt || "" }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8">
            {/* DndContext harus membungkus SEMUA draggable items */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, "drag_and_drop")}
            >
              {/* Buckets/Categories - Sesuai Figma */}
              <div className="flex flex-col gap-6">
                <div
                  className="text-xl font-medium text-[#27272A]"
                  dangerouslySetInnerHTML={{ __html: getQuestionHtml(exercise) }}
                />
                {buckets.map((bucket: string) => {
                  // Komponen Droppable Bucket
                  const DroppableBucket = () => {
                    const { setNodeRef, isOver } = useDroppable({ id: bucket });

                    return (
                      <div
                        ref={setNodeRef}
                        className="bg-white border-2 border-[#E4E4E7] rounded-[14px] p-5 flex flex-col gap-5"
                        style={{
                          backgroundColor: isOver ? "#e0f2fe" : "white",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <div className="flex items-stretch gap-2.5">
                          <div className="flex items-center gap-2 flex-1">
                            <h3 className="text-xl font-semibold text-[#3674B5]">
                              {bucket}
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[60px]">
                          {containerItems[bucket].length === 0 ? (
                            <div className="text-gray-400 text-sm italic py-2">
                              Drag items ke sini
                            </div>
                          ) : (
                            containerItems[bucket].map((item) => (
                              <DraggableItem
                                key={item}
                                id={item}
                                content={item}
                                isCorrect={isCorrect}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  };

                  return <DroppableBucket key={bucket} />;
                })}
              </div>

              {/* Items to Drag - Sesuai Figma */}
              <div className="flex flex-wrap gap-3.5">
                {containerItems["items"].map((item) => (
                  <DraggableItem key={item} id={item} content={item} />
                ))}
              </div>
            </DndContext>
          </div>
        </motion.div>
      );
    case "sorting":
      // Komponen SortableItem dengan icon menu - Sesuai Figma
      const SortableItem = ({
        id,
        children,
        isCorrect: itemCorrect,
      }: {
        id: string;
        children: React.ReactNode;
        isCorrect?: boolean;
      }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id });

        const combinedStyle = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          boxShadow: itemCorrect
            ? "0px 4px 0px 0px rgba(23, 201, 100, 1)"
            : "0px 4px 0px 0px rgba(228, 228, 231, 1)",
        };

        return (
          <div
            ref={setNodeRef}
            style={combinedStyle}
            {...attributes}
            {...listeners}
            className={`flex items-center gap-5 px-6 py-3.5 border-2 rounded-[14px] cursor-grab transition-colors ${
              itemCorrect
                ? "bg-[#E8FAF0] border-[#17C964] hover:border-[#17C964]"
                : "bg-white border-[#E4E4E7] hover:border-[#3674B5]"
            }`}
          >
            {/* Menu Icon */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="flex-shrink-0"
            >
              <path
                d="M6.66675 13.3333H33.3334M6.66675 20H33.3334M6.66675 26.6667H33.3334"
                stroke={itemCorrect ? "#12A150" : "#3F3F46"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <p
              className={`text-xl font-medium leading-[1.6em] ${
                itemCorrect ? "text-[#12A150]" : "text-[#3F3F46]"
              }`}
            >
              {children}
            </p>
          </div>
        );
      };

      return (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          layout
        >
          {/* Instruction Card */}
          <div className="bg-white border-2 border-[#3674B5] rounded-[14px] px-8 py-2 flex flex-col gap-2">
            <div
              className="text-lg font-medium text-[#27272A] leading-[1em] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.prompt || "" }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8">
<<<<<<< Updated upstream
            <div
              className="text-xl font-medium text-[#27272A] leading-[1.2em] ql-editor"
              dangerouslySetInnerHTML={{
                __html: getQuestionHtml(exercise),
              }}
            />
=======
            {/* Display Template Code if exists */}
            {exercise.template_code && (
              <div className="bg-white border-2 border-[#E4E4E7] rounded-[14px] overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage="javascript"
                  value={exercise.template_code.replace(/\\n/g, '\n')}
                  options={{
                    readOnly: true,
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                    lineNumbers: 'on',
                    folding: false,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </div>
            )}

            <p className="text-xl font-medium text-[#27272A] leading-[1.2em]">
              {exercise.pertanyaan || exercise.data.question || 'Urutkan item berikut:'}
            </p>
>>>>>>> Stashed changes

            {/* Sortable Items */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, "sorting")}
            >
              <SortableContext
                items={(answers.items || exercise.data.code_lines).map(
                  (item: string) => item,
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3.5">
                  {(answers.items || exercise.data.code_lines).map(
                    (item: string) => (
                      <SortableItem key={item} id={item} isCorrect={isCorrect}>
                        {item}
                      </SortableItem>
                    ),
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* Divider */}
            <div className="h-[1.5px] bg-black/15"></div>
          </div>
        </motion.div>
      );
    case "guessing":
      return (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          layout
        >
          {/* Instruction Card */}
          <div className="bg-white border-2 border-[#3674B5] rounded-[14px] px-8 py-2 flex flex-col gap-2">
            <div
              className="text-lg font-medium text-[#27272A] leading-[1em] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.prompt || "" }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8">
            {/* Code Editor */}
            <div className="bg-white border-2 border-[#E4E4E7] rounded-[14px] overflow-hidden">
              <Editor
                height="150px"
                defaultLanguage="javascript"
                value={exercise.data.code}
                options={{
                  readOnly: true,
                  fontSize: 16,
                  minimap: { enabled: false },
                  scrollbar: { vertical: "hidden", horizontal: "hidden" },
                  lineNumbers: "off",
                  folding: false,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>

            {/* Input Answer */}
            <div className="flex flex-col gap-4">
              <p className="text-xl font-medium text-[#27272A]">
                Masukkan output:
              </p>
              <input
                type="text"
                placeholder="Ketik jawaban Anda di sini..."
                value={answers.answer || ""}
                onChange={(e) => setAnswers({ answer: e.target.value })}
                className="px-6 py-4 border-2 border-[#E4E4E7] rounded-[14px] text-lg focus:outline-none focus:border-[#3674B5] transition-colors"
              />
            </div>
          </div>
        </motion.div>
      );
    case "checkbox":
      return (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          layout
        >
          {/* Instruction Card */}
          <div className="bg-white border-2 border-[#3674B5] rounded-[14px] px-8 py-2 flex flex-col gap-2">
            <div
              className="text-lg font-medium text-[#27272A] leading-[1em] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.prompt || "" }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8">
            <div
              className="text-xl font-medium text-[#27272A] leading-[1.2em] ql-editor"
              dangerouslySetInnerHTML={{
                __html: getQuestionHtml(exercise),
              }}
            />
            <p className="text-sm text-gray-500 italic">
              Pilih semua jawaban yang benar
            </p>

            {/* Options - Card Style */}
            <div className="flex flex-col gap-3.5">
              {exercise.data.options.map((opt: string) => {
                const selected = (answers.selected || []).includes(opt);
                const showCorrect = isCorrect && selected;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (isCorrect) return;
                      const current = answers.selected || [];
                      const newSelected = current.includes(opt)
                        ? current.filter((x: string) => x !== opt)
                        : [...current, opt];
                      setAnswers({ selected: newSelected });
                    }}
                    disabled={isCorrect}
                    className={`flex items-stretch gap-5 px-6 py-[18px] border-2 rounded-[14px] transition-all ${
                      showCorrect
                        ? "bg-[#E8FAF0] border-[#17C964]"
                        : selected
                          ? "bg-[#3674B5] border-[#205994]"
                          : "bg-white border-[#E4E4E7] hover:border-[#3674B5]"
                    }`}
                    style={{
                      boxShadow: showCorrect
                        ? "0px 4px 0px 0px rgba(23, 201, 100, 1)"
                        : selected
                          ? "0px 4px 0px 0px rgba(32, 89, 148, 1)"
                          : "0px 4px 0px 0px rgba(228, 228, 231, 1)",
                    }}
                  >
                    {/* Checkbox Icon Mock */}
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        showCorrect
                          ? "border-[#12A150] bg-[#12A150]"
                          : selected
                            ? "border-white bg-white"
                            : "border-[#A1A1AA]"
                      }`}
                    >
                      {(showCorrect || selected) && (
                        <svg
                          width="14"
                          height="10"
                          viewBox="0 0 14 10"
                          fill="none"
                        >
                          <path
                            d="M1 5L4.5 8.5L13 1"
                            stroke={showCorrect ? "white" : "#3674B5"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    <p
                      className={`text-xl font-medium leading-[1.6em] text-left flex-1 ${
                        showCorrect
                          ? "text-[#12A150]"
                          : selected
                            ? "text-white"
                            : "text-[#3F3F46]"
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {opt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      );
    case "multiple_choice":
      return (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          layout
        >
          {/* Instruction Card */}
          <div className="bg-white border-2 border-[#3674B5] rounded-[14px] px-8 py-2 flex flex-col gap-2">
            <div
              className="text-lg font-medium text-[#27272A] leading-[1em] prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exercise.prompt || "" }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8">
<<<<<<< Updated upstream
            <div
              className="text-xl font-medium text-[#27272A] leading-[1.2em] ql-editor"
              dangerouslySetInnerHTML={{
                __html: getQuestionHtml(exercise),
              }}
            />
=======
            {/* Display Template Code if exists */}
            {exercise.template_code && (
              <div className="bg-white border-2 border-[#E4E4E7] rounded-[14px] overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage="javascript"
                  value={exercise.template_code.replace(/\\n/g, '\n')}
                  options={{
                    readOnly: true,
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                    lineNumbers: 'on',
                    folding: false,
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </div>
            )}

            <p className="text-xl font-medium text-[#27272A] leading-[1.2em]">
              {exercise.pertanyaan || exercise.data.question}
            </p>
>>>>>>> Stashed changes

            {/* Options - Card Style */}
            <div className="flex flex-col gap-3.5">
              {exercise.data.options.map((opt: string) => {
                const isSelected = answers.answer === opt;
                const showCorrect = isCorrect && isSelected;
                return (
                  <button
                    key={opt}
                    onClick={() => !isCorrect && setAnswers({ answer: opt })}
                    disabled={isCorrect}
                    className={`flex items-stretch gap-5 px-6 py-[18px] border-2 rounded-[14px] transition-all ${
                      showCorrect
                        ? "bg-[#E8FAF0] border-[#17C964]"
                        : isSelected
                          ? "bg-[#3674B5] border-[#205994]"
                          : "bg-white border-[#E4E4E7] hover:border-[#3674B5]"
                    }`}
                    style={{
                      boxShadow: showCorrect
                        ? "0px 4px 0px 0px rgba(23, 201, 100, 1)"
                        : isSelected
                          ? "0px 4px 0px 0px rgba(32, 89, 148, 1)"
                          : "0px 4px 0px 0px rgba(228, 228, 231, 1)",
                    }}
                  >
                    <p
                      className={`text-xl font-medium leading-[1.6em] text-left flex-1 ${
                        showCorrect
                          ? "text-[#12A150]"
                          : isSelected
                            ? "text-white"
                            : "text-[#3F3F46]"
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {opt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      );
    default:
      return <div>Tipe tidak didukung</div>;
  }
}
