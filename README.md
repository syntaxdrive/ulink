# UniLink Nigeria - AI Build Prompt & Guide

This README contains a comprehensive "Mega Prompt" that you can feed to an AI coding assistant (like Claude, ChatGPT, or Cursor) to build the UniLink Nigeria platform from scratch. 

The prompt is designed to build the app in a **less stressful, more iterative, and efficient way** compared to the robust, complex prototypical approach. It focuses on **Speed to Value**, **Simplicity**, and **connected features**.

---

## 🚀 The "Mega Prompt" for AI

Copy and paste the text below into your AI assistant to start building.

```markdown
**Role:**
You are a Senior Full-Stack Engineer and UX Designer specializing in building MVP (Minimum Viable Product) social platforms quickly using React (Vite), TailwindCSS, and Supabase.

**Objective:**
Build "UniLink Nigeria," a professional networking platform for Nigerian students and organizations (like a simplified LinkedIn for students). The goal is to build a highly functional, visually stunning, but *architecturally simple* app. Prioritize "working features" over "perfect abstraction."

**Tech Stack:**
- **Frontend:** React + Vite + TypeScript
- **Styling:** TailwindCSS (Use standard classes, minimize custom CSS)
- **Icons:** Lucide-React
- **Backend/Auth/DB:** Supabase (Client-side usage only, RLS for security)
- **Deployment:** Vercel (Assume this context)

**Design Philosophy:**
"Clean, Green, and Fast." Use a color palette of Emerald Green (#10b981) and Stone Grays (#fafaf9). Use ample whitespace, rounded corners (rounded-2xl), and smooth transitions. The UI should feel friendly and approachable, not corporate.

---

### 📅 Phase 1: Foundation & Auth (The "Skeleton")
**Goal:** getting a user signed up and stored in the DB with a profile.

1.  **Setup:** Initialize a Vite app. Install `lucide-react`, `@supabase/supabase-js`, `react-router-dom`.
2.  **Database:** Create a `profiles` table in Supabase that extends `auth.users`.
    -   *Fields:* `id` (uuid, PK), `name`, `email`, `role` ('student'|'org'), `university`, `avatar_url`.
    -   *Trigger:* Write a SQL trigger to **automatically** create a row in `public.profiles` whenever a user signs up via Supabase Auth. *Why? This handles 50% of the complexity of user management automatically.*
3.  **Auth UI:** Create a simple Login/Signup page.
    -   *Simplicity Hack:* Don't build separate forms. Use a single toggle. On Signup, ask for "Role" (Student vs Org).
4.  **Routing:** Use `react-router-dom`. Routes: `/` (Login), `/app/*` (Protected Dashboard).

### 🤝 Phase 2: Network & Connections (The "Social Graph")
**Goal:** Users finding and connecting with each other.

1.  **Database:** Create a `connections` table.
    -   *Fields:* `id`, `requester_id`, `recipient_id`, `status` ('pending'|'accepted').
    -   *Unique Constraint:* Ensure a pair of users implies only ONE record.
2.  **Network Page:** List users from `profiles`.
    -   *Simplicity Hack:* Don't use complex infinite scroll yet. Just `limit(50)`.
    -   *Action:* "Connect" button inserts a row into `connections`.
    -   *Logic:* If I am `requester_id`, show "Pending". If I am `recipient_id` and status is pending, show "Accept".
3.  **Integration:** When "Accepted", both users are now "Friends". This enables Chat.

### 💬 Phase 3: Real-time Chat (The "Communication")
**Goal:** Simple 1-on-1 messaging.

1.  **Database:** Create a `messages` table.
    -   *Fields:* `id`, `sender_id`, `recipient_id`, `content`, `created_at`.
    -   *Crucial Simplification:* Do NOT use a separate "Conversations" table. Just query messages where `(sender=me AND recipient=them) OR (sender=them AND recipient=me)`. Order by `created_at`. This saves huge complexity.
2.  **UI:** A split view. Left side: List of "Friends" (query `connections` where status='accepted'). Right side: Chat window.
3.  **Real-time:** Use `supabase.channel` to listen for INSERTs on the `messages` table. When a new row arrives, push to state.

### 💼 Phase 4: Jobs & Feed (The "Value")
**Goal:** Content and Opportunities.

1.  **Database:**
    -   `jobs`: `title`, `company`, `type` (Internship/Entry), `description`.
    -   `posts`: `content`, `author_id`, `image_url`.
2.  **Feed Page:** Combined view.
    -   Fetch `posts` sorted by newest.
    -   *Simplicity Hack:* Don't build a complex recommendation algorithm. Just show *all* posts from the community for now to make the app feel "alive".
3.  **Job Board:** Simple list. "Apply" button just opens a `mailto:` link or an external URL to the company site. *Why? Building a full ATS (Application Tracking System) is overkill for V1.*

---

### 🚀 Execution Strategy (How to build this effortlessly)

**Rule #1: The Database is the Source of Truth.**
Don't manage complex global Create/Update/Delete state in React Context if you can avoid it. Use `useEffect` to fetch data, and when you mutate (e.g., send message), just **refetch** or optimistically update that single list.

**Rule #2: Files over Folders.**
Don't over-fragment your code. Keep feature logic together.
- `src/features/chat/ChatWindow.tsx`
- `src/features/network/UserCard.tsx`
Good code collocation > arbitrary "components" folder.

**Rule #3: Use Supabase Triggers for "Side Effects".**
Don't try to manually create a Notification in React when a user sends a Connection Request. It's fragile.
*Better Way:* Write a Postgres Trigger: `AFTER INSERT ON connections, INSERT INTO notifications`. This guarantees data integrity and makes your frontend code stupidly simple.

**Start now. Begin by giving me the SQL for the tables described above.**
```

---

## 💡 How this approach is better (Less Stressful & Less "Robust")

1.  **Direct-to-DB Messaging:**
    *   *Old Way:* Creating `Conversation` IDs, managing participants arrays, handling group logic.
    *   *New Way:* Just storing `sender` and `recipient` on the message. It scales poorly for millions, but perfectly for thousands. It removes 40% of the backend logic.

2.  **Trigger-Based Notifications:**
    *   *Old Way:* Your React code has to call `createConnection()` AND `createNotification()`. If one fails, UI is broken.
    *   *New Way:* React calls `createConnection()`. The Database *automatically* creates the notification. Your frontend becomes dumber and more reliable.

3.  **Unified Auth Flow:**
    *   *Old Way:* Robust multi-step forms validating every field before submission.
    *   *New Way:* Single page, minimal fields to start. Let users fill their profile *after* they are hooked. Low friction = High Conversion.

4.  **"Global Feed" vs "Graph Feed":**
    *   *Old Way:* Only showing posts from friends. Requires complex SQL joins.
    *   *New Way:* Show *global* posts. Easier query (`select * from posts`), and solves the "empty state" problem for new users who have no friends yet.
