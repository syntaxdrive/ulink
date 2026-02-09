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

## 6. "Requested path is invalid" Error
*   **Issue**: You see this error when trying to sign in.
*   **Cause**: The URL you are redirected back to (e.g., `http://localhost:5173/app`) is not whitelisted in Supabase.
*   **Fix**:
    1.  Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**.
    2.  Under **Redirect URLs**, add:
        *   `http://localhost:5173/app`
        *   `https://your-production-domain.vercel.app/app`
    3.  Save changes.

## 7. Google Cloud Redirect URI
*   **Issue**: Google rejects the login request.
*   **Fix**:
    1.  Copy your Supabase Callback URL (usually `https://<project-ref>.supabase.co/auth/v1/callback`).
    2.  Go to **Google Cloud Console** > **Credentials**.
    3.  Click on your **OAuth 2.0 Client ID**.
    4.  Under **Authorized redirect URIs**, paste the URL.
    5.  Save.

