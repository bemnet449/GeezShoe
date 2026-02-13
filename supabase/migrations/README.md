# Admin Table RLS Migration

## Overview
This migration sets up Row Level Security (RLS) for the `Admin` table to ensure:
- Only users with `role = 'main'` can SELECT (read) from the Admin table
- Normal admins have **zero access** (no read, no relation)
- No recursive RLS issues occur
- No 500 errors from permission checks

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `admin_rls_policy.sql`
4. Paste and execute the SQL script
5. Verify the policies are created correctly

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Direct PostgreSQL Connection
```bash
psql -h <your-db-host> -U postgres -d postgres -f admin_rls_policy.sql
```

## What This Migration Does

1. **Enables RLS** on the Admin table
2. **Drops any existing policies** that might allow normal admins access
3. **Creates a SECURITY DEFINER function** (`is_main_admin`) that bypasses RLS to check roles
   - This prevents recursive RLS issues
   - The function runs with elevated privileges to read the Admin table
4. **Creates a SELECT policy** that only allows main admins to read
5. **Grants execute permission** on the function to authenticated users

## Security Features

- ✅ **No recursion**: The `is_main_admin()` function uses `SECURITY DEFINER` to bypass RLS
- ✅ **Zero access for normal admins**: Normal admins cannot read any Admin records
- ✅ **Main admin only**: Only users with `role = 'main'` can SELECT from Admin table
- ✅ **Server-side operations**: INSERT, UPDATE, DELETE are handled via API routes using service role

## Testing

After applying the migration, test:

1. **As a main admin**: Should be able to see Admin Management link and access the page
2. **As a normal admin**: Should NOT see Admin Management link and should be redirected if accessing directly
3. **As unauthenticated**: Should be redirected to login

## Troubleshooting

### Error: "permission denied for table Admin"
- This is expected for normal admins
- The client-side code handles this gracefully
- Main admins should not see this error

### Error: "function is_main_admin does not exist"
- Make sure you ran the entire migration script
- Check that the function was created: `SELECT * FROM pg_proc WHERE proname = 'is_main_admin';`

### Recursive RLS errors
- The `SECURITY DEFINER` function prevents recursion
- If you see recursion errors, verify the function was created correctly

## Rollback (if needed)

```sql
-- Disable RLS (not recommended for production)
ALTER TABLE "Admin" DISABLE ROW LEVEL SECURITY;

-- Or drop the policy
DROP POLICY IF EXISTS "Only main admins can read Admin table" ON "Admin";
DROP FUNCTION IF EXISTS is_main_admin(uuid);
```
