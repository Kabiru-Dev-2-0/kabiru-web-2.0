"use client";

import { useEffect, useState, useRef } from "react";

import { useParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import { useRouter } from "next/navigation";

import { useGameStore } from "@/store/game-store";

import { tutorialData } from "@/components/sd/tutorial/tutorial-data";

import TopHeader from "@/components/sd/lesson/top-header";
import Breadcrumb from "@/components/sd/breadcrumb";
import Leaderboard from "@/components/sd/leaderboard/leaderboard";
import DragDropExercise from "@/components/sd/exercise/drag-drop";
import PatternPainterExercise from "@/components/sd/exercise/pattern-painter";
import CodeDebuggerExercise from "@/components/sd/exercise/code-debugger";
import MazeRunnerExercise from "@/components/sd/exercise/maze-runner";
import SortingExercise from "@/components/sd/exercise/sorting";
import AnswerFeedback from "@/components/sd/exercise/answer-feedback";
import Modal from "@/components/sd/modal";
import {
  IconFOpenBook,
  IconFPartyPopper,
  IconFRobot,
  IconFTrophy,
  IconFWorldMap,
} from "react-fluentui-emoji/lib/flat";
import TutorialOverlay from "@/components/sd/tutorial/tutorial-overlay";
import GameButton from "@/components/sd/game-button";
import { useSDAuth } from "@/hooks/use-sd-auth";

type Lesson = {
  id: number;
  judul: string;
  bagian: number;
  id_modul: number;
};

type Modul = {
  id: number;
  judul: string;
};

export default function ExercisePage() {
  useSDAuth();
  const params = useParams();

  const router = useRouter();
  const boardRef = useRef<HTMLDivElement>(null);

  // ================= PROFILE =================
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sd_user");

    if (!savedUser) return;

    setUser(JSON.parse(savedUser));
  }, []);

  const lessonId = Number(params?.lessonId);

  useEffect(() => {
    if (!lessonId || Number.isNaN(lessonId)) {
      return;
    }

    fetchData();
  }, [lessonId]);

  const supabase = createClient();

  // =====================================
  // GAME STORE
  // =====================================
  const addExp = useGameStore((state) => state.addExp);

  const [shakeBoard, setShakeBoard] = useState(false);

  // =====================================
  // STATE
  // =====================================
  const [loading, setLoading] = useState(true);

  const [checkAnswerFn, setCheckAnswerFn] = useState<() => void>();

  const [exercise, setExercise] = useState<any>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [modul, setModul] = useState<Modul | null>(null);

  const [totalExercises, setTotalExercises] = useState(0);

  const [currentProgress, setCurrentProgress] = useState(2);

  const [canCheckAnswer, setCanCheckAnswer] = useState(false);

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [showFinishModal, setShowFinishModal] = useState(false);

  const [showLessonFinishModal, setShowLessonFinishModal] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);

  const [tutorialSteps, setTutorialSteps] = useState<any[]>([]);

  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const checkButtonDisabled = showTutorial
    ? false
    : !canCheckAnswer || isAnswerLocked;

  // =========================
  // LEADERBOARD
  // =========================
  useEffect(() => {
    if (!showLeaderboard) return;

    const timer = setTimeout(() => {
      handleCloseLeaderboard();
    }, 5000);

    return () => clearTimeout(timer);
  }, [showLeaderboard]);

  function handleCloseLeaderboard() {
    setShowLeaderboard(false);
    goToNextExercise();
  }

  const [feedback, setFeedback] = useState<{
    open: boolean;
    status: "correct" | "wrong";
  }>({
    open: false,
    status: "correct",
  });

  const [resetExerciseFn, setResetExerciseFn] = useState<
    (() => void) | undefined
  >();

  // =====================================
  // SHORT TEXT
  // =====================================
  const shortText = (text?: string) => {
    if (!text) return "";

    const words = text.split(" ");

    if (words.length <= 2) return text;

    return `${words[0]} ${words[1]}...`;
  };

  // =====================================
  // TUTORIAL
  // =====================================
  useEffect(() => {
    if (!user) return;

    if (!exercise) return;

    checkTutorialStatus();
  }, [user, exercise]);

  function getTutorialSteps(exercise: any) {
    if (!exercise) return [];

    switch (exercise.type) {
      case "drag_and_drop":
        return tutorialData.drag_and_drop(exercise.data?.buckets || []);

      case "pattern_painter":
        return tutorialData.pattern_painter();

      case "maze_runner":
        return tutorialData.maze_runner();

      case "sorting":
        return tutorialData.sorting();

      case "code_debugger":
        return tutorialData.code_debugger();

      default:
        return [];
    }
  }

  // =========================
  // TUTORIAL SHOW FOR NEW USER
  // =========================
  async function checkTutorialStatus() {
    if (!user || !exercise) {
      return;
    }

    const { data: userData } = await supabase
      .from("data_penggunas_sd")
      .select(
        `
        is_pengguna_baru,
        onboarding_completed,
        tutorial_completed_types
    `,
      )
      .eq("id", user.id)
      .single();

    const { data: progress } = await supabase
      .from("progress_latihan_sd")
      .select("id")
      .eq("pengguna_id", user.id)
      .eq("latihan_id", exercise.id)
      .maybeSingle();

    const onboardingCompleted = userData?.onboarding_completed === false;

    const completedTypes: string[] = userData?.tutorial_completed_types ?? [];

    const currentType = exercise.type;

    const alreadyCompleted = completedTypes.includes(currentType);

    const neverPlayed = !progress;

    const shouldShowTutorial =
      userData?.is_pengguna_baru &&
      onboardingCompleted &&
      !alreadyCompleted &&
      neverPlayed;

    setShowTutorial(shouldShowTutorial);
  }

  // =========================
  // CLOSE TUTORIAL
  // =========================
  async function closeTutorial() {
    const { data: userData } = await supabase
      .from("data_penggunas_sd")
      .select("tutorial_completed_types")
      .eq("id", user.id)
      .single();

    const completedTypes: string[] = userData?.tutorial_completed_types || [];

    const currentType = exercise?.type ?? "";

    const updatedTypes = Array.from(new Set([...completedTypes, currentType]));

    const allTypes = [
      "drag_and_drop",
      "pattern_painter",
      "maze_runner",
      "sorting",
      "code_debugger",
    ];

    const finishedAllTutorials = allTypes.every((type) =>
      updatedTypes.includes(type),
    );

    await supabase
      .from("data_penggunas_sd")
      .update({
        tutorial_completed_types: updatedTypes,
        onboarding_completed: finishedAllTutorials,
        is_pengguna_baru: !finishedAllTutorials,
      })
      .eq("id", user.id);

    setShowTutorial(false);

    // refresh state lokal
    setUser((prev: any) => ({
      ...prev,
      tutorial_completed_types: updatedTypes,
      onboarding_completed: finishedAllTutorials,
      is_pengguna_baru: !finishedAllTutorials,
    }));

    await checkTutorialStatus();
  }

  async function fetchData() {
    setLoading(true);

    // =========================
    // FETCH LESSON
    // =========================
    const { data: lessonData } = await supabase
      .from("pelajarans_sd")
      .select("*")
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonData) {
      setLesson(lessonData);

      // =========================
      // FETCH MODUL
      // =========================
      const { data: modulData } = await supabase
        .from("moduls_sd")
        .select("*")
        .eq("id", lessonData.id_modul)
        .maybeSingle();

      if (modulData) {
        setModul(modulData);
      }
    }

    // =========================
    // FETCH TOTAL EXERCISES
    // =========================
    const { count } = await supabase
      .from("latihans_sd")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("id_pelajaran", lessonId);

    setTotalExercises(count || 0);

    // =========================
    // FETCH FIRST EXERCISE
    // =========================
    const { data, error } = await supabase
      .from("latihans_sd")
      .select("*")
      .eq("id_pelajaran", lessonId)
      .order("nomor_urut", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);

      setLoading(false);

      return;
    }

    if (!data) {
      setLoading(false);

      return;
    }

    setExercise(data);

    setCurrentProgress(2);

    setTutorialSteps(getTutorialSteps(data));

    setLoading(false);
  }

  // =========================
  // LOAD NEXT & PREVIOUS EXERCISE
  // =========================
  function loadExercise(data: any, progress: number) {
    setExercise(data);

    setCurrentProgress(progress);

    setFeedback({
      open: false,
      status: "correct",
    });

    setShowLeaderboard(false);

    setShowTutorial(false);

    setShakeBoard(false);

    setCanCheckAnswer(false);

    setIsAnswerLocked(false);

    setCheckAnswerFn(undefined);

    setTutorialSteps(getTutorialSteps(data));

    boardRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================
  // NEXT EXERCISE
  // =====================================
  async function goToNextExercise() {
    if (!exercise) return;

    const { data: progress } = await supabase
      .from("progress_latihan_sd")
      .select("id")
      .eq("pengguna_id", user.id)
      .eq("latihan_id", exercise.id)
      .maybeSingle();

    const alreadyCompleted = !!progress;

    if (!alreadyCompleted) {
      const gainedExp = Number(exercise.points) || 0;

      const newExp = Number(user.exp || 0) + gainedExp;

      await supabase
        .from("data_penggunas_sd")
        .update({
          exp: newExp,
        })
        .eq("id", user.id);

      user.exp = newExp;

      localStorage.setItem("sd_user", JSON.stringify(user));

      setUser({
        ...user,
        exp: newExp,
      });
    }

    await supabase.from("progress_latihan_sd").upsert({
      pengguna_id: user.id,
      latihan_id: exercise.id,
      is_completed: true,
      score: exercise.points,
      completed_at: new Date().toISOString(),
    });

    // =========================
    // FETCH NEXT
    // =========================
    const { data, error } = await supabase
      .from("latihans_sd")
      .select("*")
      .eq("id_pelajaran", lessonId)
      .gt("nomor_urut", exercise.nomor_urut)
      .order("nomor_urut", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);

      return;
    }

    // =========================
    // SEMUA SOAL SELESAI
    // =========================
    if (!data) {
      // lesson selesai

      await supabase.from("progress_pelajaran_sd").upsert({
        pengguna_id: user.id,
        pelajaran_id: lesson?.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      const { count: totalLessons } = await supabase
        .from("pelajarans_sd")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("id_modul", lesson?.id_modul);

      const { data: lessonIds } = await supabase
        .from("pelajarans_sd")
        .select("id")
        .eq("id_modul", lesson?.id_modul);

      const ids = lessonIds?.map((item) => item.id) || [];

      const { data: completedLessons } = await supabase
        .from("progress_pelajaran_sd")
        .select("*")
        .eq("pengguna_id", user.id)
        .eq("is_completed", true)
        .in("pelajaran_id", ids);

      const totalCompleted = completedLessons?.length || 0;

      // =========================
      // MODUL SELESAI
      // =========================
      if (totalCompleted >= (totalLessons || 0)) {
        // modul sekarang selesai
        await supabase.from("progress_modul_sd").upsert({
          pengguna_id: user.id,
          modul_id: lesson?.id_modul,
          is_unlocked: true,
          is_completed: true,
        });

        // cari modul sekarang
        const { data: currentModul } = await supabase
          .from("moduls_sd")
          .select("nomor_modul")
          .eq("id", lesson?.id_modul)
          .single();

        // cari modul berikutnya
        const { data: nextModul } = await supabase
          .from("moduls_sd")
          .select("id")
          .gt("nomor_modul", currentModul?.nomor_modul)
          .order("nomor_modul", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

        // unlock modul berikutnya
        if (nextModul) {
          await supabase.from("progress_modul_sd").upsert({
            pengguna_id: user.id,
            modul_id: nextModul.id,
            is_unlocked: true,
            is_completed: false,
          });
        }

        setShowFinishModal(true);

        return;
      }
      // =========================
      // LESSON SELESAI
      // =========================
      setShowLessonFinishModal(true);

      return;
    }

    loadExercise(data, currentProgress + 1);

    return;
  }

  async function goToPreviousExercise() {
    if (!exercise) return;
    setFeedback({ open: false, status: "correct" });
    setShowLeaderboard(false);
    setShakeBoard(false);
    setShowTutorial(false);
    setCanCheckAnswer(false);
    setIsAnswerLocked(false);
    setCheckAnswerFn(undefined);
    resetExerciseFn?.();
    const { data: firstExercise } = await supabase
      .from("latihans_sd")
      .select("nomor_urut")
      .eq("id_pelajaran", lessonId)
      .order("nomor_urut", { ascending: true })
      .limit(1)
      .maybeSingle();

    const isFirstExercise =
      firstExercise && exercise.nomor_urut <= firstExercise.nomor_urut;
    if (isFirstExercise) {
      router.push(`/sd/eksplorasi/${lesson?.id_modul}/${lessonId}`);
      return;
    }

    // =========================
    // FETCH PREVIOUS EXERCISE
    // =========================
    const { data, error } = await supabase
      .from("latihans_sd")
      .select("*")
      .eq("id_pelajaran", lessonId)
      .lt("nomor_urut", exercise.nomor_urut)
      .order("nomor_urut", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (!data) return;
    loadExercise(data, Math.max(currentProgress - 1, 2));
  }

  // =====================================
  // LOADING
  // =====================================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-2xl font-bold">
        Memuat...
      </div>
    );
  }

  // =====================================
  // EMPTY
  // =====================================
  if (!exercise) {
    return (
      <div className="h-screen flex items-center justify-center text-2xl font-bold">
        Latihan tidak ditemukan
      </div>
    );
  }

  return (
    <main>
      <div className="relative min-h-screen overflow-hidden">
        {/* ================= BACKGROUND ================= */}
        <img
          src="/imageAssets/sd/soal/background.png"
          alt="background"
          className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
        "
        />

        {/* ================= HEADER ================= */}
        <div className="relative z-30">
          <TopHeader
            name={user?.username || "Pemain"}
            level="Siswa"
            avatar={user?.avatar || "/imageAssets/avatar/default.png"}
            currentProgress={currentProgress}
            totalProgress={totalExercises + 1}
            exp={user?.exp || 0}
            showProgress
            showBack
            onBack={goToPreviousExercise}
          />
        </div>

        {/* ================= MAIN BOARD ================= */}
        <div
          className={`
          absolute
          top-[16%]
          left-1/2
          -translate-x-1/2

          z-20

          w-[84%]
          h-[72%]

          ${shakeBoard ? "animate-board-shake" : ""}
  

          rounded-[28px]

          border-[10px]
          border-[#FFB236]

          bg-[#015B4E]

          shadow-2xl

          overflow-hidden
        `}>
          <div
            ref={boardRef}
            className="
            w-full
            h-full

            overflow-y-auto
            overflow-x-hidden

            px-10
            py-8

            custom-scroll
          ">
            {/* TARGET TUTORIAL */}
            <div
              data-tutorial="scrollbar"
              className="
                absolute
                top-3
                right-[3px]
                w-[18px]
                bottom-3
                rounded-full
                pointer-events-none
              "
            />
            {/* ================= OVERLAY ANSWER FEEDBACK ================= */}
            <AnswerFeedback
              open={feedback.open}
              status={feedback.status}
              duration={1500}
              onFinish={() => {
                const isCorrect = feedback.status === "correct";

                setFeedback({
                  open: false,
                  status: "correct",
                });

                if (isCorrect) {
                  setShowLeaderboard(true);
                } else {
                  resetExerciseFn?.();
                }
              }}
            />
            {/* ================= TITLE ================= */}
            <h1
              className="
              text-center
              text-amber-100
              text-3xl
              font-black
              mb-4
            "> " {exercise.prompt} "
            </h1>

            {/* ================= QUESTION ================= */}
            <div
              className="flex flex-row items-center justify-center gap-4 w-full bg-amber-100 rounded-3xl px-4 py-0 mb-8 outline-2 outline-offset-2 outline-white outline-dashed"
            >
              <IconFRobot size={120}></IconFRobot>
              <div
              className="
              text-left
              text-gray-800
              text-[18px]/6
              font-[550]
              tracking-[0.01rem]
            "
              style={{
                      fontFamily: "var(--font-lilita-one)",
                    }}
              dangerouslySetInnerHTML={{
                __html: exercise.pertanyaan || "",
              }}
            />
            </div>
            

            {/* ================= EXERCISE ================= */}
            {exercise.type === "drag_and_drop" && (
              <DragDropExercise
                key={exercise.id}
                exercise={exercise}
                setCheckAnswer={setCheckAnswerFn}
                setResetExercise={setResetExerciseFn}
                onStateChange={setCanCheckAnswer}
                onAnswerResult={(isCorrect) => {
                  if (isCorrect) {
                    setIsAnswerLocked(true);
                    setCheckAnswerFn(undefined);
                  }

                  if (!isCorrect) {
                    setShakeBoard(true);

                    setTimeout(() => {
                      setShakeBoard(false);
                    }, 500);
                  }

                  setFeedback({
                    open: true,
                    status: isCorrect ? "correct" : "wrong",
                  });
                }}
              />
            )}

            {exercise.type === "pattern_painter" && (
              <PatternPainterExercise
                key={exercise.id}
                exercise={exercise}
                setCheckAnswer={setCheckAnswerFn}
                setResetExercise={setResetExerciseFn}
                onStateChange={setCanCheckAnswer}
                onAnswerResult={(isCorrect) => {
                  if (isCorrect) {
                    setIsAnswerLocked(true);
                    setCheckAnswerFn(undefined);
                  }

                  if (!isCorrect) {
                    setShakeBoard(true);

                    setTimeout(() => {
                      setShakeBoard(false);
                    }, 500);
                  }

                  setFeedback({
                    open: true,
                    status: isCorrect ? "correct" : "wrong",
                  });
                }}
              />
            )}

            {exercise.type === "code_debugger" && (
              <CodeDebuggerExercise
                key={exercise.id}
                exercise={exercise}
                setCheckAnswer={setCheckAnswerFn}
                setResetExercise={setResetExerciseFn}
                onStateChange={setCanCheckAnswer}
                onAnswerResult={(isCorrect) => {
                  if (isCorrect) {
                    setIsAnswerLocked(true);
                    setCheckAnswerFn(undefined);
                  }

                  if (!isCorrect) {
                    setShakeBoard(true);

                    setTimeout(() => {
                      setShakeBoard(false);
                    }, 500);
                  }

                  setFeedback({
                    open: true,
                    status: isCorrect ? "correct" : "wrong",
                  });
                }}
              />
            )}

            {exercise.type === "maze_runner" && (
              <MazeRunnerExercise
                key={exercise.id}
                exercise={exercise}
                setCheckAnswer={setCheckAnswerFn}
                setResetExercise={setResetExerciseFn}
                onStateChange={setCanCheckAnswer}
                onAnswerResult={(isCorrect) => {
                  if (isCorrect) {
                    setIsAnswerLocked(true);
                    setCheckAnswerFn(undefined);
                  }

                  if (!isCorrect) {
                    setShakeBoard(true);

                    setTimeout(() => {
                      setShakeBoard(false);
                    }, 500);
                  }

                  setFeedback({
                    open: true,
                    status: isCorrect ? "correct" : "wrong",
                  });
                }}
              />
            )}

            {exercise.type === "sorting" && (
              <SortingExercise
                key={exercise.id}
                exercise={exercise}
                setCheckAnswer={setCheckAnswerFn}
                setResetExercise={setResetExerciseFn}
                onStateChange={setCanCheckAnswer}
                onAnswerResult={(isCorrect) => {
                  if (isCorrect) {
                    setIsAnswerLocked(true);
                    setCheckAnswerFn(undefined);
                  }

                  if (!isCorrect) {
                    setShakeBoard(true);

                    setTimeout(() => {
                      setShakeBoard(false);
                    }, 500);
                  }

                  setFeedback({
                    open: true,
                    status: isCorrect ? "correct" : "wrong",
                  });
                }}
              />
            )}
          </div>
        </div>

        {/* ================= FLOATING BUTTONS ================= */}
        <div
          className="
          absolute

          bottom-[8%]
          right-[8%]

          z-50

          flex
          items-center
          gap-5
        ">
          {/* PETUNJUK BUTTON */}
          <button
            onClick={() => setShowTutorial(true)}
            className="
            flex
            items-center
            gap-3

            rounded-full

            bg-gradient-to-r
            from-[#3A63FF]
            to-[#3D8BFF]

            px-8
            py-4

            text-white
            font-black
            text-[24px]

            hover:scale-105
            transition-all
          "
            data-tutorial="btn-help">
            <img
              src="/imageAssets/sd/icon-lamp.png"
              alt="hint"
              className="w-10 h-10"
            />
            PETUNJUK
          </button>

          {/* CHECK */}
          <GameButton
            disabled={checkButtonDisabled}
            data-tutorial="btn-check"
            onClick={() => {
              if (isAnswerLocked) return;

              checkAnswerFn?.();
            }}
            variant="green"
            size="lg"
            icon={
              <img
                src="/imageAssets/sd/icon-magnifying.png"
                alt="check"
                className="w-10 h-10"
              />
            }>
            PERIKSA JAWABAN
          </GameButton>
        </div>

        {/* ================= BREADCRUMB ================= */}
        <div
          className="
          absolute
          bottom-8
          left-18
          px-6 md:px-10
          z-30
        ">
          <Breadcrumb
            items={[
              {
                label: "Beranda",
                href: "/map",
              },
              {
                label: shortText(modul?.judul),
                href: `/sd/eksplorasi/${modul?.id}`,
              },
              {
                label: shortText(lesson?.judul),
              },
            ]}
          />
        </div>

        {/* ================= OVERLAY LEADERBOARD ================= */}
        {showLeaderboard && (
          <div
            className="
                fixed
                inset-0
                z-[999]
                flex
                items-center
                justify-center
              ">
            <Leaderboard
              onClose={() => {
                handleCloseLeaderboard();
              }}
            />
          </div>
        )}

        {/* ================= OVERLAY TUTORIAL ================= */}
        {showTutorial && (
          <TutorialOverlay steps={tutorialSteps} onClose={closeTutorial} />
        )}

        {/* ================= STYLES ================= */}
        <style>{`
        .custom-scroll:has(*)::-webkit-scrollbar {
          width: 18px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(232, 232, 232, 0.36);
          border-radius: 14px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: white;
          border-radius: 14px;
        }
        
        @keyframes board-shake {
          0% {
            rotate: 0deg;
          }

          20% {
            rotate: -1deg;
          }

          40% {
            rotate: 1deg;
          }

          60% {
            rotate: -0.8deg;
          }

          80% {
            rotate: 0.8deg;
          }

          100% {
            rotate: 0deg;
          }
        }

        .animate-board-shake {
          animation: board-shake 0.45s ease;
        }
      `}</style>
      </div>
      {/* ================= MODAL FINISH ALL ================= */}
      {showFinishModal && (
        <div className="fixed inset-0 z-[9999] bg-[#1F0234]/67 items-center justify-center">
          {/* Modal */}
          <Modal
            title="KAMU HEBAT!!"
            width="w-[800px]"
            onClose={() => router.push("/map")}
            buttonText="KEMBALI KE MAP"
            buttonIcon={<IconFWorldMap size={30}></IconFWorldMap>}>
            {/* Content */}
            <div className=" flex flex-col gap-4 justify-center items-center">
              <IconFTrophy
                className="mt-4 justify-center items-center"
                size={300}></IconFTrophy>
              <div className=" flex flex-col gap-1 justify-center items-center">
                <p
                  className="
                text-center
                text-[22px]
                font-bold
                text-gray-800
                ">
                  Berhasil menyelesaikan semua!
                </p>
                <p
                  className="
                text-center
                text-l
                font-medium
                text-gray-700
                ">
                  Yuk, eksplorasi modul selanjutnya
                </p>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ================= MODAL FINISH LESSON ================= */}
      {showLessonFinishModal && (
        <div
          className="
          fixed
          inset-0
          z-[9999]
          bg-[#1F0234]/67
          flex
          items-center
          justify-center
        ">
          <Modal
            title="KAMU KEREN!"
            width="w-[800px]"
            onClose={() => router.push(`/sd/eksplorasi/${lesson?.id_modul}`)}
            buttonText="LANJUTKAN BELAJAR"
            buttonIcon={<IconFOpenBook size={30} />}>
            <div
              className="
              flex
              flex-col
              items-center
              gap-4
            ">
              <IconFPartyPopper size={250} />

              <p
                className="
                text-[22px]
                font-bold
                text-center
              ">
                Pelajaran berhasil diselesaikan!
              </p>

              <p
                className="
                text-gray-700
                text-center
              ">
                Ayo lanjutkan ke pelajaran berikutnya.
              </p>
            </div>
          </Modal>
        </div>
      )}
    </main>
  );
}
