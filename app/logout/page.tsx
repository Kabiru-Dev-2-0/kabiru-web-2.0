"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        await supabase.auth.signOut();
      } catch {}
      try {
        localStorage.removeItem('aizone.exp');
        localStorage.removeItem('aizone.userName');
      } catch {}
      router.replace('/');
    })();
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Melakukan logout...</p>
    </main>
  );
}
