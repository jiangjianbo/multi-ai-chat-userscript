/**
 * @file content-script.js
 * @description Acts as a bridge between the page and the background service worker.
 */

/**
 * Injects the ChromeBroadcastChannel.js script into the page's context (DOM).
 * This makes the ChromeBroadcastChannel class available to the page's scripts.
 */
function injectScript() {
    try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('ChromeBroadcastChannel.js');
        (document.head || document.documentElement).appendChild(script);
    } catch (e) {
        console.error('Multi-AI-Chat: Failed to inject ChromeBroadcastChannel script.', e);
    }
}

injectScript();

/**
 * Listens for custom events from the page (dispatched by ChromeBroadcastChannel.js)
 * and forwards them to the background script.
 */
document.addEventListener('message-from-page', (event) => {
    // The event.detail contains the message payload from the page
    chrome.runtime.sendMessage(event.detail).catch(error => {
        // This can happen if the extension context is invalidated (e.g., during an update)
        if (!error.message.includes('Extension context invalidated')) {
            console.error('Multi-AI-Chat: Error sending message to background:', error);
        }
    });
});

/**
 * Listens for messages from the background script and dispatches them
 * as custom events into the page's DOM.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { channel, payload } = message;

    if (channel) {
        // Dispatch an event with a unique name based on the channel
        // so that the correct ChromeBroadcastChannel instance can pick it up.
        document.dispatchEvent(new CustomEvent(`message-from-content-script-${channel}`, {
            detail: payload
        }));
    }
    
    // Return true to allow for asynchronous sendResponse, although not used here.
    return true;
});