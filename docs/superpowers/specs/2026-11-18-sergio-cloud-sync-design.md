# Sergio Study Hub Cloud Sync — Design

## Intent
Let Sergio study on his own computer while Ameliya can open Parent Mode on a different device and see current results.

## Goals
- Keep the existing GitHub Pages URL and current quiz UX.
- Sync Sergio's study statistics to Supabase automatically.
- Parent access uses email authentication once, then the existing PIN 2725 inside Parent Mode.
- Sergio should not need an email login for normal studying.
- Preserve localStorage as an offline/fallback cache.

## Non-goals
- No AI features or OpenAI API usage.
- No multi-family/multi-school account system.
- No public leaderboard or social features.
- No secret/service-role key in GitHub Pages.

## Constraints
- Current app is a static GitHub Pages site.
- Supabase project: qqkktuqmhbmyudvfpeke.
- Frontend may contain only a Supabase publishable key.
- All exposed tables must use Row Level Security.
- Parent data must not be readable by anonymous visitors.

## Approaches considered
1. Parent email auth + PIN 2725 + secure device pairing for Sergio. **Selected.**
   - Best balance of security and convenience.
   - Parent is verified by Supabase Auth.
   - Sergio pairs his browser once and then studies without login.
2. PIN-only cloud dashboard.
   - Simpler, but a four-digit PIN is too weak as the only internet-facing protection.
3. Parent email auth plus Sergio login.
   - Strong security, but adds unnecessary friction for Sergio.

## Selected design
### Parent
- Parent signs in with Supabase email magic link.
- Only the approved parent account can read Sergio's cloud report.
- After authentication, Parent Mode still asks for PIN 2725 as a local UI lock.

### Sergio device
- Sergio does not sign in.
- His browser is paired once to the Sergio student record using a short-lived pairing code generated from Parent Mode.
- Pairing returns a long random device token stored only in Sergio's browser localStorage.
- The public GitHub source never contains the device token.

### Data
- students: one Sergio record owned by the authenticated parent.
- pairing_codes: short-lived one-time pairing codes.
- student_devices: hashed device tokens linked to Sergio.
- study_snapshots: latest aggregate Study Hub state for Sergio.

### Security
- Parent reads students and study_snapshots only through authenticated RLS policies tied to the parent's auth user.
- Anonymous users receive no direct table read/write access.
- Sergio writes progress through an Edge Function that validates the paired device token.
- Edge Functions keep privileged credentials server-side.
- Never expose Supabase secret or service-role keys in GitHub.

### Sync behavior
- Local results save immediately to localStorage as they do today.
- After each scored answer or completed round, the app sends the latest aggregate snapshot to Supabase.
- Failed cloud writes do not block studying; the local copy remains usable.
- When Parent Mode opens on an authenticated parent device, it fetches the latest cloud snapshot and displays it.

## UX
- Parent Mode first shows email sign-in if no valid parent session exists.
- Once authenticated, PIN 2725 unlocks the report.
- Parent Mode includes a one-time “Pair Sergio’s computer” action that generates a short code.
- Sergio's Study Hub gets a small “Connect this device” setup action; after pairing it disappears/changes to connected status.

## Verification
- Verify RLS/security advisor after schema creation.
- Verify parent can read Sergio's snapshot.
- Verify anonymous browser cannot read tables directly.
- Verify paired Sergio device can upload progress.
- Verify unpaired device token is rejected.
- Verify GitHub Pages deployment succeeds and phone/desktop both load.
