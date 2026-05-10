# Claude Code Prompt — Pilgrim Hub + Trust Architecture

> Paste into Claude Code from the project root. All placeholders marked `[PLACEHOLDER: ...]`.

---

**ultrathink** about this carefully before writing code. This is a hybrid static + authenticated app with real cryptography, a trust architecture, and a ported sub-app. Plan the auth flow, client-side encryption, guest-to-account migration, database schema, security model, rosary port, sharing system, admin panel, audit logging, and data export/deletion as one coherent system before touching any files.

**Read these skills first:**

1. **`/mnt/skills/public/frontend-design/SKILL.md`** — required. Hub must match the site (midnight navy + gold, Cormorant Garamond + Inter, ASCEND brand).
2. **`/mnt/skills/public/skill-creator/SKILL.md`** — skim if useful.

After reading, plan the full system before coding.

---

# Part 1 — Site-wide updates (ALL pages)

## Contacts

- **Alex** (lead, admin) — +1 (509) 306-0440 — alex@sjdyoungadults.com
- **Gaby** — +1 (509) 823-9987 — gaby@sjdyoungadults.com
- **Bright Minds** — [PLACEHOLDER: phone] — [PLACEHOLDER: email]

All phones tappable (`tel:`), all emails tappable (`mailto:`).

## Footer (all pages)

Remove existing copyright line. Replace with: **made with ♥ by alex** (lowercase), where ♥ is an inline SVG heart in gold `#c9a14a`:

```html
<svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a14a" aria-label="heart">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
```

Also add to footer: link to public source code at https://github.com/ragerbanjoo/ascend — label: "open source". And a link to `security.html` labeled "security".

## Group Rules — add to home, parents, hub

Heading: **"How we roll together"**. Gold bullets on dark, Cormorant Garamond heading, Inter body. Calm, not preachy.

1. No profanity (limit cussing)
2. No PDA
3. Competitive — keep it respectful
4. Be nice
5. No phones in sight during group time
6. No yelling — keep things friendly

---

# Part 2 — Pilgrim Hub (replaces `packing.html`)

Rename `packing.html` → `hub.html`. Update nav across all pages: "Packing" → "Hub" (grid/dashboard icon).

## Two modes

**Guest**: localStorage. Persistent banner: *"You're a guest — your data will be lost if you clear your browser. [Save your progress →]"*

**Authenticated**: Supabase with username + password, client-side encryption for sensitive content. Data syncs across devices. On signup, migrate localStorage → account.

## First-visit modal

```
Welcome, pilgrim.
Save your packing list, journal, prayer log, notes, and photos.

[ Create a free account ] [ Continue as guest ]

Accounts use a username and password — no email needed.
Your journal and private intentions are encrypted end-to-end.
Only you can read them.
```

Save the choice so modal doesn't show again.

---

# Part 3 — Auth (username + password, no email)

Supabase Auth requires email internally. Use `<username>@sjd-yag.local` as the internal email — user never sees it.

## Signup flow

1. User enters **username** (3–20 chars, lowercase alphanumeric + underscores) and **password** (min 10 chars)
2. **zxcvbn** password strength check (CDN), require score ≥ 3, show live meter
3. **Cloudflare Turnstile** validates human
4. Honeypot hidden field — silently reject if filled
5. Check username uniqueness against `profiles.username`
6. **Derive encryption key** from password in browser (see Part 4)
7. **Generate 12-word BIP39 recovery phrase** in browser
8. **Show recovery phrase screen** (see Part 4) — require user to confirm they saved it
9. Call `supabase.auth.signUp({ email: '<username>@sjd-yag.local', password })`
10. Insert `profiles` row with username, display name, saint icon, encryption metadata
11. Run `migrateGuestDataToAccount()`
12. Auto-login, redirect to hub

## Login flow

1. Username + password + Turnstile
2. Construct internal email, call `signInWithPassword`
3. **Derive encryption key** from password in browser (key stays in memory only)
4. Track failures in `failed_logins`; 5 failures in 10 min → lock 15 min
5. Generic error: "Invalid username or password" (no enumeration)
6. On success: load session, decrypt content on-demand

## Forgot password recovery (3 paths)

**Path 1 — Recovery phrase** (true self-service recovery):
- User enters username + 12-word phrase + new password
- Browser uses recovery phrase to unlock the encryption key
- Re-encrypts key with new password
- Updates Supabase password

