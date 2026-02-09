---
description: connect project to Netlify for deployment
---

# Connect to Netlify

Since this is the first deployment, you need to connect your GitHub repository to Netlify.

## Option 1: Via Netlify Dashboard (Recommended)

1.  **Log in to Netlify**: Go to [app.netlify.com](https://app.netlify.com) and log in.
2.  **Add New Site**: Click **"Add new site"** > **"Import an existing project"**.
3.  **Connect to GitHub**: Select **GitHub** as your Git provider.
4.  **Authorize Netlify**: If asked, authorize Netlify to access your repositories.
5.  **Select Repository**: Search for and select **`syntaxdrive/ulink`**.
6.  **Configure Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
7.  **Add Environment Variables**:
    *   Click **"Show advanced"** > **"New variable"**.
    *   Add `VITE_SUPABASE_URL` (copy value from your local `.env`)
    *   Add `VITE_SUPABASE_ANON_KEY` (copy value from your local `.env`)
8.  **Deploy**: Click **"Deploy site"**.

## Option 2: Via Netlify CLI (Advanced)

1.  Isntall CLI: `npm install -g netlify-cli`
2.  Login: `netlify login`
3.  Initialize: `netlify init`
    *   Select "Create & configure a new site"
    *   Follow the prompts to select your team and site name
    *   Build command: `npm run build`
    *   Deploy folder: `dist`
