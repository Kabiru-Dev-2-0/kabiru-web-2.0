-- Function to delete the current user
-- This allows a user to delete their own account and all associated data
-- Jalankan script ini di Supabase SQL Editor untuk mengupdate fungsi

create or replace function delete_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
DECLARE
  v_user_id uuid;
  v_pengguna_id bigint;
BEGIN
  v_user_id := auth.uid();
  
  -- Get penggunas id (if exists)
  SELECT id INTO v_pengguna_id FROM public.penggunas WHERE uuid = v_user_id;

  -- 1. Delete data tied to public.penggunas (id) - BIGINT references
  IF v_pengguna_id IS NOT NULL THEN
    -- Delete from data_penggunas
    DELETE FROM public.data_penggunas WHERE id_pengguna = v_pengguna_id;
    
    -- Delete from tantangan_pengguna
    DELETE FROM public.tantangan_pengguna WHERE id_pengguna = v_pengguna_id;
    
    -- Delete from login_activities
    DELETE FROM public.login_activities WHERE id_pengguna = v_pengguna_id;
    
    -- Delete from tantangan_claims (if exists)
    BEGIN
      DELETE FROM public.tantangan_claims WHERE id_pengguna = v_pengguna_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;
    
    -- Delete from user_daily_learning_summary (if exists)
    BEGIN
      DELETE FROM public.user_daily_learning_summary WHERE id_pengguna = v_pengguna_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;
    
    -- Delete from hasil_latihans (if exists)
    BEGIN
      DELETE FROM public.hasil_latihans WHERE id_pengguna = v_pengguna_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;

    -- Delete the penggunas record itself
    DELETE FROM public.penggunas WHERE id = v_pengguna_id;
  END IF;

  -- 2. Delete data tied to auth.users (uuid) directly - UUID references
  
  -- Delete from chat_sessions (this cascades to chat_messages)
  BEGIN
    DELETE FROM public.chat_sessions WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Delete from progres_penggunas (if exists)
  BEGIN
    DELETE FROM public.progres_penggunas WHERE id_pengguna = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Delete from progres_latihans (if exists)
  BEGIN
    DELETE FROM public.progres_latihans WHERE id_pengguna = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- 3. Finally delete the auth user
  -- This is the critical step. If this fails, the whole transaction rolls back.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- Grant execute permission to authenticated users
grant execute on function delete_current_user() to authenticated;