**Path 2 — Admin password reset** (loses encrypted data):
- Alex resets from admin panel
- ⚠️ Clear warning: "Resetting the password WILL PERMANENTLY DESTROY the user's encrypted journal and private intentions. Everything else is preserved."
- Confirmation modal requires typing "DELETE JOURNAL" to confirm
- After reset, the encrypted journal/intentions rows are deleted from the database

**Path 3 — Accept data loss**:
- User can always delete account and start over

---

# Part 4 — Client-side encryption (Option C)

Encrypt **only** `journal_entries` and `private_intentions`. Everything else stays plaintext so admin moderation and features work.

## Tech

Web Crypto API (built into browsers, no library). AES-GCM for content, PBKDF2 for key derivation.

## Key derivation

```javascript
// On signup or login, derive the content encryption key (CEK) from password
async function deriveKeyFromPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 250000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}
```

## Recovery phrase

Generate a 12-word BIP39-style phrase on signup (use a word list — can be embedded, or use `bip39` via CDN). The recovery phrase is a **secondary** way to unlock the encryption key.

**How it works:**
- Encryption key (CEK) is the actual key used to encrypt content
- CEK is encrypted twice:
  - Once with a key derived from the password → stored in `profiles.cek_password_wrapped`
  - Once with a key derived from the recovery phrase → stored in `profiles.cek_phrase_wrapped`
- Login with password → unwrap CEK with password-derived key
- Login with recovery phrase → unwrap CEK with phrase-derived key, then re-wrap with new password

## Recovery phrase UI (critical screen)

Shown after password entry during signup. Full-screen modal:

```
🔑 Your Recovery Phrase

Your journal and private intentions are encrypted with your password.
If you forget your password, this 12-word phrase is the only way to
get them back.

[word1]  [word2]  [word3]  [word4]
[word5]  [word6]  [word7]  [word8]
[word9]  [word10] [word11] [word12]

[ 📋 Copy to clipboard ]
[ 📥 Download as text file ]

⚠️ Write this down somewhere safe. Screenshot it. Email it to yourself.
Alex cannot recover this for you. If you lose both your password AND
this phrase, your journal is gone forever.

[ I've saved this somewhere safe — continue ]
```

The continue button is disabled for 10 seconds to force users to actually look at it.

## Encrypted tables

Journal and private intentions store ciphertext, not plaintext:

```sql
-- In journal_entries and private_intentions:
-- Instead of storing body/text directly, store:
--   ciphertext text    (base64 of encrypted content)
--   iv text            (base64 of AES-GCM initialization vector)
-- Title of journal entry CAN stay plaintext or be encrypted too — encrypt it for consistency
```

## Session key storage

After login, the derived CEK lives **only in memory** (JS variable, never localStorage, never sessionStorage). On page refresh, user is prompted for password again to re-derive.

**Optional comfort feature**: keep the CEK in memory across tab switches using a `ServiceWorker` or `BroadcastChannel` if needed, but never persist to disk.

## What admins (alex) can see after encryption

- ✅ All plaintext tables (packing, notes, prayer log, photos, profiles, sharing prefs)
- ❌ Journal content (ciphertext only — literally unreadable)
- ❌ Private intentions content (ciphertext only)
- ✅ Journal and intentions metadata: timestamps, counts

---

# Part 5 — Database schema

Create `supabase/migrations/001_hub_schema.sql`.

```sql
-- ============================================
-- SJD YAG × ASCEND Pilgrim Hub Schema
-- Includes client-side encryption fields
-- ============================================

-- profiles: extends auth.users, stores wrapped encryption key
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  saint_icon text,
  is_admin boolean default false,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  -- encryption metadata
  salt text,                    -- base64 PBKDF2 salt for password
  cek_password_wrapped text,    -- CEK encrypted with password-derived key
  cek_password_iv text,         -- IV for password wrap
  cek_phrase_wrapped text,      -- CEK encrypted with recovery-phrase-derived key
  cek_phrase_iv text,           -- IV for phrase wrap
  phrase_salt text              -- base64 salt for phrase derivation
);
create index on profiles(username);

-- sharing_preferences
create table sharing_preferences (
  user_id uuid primary key references auth.users on delete cascade,
  share_profile boolean default false,
  share_packing_progress boolean default false,
  share_photos boolean default false,
  updated_at timestamptz default now()
);

-- packing_items (plaintext)
create table packing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  item_key text not null,
  checked boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, item_key)
);

-- journal_entries (ENCRYPTED)
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title_ciphertext text,
  title_iv text,
  body_ciphertext text,
  body_iv text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- talk_notes (plaintext)
create table talk_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  speaker text,
  talk_title text,
  notes text,
  created_at timestamptz default now()
);

-- prayer_log (plaintext)
create table prayer_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  prayer_type text,
  detail text,
  prayed_at timestamptz default now()
);

-- private_intentions (ENCRYPTED)
create table private_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  text_ciphertext text not null,
  text_iv text not null,
  answered boolean default false,
  created_at timestamptz default now()
);

-- photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  storage_path text not null,
  caption text,
  visibility text not null check (visibility in ('private', 'group')),
  created_at timestamptz default now()
);
create index on photos(user_id);
create index on photos(visibility);

-- failed_logins
create table failed_logins (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  attempted_at timestamptz default now(),
  ip_hash text
);
create index on failed_logins(username, attempted_at);

-- scheduled_deletions (soft delete with 7-day grace)
create table scheduled_deletions (
  user_id uuid primary key references auth.users on delete cascade,
  scheduled_for timestamptz not null,
  requested_at timestamptz default now()
);

-- admin_access_log (audit trail)
create table admin_access_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users,
  admin_username text,
  action text not null,             -- 'view_user' | 'delete_user' | 'reset_password' | 'lock_account' | 'toggle_admin' | 'delete_group_photo'
  target_user_id uuid,
  target_username text,
  details text,
  created_at timestamptz default now()
);
create index on admin_access_log(target_user_id);
create index on admin_access_log(created_at);
```

