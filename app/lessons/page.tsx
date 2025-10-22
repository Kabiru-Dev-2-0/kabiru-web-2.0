'use client';
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import ExerciseRenderer from '@/components/ExerciseRenderer';
import { ProgressBar } from '@fluentui/react-components';
import { fetchLessons } from './action';

export default function Quiz() {
  const [exercises, setLessons] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data, error } = await fetchLessons();
      setLessons(data);
      setIsLoading(false);
      if (error || data.length === 0) {
        setError('Gagal memuat soal. Silakan coba lagi.');
      }
    }
    loadData();
  }, []);

  const progress = exercises.length > 0 ? (currentIndex + 1) / exercises.length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />
        <div className="container mx-auto p-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />
        <div className="container mx-auto p-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      <div className="container mx-auto p-4">
        <ProgressBar value={progress} className="mb-6" />
        <ExerciseRenderer exercises={exercises} />
      </div>
    </div>
  );
}