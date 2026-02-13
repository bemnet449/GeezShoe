-- Admin table schema and RLS policies
-- Run this in Supabase SQL Editor. Safe to re-run (drops and recreates policies).

-- Create Admin table (skip if already exists)
CREATE TABLE IF NOT EXISTS "Admin" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('main', 'normal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS "main_admin_select" ON "Admin";
DROP POLICY IF EXISTS "main_admin_insert" ON "Admin";
DROP POLICY IF EXISTS "main_admin_update" ON "Admin";
DROP POLICY IF EXISTS "main_admin_delete" ON "Admin";

-- Only main admins can SELECT (normal admins: zero access)
CREATE POLICY "main_admin_select" ON "Admin"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Admin" a
      WHERE a.id = auth.uid() AND a.role = 'main'
    )
  );

-- Only main admins can INSERT
CREATE POLICY "main_admin_insert" ON "Admin"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Admin" a
      WHERE a.id = auth.uid() AND a.role = 'main'
    )
  );

-- Only main admins can UPDATE
CREATE POLICY "main_admin_update" ON "Admin"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Admin" a
      WHERE a.id = auth.uid() AND a.role = 'main'
    )
  );

-- Only main admins can DELETE
CREATE POLICY "main_admin_delete" ON "Admin"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Admin" a
      WHERE a.id = auth.uid() AND a.role = 'main'
    )
  );

-- IMPORTANT: First main admin must be inserted via API (service role bypasses RLS) or SQL:
-- INSERT INTO "Admin" (id, name, email, role) VALUES ('auth-users-uuid', 'Main Admin', 'admin@example.com', 'main');
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role":"main"}'::jsonb WHERE id = 'auth-users-uuid';
