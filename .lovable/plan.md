## Problem Diagnosis

The app is completely broken because `authenticated` users cannot execute either `public.has_role` or `private.has_role`. Every table with an admin-related RLS policy fails because PostgreSQL throws an error (not just false) when evaluating a policy that calls a function the role can't execute.

### Root Cause

Previous security migrations revoked EXECUTE from `authenticated` on `public.has_role` and never granted EXECUTE on `private.has_role`. Since RLS policies on nearly every table reference one of these functions, ALL queries fail for authenticated users.

### Specific Issues Found

1. **`private.has_role`** — EXECUTE granted only to `postgres` and `service_role`. Missing: `authenticated`.
2. **`public.has_role`** — EXECUTE revoked from `authenticated` and `anon`. Still referenced by the "Pro users and admins can view categories" policy (unqualified call).
3. **Categories policy** — "Pro users and admins can view categories" calls `has_role(...)` without schema prefix, resolving to `public.has_role` instead of `private.has_role`.
4. **Duplicate `guard_plano_update` triggers** — Two triggers (`protect_plano_update` and `guard_plano_update_trg`) running the same function on `profiles`.
5. **Storage policies** — Use `private.has_role`, which `authenticated` can't call, so admin uploads and Pro user PDF reads fail.

### Plan

**Single SQL migration** to fix all issues:

1. **Grant EXECUTE on `private.has_role`** to `authenticated` — this is safe because the function is SECURITY DEFINER and only checks role membership (read-only). It must be callable from RLS policies.

2. **Drop and recreate the broken categories policy** — Replace "Pro users and admins can view categories" to use `private.has_role(...)` instead of unqualified `has_role(...)`.

3. **Drop the duplicate trigger** on `profiles` (`guard_plano_update_trg` or `protect_plano_update` — keep only one).

4. **Keep `public.has_role` locked down** — No EXECUTE for `authenticated`/`anon` since all policies should use the private version.

### Impact

- All authenticated users will be able to load categories, tools, profiles, lessons, modules, and site_settings again.
- Admin functionality (uploads, CRUD) will work via the edge function and RLS policies.
- No security downgrade — `private.has_role` is SECURITY DEFINER (runs as owner) and only performs a read check.
- The `anon` role already has direct SELECT policies on `categories` and `tools` (with `USING (true)`), so public visitors are unaffected.

### What will NOT be changed without your approval

- No RLS policies will be removed (only the broken one replaced)
- No tables altered
- No storage buckets modified
- RLS stays enabled everywhere
