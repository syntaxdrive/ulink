# User Search Fix - Summary

## Problem

Users could not find all other users when searching in the Network page. Only a limited number of users (20) were showing up in search results.

## Root Cause

The search functionality was only filtering through pre-fetched user suggestions, which were limited to 20 users by the `get_suggested_connections` database function. When users typed in the search box, it was only searching within those 20 pre-loaded profiles, not the entire database.

**Code Location:** `sql/setup_algorithms.sql` line 41
```sql
limit 20; -- This was limiting suggestions to only 20 users
```

## Solution

### 1. Created New Database Function (`sql/fix_user_search.sql`)

Created a new `search_all_users` function that:
- Searches the **entire database** of users
- Searches across multiple fields: name, email, university, headline, username
- Returns up to 100 results (instead of 20)
- Prioritizes results by:
  1. Exact name matches
  2. Verified users
  3. Users from same university
  4. Alphabetical order

### 2. Updated Suggestion Limit

Increased the `get_suggested_connections` limit from 20 to 50 users for better default suggestions.

### 3. Enhanced Frontend Hook (`useNetwork.ts`)

Added new `searchUsers` function that:
- Calls the database search function when user types
- Falls back to client-side search if database function doesn't exist yet
- Returns search results separately from suggestions
- Includes loading state for search

### 4. Updated Network Page (`NetworkPage.tsx`)

- Added debounced search (300ms delay after user stops typing)
- Shows search results when user is searching
- Shows suggestions/network when search is empty
- Displays loading spinner during search

## Files Modified

1. **Created:**
   - `sql/fix_user_search.sql` - Database search function

2. **Modified:**
   - `src/features/network/hooks/useNetwork.ts` - Added search functionality
   - `src/features/network/NetworkPage.tsx` - Integrated search with UI

## How It Works Now

### Before (Broken)
```
User types "John" → Filters 20 pre-loaded suggestions → Only finds Johns in those 20
```

### After (Fixed)
```
User types "John" → Searches entire database → Finds all Johns (up to 100 results)
```

## User Experience

1. **User opens Network page**
   - Sees 50 suggested connections (increased from 20)

2. **User types in search box**
   - Loading spinner appears
   - After 300ms, database search executes
   - All matching users appear (up to 100)

3. **User clears search**
   - Returns to showing suggestions/network

## Testing

To test the fix:

1. **Run the SQL script:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- sql/fix_user_search.sql
   ```

2. **Test search:**
   - Go to Network page
   - Type a name in search box
   - Should see all users matching that name
   - Should see loading spinner while searching

3. **Verify:**
   - Search for common names (e.g., "John", "Mary")
   - Should see more than 20 results
   - Results should be sorted by relevance

## Performance Considerations

- **Debouncing:** 300ms delay prevents excessive database queries
- **Limit:** 100 results max to prevent overwhelming the UI
- **Indexing:** Database should have indexes on name, email, university for fast search
- **Fallback:** If database function fails, falls back to client-side search

## Future Improvements

1. **Add pagination** for search results (if more than 100 matches)
2. **Add filters** (by university, role, verified status)
3. **Add search history** (recent searches)
4. **Add fuzzy matching** (typo tolerance)
5. **Add search suggestions** (autocomplete)

## SQL to Run

**Required:** Run this in Supabase SQL Editor:

```sql
-- File: sql/fix_user_search.sql

CREATE OR REPLACE FUNCTION public.search_all_users(
    current_user_id uuid,
    search_query text
)
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.profiles
  WHERE id != current_user_id
  AND (
    name ILIKE '%' || search_query || '%'
    OR email ILIKE '%' || search_query || '%'
    OR university ILIKE '%' || search_query || '%'
    OR headline ILIKE '%' || search_query || '%'
    OR username ILIKE '%' || search_query || '%'
  )
  ORDER BY 
    CASE WHEN LOWER(name) = LOWER(search_query) THEN 0 ELSE 1 END,
    CASE WHEN is_verified = true THEN 0 ELSE 1 END,
    CASE WHEN university = (SELECT university FROM profiles WHERE id = current_user_id) THEN 0 ELSE 1 END,
    name ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.search_all_users(uuid, text) TO authenticated;
```

## Verification

After running the SQL and reloading the app:

- [ ] Search finds users beyond the initial 20 suggestions
- [ ] Search shows loading spinner
- [ ] Search is debounced (doesn't search on every keystroke)
- [ ] Clearing search returns to suggestions
- [ ] Search results are sorted by relevance
- [ ] No console errors

## Status

✅ **Code Updated** - Frontend changes complete
⏳ **Database Update Required** - Need to run `sql/fix_user_search.sql`
🧪 **Testing Needed** - Test after running SQL script

---

**Next Step:** Run `sql/fix_user_search.sql` in Supabase SQL Editor to enable the fix!
