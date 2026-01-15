---
description: How to fix the App Name on Google Sign-In Screen
---

# Fix Google Sign-In App Name (Supabase URL showing)

If you see `project-id.supabase.co` or "Supabase" instead of "UniLink", it usually means you are using Supabase's default testing keys or your Google Cloud configuration is incomplete.

## Phase 1: Ensure You Are Using Your Own Google Keys

You cannot change the name if you are using Supabase's default shared Google credentials. You must create your own.

1.  **Go to Supabase Dashboard**
    *   Authentication > Providers > **Google**.
    *   Ensure **Client ID** and **Client Secret** are populated with *your own* keys from Google Cloud, not left blank (which uses defaults).
    *   If they are blank, you need to create a project in Google Cloud.

## Phase 2: Update Google Cloud Consent Screen

If you *are* using your own keys, you need to configure the name in Google Cloud.

1.  **Open Google Cloud Console**
    *   [https://console.cloud.google.com/](https://console.cloud.google.com/)
    *   Select the project that matches the Client ID in Supabase.

2.  **Go to OAuth Consent Screen**
    *   **APIs & Services** > **OAuth consent screen**.
    *   Click **Edit App**.

3.  **Update Info**
    *   **App Name**: Set to **UniLink**.
    *   **Support Email**: `unilinkrep@gmail.com`.
    *   **Authorized Domains**: Add `supabase.co` AND your own domain (e.g. `vercel.app`).

4.  **Save & Publish**
    *   Save changes.
    *   If the app status is **Testing**, only added test users can access it. To make it public and remove the "Unverified App" warning (if applicable), click **Publish App**.

## Phase 3: Check Supabase URL Customization (Advanced)

If the URL in the address bar is `...supabase.co/auth/v1/...`, that is normal for the redirection. You can map a custom domain in Supabase (Pro plan) if you want `auth.unilink.com`, but the **Consent Screen text** is controlled purely by Google Cloud settings.