## RLS policies

```sql
alter table profiles enable row level security;
alter table sharing_preferences enable row level security;
alter table packing_items enable row level security;
alter table journal_entries enable row level security;
alter table talk_notes enable row level security;
alter table prayer_log enable row level security;
alter table private_intentions enable row level security;
alter table photos enable row level security;
alter table failed_logins enable row level security;
alter table scheduled_deletions enable row level security;
alter table admin_access_log enable row level security;

-- profiles
create policy "Own profile" on profiles for select using (auth.uid() = id);
create policy "Shared profiles visible" on profiles for select
  using (
    exists (select 1 from sharing_preferences where user_id = profiles.id and share_profile = true)
    and auth.role() = 'authenticated'
  );
create policy "Admins see all profiles" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
create policy "Own profile update" on profiles for update using (auth.uid() = id);
create policy "Own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "Admin delete profiles" on profiles for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Own sharing prefs" on sharing_preferences for all using (auth.uid() = user_id);

create policy "Own packing" on packing_items for all using (auth.uid() = user_id);
create policy "Shared packing visible" on packing_items for select
  using (
    exists (select 1 from sharing_preferences where user_id = packing_items.user_id and share_packing_progress = true)
    and auth.role() = 'authenticated'
  );

create policy "Own journal only" on journal_entries for all using (auth.uid() = user_id);
create policy "Own talk notes" on talk_notes for all using (auth.uid() = user_id);
create policy "Own prayer log" on prayer_log for all using (auth.uid() = user_id);
create policy "Own intentions" on private_intentions for all using (auth.uid() = user_id);

create policy "Own photos" on photos for all using (auth.uid() = user_id);
create policy "Group photos visible" on photos for select
  using (visibility = 'group' and auth.role() = 'authenticated');
create policy "Shared individual photos" on photos for select
  using (
    visibility = 'private'
    and exists (select 1 from sharing_preferences where user_id = photos.user_id and share_photos = true)
    and auth.role() = 'authenticated'
  );

create policy "Admin reads failed logins" on failed_logins for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- scheduled_deletions: user can see/cancel own; admins see all
create policy "Own deletion" on scheduled_deletions for all using (auth.uid() = user_id);
create policy "Admin sees deletions" on scheduled_deletions for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- admin_access_log: admins insert; users can read their own audit trail; admins read all
create policy "Admin writes log" on admin_access_log for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
create policy "User reads own audit log" on admin_access_log for select using (auth.uid() = target_user_id);
create policy "Admin reads all logs" on admin_access_log for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
```

## Storage bucket (Supabase Storage)

```sql
insert into storage.buckets (id, name, public) values ('photos', 'photos', false);

create policy "Users upload own photos" on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read own photos" on storage.objects for select
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Authenticated read group photos" on storage.objects for select
  using (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and exists (select 1 from photos where storage_path = storage.objects.name and visibility = 'group')
  );
create policy "Users delete own photos" on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
```

Photo path format: `{user_id}/{filename}`.

## Bootstrap admin (run after alex signs up)

```sql
update profiles set is_admin = true where username = 'alex';
```

---

# Part 6 — Hub layout (`hub.html`)

Dashboard grid. Mobile: single column. Desktop: 2-column.

