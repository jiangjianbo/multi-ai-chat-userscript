const { driverFactory } = require('./page-driver');
const { SyncChatWindow } = require('./sync-chat-window');

/**
 * @description 在原生AI页面运行的核心控制器。
 * @param {object} args - 构造函数参数。
 * @param {Message} args.message
 * @param {Config} args.config
 * @param {I18n} args.i18n
 * @param {Util} args.util
 */
function PageController(args) {
    this.message = args.message;
    this.config = args.config;
    this.i18n = args.i18n;
    this.util = args.util;

    this.driver = null;
    this.syncChatWindow = null;
    // 为每个页面实例生成一个唯一的ID
    this.pageId = 'page-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

    /**
     * @description 初始化，注入UI，选择驱动。
     */
    this.init = function() {
        const hostname = window.location.hostname;
        this.driver = driverFactory(hostname);
        this.syncChatWindow = new SyncChatWindow();

        this.injectUI();

        // 注册消息监听器
        this.message.register(this);

        // 设置驱动的回调
        this.driver.onAnswer = this.handleDriverAnswer.bind(this);
        this.driver.onChatTitle = this.handleDriverChatTitle.bind(this);
        this.driver.onOption = this.handleDriverOption.bind(this);

        // 开始监控页面变化
        this.driver.startMonitoring();
    };

    this.injectUI = function() {
        const syncButton = this.util.toHtml({
            tag: 'button',
            '@id': 'multi-ai-sync-btn',
            '@style': { position: 'fixed', top: '10px', right: '10px', zIndex: 9999 },
            text: 'Sync Chat' // TODO: Use i18n
        });

        syncButton.addEventListener('click', this.handleSyncButtonClick.bind(this));
        document.body.appendChild(syncButton);
        
        // TODO: Inject other UI elements like toolbars and indexes
    };

    this.handleSyncButtonClick = function() {
        this.syncChatWindow.checkAndCreateWindow();
        // 确保窗口创建后再发送消息
        setTimeout(() => {
            this.message.send('create', {
                id: this.pageId,
                url: window.location.href,
                title: this.driver.getChatTitle() || document.title
            });
        }, 500);
    };

    /**
     * @description 处理来自主窗口的聊天消息。
     */
    this.onMsgChat = function(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.content) {
            this.driver.setPrompt(data.content);
            this.driver.send();
        }
    };
    
    /**
     * @description 处理来自主窗口的创建新会话的指令。
     */
    this.onMsgThread = function(data) {
        // TODO: Implement logic to create a new chat thread
    };

    // --- Driver Event Handlers ---

    this.handleDriverAnswer = function(index, element) {
        this.message.send('answer', {
            id: this.pageId,
            index: index,
            content: element.innerHTML // or .textContent
        });
    };

    this.handleDriverChatTitle = function(title) {
        this.message.send('titleChange', {
            id: this.pageId,
            title: title
        });
    };

    this.handleDriverOption = function(key, value) {
        this.message.send('optionChange', {
            id: this.pageId,
            key: key,
            value: value
        });
    };
}

module.exports = PageController;
