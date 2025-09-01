import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';

/**
 * 主窗口控制器
 * @constructor
 */
function MainWindowController() {
    // 调用基类的构造函数
    MessageNotifier.call(this, CHANNEL_NAME);

    this.utils = new Utils();

    this.chatAreas = {};
    this.chatAreaCount = 0;
    this.currentLayout = 2;

    /**
     * 初始化主窗口
     */
    this.init = function () {
        this.register(this); // 注册事件回调

        this.initLayoutButtons();
        this.initSendButton();
        this.loadFromLocalStorage();
        this.setupRTLSupport();
    };

    /**
     * 初始化布局按钮
     */
    this.initLayoutButtons = function () {
        const buttons = this.utils.$$('.layout-buttons button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentLayout = parseInt(button.dataset.layout);
                this.updateLayout();
            });
        });
    };

    /**
     * 初始化发送按钮
     */
    this.initSendButton = function () {
        const sendButton = this.utils.$('#send-all-btn');
        const input = this.utils.$('#main-prompt');

        sendButton.addEventListener('click', () => this.sendToAll());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendToAll();
            }
        });
    };

    /**
     * 发送消息到所有AI
     */
    this.sendToAll = function () {
        const input = this.utils.$('#main-prompt');
        const message = input.value.trim();
        if (message && Object.keys(this.chatAreas).length > 0) {
            const chatId = 'main-' + Date.now();

            // 在每个内容块中显示问题
            for (const id in this.chatAreas) {
                this.chatAreas[id].addMessage({
                    type: 'question',
                    content: message
                });
            }

            // 发送到所有AI
            this.send('chat', {
                chatId,
                message
            });

            input.value = '';
        }
    };

    /**
     * 添加内容块
     * @param {Object} data 内容块数据
     * @return {string} 内容块ID
     */
    this.addChatArea = function (data) {
        this.chatAreaCount++;
        const chatAreaId = `chatarea-${this.chatAreaCount}`;

        // 检查是否已存在相同tabId的内容块
        for (const id in this.chatAreas) {
            if (this.chatAreas[id].tabId === data.tabId) {
                return id; // 已存在，返回现有ID
            }
        }

        const chatArea = new ChatArea(this, {
            id: chatAreaId,
            url: data.url,
            tabId: data.tabId,
            config: data.config
        });
        chatArea.init(); // 初始化内容块

        this.chatAreas[chatAreaId] = chatArea;
        this.utils.$('#chat-areas-container').appendChild(chatArea.element);
        this.updateLayout();
        this.saveToLocalStorage();

        return chatAreaId;
    };

    /**
     * 移除内容块
     * @param {string} id 内容块ID
     */
    this.removeChatArea = function (id) {
        if (this.chatAreas[id]) {
            const element = this.chatAreas[id].element;
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
            delete this.chatAreas[id];
            this.updateLayout();
            this.saveToLocalStorage();
        }
    };

    /**
     * 更新布局
     */
    this.updateLayout = function () {
        const container = this.utils.$('#chat-areas-container');
        const count = Object.keys(this.chatAreas).length;
        const layout = Math.min(this.currentLayout, count || 1);

        let columns = 1;
        switch (layout) {
            case 1: columns = 1; break;
            case 2: columns = 2; break;
            case 3: columns = 3; break;
            case 4: columns = 2; break;
            case 6: columns = 3; break;
        }

        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    };

    /**
     * 处理创建消息
     * @param {Object} data 消息数据
     */
    this.onMsgCreate = function (data) {
        this.addChatArea(data);
    };

    /**
     * 处理回答消息
     * @param {Object} data 消息数据
     */
    this.onMsgAnswer = function (data) {
        for (const id in this.chatAreas) {
            if (this.chatAreas[id].tabId === data.tabId) {
                this.chatAreas[id].handleAnswer(data);
                break;
            }
        }
    };

    /**
     * 处理线程返回消息
     * @param {Object} data 消息数据
     */
    this.onMsgThreadReturn = function (data) {
        // 找到对应的内容块并更新
        for (const id in this.chatAreas) {
            if (this.chatAreas[id].tabId === data.tabId) {
                this.chatAreas[id].tabId = data.tabId;
                this.chatAreas[id].url = data.url;
                this.chatAreas[id].config = data.config;
                break;
            }
        }
    };

    /**
     * 处理分享返回消息
     * @param {Object} data 消息数据
     */
    this.onMsgShareReturn = function (data) {
        // 显示分享链接
        for (const id in this.chatAreas) {
            if (this.chatAreas[id].tabId === data.tabId) {
                this.chatAreas[id].addMessage({
                    type: 'system',
                    content: `Share link: <a href="${data.link}" target="_blank">${data.link}</a>`
                });
                break;
            }
        }
    };

    /**
     * 保存数据到本地存储
     */
    this.saveToLocalStorage = function () {
        const data = {
            chatAreas: Object.values(this.chatAreas).map(area => ({
                url: area.url,
                tabId: area.tabId,
                config: area.config
            })),
            layout: this.currentLayout
        };

        localStorage.setItem('multi-ai-chat-data', JSON.stringify(data));
    };

    /**
     * 从本地存储加载数据
     */
    this.loadFromLocalStorage = function () {
        const data = localStorage.getItem('multi-ai-chat-data');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                parsed.chatAreas.forEach(area => {
                    this.addChatArea(area);
                });
                if (parsed.layout) {
                    this.currentLayout = parsed.layout;
                    this.updateLayout();
                }
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
            }
        }
    };

    /**
     * 设置RTL语言支持
     */
    this.setupRTLSupport = function () {
        if (this.utils.isRTL()) {
            document.body.classList.add('rtl');
            document.body.dir = 'rtl';
        }
    };
}

export default MainWindowController;
