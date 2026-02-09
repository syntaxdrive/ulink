# Verification Badge Management

## Quick Reference

### 🔵 Give Blue Ticks (Verified Users)
**File:** `give_blue_ticks.sql`

1. Open the file
2. Add email addresses to the list
3. Run: `npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < give_blue_ticks.sql`

### 🟡 Give Gold Ticks (Founders)
**File:** `give_gold_ticks.sql`

1. Open the file
2. Add founder email addresses to the list
3. Run: `npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < give_gold_ticks.sql`

### ❌ Remove Badges
**File:** `remove_ticks.sql`

1. Open the file
2. Add email addresses to remove badges from
3. Run: `npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < remove_ticks.sql`

## Example Usage

### Adding Blue Ticks
```sql
WHERE email IN (
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
);
```

### Adding Gold Ticks
```sql
WHERE email IN (
    'founder@unilink.ng',
    'cofounder@unilink.ng'
);
```

## Badge Hierarchy
1. **Gold Tick** (Highest) - Founders only
2. **Blue Tick** - Verified users
3. **No Badge** - Regular users

**Note:** If a user has both `is_verified` and `is_founder`, they get the GOLD tick (founder status overrides).

## View All Verified Users
```sql
SELECT 
    name, 
    email, 
    CASE 
        WHEN is_founder THEN '🟡 Gold'
        WHEN is_verified THEN '🔵 Blue'
        ELSE 'None'
    END as badge
FROM public.profiles
WHERE is_verified = true OR is_founder = true;
```
