import { supabase } from './supabase';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Enhanced sign-in that uses a visually integrated In-App Browser for mobile users.
 * This keeps the user inside the UniLink app instead of switching to Chrome/Safari.
 */
export const signInWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
        // 1. Start the OAuth flow but don't redirect the main window
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // The custom scheme com.syntaxdrive.ulink:// is registered in the Android manifest
                redirectTo: 'com.syntaxdrive.ulink://auth-callback',
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            console.error('Mobile Auth Error:', error.message);
            alert('Sign in failed. Please try again.');
            return;
        }

        // 2. Open the URL in the integrated In-App Browser tab
        if (data?.url) {
            console.log('Opening In-App Browser:', data.url);
            await Browser.open({
                url: data.url,
                windowName: '_self',
                toolbarColor: '#059669' // Emerald-600 to match branding
            });
        }
    } else {
        // Standard web flow
        // redirectTo must exactly match one of the URLs in your Supabase
        // project: Authentication > URL Configuration > Redirect URLs
        const origin = window.location.origin;
        // Ensure we don't have double slashes if origin ends with /
        const redirectTo = origin.endsWith('/') ? `${origin}app` : `${origin}/app`;
        
        console.log('[Auth] Starting Google sign-in, redirectTo:', redirectTo);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: {
                    prompt: 'select_account',
                    access_type: 'offline',
                },
            },
        });

        if (error) {
            console.error('[Auth] Google sign-in error:', error.message, error);
            alert(`Sign-in failed: ${error.message}`);
            return;
        }

        console.log('[Auth] OAuth initiated, data:', data);
    }
};

/**
 * Handles the deep link return from the browser tab back to the app.
 * Call this in your root App component's useEffect.
 */
export const initializeNativeAuth = () => {
    if (!Capacitor.isNativePlatform()) return;

    // Listen for the app being opened via a URL (deep link)
    App.addListener('appUrlOpen', async (data: any) => {
        const url = new URL(data.url);

        console.log('App opened with URL:', data.url);

        // Close the browser tab manually on any deep link return
        try {
            await Browser.close();
        } catch (e) {
            console.error('Error closing browser:', e);
        }

        // Supabase PKCE flow returns a 'code' parameter
        const code = url.searchParams.get('code');

        if (code) {
            // Exchange the code for a real user session
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('Token exchange error:', error.message);
            }
        }

        // Also handle implicit flow (if anyone switched it back)
        if (url.hash && url.hash.includes('access_token')) {
            // Supabase client auto-handles hash fragments if configured
        }
    });

    // Cleanup Browser if it's still hanging
    window.addEventListener('blur', () => {
        // Logic to check if we should close browser
    });
};
