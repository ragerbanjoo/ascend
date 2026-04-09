'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type AuthState = 'loading' | 'login' | 'authenticated' | 'not_admin' | 'no_supabase';

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url === 'https://your-project.supabase.co') {
      setAuthState('no_supabase');
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAuthState('login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (profile?.is_admin) {
        setAuthState('authenticated');
      } else {
        setAuthState('not_admin');
      }
    } catch {
      setAuthState('login');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('Failed to send magic link');
    } finally {
      setSending(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthState('login');
    setSent(false);
  }

  if (authState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (authState === 'no_supabase') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <h1 className="text-center font-display text-2xl font-bold text-gray-900">Admin Portal</h1>
          <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">Supabase not configured</p>
            <p className="mt-1">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.</p>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'not_admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
          <h1 className="font-display text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-sm text-gray-600">Your account does not have admin privileges.</p>
          <button onClick={handleSignOut} className="mt-6 btn-secondary">Sign Out</button>
        </div>
      </div>
    );
  }

  if (authState === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-gray-900">Rosary Admin</h1>
            <button onClick={handleSignOut} className="btn-secondary text-sm">Sign Out</button>
          </div>

          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Rosary Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Configure default prayer options for the public Rosary experience.</p>

            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Fatima Prayer default ON</span>
                  <p className="text-xs text-gray-500">When enabled, the Fatima prayer is included by default for new visitors.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Litany of Loreto default ON</span>
                  <p className="text-xs text-gray-500">When enabled, the Litany of Loreto is included by default for new visitors.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Show Litany section</span>
                  <p className="text-xs text-gray-500">When enabled, the Litany toggle appears in the prayer controls.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Scripture Reading default ON</span>
                  <p className="text-xs text-gray-500">When enabled, the Scripture Reading panel is shown by default for new visitors.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Litany of Loreto Content</h2>
            <p className="mt-1 text-sm text-gray-500">
              The litany text is stored as structured data. Connect Supabase to enable editing individual lines, reordering, and preview.
            </p>
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-semibold">Supabase required for content editing</p>
              <p className="mt-1">Configure your Supabase connection to unlock the full litany editor with line-by-line EN/ES editing, reordering, and live preview.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Scripture Readings per Mystery</h2>
            <p className="mt-1 text-sm text-gray-500">
              Scripture readings are stored per mystery with bilingual passage references and summaries. Connect Supabase to enable editing.
            </p>
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-semibold">Supabase required for content editing</p>
              <p className="mt-1">Configure your Supabase connection to unlock the scripture editor with per-mystery EN/ES passage refs, summaries, USCCB URL overrides, and live preview.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Mystery Detail Pages (20 Mysteries)</h2>
            <p className="mt-1 text-sm text-gray-500">
              Each mystery has a detail page with summary, teachings, fruit, scripture readings, church sources, and reflection prompts. All 20 mysteries are seeded with bilingual content.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Editable fields per mystery:</p>
              <ul className="ml-4 list-disc text-xs text-gray-500 space-y-1">
                <li>Title (EN/ES)</li>
                <li>Summary — what happens (EN/ES)</li>
                <li>What It Teaches — spiritual meaning (EN/ES)</li>
                <li>Fruit of the Mystery (EN/ES)</li>
                <li>Scripture Readings — passage refs, summaries, USCCB links (EN/ES)</li>
                <li>Church Sources — Vatican, USCCB, papal docs with excerpts and links</li>
                <li>Reflection Prompts — 2–3 per mystery (EN/ES)</li>
              </ul>
            </div>
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-semibold">Supabase required for content editing</p>
              <p className="mt-1">Configure your Supabase connection to unlock the full mystery detail editor with side-by-side EN/ES editing, reordering, and revision history.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-gray-900">Learn: &ldquo;What should I choose to pray?&rdquo;</h2>
            <p className="mt-1 text-sm text-gray-500">
              Guidance section on the Learn tab helping users understand which prayer options to include. Linked from the Pray tab helper.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Section key: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">learn.whatToChoose</code></p>
              <p className="text-sm font-medium text-gray-700">Editable fields:</p>
              <ul className="ml-4 list-disc text-xs text-gray-500 space-y-1">
                <li>Heading (EN/ES)</li>
                <li>Intro paragraph (EN/ES)</li>
                <li>Cards array — each card: title, whatItIs, whenToInclude (bullets), whenToSkip (bullets), quickTip, sources (label + URL)</li>
                <li>Back to Pray label (EN/ES)</li>
              </ul>
              <p className="text-sm text-gray-500">Cards: Core Rosary, Fatima Prayer, Litany of Loreto, Scripture Reading</p>
            </div>
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-semibold">Supabase required for content editing</p>
              <p className="mt-1">Configure your Supabase connection to unlock the Learn section editor with side-by-side EN/ES editing, card reordering, source link management, and revision history.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center font-display text-2xl font-bold text-gray-900">Admin Portal</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Sign in with your email to manage site content</p>

        {sent ? (
          <div className="mt-8 rounded-lg bg-brand-50 p-4 text-center">
            <p className="font-semibold text-brand-800">Check your email!</p>
            <p className="mt-1 text-sm text-brand-700">We sent a magic link to <strong>{email}</strong></p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm text-brand-600 underline">
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
