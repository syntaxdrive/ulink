# Ported Features Documentation

This document outlines the features ported from the React Web application to the React Native mobile application.

## 1. Messages / Chat
**Web Source:** `src/features/messages`
**Mobile Implementation:** `src/features/messages`

### Key Components:
- **MessagesScreen**: Displays a list of active conversations.
  - Uses `useChat` hook to fetch sorted conversations via RPC `get_sorted_conversations`.
  - Displays unread counts and last message status.
  - Navigates to `ChatScreen`.
- **ChatScreen**: Handles individual 1-on-1 chats.
  - Uses `useChatMessages` hook.
  - Supports real-time updates via Supabase subscriptions.
  - Handles optimistic UI updates for sending messages.
  - Auto-scrolls to new messages.

### Hooks:
- `useChat`: Manages conversation list and global unread counts.
- `useChatMessages`: Manages messages for a specific chat room, including sending and real-time syncing.

## 2. Jobs
**Web Source:** `src/features/jobs`
**Mobile Implementation:** `src/features/jobs`

### Key Components:
- **JobsScreen**: Displays a list of available jobs.
  - Fetches from `jobs` table in Supabase.
  - Supports search by title/company.
  - "Apply Now" button opens the application link in default browser.
  - Displays job type, salary range, and location.

## 3. Network (Enhanced)
**Web Source:** `src/features/network`
**Mobile Implementation:** `src/features/network`

### Updates:
- **Direct Messaging**: Updated the "Message" button on user profiles to navigate directly to the `ChatScreen` with the user's details pre-filled.

## Missing Features / Future Work
- **Course/Learn**: The `Learn` feature (Courses) is still pending implementation.
- **Job Management**: Creating/Editing jobs (Admin/Org side) is not yet implemented on mobile (Viewer only).
- **Rich Text / Media**: Chat currently supports text only. Image/Audio support needs to be ported from web.

## 3. Network & Leaderboard
**Web Source:** `src/features/network`
**Mobile Implementation:** `src/features/network`

### Key Components:
- **NetworkScreen**: Displays "Grow" (suggestions), "My Network" (connections), and "Top 50" (Leaderboard).
- **Leaderboard Algorithm**:
  - Fetches top 50 users based on activity.
  - Score = (Posts * 10) + (Comments * 5).
  - Displays rank, avatar, name, and detailed stats.

