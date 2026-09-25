# Verification Badge System

## Badge Types

### 🔵 Blue Badge (`is_verified = true`)
- **For:** Verified individual users
- **Color:** Blue (#3b82f6)
- **Criteria:** Manually assigned to trusted users

### 🟡 Gold Badge (Organizations)
- **For:** Verified organizations
- **Color:** Yellow (#eab308)  
- **Criteria:** `role = 'org'` AND `is_verified = true`

## Where Badges Appear

✅ **Feed Page** - Next to post author names
✅ **Profile Pages** - Next to user's name
✅ **Network Page** - In connection lists
✅ **Messages Page** - In conversation list and chat header
✅ **Talent Search** - Next to candidate names
✅ **Comments** - Next to commenter names

## Badge Colors by Location

- **Feed Posts:** Yellow for verified users
- **Messages:** Blue for verified users
- **Network:** Yellow for verified users
- **Talent Search:** Blue for verified users
- **Profile:** Yellow for verified users

## Recently Verified Users (Blue Badges)

1. adetolaadeyinka2@gmail.com
2. oluwadamisi012@gmail.com
3. amarachimunachi37@gmail.com
4. sahirah648@gmail.com
5. oguntoyinboesther3@gmail.com
6. olayiwolamary1710@gmail.com

## How to Verify More Users

Run this SQL command:

```sql
UPDATE public.profiles
SET is_verified = true
WHERE email IN ('user@example.com', 'another@example.com');
```

Or use the script: `verify_specific_users.sql`