## Top bar
- "Welcome, @username" or "Welcome, pilgrim"
- Saint icon, account pill (Guest/Signed in)
- Guest: "Save your progress" → auth modal
- Authed: dropdown → Account Settings · Sharing · Privacy · Export · Sign out
- **Alex only**: extra "Admin Panel" link

## Hero — Right Now
- Current/next timeline stop (time-aware)
- Countdown to next stop
- Weather at next destination [PLACEHOLDER: optional Open-Meteo]
- "View full timeline →"

## Tiles

### 1 — 📦 Packing Checklist (plaintext)
Existing checklist. Animated checkboxes, progress bar. Guest: localStorage. Authed: `packing_items`.

### 2 — 📓 Journal (ENCRYPTED, always private)
New entry button + list. Title + textarea editor, autosave every 5 seconds. Each entry encrypted before upload, decrypted on view. Export as PDF button (decrypts + generates PDF in browser).

**Inline privacy notice next to the editor:**
> 🔒 *Your journal is encrypted in your browser with your password. Not even Alex can read this.*

### 3 — 📿 Rosary (PORTED from `/rosary/`)
1. Read all files in `/rosary/` folder
2. Port into `/hub/rosary.html` (or full-screen modal)
3. Restyle to ASCEND brand: midnight navy + gold, Cormorant Garamond headings, Inter body
4. Keep all functionality
5. On rosary completion → "Log this rosary" → `prayer_log`

### 4 — 📝 Talk Notes (plaintext)
Speaker dropdown, title + notes. Stores to `talk_notes`. Sortable, exportable.

### 5 — 🙏 Private Intentions (ENCRYPTED)
Personal, private. Add/mark answered/delete. Encrypted like journal. Counter at top.

Inline notice: *"🔒 Encrypted. Only you can read these."*

### 6 — 📸 Photo Gallery
Three modes on upload: Private / Group Album / Shared via sharing prefs.

Sub-tabs: **My Photos** · **Group Album** · **Friends' Shared**

Upload: Supabase Storage bucket `photos`. Client-side compress (max 1920px, JPEG 85). Max 5MB. JPEG/PNG/HEIC. Path: `{user_id}/{filename}`.

### 7 — ⛪ Confession Prep
Examination of conscience (Ten Commandments). Act of Contrition. Confession times:
- ASCEND Saturday — 8:00 AM main hall
- North American Martyrs — Sundays during Mass when a second priest is available
- St. James Cathedral — check schedule

### 8 — 📖 Daily Readings & Saint of the Day
**Placeholder tile — "Coming soon"**. Build container, don't wire API. [PLACEHOLDER: v2]

### 9 — 🆘 Emergency Info
- Alex — +1 (509) 306-0440 — alex@sjdyoungadults.com
- Gaby — +1 (509) 823-9987 — gaby@sjdyoungadults.com
- Bright Minds — [PLACEHOLDER]
- Hotel: La Quinta Lynnwood — (425) 775-7447
- "I'm lost" → timeline.html
- Nearest hospitals [PLACEHOLDER]
- "Open in Maps" for all trip addresses

### 10 — 📜 Group Rules
The 6 rules. Heading: "How we roll together."

### 11 — 👥 Friends
Lists pilgrims who opted into sharing. Each card shows what they shared. Opt-in only.

### 12 — 🔐 My Privacy & Data
Links to:
- Privacy & Trust page (`privacy.html`)
- Security Measures page (`security.html`)
- My audit log (who accessed my account and when)
- Export all my data
- Delete my account

---

# Part 7 — Account Settings (modal)

- Change username (validated)
- Change password (requires current password; re-wraps CEK)
- Change display name, saint icon
- **Sharing Preferences** (granular):
  - [ ] Share my profile
  - [ ] Share my packing progress
  - [ ] Share my private photos
  - Journal always private (grayed: "Your journal is yours alone.")
- **View my audit log** → who has accessed my account
- **Export all my data** (see Part 9)
- **Delete my account** (see Part 10)
- Sign out

---

# Part 8 — Privacy & Trust page (`privacy.html`)

New page, linked from hub and footer. Radically honest.

## Sections

### What we can see

> **Plaintext in the database** (Alex as database admin can technically read):
> - Username, display name, saint icon
> - Packing progress
> - Talk notes from speakers
> - Prayer log (which prayers, when)
> - Photos you upload
>
> **Encrypted in your browser** (nobody can read without your password):
> - 🔒 Journal entries
> - 🔒 Private intentions
>
> These are encrypted with a key derived from your password using PBKDF2 and AES-GCM, industry-standard cryptography. The encryption happens in your browser before anything is sent to the database. Even Alex, who owns the database, sees only scrambled text.

