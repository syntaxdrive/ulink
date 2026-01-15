# UniLink Admin Dashboard Guide

## 1. Accessing the Dashboard
The Admin Dashboard is located at `/app/admin`.
It is only accessible to users with `is_admin = true`.

## 2. Promoting a User to Admin
To add a new admin (so they can access the dashboard), you don't need to create a new account. You simply promote an existing user.

1.  Open the file `sql/add_admin_by_email.sql` in your editor.
2.  Edit the email list to include the email(s) you want to promote:
    ```sql
    WHERE email IN (
        'new_admin@ulink.com',
        'another_one@ulink.com'
    )
    ```
3.  Run the script via your terminal:
    ```bash
    Get-Content sql/add_admin_by_email.sql | npx supabase db execute --project-ref hnybmnkjsbvyvqbzclsa
    ```

## 3. FAQ: Admin Passwords & Login
**Q: What is the admin password?**
A: Admins use their **existing personal password**. Since "Admin" is just a status applied to a regular user, they log in normally with their own email and password.

**Q: How do I create a shared admin account?**
A: 1. Go to the Sign Up page and create a new account (e.g., `admin@ulink.com`).
   2. Set a password you want to share.
   3. Run the `add_admin_by_email.sql` script for this email.
   4. Share these credentials with your team.

## 4. Features
-   **Analytics:** View total users, verified counts, and organizations.
-   **User Management:**
    -   Search for any user.
    -   **Verify/Unverify:** Click the button to toggle their Blue Tick status.
    -   View basic details (School, Email).

## 4. Troubleshooting
-   If you get "Checking permissions..." forever, ensure your `role_type` is set correctly in the database.
-   If stats show 0, ensure the `setup_admin_dashboard.sql` script ran successfully.
