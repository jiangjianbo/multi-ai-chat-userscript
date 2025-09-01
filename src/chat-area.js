import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';

/**
 * 内容块控制器，管理主窗口中的单个AI会话区域
 * @constructor
 * @param {MainWindowController} mainController 主控制器
 * @param {Object} options 配置选项
 * @param {string} options.id 内容块ID
 * @param {string} options.url AI页面URL
 * @param {string} options.tabId 标签ID
 * @param {Object} options.config 配置信息
 */
function ChatArea(mainController, options) {
    // 调用基类的构造函数
    MessageNotifier.call(this, CHANNEL_NAME);

    this.mainController = mainController;

    this.id = options.id;
    this.url = options.url;
    this.tabId = options.tabId;
    this.config = options.config;

    this.utils = new Utils();

    /**
     * 初始化
     */
    this.init = function () {
        this.register(this); // 注册事件回调

        // 创建DOM元素
        this.element = this.createChatAreaElement();
        this.contentElement = this.utils.$('.chatarea-content', this.element);
        this.initEvents();
    }

    /**
     * 创建内容块元素
     * @return {HTMLElement} 内容块元素
     */
    this.createChatAreaElement = function () {
        const aiName = this.getAINameFromUrl(this.url);
        const rtlClass = this.utils.isRTL() ? 'rtl' : '';

        const chatArea = this.utils.createElement('div', {
            id: this.id,
            class: `chatarea ${rtlClass}`,
            dir: this.utils.isRTL() ? 'rtl' : 'ltr'
        });

        // 头部
        const header = this.utils.createElement('div', { class: 'chatarea-header' }, [
            this.utils.createElement('div', { class: 'ai-name' }, [aiName]),
            this.utils.createElement('div', { class: 'chat-controls' }, [
                this.utils.createElement('button', { class: 'web-search-btn' }, [this.utils.getLangText('webSearch')]),
                this.utils.createElement('button', { class: 'share-btn' }, [this.utils.getLangText('share')]),
                this.utils.createElement('button', { class: 'open-window-btn' }, [this.utils.getLangText('openInWindow')]),
                this.utils.createElement('button', { class: 'close-btn' }, [this.utils.getLangText('close')])
            ])
        ]);

        // 内容区域
        const content = this.utils.createElement('div', { class: 'chatarea-content' });

        // 浮动输入区域
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

    /**
     * 从URL获取AI名称
     * @param {string} url URL地址
     * @return {string} AI名称
     */
    this.getAINameFromUrl = function (url) {
        const providers = DEFAULT_AI_PROVIDERS;
        for (const provider of providers) {
            if (url.includes(provider.url.replace('https://', ''))) {
                return provider.name;
            }
        }
        return 'AI';
    };

    /**
     * 初始化事件监听
     */
    this.initEvents = function () {
        // 关闭按钮
        this.utils.$('.close-btn', this.element).addEventListener('click', () => {
            this.mainController.removeChatArea(this.id);
        });

        // 分享按钮
        this.utils.$('.share-btn', this.element).addEventListener('click', () => {
            this.send('share', {
                tabId: this.tabId,
                chatIds: [] // 分享所有对话
            });
        });

        // 打开窗口按钮
        this.utils.$('.open-window-btn', this.element).addEventListener('click', () => {
            const existingWindow = this.findExistingWindow();
            if (existingWindow) {
                existingWindow.focus();
            } else {
                window.open(this.url, '_blank');
            }
        });

        // 网页搜索按钮
        this.utils.$('.web-search-btn', this.element).addEventListener('click', () => {
            this.send('config', {
                tabId: this.tabId,
                webSearch: true
            });
        });

        // 浮动输入框切换
        const inputToggle = this.utils.$('.input-toggle', this.element);
        const hiddenInput = this.utils.$('.hidden-input', this.element);

        inputToggle.addEventListener('click', () => {
            hiddenInput.classList.toggle('active');
            if (hiddenInput.classList.contains('active')) {
                this.utils.$('textarea', hiddenInput).focus();
            }
        });

        // 发送按钮
        this.utils.$('.send-btn', this.element).addEventListener('click', () => {
            this.sendHiddenMessage();
        });

        // 回车发送
        this.utils.$('textarea', hiddenInput).addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendHiddenMessage();
            }
        });
    };

    /**
     * 发送隐藏输入框的消息
     */
    this.sendHiddenMessage = function () {
        const input = this.utils.$('textarea', this.element);
        const message = input.value.trim();
        if (message) {
            const chatId = 'chat-' + Date.now();
            this.send('chat', {
                tabId: this.tabId,
                chatId,
                message
            });
            input.value = '';
            this.utils.$('.hidden-input', this.element).classList.remove('active');
        }
    };

    /**
     * 查找已存在的AI页面窗口
     * @return {Window|null} 窗口对象
     */
    this.findExistingWindow = function () {
        for (let i = 0; i < window.frames.length; i++) {
            try {
                if (window.frames[i].location.href.includes(this.url)) {
                    return window.frames[i];
                }
            } catch (e) { /* 跨域访问会出错，忽略 */ }
        }
        return null;
    };

    /**
     * 添加消息到内容区域
     * @param {Object} message 消息对象
     * @param {string} message.type 类型：question/answer
     * @param {string} message.content 内容HTML
     */
    this.addMessage = function (message) {
        const messageClass = message.type === 'question' ? 'user-message' : 'ai-message';
        const messageElement = this.utils.createElement('div', {
            class: `message ${messageClass}`,
            dir: this.utils.isRTL() ? 'rtl' : 'ltr'
        });

        messageElement.innerHTML = message.content;
        this.contentElement.appendChild(messageElement);
        this.contentElement.scrollTop = this.contentElement.scrollHeight;
    };

    /**
     * 处理回答消息
     * @param {Object} data 回答数据
     */
    this.handleAnswer = function (data) {
        this.addMessage({
            type: 'answer',
            content: data.answer
        });
    };
}

export default ChatArea;