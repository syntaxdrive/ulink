# ✅ FINAL BADGE SYSTEM - SUPER SIMPLE

## How It Works

You have TWO SQL files. Just add/remove emails from them:

### 1. `blue_ticks.sql` 🔵
- Add emails here for BLUE verification badges
- Already has these 6 emails:
  - adetolaadeyinka2@gmail.com
  - oluwadamisi012@gmail.com
  - amarachimunachi37@gmail.com
  - sahirah648@gmail.com
  - oguntoyinboesther3@gmail.com
  - olayiwolamary1710@gmail.com

### 2. `gold_ticks.sql` 🟡
- Add emails here for GOLD founder badges
- Currently has placeholder email

## To Add Badges

### Blue Tick:
1. Open `blue_ticks.sql`
2. Add email to the list (e.g., `'newuser@example.com',`)
3. Run: `Get-Content blue_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa`

### Gold Tick:
1. Open `gold_ticks.sql`
2. Add email to VALUES (e.g., `('founder@unilink.ng'),`)
3. Run: `Get-Content gold_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa`

## To Remove Badges

Just remove the email from the SQL file and re-run it!

## Setup (One Time Only)

Run these once to set up the system:
```bash
# 1. Create gold_verified_users table
Get-Content gold_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa

# 2. Create helper view
Get-Content create_badge_view.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa

# 3. Assign blue ticks
Get-Content blue_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa
```

## View All Badges
```sql
SELECT name, email, badge_type
FROM public.user_badges
WHERE badge_type != 'none'
ORDER BY badge_type, name;
```

## That's It!
No complicated fields, no is_founder boolean. Just two simple email lists.
- Gold list = Gold badge 🟡
- Blue list (is_verified) = Blue badge 🔵
