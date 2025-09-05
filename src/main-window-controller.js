import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';
import ChatArea from './chat-area.js';

const CHANNEL_NAME = 'multi-ai-chat-channel';

/**
 * 主窗口控制器
 * @constructor
 */
function MainWindowController() {
    MessageNotifier.call(this, CHANNEL_NAME);
    this.utils = new Utils();
    this.chatAreas = {};
    this.chatAreaCount = 0;
    this.currentLayout = 2;

    this.init = function () {
        this.register(this);
        this.initLayoutButtons();
        this.initSendButton();
        this.loadFromLocalStorage();
        this.setupRTLSupport();
    };

    this.initLayoutButtons = function () {
        const buttons = this.utils.$$('.layout-buttons button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentLayout = parseInt(button.dataset.layout);
                this.updateLayout();
            });
        });
    };

    this.initSendButton = function () {
        const sendButton = this.utils.$('#send-all-btn');
        const input = this.utils.$('#main-prompt');
        sendButton.addEventListener('click', () => this.sendToAll());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendToAll(); }
        });
    };

    this.sendToAll = function () {
        const input = this.utils.$('#main-prompt');
        const message = input.value.trim();
        if (message && Object.keys(this.chatAreas).length > 0) {
            const chatId = 'main-' + Date.now();
            for (const id in this.chatAreas) {
                this.chatAreas[id].addMessage({ type: 'question', content: message });
            }
            this.send('chat', { chatId, message });
            input.value = '';
        }
    };

    this.addChatArea = function (data) {
        for (const id in this.chatAreas) {
            if (this.chatAreas[id].tabId === data.tabId) { return id; }
        }
        this.chatAreaCount++;
        const chatAreaId = `chatarea-${this.chatAreaCount}`;
        const chatArea = new ChatArea(this, { id: chatAreaId, ...data });
        chatArea.init();
        this.chatAreas[chatAreaId] = chatArea;
        this.utils.$('#chat-areas-container').appendChild(chatArea.element);
        this.updateLayout();
        this.saveToLocalStorage();
        return chatAreaId;
    };

    this.removeChatArea = function (id) {
        if (this.chatAreas[id]) {
            const element = this.chatAreas[id].element;
            if (element && element.parentNode) { element.parentNode.removeChild(element); }
            delete this.chatAreas[id];
            this.updateLayout();
            this.saveToLocalStorage();
        }
    };

    this.updateLayout = function () {
        const container = this.utils.$('#chat-areas-container');
        const count = Object.keys(this.chatAreas).length;
        const layout = Math.min(this.currentLayout, count || 1);
        let columns = count > 0 ? layout : 1;
        if (count === 4) columns = 2;
        if (count === 6) columns = 3;
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    };

    this.onMsgCreate = function (data) { this.addChatArea(data); };
    this.onMsgAnswer = function (data) { for (const id in this.chatAreas) { if (this.chatAreas[id].tabId === data.tabId) { this.chatAreas[id].handleAnswer(data); break; } } };
    this.onMsgThreadReturn = function (data) { for (const id in this.chatAreas) { if (this.chatAreas[id].tabId === data.tabId) { this.chatAreas[id].tabId = data.tabId; this.chatAreas[id].url = data.url; this.chatAreas[id].config = data.config; break; } } };
    this.onMsgShareReturn = function (data) { for (const id in this.chatAreas) { if (this.chatAreas[id].tabId === data.tabId) { this.chatAreas[id].addMessage({ type: 'system', content: `Share link: <a href="${data.link}" target="_blank">${data.link}</a>` }); break; } } };

    this.saveToLocalStorage = function () {
        const data = { chatAreas: Object.values(this.chatAreas).map(area => ({ url: area.url, tabId: area.tabId, config: area.config })), layout: this.currentLayout };
        localStorage.setItem('multi-ai-chat-data', JSON.stringify(data));
    };

    this.loadFromLocalStorage = function () {
        const data = localStorage.getItem('multi-ai-chat-data');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.chatAreas) parsed.chatAreas.forEach(area => { this.addChatArea(area); });
                if (parsed.layout) { this.currentLayout = parsed.layout; this.updateLayout(); }
            } catch (e) { console.error('Failed to load from localStorage:', e); }
        }
    };

    this.setupRTLSupport = function () {
        if (this.utils.isRTL()) { document.body.classList.add('rtl'); document.body.dir = 'rtl'; }
    };
}

export default MainWindowController;
