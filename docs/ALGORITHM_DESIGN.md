# UniLink Smart Algorithm Documentation

This document outlines the logic behind the recommendation engines driving the UniLink platform. These algorithms act as the "Black Box" that determines what users see, designed to drive growth for Verified users while maintaining high relevance for everyone.

## 1. Network Algorithm (Growth Engine)
**Feature:** "Suggested Connections" / `get_suggested_connections` API
**Goal:** Drive massive connection growth for Verified Users and connect peers.

**Logic Hierarchy:**
1.  **Verified Boost (Priority 1):**
    *   **Logic:** Users with `is_verified = true` (Blue/Gold ticks) are ALWAYS hard-coded to appear at the top of the suggestion list for everyone.
    *   **Purpose:** This artificially inflates the visibility of premium/verified users, converting views into connection requests.
2.  **University Relevance (Priority 2):**
    *   **Logic:** Users from the SAME university as the viewer appear next.
    *   **Purpose:** Ensures high relevance (classmates, campus peers) if no verified users are available.
3.  **Freshness (Priority 3):**
    *   **Logic:** `Random()` sorting for the remainder.
    *   **Purpose:** Ensures the list isn't static and stale; users see new faces every refresh.

---

## 2. Smart Feed Algorithm (Discovery Engine)
**Feature:** Main Home Feed / `get_smart_feed` API
**Goal:** A blend of personal network updates and global discovery of "Top Voices" (Verified Users).

**Content Mix:**
The feed constructs a timeline from four distinct sources, blended by recency:

| Source | Condition | Visibility Rule |
| :--- | :--- | :--- |
| **My Connections** | `status = 'accepted'` | **Permanent:** Shows all history. |
| **University Peers** | `uni = my_uni` | **Permanent:** Shows all history (local campus buzz). |
| **Verified "Stars"** | `is_verified = true` | **Ephemeral (Smart Constraint):** Only shows posts from the **last 7 days**. |
| **Self** | `author_id = my_id` | **Permanent:** Always show my own posts. |

**The "Smart" Constraint:**
*   Verified users appear in *everyone's* feed (Global Reach).
*   **Anti-Spam Mechanism:** To prevent verified users from dominating the feed with old content, their posts are only eligible for global discovery if created within the last 7 days. This forces them to stay active to maintain their "celebrity" status on the feed.

---

## 3. Talent Discovery Algorithm
**Feature:** Search & Recruitment / `search_talent` API
**Goal:** Help organizations find the best candidates quickly.

**Ranking Logic:**
1.  **Verification Status:** Verified accounts are pinned to the top of ANY search result.
2.  **Relevance:** Keyword matching on `name`, `headline`, and `skills` array.
3.  **Alphabetical:** Secondary sort for clean ordering.

---

## 4. Organization Discovery
**Feature:** "Companies to Follow" / `get_suggested_orgs` API
**Goal:** Promote partner organizations.

**Logic:**
*   Exclusively shows profiles with `role = 'org'`.
*   **Filtering:** Automatically excludes organizations the user is already connected to.
*   **Sorting:** Verified Organizations -> Random.
