# 🟡 Gold Tick System (Simple)

## One File to Rule Them All

**File:** `add_gold_ticks.sql`

Just add email addresses to this file and run it. That's it!

## How to Add Gold Ticks

1. Open `add_gold_ticks.sql`
2. Add email to the VALUES list:
   ```sql
   ('newemail@example.com'),
   ```
3. Run:
   ```bash
   Get-Content add_gold_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa
   ```

## How to Remove Gold Ticks

1. Open `remove_gold_ticks.sql`
2. Add email to remove
3. Run:
   ```bash
   Get-Content remove_gold_ticks.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa
   ```

## Current Gold Tick Users

Already in the list:
- oguntoyinboesther3@gmail.com
- olayiwolamary1710@gmail.com
- adetolaadeyinka2@gmail.com
- amarachimunachi37@gmail.com
- sahirah648@gmail.com
- oluwadamisi012@gmail.com

## View All Gold Ticks

```bash
Get-Content list_verified_users.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa
```

## That's It!

No blue ticks, no complications. Just gold ticks. 🟡
