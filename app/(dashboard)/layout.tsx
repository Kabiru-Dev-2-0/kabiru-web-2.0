import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  let initialUserName: string = '';
  let initialExp: number = 0;
  let penggunaId: number | undefined = undefined;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: pengguna } = await supabase
        .from('penggunas')
        .select('id, nama_lengkap')
        .eq('uuid', user.id)
        .single();

      if (pengguna) {
        penggunaId = pengguna.id as number;
        initialUserName = (pengguna as any)?.nama_lengkap ?? '';

        const { data: expRow } = await supabase
          .from('data_penggunas')
          .select('exp')
          .eq('id_pengguna', pengguna.id)
          .single();

        if (expRow) {
          initialExp = (expRow as any)?.exp ?? 0;
        }
      }
    }
  } catch {
    // ignore SSR header failures; header can still fallback client-side
  }

  return (
    <div className="flex h-screen w-full bg-[#FCFDFD]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          initialUserName={initialUserName}
          initialExp={initialExp}
          penggunaId={penggunaId}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
