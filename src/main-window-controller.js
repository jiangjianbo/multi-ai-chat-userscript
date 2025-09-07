
import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';
import ChatArea from './chat-area.js';

const CHANNEL_NAME = 'multi-ai-chat-channel';

function MainWindowController() {
    MessageNotifier.call(this, CHANNEL_NAME);
    this.utils = new Utils();
    this.chatAreas = {};
    this.currentLayout = 2;

    this.init = function () {
        this.register(this);
        this.initLayoutButtons();
        this.initControlButtons();
        this.initSendButton();
        this.loadFromLocalStorage();
        this.updateLayout();
    };

    this.initLayoutButtons = function () {
        const buttons = this.utils.$$('.layout-buttons button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.utils.$$('.layout-buttons button.active').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentLayout = parseInt(e.currentTarget.dataset.layout, 10);
                this.updateLayout();
            });
        });
    };

    this.initControlButtons = function() {
        this.utils.$('#new-chat-btn').addEventListener('click', () => this.addChatArea());
    };

    this.initSendButton = function () {
        const sendButton = this.utils.$('#send-all-btn');
        const input = this.utils.$('#main-prompt');
        sendButton.addEventListener('click', () => this.sendToAll());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendToAll(); }
        });
    };

    this.sendToAll = function () {
        const input = this.utils.$('#main-prompt');
        const message = input.value.trim();
        if (!message) return;

        const chatId = 'main-' + Date.now();
        for (const id in this.chatAreas) {
            const area = this.chatAreas[id];
            if (area.isAssigned) {
                area.addMessage({ type: 'user', content: message });
            }
        }
        this.send('chat', { chatId, message });
        input.value = '';
    };

    this.addChatArea = function (data = {}) {
        const chatAreaId = `chatarea-${Date.now()}`;
        const chatArea = new ChatArea(this, { id: chatAreaId, ...data });
        chatArea.init();
        this.chatAreas[chatAreaId] = chatArea;
        this.utils.$('#chat-areas-container').appendChild(chatArea.element);
        this.updateLayout();
        return chatAreaId;
    };

    this.removeChatArea = function (id) {
        if (this.chatAreas[id]) {
            this.chatAreas[id].element.remove();
            delete this.chatAreas[id];
            this.updateLayout();
        }
    };

    this.updateLayout = function () {
        const container = this.utils.$('#chat-areas-container');
        const count = Object.keys(this.chatAreas).length;
        const layoutButtons = this.utils.$$('.layout-buttons button');

        layoutButtons.forEach(button => {
            button.disabled = parseInt(button.dataset.layout, 10) < count;
        });

        if (parseInt(this.currentLayout, 10) < count) {
            this.currentLayout = count;
            const currentActive = this.utils.$('.layout-buttons button.active');
            if(currentActive) currentActive.classList.remove('active');
            const newActive = this.utils.$(`.layout-buttons button[data-layout='${this.currentLayout}']`);
            if(newActive) newActive.classList.add('active');
        }

        let columns = 1;
        switch (String(this.currentLayout)) {
            case '1': columns = 1; break;
            case '2': columns = 2; break;
            case '3': columns = 3; break;
            case '4': columns = 2; break;
            case '6': columns = 3; break;
            default: columns = Math.min(count, 2); break;
        }
        container.style.gridTemplateColumns = count > 0 ? `repeat(${columns}, 1fr)` : 'none';
    };

    this.onMsgCreate = function (data) { this.addChatArea(data); };
    this.onMsgAnswer = function (data) { for (const id in this.chatAreas) { if (this.chatAreas[id].tabId === data.tabId) { this.chatAreas[id].handleAnswer(data); break; } } };
}

export default MainWindowController;
