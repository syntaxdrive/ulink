# Admin & Verification System Setup Guide

## Overview
UniLink has three types of special accounts:
1. **🔵 Blue Tick** - Verified users
2. **🟡 Gold Tick** - Founders/Co-founders  
3. **👤 Admin** - Moderation & support

## Setup Steps

### Step 1: Update Database Schema
```bash
npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < add_founder_admin_roles.sql
```

This adds:
- `is_founder` column (boolean)
- `role_type` column (student/org/admin/founder)

### Step 2: Assign Blue Ticks (Verified Users)
```bash
npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < assign_blue_ticks.sql
```

Verified users (Blue Ticks):
1. adetolaadeyinka2@gmail.com
2. oluwadamisi012@gmail.com
3. amarachimunachi37@gmail.com
4. sahirah648@gmail.com
5. oguntoyinboesther3@gmail.com
6. olayiwolamary1710@gmail.com

### Step 3: Assign Gold Ticks (Founders)
Edit `assign_gold_ticks.sql` and replace placeholder emails with actual founder emails:
```sql
WHERE email IN (
    'your-founder-email@example.com',
    'cofounder-email@example.com'
);
```

Then run:
```bash
npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < assign_gold_ticks.sql
```

### Step 4: Create Admin Account

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" / "Invite User"
3. Email: `admin@unilink.ng` (or your choice)
4. Set strong password
5. Copy the user ID

**Option B: Via SQL**
Edit `create_admin_account.sql` with the admin email, then run:
```bash
npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa < create_admin_account.sql
```

## Badge System

### Badge Colors
- **🟡 Gold** (`#eab308`) - Founders only (`is_founder = true`)
- **🔵 Blue** (`#3b82f6`) - Verified users (`is_verified = true` AND `is_founder = false`)

### Where Badges Appear
✅ Feed posts
✅ Profile pages  
✅ Messages
✅ Network connections
✅ Comments
✅ Talent search

## Admin Features

### What Admins Can Do:
1. **Receive Reports** - All user reports go to admin account
2. **Moderation** - Review flagged content
3. **User Management** - (Future: ban/suspend users)
4. **Analytics** - (Future: view platform stats)

### Admin Account Setup
After creating the admin account:
1. Login with admin credentials
2. Admin will see reports in Messages
3. Reports are prefixed with 🚨
4. Contains full user details for investigation

## Report System Flow

1. User clicks "Report Account" on a profile
2. Pre-filled report template generated:
   ```
   🚨 REPORT
   Reported User: [Name]
   User ID: [ID]
   Email: [Email]
   University: [University]
   Reason: [User fills this]
   ```
3. User sent to Messages page
4. Report pre-filled in message input
5. User sends to admin account

## Future Enhancements

### Planned Features:
- [ ] Dedicated admin dashboard
- [ ] Report management system
- [ ] User ban/suspend functionality
- [ ] Analytics and insights
- [ ] Bulk verification tools
- [ ] Automated moderation rules

## SQL Scripts Reference

| Script | Purpose |
|--------|---------|
| `add_founder_admin_roles.sql` | Add new columns to database |
| `assign_blue_ticks.sql` | Give blue badges to verified users |
| `assign_gold_ticks.sql` | Give gold badges to founders |
| `create_admin_account.sql` | Set up admin account |

## Verification Criteria

### Blue Tick (Verified)
- Trusted community members
- Active contributors
- Manually verified by admins

### Gold Tick (Founder)
- Founders and co-founders only
- Automatically verified
- Special privileges (future)

## Support

For questions or issues:
- Email: admin@unilink.ng
- Check database with: `SELECT * FROM profiles WHERE role_type = 'admin'`
