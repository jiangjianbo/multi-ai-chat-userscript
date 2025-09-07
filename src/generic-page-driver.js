import Utils from './utils.js';

function GenericPageDriver() {
    this.utils = new Utils();
    this.selectors = {
        inputArea: ['input[type="text"]', 'textarea', '.ql-editor', '.chat-input-editor'],
        sendButton: ['button[type="submit"]', '.send-button', '.send-btn', 'button[aria-label="发送"]'],
        chatHistory: ['.chat-messages', '.messages', '#chat-area', '.chat-history-scroll-container'],
        messageItem: ['.message', '.chat-message', '.conversation-container'],
        userMessage: ['.user-message', '.segment-user', '.user-query-container'],
        aiMessage: ['.ai-message', '.segment-assistant', '.model-response-container'],
        newChatButton: ['.new-chat-button', '.new-conversation', 'button[data-test-id="new-chat-button"]'],
        sessionTitle: ['h2.session-title', '.chat-header-content h2', '.conversation-title']
    };

    // Helper to find an element using multiple selectors
    this._querySelector = function(selectors, context = document) {
        for (const selector of selectors) {
            const element = context.querySelector(selector);
            if (element) return element;
        }
        return null;
    };

    // Helper to find all elements using multiple selectors
    this._querySelectorAll = function(selectors, context = document) {
        let allElements = [];
        for (const selector of selectors) {
            const elements = context.querySelectorAll(selector);
            if (elements.length > 0) {
                allElements = [...allElements, ...Array.from(elements)];
            }
        }
        return allElements;
    };

    this.getUsername = function () { return new Promise(resolve => setTimeout(() => resolve('User'), 100)); };
    
    this.getSessionTitle = function() {
        const titleElement = this._querySelector(this.selectors.sessionTitle);
        return titleElement ? titleElement.textContent.trim() : null;
    };

    this.getChatHistory = function () {
        const historyContainer = this._querySelector(this.selectors.chatHistory);
        if (historyContainer) {
            const historyItems = this._querySelectorAll(this.selectors.messageItem, historyContainer);
            return Array.from(historyItems).map(item => item.textContent.trim().substring(0, 50) + '...');
        }
        return [];
    };

    this.sendMessage = function (message) {
        return new Promise(resolve => {
            const input = this._querySelector(this.selectors.inputArea);
            if (input) {
                input.value = message;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                const sendBtn = this._querySelector(this.selectors.sendButton);
                if (sendBtn) { sendBtn.click(); setTimeout(resolve, 1000); } else { resolve(); }
            } else { resolve(); }
        });
    };

    this.getAnswer = function () {
        return new Promise(resolve => {
            const chatHistory = this._querySelector(this.selectors.chatHistory);
            if (chatHistory) {
                const messages = this._querySelectorAll(this.selectors.aiMessage, chatHistory);
                const lastMessage = messages[messages.length - 1];
                resolve(lastMessage ? lastMessage.textContent.trim() : '');
            } else {
                resolve('');
            }
        });
    };

    this.addFloatingToolbars = function () {
        const messages = this._querySelectorAll(this.selectors.messageItem);
        messages.forEach(msg => {
            if (!this.utils.$('.ai-sync-toolbar', msg)) {
                const toolbar = this.utils.createElement('div', { class: 'ai-sync-toolbar', style: 'position:absolute; top:5px; right:5px; display:flex; gap:5px;' }, [
                    this.utils.createElement('button', { class: 'copy-btn' }, ['Copy']),
                    this.utils.createElement('button', { class: 'collapse-btn' }, ['-']),
                    this.utils.createElement('button', { class: 'hide-btn' }, ['×'])
                ]);
                msg.style.position = 'relative';
                msg.appendChild(toolbar);
                this.utils.$('.copy-btn', toolbar).addEventListener('click', () => navigator.clipboard.writeText(msg.textContent));
                this.utils.$('.collapse-btn', toolbar).addEventListener('click', () => { const c = msg.querySelector(':scope > div:not(.ai-sync-toolbar)'); if(c) c.style.display = c.style.display === 'none' ? 'block' : 'none'; });
                this.utils.$('.hide-btn', toolbar).addEventListener('click', () => { msg.style.display = 'none'; });
            }
        });
    };

    this.createNewThread = function () {
        return new Promise(resolve => {
            const newChatBtn = this._querySelector(this.selectors.newChatButton);
            if (newChatBtn) {
                newChatBtn.click();
                setTimeout(() => { this.getUsername().then(username => resolve({ url: window.location.href, tabId: this.getTabId(), config: { username } })); }, 1000);
            } else { resolve(null); }
        });
    };

    this.getTabId = function () { return window.location.href + Date.now(); };
    this.createShareLink = function (chatIds) { return new Promise(resolve => resolve(window.location.href)); };
}

export default GenericPageDriver;