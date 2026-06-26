"use client";

import { create } from "zustand";

import { persist } from "zustand/middleware";

type GameStore = {
  // =========================
  // EXP
  // =========================
  exp: number;

  addExp: (
    amount: number
  ) => void;

  resetExp: () => void;

  // =========================
  // LESSON PROGRESS
  // =========================
  unlockedLessons: number[];

  completedLessons: number[];

  unlockLesson: (
    lessonId: number
  ) => void;

  completeLesson: (
    lessonId: number
  ) => void;


  // =========================
  // EXERCISES PROGRESS
  // =========================
  completedExercises: number[];

  completeExercise: (
  exerciseId: number
  ) => void;

  resetProgress: () => void;
};

export const useGameStore =
  create<GameStore>()(
    persist(
      (set) => ({
        // =========================
        // INITIAL STATE
        // =========================
        exp: 0,

        // lesson pertama otomatis kebuka
        unlockedLessons: [1],

        completedLessons: [],

        completedExercises: [],

        // =========================
        // EXP ACTIONS
        // =========================
        addExp: (amount) =>
          set((state) => ({
            exp:
              state.exp + amount,
          })),

        resetExp: () =>
          set({
            exp: 0,
          }),

        // =========================
        // UNLOCK LESSON
        // =========================
        unlockLesson: (
          lessonId
        ) =>
          set((state) => ({
            unlockedLessons: Array.from(
            new Set<number>([
                ...state.unlockedLessons,
                lessonId,
            ])
            ),
          })),

        // =========================
        // COMPLETE LESSON
        // =========================
        completeLesson: (
          lessonId
        ) =>
          set((state) => ({
            completedLessons: Array.from(
            new Set<number>([
                ...state.completedLessons,
                lessonId,
            ])
            ),
          })),

        // =========================
        // COMPLETE EXERCISE
        // =========================
        completeExercise: (
          exerciseId
        ) =>
          set((state) => ({
            completedExercises:
              Array.from(
                new Set<number>([
                  ...state.completedExercises,
                  exerciseId,
                ])
              ),
          })),

        // =========================
        // RESET ALL PROGRESS
        // =========================
        resetProgress: () =>
          set({
            unlockedLessons: [1],
            completedLessons: [],
            completedExercises: [],
          }),
      }),
      {
        name: "kabiru-game",
      }
    )
  );