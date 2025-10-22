import { createClient } from '@/utils/supabase/server';

export default async function Exercises() {
  const supabase = await createClient();
  const { data: exercises } = await supabase.from("exercises").select();

  return <pre>{JSON.stringify(exercises, null, 2)}</pre>
}