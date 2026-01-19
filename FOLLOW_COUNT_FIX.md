# Follow/Connection Count Fix

## Problem
Users were seeing inaccurate follower, following, and connection counts when viewing profiles. The counts were not updating properly or showing incorrect numbers.

## Root Causes

### 1. **Cached Follower/Following Counts**
- The `useFollow` hook was fetching `followers_count` and `following_count` from the `profiles` table
- These are cached/denormalized values that may not update in real-time
- If database triggers aren't working or missing, these values become stale

### 2. **Incomplete Real-time Subscriptions**
- Only subscribed to changes where the profile was being followed
- Didn't subscribe to changes where the profile follows others
- Missing updates when the current user's follow status changed

## Solutions Applied

### 1. **Real-time Count Queries** ✅
Changed from cached values to real-time queries:

**Before:**
```typescript
const { data: profile } = await supabase
    .from('profiles')
    .select('followers_count, following_count')
    .eq('id', profileId)
    .single();
```

**After:**
```typescript
// Get followers count - people who follow this profile
const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileId);

// Get following count - people this profile follows
const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profileId);
```

### 2. **Enhanced Real-time Subscriptions** ✅
Added two separate channels:

**Followers Channel:**
- Listens for changes where `following_id = profileId`
- Updates when someone follows/unfollows this profile
- Also refreshes the current user's follow status

**Following Channel:**
- Listens for changes where `follower_id = profileId`
- Updates when this profile follows/unfollows someone

### 3. **Connection Count** ✅
The connection count was already using real-time queries (line 218-223 in UserProfilePage.tsx):
```typescript
supabase.from('connections')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
    .eq('status', 'accepted')
    .then(({ count }) => setConnectionsCount(count || 0));
```

## Files Modified

1. **`src/features/profile/hooks/useFollow.ts`**
   - Updated `fetchCounts()` to query follows table directly
   - Added dual real-time subscriptions for followers and following
   - Ensures accurate counts at all times

## Benefits

✅ **Accurate Counts**: Always shows the correct number of followers/following/connections
✅ **Real-time Updates**: Counts update instantly when changes occur
✅ **No Stale Data**: No reliance on cached values that might not update
✅ **Better UX**: Users see immediate feedback when they follow/unfollow

## Testing

To verify the fix works:

1. **View a profile** → Check follower/following/connection counts
2. **Follow the user** → Count should increment immediately
3. **Unfollow** → Count should decrement immediately
4. **Open profile in two tabs** → Changes in one tab reflect in the other
5. **Check your own profile** → Counts should match actual data

## Performance Considerations

- Using `count: 'exact', head: true` is efficient (doesn't fetch rows, just counts)
- Real-time subscriptions are lightweight (only trigger on actual changes)
- Two subscriptions per profile view is acceptable overhead

## Future Enhancements

Potential improvements:
- [ ] Add caching layer with short TTL (5-10 seconds)
- [ ] Batch count updates if viewing multiple profiles
- [ ] Add loading states for count updates
- [ ] Consider materialized views for very high-traffic profiles
