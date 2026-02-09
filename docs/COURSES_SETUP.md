# 🚀 Quick Setup: Courses System

## Step 1: Run Database Migrations

Open your Supabase SQL Editor and run these two migration files in order:

### Migration 1: Create Tables
```sql
-- Copy and paste the entire content from:
supabase/migrations/20260209_create_courses.sql
```

### Migration 2: Create Functions
```sql
-- Copy and paste the entire content from:
supabase/migrations/20260209_course_functions.sql
```

## Step 2: Verify Installation

1. **Check your dev server** (should auto-reload)
   ```
   http://localhost:5173/app/learn
   ```

2. **You should see:**
   - "Courses" page with search bar
   - Category filters (School, Skill, Tech, etc.)
   - "Add Course" button (top right)
   - Empty state message (if no courses yet)

## Step 3: Create Your First Course

1. Click **"Add Course"** button
2. Fill in the form:
   - **YouTube URL:** Paste any educational YouTube video URL
     - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - **Title:** e.g., "Introduction to React Hooks"
   - **Description:** Brief overview
   - **Category:** Select from dropdown
   - **Level:** Beginner/Intermediate/Advanced
   - **Tags:** Optional (comma-separated)
3. Click **"Create Course"**
4. Course appears in the grid immediately!

## Step 4: Test Features

- **Search:** Type in search bar
- **Filter:** Click category chips
- **Like:** Click heart icon on a course
- **Enroll:** Click "Enroll" button

## Troubleshooting

### Issue: "Invalid YouTube URL"
- Make sure you're using a full YouTube URL
- Try: `https://www.youtube.com/watch?v=VIDEO_ID`

### Issue: Courses page is blank
- Check that migrations ran successfully in Supabase
- Open browser console (F12) for errors
- Verify you're logged in

### Issue: Can't create course
- Ensure you're authenticated
- Check database RLS policies are active
- View network tab for API errors

---

That's it! Your Courses platform is ready. 🎉

See `COURSES_SYSTEM.md` for full documentation.
