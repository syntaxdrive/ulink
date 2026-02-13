# UniLink Mobile App Implementation Plan

This plan outlines the remaining features required to bring the React Native app to parity with the Web App and complete the MVP.

## Phase 1: Core Engagement & Discovery (High Priority)
### 1. Search & Explore Screen
- **Objective**: Allow users to discover content and connections.
- **Features**:
    - Search bar (Users, Posts, Communities).
    - "Trending" hashtags/topics section.
    - Suggested users to follow.
- **Tech**: Supabase text search, existing `useFeed` logic adapted for search.

### 2. Edit Profile
- **Objective**: Allow users to manage their identity.
- **Features**:
    - Form to edit Name, Headline, Bio.
    - Avatar upload (ImagePicker + Supabase Storage).
- **Tech**: `expo-image-picker`, Supabase Storage buckets.

### 3. Notifications System
- **Objective**: Drive retention through activity updates.
- **Features**:
    - List of notifications (Likes, Comments, Follows).
    - Real-time updates (Supabase Realtime).
    - Navigation to relevant content (e.g., tapping a "Like" notification goes to the Post).

## Phase 2: Communication & Community (Medium Priority)
### 4. Direct Messaging (Chat)
- **Objective**: Enable private communication.
- **Features**:
    - Conversation list (Inbox).
    - Chat room (Real-time messages).
    - "Message" button on user profiles.
- **Tech**: New `messages` table, Supabase Realtime subscriptions.

### 5. Community Management
- **Objective**: Empower users to build sub-groups.
- **Features**:
    - Create Community form.
    - Community settings (for admins).
    - Invite members.

## Phase 3: Content Enrichment (Lower Priority / Polish)
### 6. Richer Posts (Polls & Media)
- **Objective**: Increase interaction variety.
- **Features**:
    - Poll creation and voting.
    - Multiple image uploads (Carousel).
    - Video playback support.

### 7. Resources / Academy
- **Objective**: Deliver educational value (UniLink specific).
- **Features**:
    - Library of downloadable resources (PDFs, Links).
    - Categorized view.

## Execution Order
1.  **Search & Explore** (Impact: High, Effort: Medium)
2.  **Edit Profile** (Impact: High, Effort: Medium)
3.  **Notifications Logic** (Impact: Medium, Effort: Low - UI exists)
4.  **Direct Messages** (Impact: High, Effort: High)

---
*Created: Feb 11, 2026*
