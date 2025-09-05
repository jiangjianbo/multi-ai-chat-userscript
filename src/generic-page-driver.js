import Utils from './utils.js';

function GenericPageDriver() {
    this.utils = new Utils();
    this.selectors = {
        inputArea: 'input[type="text"], textarea',
        sendButton: 'button[type="submit"], .send-button, .send-btn',
        chatHistory: '.chat-messages, .messages, #chat-area',
        messageItem: '.message, .chat-message',
        userMessage: '.user-message',
        aiMessage: '.ai-message',
        newChatButton: '.new-chat-button, .new-conversation'
    };

    this.getUsername = function () { return new Promise(resolve => setTimeout(() => resolve('User'), 100)); };
    this.getChatHistory = function () { return new Promise(resolve => resolve([])); };

    this.sendMessage = function (message) {
        return new Promise(resolve => {
            const input = this.utils.$(this.selectors.inputArea);
            if (input) {
                input.value = message;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                const sendBtn = this.utils.$(this.selectors.sendButton);
                if (sendBtn) { sendBtn.click(); setTimeout(resolve, 1000); } else { resolve(); }
            } else { resolve(); }
        });
    };

    this.getAnswer = function () {
        return new Promise(resolve => {
            const chatHistory = this.utils.$(this.selectors.chatHistory);
            if (chatHistory) {
                const messages = this.utils.$$(this.selectors.messageItem, chatHistory);
                const lastMessage = messages[messages.length - 1];
                resolve(lastMessage ? lastMessage.innerHTML : '');
            } else { resolve(''); }
        });
    };

    this.addFloatingToolbars = function () {
        const messages = this.utils.$$(this.selectors.messageItem);
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
            const newChatBtn = this.utils.$(this.selectors.newChatButton);
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