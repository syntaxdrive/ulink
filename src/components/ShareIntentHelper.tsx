
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendIntent } from 'capacitor-plugin-send-intent';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';

/**
 * Handles incoming shared content (text, links, images) from other Android apps.
 * This component listens for intents and pre-fills the post creation state.
 */
export default function ShareIntentHelper() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const urlToBlob = async (url: string) => {
            const response = await fetch(url);
            return await response.blob();
        };

        const handleIntent = async (data: any) => {
            try {
                console.log('[ShareIntent] Received:', data);
                
                let content = '';
                let images: File[] = [];

                // 1. Handle Text/URL
                if (data.text || data.url || data.title) {
                    const parts: string[] = [];
                    if (data.title) parts.push(data.title);
                    if (data.text && data.text !== data.title && data.text !== data.url) parts.push(data.text);
                    if (data.url) parts.push(data.url);
                    content = parts.join('\n\n');
                }

                // 2. Handle Images/Files (clanceyp/capacitor-plugin-send-intent pattern)
                // The plugin might put the URI in data.url if it's a single file, 
                // or in extras for more complex shares.
                const possibleUri = data.url || data.extras?.['android.intent.extra.STREAM'];
                
                if (possibleUri && typeof possibleUri === 'string' && (possibleUri.startsWith('content://') || possibleUri.startsWith('file://'))) {
                    try {
                        const blob = await urlToBlob(Capacitor.convertFileSrc(possibleUri));
                        const file = new File([blob], `share_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
                        images.push(file);
                    } catch (err) {
                        console.error('[ShareIntent] Failed to read image URI:', err);
                    }
                }

                if (content || images.length > 0) {
                    // Navigate to feed and pass share content via state
                    navigate('/app', { 
                        state: { 
                            shareContent: content,
                            shareImages: images,
                            shareType: data.type || 'text'
                        },
                        replace: true 
                    });
                }
            } catch (e) {
                console.error('[ShareIntent] Failed to handle intent:', e);
            }
        };

        // Check for intent that started the app
        SendIntent.checkSendIntentReceived().then((result) => {
            if (result) handleIntent(result);
        }).catch(err => {
            console.error('[ShareIntent] Error checking intent:', err);
        });

        // Listen for intents while the app is running
        const listener = SendIntent.addListener('appSendIntentReceived', (data: any) => {
            handleIntent(data);
        });

        return () => {
            listener.remove();
        };
    }, [navigate]);

    return null;
}
