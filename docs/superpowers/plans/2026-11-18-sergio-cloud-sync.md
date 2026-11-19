# Sergio Study Hub Cloud Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync Sergio’s Study Hub results from his computer to Supabase so Ameliya can securely view them in Parent Mode on another device.

**Architecture:** Keep GitHub Pages as the static frontend. Use Supabase Auth for the parent, RLS-protected tables for ownership, and Edge Functions for Sergio device pairing and progress upload using a long random device token stored only in Sergio’s browser.

**Tech Stack:** Static HTML/CSS/JavaScript, GitHub Pages, Supabase Postgres, Supabase Auth, Supabase Edge Functions, supabase-js browser CDN.

**Spec:** `docs/superpowers/specs/2026-11-18-sergio-cloud-sync-design.md`

## Global Constraints
- Keep the existing GitHub Pages URL.
- Sergio must not need an email login to study.
- Parent uses email authentication once, then PIN 2725 as a local UI lock.
- Only a Supabase publishable key may appear in frontend source.
- Never expose secret/service-role keys in GitHub.
- All exposed tables must use Row Level Security.
- Preserve localStorage as offline/fallback storage.

## Review Focus
- Anonymous visitors must not be able to read Sergio’s report directly.
- An invalid or expired pairing code must not pair a device.
- An invalid device token must not upload progress.
- Loss of network must not block local studying.
- Parent Mode on a second device must show the latest uploaded snapshot after authentication.

---

### Task 1: Database ownership and cloud snapshot schema

**Files:**
- Supabase schema via SQL
- Verify with Supabase table listing and advisors

**Interfaces:**
- Produces: `students`, `pairing_codes`, `student_devices`, `study_snapshots`

- [ ] Create tables with timestamps, parent ownership, hashed device token storage, and one latest snapshot per student.
- [ ] Enable RLS on every public table.
- [ ] Add parent-only SELECT policies tied to `auth.uid()`.
- [ ] Keep anonymous direct table access denied.
- [ ] Seed one Sergio student row only after the parent account exists or via a safe parent-owned creation path.
- [ ] Run security advisors and fix findings relevant to this schema.

### Task 2: Parent authentication and device pairing backend

**Files:**
- Create Supabase Edge Function: `create-pairing-code`
- Create Supabase Edge Function: `pair-device`

**Interfaces:**
- `create-pairing-code`: authenticated parent -> short-lived code
- `pair-device`: code -> random device token returned once

- [ ] Verify authenticated parent identity before creating a pairing code.
- [ ] Generate short-lived, one-time pairing codes.
- [ ] Exchange a valid code for a long random device token.
- [ ] Store only a cryptographic hash of the device token.
- [ ] Reject expired, reused, and invalid codes.
- [ ] Verify valid and invalid pairing flows.

### Task 3: Progress upload backend

**Files:**
- Create Supabase Edge Function: `sync-study-progress`

**Interfaces:**
- Consumes: device token + aggregate Study Hub snapshot
- Produces: upserted `study_snapshots` row

- [ ] Validate the device token against its stored hash.
- [ ] Validate the snapshot shape and allowed size.
- [ ] Upsert only the linked Sergio student’s latest snapshot.
- [ ] Reject missing/invalid tokens.
- [ ] Verify successful upload and rejection cases.

### Task 4: GitHub Pages Supabase client and local-first sync

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Browser client uses project URL + publishable key.
- LocalStorage remains canonical fallback when cloud is unavailable.

- [ ] Load supabase-js in the browser.
- [ ] Add project URL and publishable key only.
- [ ] Add device pairing UI for Sergio’s browser.
- [ ] Store the returned device token only in localStorage.
- [ ] Upload aggregate state after scored answers and round completion without blocking the quiz.
- [ ] Show connected/offline sync status.
- [ ] Verify the quiz still works with Supabase unreachable.

### Task 5: Parent Mode cloud report

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Interfaces:**
- Supabase Auth magic link session -> parent-owned student + latest snapshot -> existing Parent dashboard.

- [ ] Show email sign-in when no parent Supabase session exists.
- [ ] After authentication, require PIN 2725 before displaying the report.
- [ ] Fetch Sergio’s latest snapshot through RLS-protected authenticated reads.
- [ ] Add “Pair Sergio’s computer” to generate the short-lived pairing code.
- [ ] Display cloud last-sync time and current Spanish/English statistics.
- [ ] Verify another anonymous browser cannot read the report.

### Task 6: End-to-end verification and deployment

**Files:**
- GitHub Pages production files
- Supabase project configuration

**Interfaces:**
- Sergio computer -> Edge Function -> Supabase -> authenticated Parent phone

- [ ] Run Supabase security advisors.
- [ ] Confirm no secret/service-role key is present in GitHub source.
- [ ] Confirm Pages deployment succeeds.
- [ ] Pair one test browser and upload a test snapshot.
- [ ] Read that snapshot through authenticated parent access.
- [ ] Confirm invalid device token fails.
- [ ] Confirm local quiz remains usable when cloud sync fails.
