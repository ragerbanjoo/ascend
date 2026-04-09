# Supabase Setup for Pilgrim Hub

Step-by-step for Alex:

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** — copy **Project URL** and **anon key** — paste into `script.js` config block
3. Go to **SQL Editor** — run `supabase/migrations/001_hub_schema.sql`
4. Go to **Authentication > Providers > Email** — **ENABLE** email provider, **DISABLE** "Confirm email"
5. Go to **Authentication > URL Configuration** — set Site URL to `https://ascend.sjdyoungadults.com`
6. Go to **Storage** — verify `photos` bucket exists (created by migration), set to authenticated access
7. Go to [Cloudflare Dashboard > Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) — create a widget for `ascend.sjdyoungadults.com` — copy site key into `script.js`
8. In Cloudflare dashboard: enable **Bot Fight Mode**, set security level to **Medium**, enable WAF managed rules, add rate limit rule for auth endpoints (10 req/min)
9. Sign up on the live site as `alex` — **save your recovery phrase somewhere safe**
10. Go back to Supabase **SQL Editor** and run:
    ```sql
    update profiles set is_admin = true where username = 'alex';
    ```
11. Reload the site — `/admin.html` should now work

## Weekly Maintenance

Run this query in Supabase SQL Editor to clean up expired soft-deletes:

```sql
delete from auth.users where id in (
  select user_id from scheduled_deletions where scheduled_for < now()
);
```

This cascades everything via foreign keys — all related rows across all tables are wiped.

(Future enhancement: set up a Supabase Edge Function with a daily cron trigger to automate this.)

## Testing Checklist

1. Guest mode — packing, journal, notes all work with localStorage
2. Signup — username + password, recovery phrase shown, Turnstile passes
3. Recovery phrase — verify it's 12 words, copy/download works
4. Login — username + password, Turnstile passes
5. Encrypt/decrypt — journal entries save as ciphertext, display as plaintext
6. Export — ZIP downloads with all data, journal decrypted
7. Soft delete — account scheduled, 7-day grace, cancel works
8. Admin panel — user list, audit log, password reset (with journal destruction warning)
9. Audit log — user can see admin actions on their account
10. Sharing toggles — profile/packing/photos visibility
11. Photo upload — private and group modes
12. Rosary — pray flow, bead counter, log completion to prayer_log

## Important Security Notes

- The **anon key** in `script.js` is safe to expose — it's designed for client-side use
- **NEVER** put the service role key in client code
- RLS is enabled on every table — the anon key can only access data allowed by policies
- Encrypted fields (journal, intentions) are ciphertext — even with database access, content is unreadable without the user's password
