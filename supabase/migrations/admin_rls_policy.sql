-- ============================================
-- Admin Table RLS Policy Setup
-- ============================================
-- This migration ensures only users with role = 'main' can SELECT from Admin table
-- Normal admins have zero access (no read, no relation)
-- Uses SECURITY DEFINER function to avoid recursive RLS issues
-- ============================================

-- Step 1: Enable RLS on Admin table
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow main admins to read Admin table" ON "Admin";
DROP POLICY IF EXISTS "Allow admins to read themselves" ON "Admin";
DROP POLICY IF EXISTS "Allow all admins to read Admin table" ON "Admin";

-- Step 3: Create a SECURITY DEFINER function to check if user is main admin
-- This function bypasses RLS to avoid recursion issues
CREATE OR REPLACE FUNCTION is_main_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role text;
BEGIN
  -- Query Admin table with SECURITY DEFINER (bypasses RLS)
  SELECT role INTO admin_role
  FROM "Admin"
  WHERE id = user_id;
  
  -- Return true only if role is 'main'
  RETURN admin_role = 'main';
END;
$$;

-- Step 4: Grant execute permission to authenticated users only
-- (Not granting to anon for security - only authenticated users should check admin roles)
GRANT EXECUTE ON FUNCTION is_main_admin(uuid) TO authenticated;

-- Step 5: Create RLS policy that only allows main admins to SELECT
-- This policy uses the function which bypasses RLS, preventing recursion
CREATE POLICY "Only main admins can read Admin table"
ON "Admin"
FOR SELECT
TO authenticated
USING (is_main_admin(auth.uid()));

-- Step 6: Ensure no other policies exist that would allow normal admins access
-- (No INSERT, UPDATE, DELETE policies needed - those are handled server-side via API routes)

-- Step 7: Verify the setup
-- The Admin table is now:
-- - RLS enabled
-- - Only main admins can SELECT (read)
-- - Normal admins have zero access
-- - No recursive RLS issues (function uses SECURITY DEFINER)
