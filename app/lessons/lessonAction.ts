'use server';
import { createClient } from '@/utils/supabase/server';

export async function fetchLessons() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('lessons').select('*');
  if (error) {
    console.error('Error fetching lessons:', error);
    return { data: [], error: error.message };
  }
  
  return { data: data || [], error: null };
}