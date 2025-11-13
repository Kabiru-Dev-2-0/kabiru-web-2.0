import { createClient } from '@/utils/supabase/server';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function LogoutClient() {
  'use client';
  const router = useRouter();

  useEffect(() => {
    try {
      localStorage.removeItem('aizone.exp');
      localStorage.removeItem('aizone.userName');
    } catch {}
    router.replace('/');
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Melakukan logout...</p>
    </main>
  );
}

// Server component
export default async function LogoutPage() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (!error) {
    return <LogoutClient />;
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Logout gagal</h1>
      <p className="mt-2">Terjadi masalah saat logout. Silakan coba lagi.</p>
    </main>
  );
}
