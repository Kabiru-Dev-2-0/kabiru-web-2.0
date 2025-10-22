'use server';
import { createClient } from '@/utils/supabase/server';

export async function fetchExercises() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('exercises').select('*');
  if (error) {
    console.error('Error fetching exercises:', error);
    return { data: [], error: error.message };
  }
  
  return { data: data || [], error: null };
}