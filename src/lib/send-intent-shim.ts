
import { registerPlugin } from '@capacitor/core';

// Standard Capacitor 3+ registration.
// This replaces the broken 'registerWebPlugin' call in the original plugin's web.js
const SendIntent = registerPlugin<any>('SendIntent', {
    web: () => Promise.resolve({ 
        checkSendIntentReceived: () => Promise.resolve({}),
        addListener: () => ({ remove: () => {} }),
        removeAllListeners: () => {}
    })
});

export { SendIntent };
