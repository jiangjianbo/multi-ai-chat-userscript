/**
 * @file background.js
 * @description The service worker for the Chrome extension, acting as a message routing hub.
 */

// Routing table: Map<channelName, Set<tabId>>
const routingTable = new Map();

/**
 * Handles incoming messages from content scripts.
 * Messages can be for registration, unregistration, or broadcasting.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, channel, payload } = message;
    const tabId = sender.tab ? sender.tab.id : null;

    if (!channel || !tabId) {
        return;
    }

    switch (type) {
        case 'register':
            if (!routingTable.has(channel)) {
                routingTable.set(channel, new Set());
            }
            routingTable.get(channel).add(tabId);
            console.log(`Tab ${tabId} registered for channel "${channel}"`);
            break;

        case 'unregister':
            if (routingTable.has(channel)) {
                routingTable.get(channel).delete(tabId);
                if (routingTable.get(channel).size === 0) {
                    routingTable.delete(channel);
                }
                console.log(`Tab ${tabId} unregistered from channel "${channel}"`);
            }
            break;

        case 'broadcast':
            const subscribers = routingTable.get(channel);
            if (subscribers) {
                subscribers.forEach(subscriberTabId => {
                    // Don't send the message back to the originating tab
                    if (subscriberTabId !== tabId) {
                        chrome.tabs.sendMessage(subscriberTabId, { channel, payload }).catch(error => {
                            // Suppress common errors when a tab is closed or unreachable
                            if (!error.message.includes('Receiving end does not exist')) {
                                console.error(`Failed to send message to tab ${subscriberTabId}:`, error);
                            }
                        });
                    }
                });
            }
            break;
    }
    
    // Indicate that the response will be sent asynchronously (optional, but good practice).
    return true;
});

/**
 * Cleans up the routing table when a tab is closed.
 */
chrome.tabs.onRemoved.addListener((closedTabId, removeInfo) => {
    routingTable.forEach((subscribers, channel) => {
        if (subscribers.has(closedTabId)) {
            subscribers.delete(closedTabId);
            if (subscribers.size === 0) {
                routingTable.delete(channel);
            }
            console.log(`Cleaned up registration for closed tab ${closedTabId} from channel "${channel}"`);
        }
    });
});