import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';
import {KimiPageDriver, GeminiPageDriver, ChatGPTPageDriver} from './drivers.js';
import GenericPageDriver from './generic-page-driver.js';

/**
 * 注入控制器，负责在原生AI页面注入脚本和按钮
 * @constructor
 */
function InjectionController() {
    // 调用基类的构造函数
    MessageNotifier.call(this, CHANNEL_NAME);

    this.utils = new Utils();
    this.driver = null; // 等待 init 做初始化
    this.isConnected = false;

    /**
     * 创建合适的页面驱动
     * @return {GenericPageDriver} 页面驱动实例
     */
    this.createDriver = function () {
        const url = window.location.href;
        if (url.includes('kimi.com')) return new KimiPageDriver();
        if (url.includes('gemini.google.com')) return new GeminiPageDriver();
        if (url.includes('chatgpt.com')) return new ChatGPTPageDriver();
        // 其他AI驱动...
        return new GenericPageDriver();
    };

    /**
     * 初始化控制器
     */
    this.init = function () {
        this.driver = this.createDriver();

        this.addSyncButton();
        this.setupAnswerListener();
        this.driver.addFloatingToolbars();
        this.register(this); // 绑定消息处理
    };

    /**
     * 添加"同步对比"按钮
     */
    this.addSyncButton = function () {
        const button = this.utils.createElement('button', {
            id: 'ai-sync-button',
            style: 'position:fixed; top:20px; right:20px; z-index:9999; padding:8px 16px; background:blue; color:white; border:none; border-radius:4px; cursor:pointer;'
        }, [this.utils.getLangText('syncCompare')]);

        button.addEventListener('click', () => this.openMainWindow());
        document.body.appendChild(button);
    };

    /**
     * 打开主窗口
     */
    this.openMainWindow = function () {
        let mainWindow = this.findMainWindow();
        if (!mainWindow) {
            mainWindow = window.open('', WINDOW_NAME);
            this.injectMainWindowContent(mainWindow);
        } else {
            mainWindow.focus();
        }

        // 发送创建消息
        this.driver.getUsername().then(username => {
            this.send('create', {
                url: window.location.href,
                tabId: this.driver.getTabId(),
                config: { username }
            }, mainWindow);
        });

        this.isConnected = true;
    };

    /**
     * 查找已存在的主窗口
     * @return {Window|null} 主窗口
     */
    this.findMainWindow = function () {
        for (let i = 0; i < window.frames.length; i++) {
            try {
                if (window.frames[i].name === WINDOW_NAME) {
                    return window.frames[i];
                }
            } catch (e) { /* 跨域访问会出错，忽略 */ }
        }
        return null;
    };

    /**
     * 注入主窗口内容
     * @param {Window} mainWindow 主窗口
     */
    this.injectMainWindowContent = function (mainWindow) {
        const utils = new Utils();
        const isRTL = utils.isRTL();
        const lang = utils.getBrowserLang();

        // 主窗口HTML内容
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="${lang}" dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
            <meta charset="UTF-8">
            <title>${utils.getLangText('multipleAiChat')}</title>
            <style>
                body { margin:0; padding:0; font-family:Arial, sans-serif; ${isRTL ? 'direction:rtl;' : ''} }
                .header { display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f0f0f0; border-bottom:1px solid #ccc; }
                .title { font-size:1.2rem; font-weight:bold; }
                .lang-selector { margin:0 10px; }
                .layout-buttons button { margin:0 5px; padding:5px 10px; }
                .control-buttons button { margin:0 5px; padding:5px 10px; }
                .chat-areas { display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; padding:10px; height:calc(100vh - 120px); box-sizing:border-box; }
                .chatarea { border:1px solid #ccc; border-radius:4px; overflow:hidden; display:flex; flex-direction:column; }
                .chatarea-header { padding:8px; background:#f5f5f5; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; }
                .chatarea-content { flex:1; overflow-y:auto; padding:10px; }
                .input-area { padding:10px; border-top:1px solid #ccc; }
                .main-input { display:flex; padding:10px; border-top:1px solid #ccc; }
                .main-input textarea { flex:1; padding:8px; border:1px solid #ccc; border-radius:4px; }
                .main-input button { margin-left:10px; padding:8px 16px; }
                .floating-input { position:relative; }
                .input-toggle { position:absolute; bottom:10px; right:10px; background:blue; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; }
                .hidden-input { display:none; position:absolute; bottom:50px; right:10px; width:300px; }
                .hidden-input.active { display:block; }
                .rtl { direction:rtl; text-align:right; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${utils.getLangText('multipleAiChat')}</div>
                <div class="layout-buttons">
                    <button data-layout="1">1</button>
                    <button data-layout="2">2</button>
                    <button data-layout="3">3</button>
                    <button data-layout="4">4</button>
                    <button data-layout="6">6</button>
                </div>
                <div class="control-buttons">
                    <button id="settings-btn">⚙️ ${utils.getLangText('settings')}</button>
                    <button id="new-chat-btn">➕ ${utils.getLangText('newChat')}</button>
                </div>
            </div>
            <div class="chat-areas" id="chat-areas-container"></div>
            <div class="main-input">
                <textarea id="main-prompt" placeholder="${utils.getLangText('send')}..."></textarea>
                <button id="send-all-btn">${utils.getLangText('send')}</button>
            </div>
            <script>
                const CHANNEL_NAME = '${CHANNEL_NAME}';
                const WINDOW_NAME = '${WINDOW_NAME}';

                // 注入语言类
                ${I18n.toString()}                

                // 注入工具类
                ${Utils.toString()}
                
                // 注入消息通知器
                ${MessageNotifier.toString()}
                
                // 注入ChatArea类
                ${ChatArea.toString()}
                
                // 主窗口控制器
                ${MainWindowController.toString()}

                const mainController = new MainWindowController();
                mainController.init();
            </script>
        </body>
        </html>
        `;

        mainWindow.document.write(htmlContent);
        mainWindow.document.close();
    };

    /**
     * 处理聊天消息
     * @param {Object} data 消息数据
     */
    this.onMsgChat = function (data) {
        const { chatId, message } = data;
        this.driver.sendMessage(message).then(() => {
            // 等待回答完成
            const checkAnswer = setInterval(() => {
                this.driver.getAnswer().then(answer => {
                    if (answer) {
                        clearInterval(checkAnswer);
                        this.send('answer', {
                            url: window.location.href,
                            tabId: this.driver.getTabId(),
                            chatId,
                            answerTime: new Date().toISOString(),
                            answer
                        });
                    }
                });
            }, 1000);
        });
    };

    /**
     * 处理配置消息
     * @param {Object} data 配置数据
     */
    this.onMsgConfig = function (data) {
        // 处理配置变更，如搜索开关等
        console.log('Config update:', data);
        // 具体实现根据不同AI页面的特性
    };

    /**
     * 处理线程消息（新建会话）
     * @param {Object} data 消息数据
     */
    this.onMsgThread = function (data) {
        this.driver.createNewThread().then(result => {
            if (result) {
                this.send('thread_return', result);
            }
        });
    };

    /**
     * 处理分享消息
     * @param {Object} data 消息数据
     */
    this.onMsgShare = function (data) {
        this.driver.createShareLink(data.chatIds).then(link => {
            this.send('share_return', {
                tabId: this.driver.getTabId(),
                link
            });
        });
    };

    /**
     * 设置回答监听
     */
    this.setupAnswerListener = function () {
        const observer = new MutationObserver(this.utils.debounce(() => {
            if (this.isConnected) {
                this.driver.getAnswer().then(answer => {
                    if (answer) {
                        this.send('answer', {
                            url: window.location.href,
                            tabId: this.driver.getTabId(),
                            chatId: 'auto-' + Date.now(),
                            answerTime: new Date().toISOString(),
                            answer
                        });
                    }
                });
            }
        }, 1000));

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    };
}

export default InjectionController;
