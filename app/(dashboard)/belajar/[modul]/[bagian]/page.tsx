'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { LearningPathVisual } from '@/components/learning-path-visual';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CircularProgress } from '@heroui/progress';

interface Stage {
  id: number;
  nomor_latihan: number;
  unit_name: string;
  judul: string;
  status: 'completed' | 'current' | 'locked';
  progres: number;
  isEntry?: boolean;
}

export default function BagianPage() {
  const params = useParams();
  const router = useRouter();
  const bagian = params.bagian as string;
  const modulId = params.modul as string;

  useEffect(() => {
    if (modulId) {
      router.replace(`/belajar/${modulId}/units`);
    }
  }, [modulId]);
  return null;
}
