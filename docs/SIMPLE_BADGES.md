# Simple Badge System

## How It Works

### Two Badge Types:
- **🔵 Blue Tick** - Verified users
- **🟡 Gold Tick** - Founders/Co-founders

### Two Simple Lists:
1. **`blue_ticks.sql`** - List of emails for blue badges
2. **`gold_ticks.sql`** - List of emails for gold badges

## Usage

### Add Blue Tick
1. Open `blue_ticks.sql`
2. Add email to the list
3. Run: `Get-Content blue_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa`

### Add Gold Tick
1. Open `gold_ticks.sql`
2. Add email to the VALUES list
3. Run: `Get-Content gold_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa`

### Remove Badges
Just remove the email from the respective SQL file and re-run it.

## Current Blue Tick Users
- adetolaadeyinka2@gmail.com
- oluwadamisi012@gmail.com
- amarachimunachi37@gmail.com
- sahirah648@gmail.com
- oguntoyinboesther3@gmail.com
- olayiwolamary1710@gmail.com

## Current Gold Tick Users
(Add founder emails to `gold_ticks.sql`)

## Badge Display Logic
- If email in `gold_verified_users` table → Show 🟡 Gold badge
- Else if `is_verified = true` → Show 🔵 Blue badge
- Else → No badge

## View All Badges
```sql
SELECT name, email, badge_type
FROM public.user_badges
WHERE badge_type != 'none';
```