### What Alex promises

> Alex owns this site and the database behind it. Here's what Alex commits to:
>
> - **Never** read any plaintext personal content without your explicit permission
> - **Never** share your data with anyone outside the group
> - **Never** use your data for ads, tracking, or analytics
> - **Always** log every admin action so you can see it
> - **Always** let you export your data
> - **Always** let you delete your account
>
> These are trust promises, not technical guarantees. You can verify the audit log is real and view it at any time in your account settings.

### Your rights

> - **Export**: download everything you've written as a ZIP file, at any time
> - **Delete**: delete your account and all your data, with a 7-day recovery window
> - **Audit**: see every admin action taken on your account
> - **Privacy**: choose what (if anything) to share with other pilgrims
> - **Review the code**: this site is open source at [PLACEHOLDER: GitHub URL]. You can read exactly what it does.

### What happens if you forget your password

> - You can use your **12-word recovery phrase** to get your encrypted journal and intentions back
> - If you lose BOTH your password and your recovery phrase, your encrypted content is gone forever. Not even Alex can recover it.
> - Your plaintext content (packing, notes, photos) can still be recovered by Alex if needed
> - **Write down your recovery phrase. Screenshot it. Email it to yourself. Don't lose it.**

### Contact

If you have questions about your privacy or want to request something special: alex@sjdyoungadults.com

---

# Part 8.5 — Security page (`security.html`)

New page linked from the footer and from the Privacy & Trust page. This is a plain-English walkthrough of every security measure the site uses, so users can verify what's protecting them. Same radical transparency principle as the privacy page.

## Header

