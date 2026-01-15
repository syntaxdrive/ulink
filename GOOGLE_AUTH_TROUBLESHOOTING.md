# Google Sign-In Name Troubleshooting

If you have configured the Google Cloud OAuth Consent Screen but still see `project-id.supabase.co` instead of "UniLink", check these common issues:

## 1. App Status: Testing vs. Published
**most common cause**

*   **Issue**: If your app status is **"Testing"**, Google warns users by showing the domain name (`supabase.co`) instead of your App Name to prevent phishing.
*   **Fix**:
    1.  Go to [Google Cloud Console > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).
    2.  Under **Publishing status**, click **PUBLISH APP**.
    3.  Confirm the dialog.
    *   *Note: For basic access (email/profile), verification is not required immediately, but publishing makes the name visible.*

## 2. Authorized Domains
*   **Issue**: If the domain (`supabase.co`) is not in your authorized domains list, Google might default to showing the project ID.
*   **Fix**:
    1.  In the OAuth Consent Screen editor.
    2.  Scroll to **Authorized domains**.
    3.  Ensure `supabase.co` is added (since Supabase handles the auth redirect).

## 3. Propagation Delay
*   **Issue**: Changes to the consent screen can take 5-10 minutes to reflect globally.
*   **Fix**: Wait 10 minutes and try again.

## 4. Browser Cache
*   **Issue**: Your browser remembers the old consent screen.
*   **Fix**: Open an **Incognito/Private** window and try to sign in again.

## 5. Verification for Logo
*   **Issue**: If you uploaded a **Logo**, Google might restrict showing the custom branding until the app is verified.
*   **Fix**: Try temporarily **removing the logo** and saving. If the name "UniLink" appears after removing the logo, you know it's a verification requirement.
