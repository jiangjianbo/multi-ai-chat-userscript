/**
 * @file background.js
 * @description The service worker for the Chrome extension, acting as a message routing hub.
 */

// Routing table: Map<channelName, Set<tabId>>
const routingTable = new Map();

// Adaptor cache: 存储窗口引用等缓存数据
const adaptorCache = {};

/**
 * Handles browserAdaptor messages from content scripts.
 * @param {object} message - The message object
 * @param {object} sender - The sender info
 * @param {function} sendResponse - The response callback
 */
async function handleBrowserAdaptorMessage(message, sender, sendResponse) {
    const { action } = message;

    switch (action) {
        case 'findOrCreateNamedWindow': {
            const { name, options } = message;
            try {
                // 查找已有 tab：检查所有 tab 的 window.name
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                    try {
                        const results = await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: () => window.name
                        });
                        if (results && results[0] && results[0].result === name) {
                            sendResponse({ handle: { tabId: tab.id }, isNew: false });
                            return;
                        }
                    } catch (e) {
                        // Tab 无法执行脚本，跳过
                    }
                }

                // 未找到，创建新窗口
                const width = options?.width || 1200;
                const height = options?.height || 800;
                const left = Math.floor((screen.width - width) / 2);
                const top = Math.floor((screen.height - height) / 2);

                const newWindow = await chrome.windows.create({
                    url: chrome.runtime.getURL('main-window.html'),
                    type: 'popup',
                    width, height, left, top
                });

                const tabId = newWindow.tabs[0].id;
                // 设置窗口名称
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: (n) => { window.name = n; },
                    args: [name]
                });

                sendResponse({ handle: { tabId }, isNew: true });
            } catch (e) {
                console.error('findOrCreateNamedWindow error:', e);
                sendResponse({ handle: null, isNew: false });
            }
            break;
        }

        case 'focusWindow': {
            const { handle } = message;
            if (handle?.tabId) {
                try {
                    const tab = await chrome.tabs.get(handle.tabId);
                    if (tab) {
                        await chrome.tabs.update(handle.tabId, { active: true });
                        await chrome.windows.update(tab.windowId, { focused: true });
                    }
                } catch (e) {
                    console.error('focusWindow error:', e);
                }
            }
            sendResponse({});
            break;
        }

        case 'closeCurrentWindow': {
            const tabId = sender.tab?.id;
            if (tabId) {
                chrome.tabs.remove(tabId);
            }
            sendResponse({});
            break;
        }

        case 'openTab': {
            const { url, target } = message;
            try {
                const tab = await chrome.tabs.create({ url });
                sendResponse({ handle: { tabId: tab.id } });
            } catch (e) {
                console.error('openTab error:', e);
                sendResponse({ handle: null });
            }
            break;
        }

        case 'setCachedWindowRef': {
            const { key, handle } = message;
            adaptorCache[key] = handle;
            sendResponse({});
            break;
        }

        default:
            sendResponse({});
    }
}

/**
 * Handles incoming messages from content scripts.
 * Messages can be for registration, unregistration, or broadcasting.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;

    // BrowserAdaptor 消息处理
    if (type === 'browserAdaptor') {
        handleBrowserAdaptorMessage(message, sender, sendResponse);
        return true;
    }

    const { channel, payload } = message;
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