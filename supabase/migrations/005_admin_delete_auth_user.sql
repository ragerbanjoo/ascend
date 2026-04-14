-- Run this in your Supabase SQL Editor.
-- Creates a function that allows admins to fully delete a user
-- (including their auth.users record) so the username can be reused.

CREATE OR REPLACE FUNCTION admin_delete_auth_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can delete auth users';
  END IF;

  -- Delete from auth.users (cascades auth sessions, etc.)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
