import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';

const CHANNEL_NAME = 'multi-ai-chat-channel';

/**
 * 内容块控制器，管理主窗口中的单个AI会话区域
 * @constructor
 * @param {MainWindowController} mainController 主控制器
 * @param {Object} options 配置选项
 */
function ChatArea(mainController, options) {
    MessageNotifier.call(this, CHANNEL_NAME);

    this.mainController = mainController;
    this.id = options.id;
    this.url = options.url;
    this.tabId = options.tabId;
    this.config = options.config;
    this.utils = new Utils();
    const DEFAULT_AI_PROVIDERS = this.utils.getDefaultAiProviders();

    this.init = function () {
        this.register(this);
        this.element = this.createChatAreaElement();
        this.contentElement = this.utils.$('.chatarea-content', this.element);
        this.initEvents();
    };

    this.createChatAreaElement = function () {
        const aiName = this.getAINameFromUrl(this.url);
        const rtlClass = this.utils.isRTL() ? 'rtl' : '';
        const chatArea = this.utils.createElement('div', { id: this.id, class: `chatarea ${rtlClass}`, dir: this.utils.isRTL() ? 'rtl' : 'ltr' });
        const header = this.utils.createElement('div', { class: 'chatarea-header' }, [
            this.utils.createElement('div', { class: 'ai-name' }, [aiName]),
            this.utils.createElement('div', { class: 'chat-controls' }, [
                this.utils.createElement('button', { class: 'web-search-btn' }, [this.utils.getLangText('webSearch')]),
                this.utils.createElement('button', { class: 'share-btn' }, [this.utils.getLangText('share')]),
                this.utils.createElement('button', { class: 'open-window-btn' }, [this.utils.getLangText('openInWindow')]),
                this.utils.createElement('button', { class: 'close-btn' }, [this.utils.getLangText('close')])
            ])
        ]);
        const content = this.utils.createElement('div', { class: 'chatarea-content' });
        const floatingInput = this.utils.createElement('div', { class: 'floating-input' }, [
            this.utils.createElement('div', { class: 'input-toggle' }, ['↑']),
            this.utils.createElement('div', { class: 'hidden-input' }, [
                this.utils.createElement('textarea', { placeholder: this.utils.getLangText('send') + '...' }),
                this.utils.createElement('button', { class: 'send-btn' }, [this.utils.getLangText('send')])
            ])
        ]);
        chatArea.appendChild(header);
        chatArea.appendChild(content);
        chatArea.appendChild(floatingInput);
        return chatArea;
    };

    this.getAINameFromUrl = function (url) {
        for (const provider of DEFAULT_AI_PROVIDERS) {
            if (url.includes(provider.url.replace('https://', ''))) {
                return provider.name;
            }
        }
        return 'AI';
    };

    this.initEvents = function () {
        this.utils.$('.close-btn', this.element).addEventListener('click', () => this.mainController.removeChatArea(this.id));
        this.utils.$('.share-btn', this.element).addEventListener('click', () => this.send('share', { tabId: this.tabId, chatIds: [] }));
        this.utils.$('.open-window-btn', this.element).addEventListener('click', () => {
            const existingWindow = this.findExistingWindow();
            if (existingWindow) { existingWindow.focus(); } else { window.open(this.url, '_blank'); }
        });
        this.utils.$('.web-search-btn', this.element).addEventListener('click', () => this.send('config', { tabId: this.tabId, webSearch: true }));
        const inputToggle = this.utils.$('.input-toggle', this.element);
        const hiddenInput = this.utils.$('.hidden-input', this.element);
        inputToggle.addEventListener('click', () => {
            hiddenInput.classList.toggle('active');
            if (hiddenInput.classList.contains('active')) { this.utils.$('textarea', hiddenInput).focus(); }
        });
        this.utils.$('.send-btn', this.element).addEventListener('click', () => this.sendHiddenMessage());
        this.utils.$('textarea', hiddenInput).addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendHiddenMessage(); }
        });
    };

    this.sendHiddenMessage = function () {
        const input = this.utils.$('textarea', this.element);
        const message = input.value.trim();
        if (message) {
            const chatId = 'chat-' + Date.now();
            this.send('chat', { tabId: this.tabId, chatId, message });
            input.value = '';
            this.utils.$('.hidden-input', this.element).classList.remove('active');
        }
    };

    this.findExistingWindow = function () {
        for (let i = 0; i < window.frames.length; i++) {
            try {
                if (window.frames[i].location.href.includes(this.url)) { return window.frames[i]; }
            } catch (e) { /* cross-origin */ }
        }
        return null;
    };

    this.addMessage = function (message) {
        const messageClass = message.type === 'question' ? 'user-message' : 'ai-message';
        const messageElement = this.utils.createElement('div', { class: `message ${messageClass}`, dir: this.utils.isRTL() ? 'rtl' : 'ltr' });
        messageElement.innerHTML = message.content;
        this.contentElement.appendChild(messageElement);
        this.contentElement.scrollTop = this.contentElement.scrollHeight;
    };

    this.handleAnswer = function (data) {
        this.addMessage({ type: 'answer', content: data.answer });
    };
}

export default ChatArea;