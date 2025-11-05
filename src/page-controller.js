const DriverFactory = require('./driver-factory');
const { GenericPageDriver } = require('./page-driver');
const SyncChatWindow = require('./sync-chat-window');

/**
 * @description 在原生AI页面运行的核心控制器。
 * @param {Message} message
 * @param {Config} config
 * @param {I18n} i18n
 * @param {Util} util
 */
function PageController(message, config, i18n, util) {
    const driverFactory = new DriverFactory();

    this.message = message;
    this.config = config;
    this.i18n = i18n;
    this.util = util;

    this.driver = null;
    this.syncChatWindow = null;
    // 为每个页面实例生成一个唯一的ID
    this.pageId = 'page-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

    /**
     * @description 初始化，注入UI，选择驱动。
     */
    this.init = async function() {
        const hostname = window.location.hostname;
        this.driver = driverFactory.createDriver(hostname);
        const initialized = this.driver.init();
        
        this.syncChatWindow = new SyncChatWindow();

        this.injectUI();

        // 注册消息监听器
        this.message.register(this.pageId, this);

        // 设置驱动的回调
        this.driver.onAnswer = this.handleDriverAnswer.bind(this);
        this.driver.onChatTitle = this.handleDriverChatTitle.bind(this);
        this.driver.onOption = this.handleDriverOption.bind(this);
        this.driver.onQuestion = this.handleDriverQuestion.bind(this);
        this.driver.onModelVersionChange = this.handleDriverModelVersionChange.bind(this);
        this.driver.onNewSession = this.handleDriverNewSession.bind(this);

        // 开始监控页面变化
        await initialized; // 等待初始化完成
        this.driver.startMonitoring();
    };

    this.injectUI = function() {
        const syncButton = this.util.toHtml({
            tag: 'button',
            '@id': 'multi-ai-sync-btn',
            '@style': { position: 'fixed', top: '10px', right: '10px', zIndex: 9999 },
            text: this.i18n.getText('sync_chat_button_label')
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
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        this.driver.newSession();
    };

    /**
     * @description 处理来自主窗口的设置选项的指令。
     */
    this.onMsgSetOption = function(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.key && data.value !== undefined) {
            this.driver.setOption(data.key, data.value);
        }
    };

    /**
     * @description 处理来自主窗口的设置模型版本的指令。
     */
    this.onMsgSetModelVersion = function(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.version) {
            this.driver.setModelVersion(data.version);
        }
    };

    /**
     * @description 处理来自主窗口的设置答案状态的指令。
     */
    this.onMsgSetAnswerStatus = function(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.index !== undefined && data.collapsed !== undefined) {
            this.driver.setAnswerStatus(data.index, data.collapsed);
        }
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

    this.handleDriverQuestion = function(index, element) {
        this.message.send('question', {
            id: this.pageId,
            index: index,
            content: element.innerHTML // or .textContent
        });
    };

    this.handleDriverModelVersionChange = function(version) {
        this.message.send('modelVersionChange', {
            id: this.pageId,
            version: version
        });
    };

    this.handleDriverNewSession = function() {
        this.message.send('newSession', {
            id: this.pageId
        });
    };
}

module.exports = PageController;