> **🛡️ Security Measures**
>
> We take security seriously because you're trusting us with personal, spiritual content. Here's exactly what protects you — every layer, in plain English. You can verify all of this in our [open source code](https://github.com/ragerbanjoo/ascend).

## Sections

### 🔐 Your account

- **Username + password** (no email required — we respect that you don't want to give us one)
- **Passwords are hashed with bcrypt** — we never store your actual password, only a one-way cryptographic fingerprint. Even we can't read it.
- **Minimum password strength enforced** using zxcvbn — weak passwords are rejected with helpful guidance
- **Account lockout after 5 failed login attempts in 10 minutes** — blocks brute-force attacks
- **Generic error messages** — we never tell an attacker whether a username exists or the password was wrong, only "Invalid username or password"

### 🔑 End-to-end encryption for your journal

- Your **journal entries** and **private intentions** are encrypted **in your browser** before being sent to the database
- We use **AES-GCM 256-bit** encryption — the same standard used by banks and governments
- The encryption key is derived from your password using **PBKDF2 with 250,000 iterations** — an industry-standard key derivation function that makes brute-forcing the key computationally infeasible
- Your encryption key **lives only in your browser memory** during your session — it's never stored on disk, never sent to the server, never logged
- Even Alex, who owns the database, sees only ciphertext for these fields
- If you want to verify this, open the browser developer tools on the hub page and look at the network requests — you'll see the encrypted blobs going to and from the server

### 🔁 Recovery phrase

- On signup, you receive a **12-word BIP39 recovery phrase** generated with a cryptographically secure random number generator
- This phrase is a secondary way to unlock your encryption key if you forget your password
- The phrase-derived key is used to encrypt a copy of your content encryption key, which is stored alongside the password-wrapped copy
- If you lose both your password AND your recovery phrase, your encrypted content is mathematically unrecoverable — **not even we can decrypt it**

### 🤖 Bot & abuse protection

- **Cloudflare Turnstile** on every signup and login — a privacy-friendly alternative to CAPTCHA that verifies you're human without asking you to click on fire hydrants
- **Honeypot field** on the signup form — a hidden field that real humans can't see; if it gets filled, we know it's a bot
- **Cloudflare Bot Fight Mode** blocks known bot traffic at the network edge before it ever reaches our site
- **Rate limiting**: maximum 10 authentication requests per minute per IP address — stops credential-stuffing attacks

### 🗄️ Database security (Supabase)

- **Row-Level Security (RLS)** is enabled on every single database table
- RLS policies enforce that you can only read and write your own data — verified cryptographically by Supabase on every query
- For example, the journal policy is: `auth.uid() = user_id` — meaning "you can only see rows where the user ID matches your authenticated session"
- The policies are defined in [our migration file](https://github.com/ragerbanjoo/ascend/blob/main/supabase/migrations/001_hub_schema.sql) — you can read them yourself
- Only the **Supabase anon key** is in our client code (it's designed to be safe to expose); the **service role key** that bypasses RLS is never in the codebase
- The database itself is hosted by Supabase on AWS with encryption at rest and in transit

### 🌐 Network security

- **All traffic is HTTPS only** — encrypted in transit
- **Strict security headers** set via Netlify:
  - `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
  - `X-Content-Type-Options: nosniff` — prevents MIME sniffing attacks
  - `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leakage
  - `Permissions-Policy` — denies access to geolocation, microphone, camera
  - **Content Security Policy (CSP)** — tightly restricts where scripts, styles, fonts, images, and connections can come from
- **Cloudflare WAF** (Web Application Firewall) blocks known attack patterns at the edge
- **DNSSEC** and DDoS protection via Cloudflare

### 🧼 Input sanitization

- All user-generated content is rendered as **plain text only** (using `textContent`, never `innerHTML`)
- This means if anyone ever tried to inject malicious HTML or JavaScript into their journal, notes, or intentions, it would display as literal text — the XSS attack would fail
- All database queries use parameterized SDK calls — **SQL injection is impossible** by design
- Honeypot traps silently reject bot submissions without tipping them off

### 📜 Audit logging

- Every action taken in the admin panel is **automatically logged** to an immutable audit table
- The log records: who performed the action, when, on whom, and what
- **You can view your own audit log** in Account Settings to see every time your account was accessed by an admin
- If Alex ever looked at something he shouldn't, it's on the record — and you can see it

### 🗑️ Soft delete & recovery

- When you delete your account, we don't immediately erase your data
- Your account is scheduled for deletion **7 days in the future**
- During that window, you can log in and cancel the deletion with one click
- After 7 days, the data is permanently deleted — and because of database cascade rules, every related row across every table is wiped
- Before deletion, we offer you a full export so you can keep your journey forever

### 🔓 What we deliberately chose NOT to do

Transparency includes admitting the limits of what we built:

- **We don't use two-factor authentication (2FA)** — it adds friction for a group that's already reluctant about email. If you want 2FA in the future, let us know.
- **We don't have a full security team** — this is built by one person (Alex) for a small group. We're not a bank.
- **Client-side encryption only protects journal and intentions** — packing, notes, prayer log, and photos are plaintext so admin moderation and features work. If you want something truly private, put it in the journal.
- **Session keys live in browser memory** — if someone gets physical access to your phone while you're logged in, they can read your decrypted journal. Lock your phone.

### 🐛 Found a security issue?

If you find a vulnerability, please email alex@sjdyoungadults.com directly. We'll fix it and credit you if you want.

### 📖 Verify it yourself

All of this is verifiable in our source code: [github.com/ragerbanjoo/ascend](https://github.com/ragerbanjoo/ascend)

Specific files to check:
- **`script.js`** — auth flow, encryption module, rate limiting
- **`supabase/migrations/001_hub_schema.sql`** — RLS policies
- **`_headers`** — security headers
- **`hub.html`** — how user input is rendered (plain text only)

We don't ask you to trust us. We give you everything you need to verify us.

---

# Part 9 — Export All My Data

Button in Account Settings: **"Export all my data"**. Generates a ZIP client-side with:

1. `profile.json` — username, display name, created date, last seen
2. `packing.json` — all packing items
3. `journal.json` — decrypted journal entries (title + body + dates)
4. `journal.pdf` — beautifully formatted PDF of all journal entries, in order, with dates (use `jsPDF` via CDN)
5. `talk-notes.json` — all talk notes
6. `prayer-log.json` — prayer history
7. `intentions.json` — decrypted private intentions
8. `audit-log.json` — who accessed your account and when
9. `photos/` folder — all photos you uploaded (original files)
10. `README.txt` — explains what each file is, the date exported, and a note: "This is your pilgrimage. Keep it forever."

Use `JSZip` via CDN for the ZIP. Filename: `sjd-pilgrimage-{username}-{YYYY-MM-DD}.zip`.

**Auto-export reminder on May 18**: When a signed-in user loads any page on or after May 18, 2026, show a one-time toast:
> 🙏 *Your pilgrimage is complete. Download a copy of your journey to keep forever. [Export now →]*

Store the dismissal in `localStorage` so it doesn't spam them.

---

# Part 10 — Soft delete with recovery

## Delete flow

1. User clicks "Delete my account" in settings
2. Modal: "Are you sure? Your account will be scheduled for deletion in 7 days. Download a copy first?"
3. Two buttons: **[ Download & delete ]** and **[ Just delete ]**
4. Download option runs export first, then proceeds
5. Insert row in `scheduled_deletions` with `scheduled_for = now() + interval '7 days'`
6. User is signed out
7. If they log in during the 7 days, banner shows: "Your account is scheduled for deletion on [date]. [Cancel deletion]"
8. Canceling removes the `scheduled_deletions` row

## Hard delete execution

Since we're client-side only (no cron), use this approach:

**On every page load when signed in**, check if current user has a `scheduled_deletions` row past its date. If yes, execute deletion in browser: cascade delete via `supabase.auth.admin.deleteUser()` — BUT that requires service role, which we don't have in the client.

**Realistic approach**: document in `supabase/README.md` that Alex should run a weekly SQL query to clean up expired deletions:

```sql
-- Run weekly (or set up as a Supabase scheduled function later)
delete from auth.users
where id in (
  select user_id from scheduled_deletions
  where scheduled_for < now()
);
```

This cascades everything via the foreign keys. Document this clearly.

Alternatively, set up a Supabase Edge Function with a cron trigger to run daily. [PLACEHOLDER: future enhancement — edge function for auto-cleanup]

---

# Part 11 — Admin Panel (`admin.html`)

Alex-only. Check `profiles.is_admin` on page load, redirect if false.

## Features

### User Management
Table: username, display name, created, last seen, admin, scheduled deletion status. Sortable, searchable.

Row actions (EVERY action writes to `admin_access_log`):
- **View details**: profile + counts (journal count, photo count, etc.) — **never journal content** (it's ciphertext anyway)
- **Delete account**: cascades everything, logs action
- **Reset password**: generates temp password, shows once
  - ⚠️ Confirmation requires typing "DELETE JOURNAL" to confirm
  - Warning: "This PERMANENTLY destroys the user's encrypted journal and private intentions. Everything else is preserved."
  - On confirm: reset password AND delete `journal_entries` and `private_intentions` rows for that user (since they'd be unreadable anyway)
- **Lock/unlock**
- **Toggle admin**

### Activity Dashboard
- Total users
- Active last 24h (based on `last_seen_at`)
- New signups this week
- Failed login attempts (from `failed_logins`)
- Storage usage
- Pending scheduled deletions

### Moderation
- View/remove group album photos
- Every removal logged

### Audit Log Viewer
- Full `admin_access_log` table, newest first
- Filter by action, admin, target user
- This is Alex's own accountability record — visible to users for their own account

## Write to audit log on every admin action

```javascript
async function logAdminAction(action, targetUserId, targetUsername, details) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  await supabase.from('admin_access_log').insert({
    admin_user_id: user.id,
    admin_username: profile.username,
    action,
    target_user_id: targetUserId,
    target_username: targetUsername,
    details
  });
}
```

Call before every sensitive admin action.

## Update `last_seen_at`

On every signed-in page load: `update profiles set last_seen_at = now() where id = auth.uid()`.

---

# Part 12 — User-visible audit log

In Account Settings, "View my audit log" button shows a list of every action taken on the user's account:

```
📋 Account Activity

Dec 15, 2026 — Alex viewed your profile details
Dec 10, 2026 — You signed up
Dec 10, 2026 — You enabled photo sharing
```

Pulls from `admin_access_log` where `target_user_id = auth.uid()`, plus local events. Builds real trust — if Alex ever poked around, it's on the record.

---

# Part 13 — Guest-to-account migration

```javascript
async function migrateGuestDataToAccount(userId, encryptionKey) {
  // Read all localStorage hub data
  // For each table:
  //   - packing_items: bulk insert plaintext
  //   - journal_entries: encrypt each entry with encryptionKey, then insert
  //   - talk_notes: bulk insert plaintext
  //   - prayer_log: bulk insert plaintext
  //   - private_intentions: encrypt each with encryptionKey, then insert
  // Clear corresponding localStorage keys on success
  // Show toast: "Saved! Your journey is now safe across all your devices."
}
```

Run immediately after successful signup, after encryption key derivation.

---

# Part 14 — Security checklist

## Supabase
- ✅ RLS enabled on every table
- ✅ Only anon key in client code
- ✅ Built-in rate limiting enabled

## Bot & abuse
- ✅ Cloudflare Turnstile on signup + login
- ✅ Cloudflare dashboard: Bot Fight Mode, Security Medium, WAF managed rules, rate limit auth endpoints
- ✅ Honeypot on signup
- ✅ Account lockout after 5 failures in 10 min
- ✅ Generic error messages (no enumeration)

## Crypto
- ✅ PBKDF2 with 250,000 iterations
- ✅ AES-GCM with random IV per encryption
- ✅ Encryption key never persisted to disk
- ✅ Recovery phrase generated with crypto-secure RNG
- ✅ Re-wrap on password change

## Input sanitization
- ✅ Never `innerHTML` with user input — always `textContent`
- ✅ All user content rendered as plain text
- ✅ DOMPurify via CDN if rich text ever needed
- ✅ SDK parameterization for all queries

## Headers — `_headers` at project root

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://challenges.cloudflare.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src https://challenges.cloudflare.com; connect-src 'self' https://*.supabase.co
```

---

# Part 15 — Files

## New
- `hub.html`
- `hub/rosary.html` (ported, restyled)
- `admin.html`
- `privacy.html`
- `security.html`
- `supabase/migrations/001_hub_schema.sql`
- `supabase/README.md`
- `_headers`

## Modify
- `script.js` — Supabase client, auth listener, crypto module, `dataStore` abstraction, migration, export, audit logging
- `style.css` — hub, modals, tile grid, admin panel, privacy page, restyled rosary
- All HTML files — nav "Packing" → "Hub" (grid icon)
- All HTML files — footer: "made with ♥ by alex" + open source link
- `parents.html` — add Alex + Gaby, add group rules
- `index.html` — add group rules strip before footer

## Delete
- `packing.html`

---

# Part 16 — Config block (top of `script.js`)

```javascript
// ============================================
// SUPABASE CONFIG
// ============================================
// Anon key is SAFE to expose. NEVER put service_role key here.
const SUPABASE_URL = 'https://iisgwprvkzbwkeuygvlz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpc2d3cHJ2a3pid2tldXlndmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjUwMjksImV4cCI6MjA5MTM0MTAyOX0.rKo2mRJVfNihvF9re04dKCzUr-GaSuzeWr6a0D0Ltnw';

// Cloudflare Turnstile site key
const TURNSTILE_SITE_KEY = '0x4AAAAAAC3B7AbNZ6C3qQ-9';

// Bootstrap admin username
const BOOTSTRAP_ADMIN_USERNAME = 'alex';

// Public GitHub repo URL (for footer and privacy page)
const SOURCE_CODE_URL = 'https://github.com/ragerbanjoo/ascend';

// Encryption parameters
const PBKDF2_ITERATIONS = 250000;
```

---

# Part 17 — Setup README (`supabase/README.md`)

Step-by-step for Alex:

1. Create free Supabase project at supabase.com
2. Settings → API → copy Project URL and anon key → paste into `script.js`
3. SQL Editor → run `supabase/migrations/001_hub_schema.sql`
4. Authentication → Providers → Email → ENABLE, DISABLE "Confirm email"
5. Authentication → URL Configuration → set Site URL to production domain
6. Storage → verify `photos` bucket exists (created by migration), authenticated access
7. Cloudflare → Turnstile → create widget → copy site key → paste into `script.js`
8. Cloudflare dashboard → Bot Fight Mode ON, Medium security, rate limit auth endpoints
9. Sign up on the live site as `alex`, **save recovery phrase**
10. SQL Editor: `update profiles set is_admin = true where username = 'alex';`
11. Reload site → `/admin.html` works
12. **Weekly maintenance**: run this to clean up expired soft-deletes:
    ```sql
    delete from auth.users where id in (
      select user_id from scheduled_deletions where scheduled_for < now()
    );
    ```
13. Test: guest mode, signup with recovery phrase, login, encrypt/decrypt, export, soft delete, admin panel, audit log

---

# Part 18 — Animation & polish

- Hub tiles fade in staggered
- Hover lift + gold glow
- Modals scale + fade open
- Toast notifications for save/error/sign-in
- Loading spinners during Supabase calls
- Password strength meter animates live
- Recovery phrase screen: each word fades in sequentially (theatrical — drives home importance)
- Encrypted badges (🔒) on journal and intentions tiles
- All animations respect `prefers-reduced-motion`

---

# Deliverables

- `hub.html`, `hub/rosary.html`, `admin.html`, `privacy.html`, `security.html`
- Updated `script.js` (with crypto module) and `style.css`
- `supabase/migrations/001_hub_schema.sql`
- `supabase/README.md`
- `_headers`
- Updated nav and footer across all existing pages
- Ported and restyled rosary app
- Group rules on home, parents, hub
- Comment block at top of `hub.html` listing every `[PLACEHOLDER]`
- Test plan comment: guest mode, signup, recovery phrase flow, login, encrypt/decrypt, export, soft delete, admin panel, audit log, sharing toggles

Build it carefully. This is sacred work — a pilgrim's journal holds things they may never share with anyone. Make the cryptography correct and the experience trustworthy.
