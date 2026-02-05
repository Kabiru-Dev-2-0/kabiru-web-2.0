-- Function to delete the current user
-- This allows a user to delete their own account
create or replace function delete_current_user()
returns void
language sql
security definer
as $$
  -- Delete from auth.users which cascades to other tables if foreign keys are set correctly
  delete from auth.users where id = auth.uid();
$$;

-- Grant execute permission to authenticated users
grant execute on function delete_current_user() to authenticated;
