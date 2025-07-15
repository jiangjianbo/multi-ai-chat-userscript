// ==UserScript==
// @name         Multi AI Sync Chat
// @namespace    https://github.com/jiangjianbo/multi-ai-chat-userscript
// @version      0.1
// @description  Sync and compare multiple AI chat conversations
// @author       jiangjianbo
// @match        *://www.kimi.com/chat/*
// @match        *://gemini.google.com/*
// @match        *://chatgpt.com/*
// @match        *://chat.deepseek.com/*
// @match        *://x.com/i/grok*
// @match        *://www.tongyi.com/*
// @match        *://*/*multi-ai-sync-chat-window*
// @grant        none
// ==/UserScript==

/**
 * 多语言支持文本常量
 * @type {Object}
 */
const LANGS = {
    en: {
        syncCompare: "Sync Compare",
        multipleAiChat: "Multiple AI Sync Chat",
        layout: "Layout",
        settings: "Settings",
        newChat: "New Chat",
        confirmSwitch: "Are you sure you want to switch AI? Current content will be replaced.",
        close: "Close",
        share: "Share",
        openInWindow: "Open in Window",
        webSearch: "Web Search",
        send: "Send"
    },
    zh: {
        syncCompare: "同步对比",
        multipleAiChat: "多个AI同步聊天",
        layout: "布局",
        settings: "设置",
        newChat: "新对话",
        confirmSwitch: "确定要切换AI吗？当前内容将被替换。",
        close: "关闭",
        share: "分享",
        openInWindow: "在窗口中打开",
        webSearch: "网页搜索",
        send: "发送"
    },
    fr: {
        syncCompare: "Comparaison synchrone",
        multipleAiChat: "Chat synchrone avec plusieurs IA",
        layout: "Disposition",
        settings: "Paramètres",
        newChat: "Nouvelle conversation",
        confirmSwitch: "Voulez-vous vraiment changer d'IA ? Le contenu actuel sera remplacé.",
        close: "Fermer",
        share: "Partager",
        openInWindow: "Ouvrir dans une fenêtre",
        webSearch: "Recherche web",
        send: "Envoyer"
    },
    ja: {
        syncCompare: "同期比較",
        multipleAiChat: "複数AI同期チャット",
        layout: "レイアウト",
        settings: "設定",
        newChat: "新しい会話",
        confirmSwitch: "AIを切り替えてもよろしいですか？現在のコンテンツは置き換えられます。",
        close: "閉じる",
        share: "共有",
        openInWindow: "ウィンドウで開く",
        webSearch: "Web検索",
        send: "送信"
    },
    ko: {
        syncCompare: "동기화 비교",
        multipleAiChat: "다중 AI 동기 채팅",
        layout: "레이아웃",
        settings: "설정",
        newChat: "새 대화",
        confirmSwitch: "AI를 전환하시겠습니까? 현재 내용이 교체됩니다.",
        close: "닫기",
        share: "공유",
        openInWindow: "새 창에서 열기",
        webSearch: "웹 검색",
        send: "보내기"
    },
    es: {
        syncCompare: "Comparación sincrónica",
        multipleAiChat: "Chat sincrónico con múltiples IA",
        layout: "Diseño",
        settings: "Configuración",
        newChat: "Nuevo chat",
        confirmSwitch: "¿Estás seguro de cambiar de IA? El contenido actual será reemplazado.",
        close: "Cerrar",
        share: "Compartir",
        openInWindow: "Abrir en ventana",
        webSearch: "Búsqueda web",
        send: "Enviar"
    },
    pt: {
        syncCompare: "Comparação síncrona",
        multipleAiChat: "Chat síncrono com múltiplas IAs",
        layout: "Layout",
        settings: "Configurações",
        newChat: "Nova conversa",
        confirmSwitch: "Tem certeza que deseja mudar de IA? O conteúdo atual será substituído.",
        close: "Fechar",
        share: "Compartilhar",
        openInWindow: "Abrir em janela",
        webSearch: "Pesquisa web",
        send: "Enviar"
    },
    ar: {
        syncCompare: "النسبة المُتزامنة",
        multipleAiChat: "الدردشة المتزامنة مع عدة أنظمة ذكية",
        layout: "التخطيط",
        settings: "الإعدادات",
        newChat: "دردشة جديدة",
        confirmSwitch: "هل أنت متأكد من رغبتك في تبديل الأنظمة الذكية؟ سيتم استبدال المحتوى الحالي.",
        close: "إغلاق",
        share: "مشاركة",
        openInWindow: "فتح في نافذة جديدة",
        webSearch: "البحث عبر الويب",
        send: "إرسال"
    }
};

/**
 * 默认AI供应商列表
 * @type {Array}
 */
const DEFAULT_AI_PROVIDERS = [
    { name: "Kimi", url: "https://www.kimi.com/chat/" },
    { name: "Gemini", url: "https://gemini.google.com/" },
    { name: "ChatGPT", url: "https://chatgpt.com/" },
    { name: "DeepSeek", url: "https://chat.deepseek.com/" },
    { name: "Grok", url: "https://x.com/i/grok" },
    { name: "Tongyi", url: "https://www.tongyi.com/" }
];

/**
 * 工具类，提供常用DOM操作和工具方法
 * @constructor
 */
function Utils() {
    /**
     * 获取浏览器当前语言
     * @return {string} 语言代码
     */
    this.getBrowserLang = function () {
        const lang = navigator.language || navigator.userLanguage;
        const langCode = lang.split('-')[0];
        return LANGS[langCode] ? langCode : 'en';
    };

    /**
     * 获取多语言文本
     * @param {string} key 文本键名
     * @return {string} 对应语言的文本
     */
    this.getLangText = function (key) {
        const lang = this.getBrowserLang();
        return LANGS[lang][key] || LANGS['en'][key];
    };

    /**
     * 创建DOM元素
     * @param {string} tag 标签名
     * @param {Object} attrs 属性键值对
     * @param {Array} children 子元素数组
     * @return {HTMLElement} 创建的元素
     */
    this.createElement = function (tag, attrs, children) {
        const elem = document.createElement(tag);
        if (attrs) {
            for (const key in attrs) {
                elem.setAttribute(key, attrs[key]);
            }
        }
        if (children) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    elem.appendChild(document.createTextNode(child));
                } else if (child) {
                    elem.appendChild(child);
                }
            });
        }
        return elem;
    };

    /**
     * jQuery风格选择器
     * @param {string} selector 选择器字符串
     * @param {HTMLElement} context 上下文元素
     * @return {HTMLElement|null} 找到的元素
     */
    this.$ = function (selector, context) {
        return (context || document).querySelector(selector);
    };

    /**
     * jQuery风格多元素选择器
     * @param {string} selector 选择器字符串
     * @param {HTMLElement} context 上下文元素
     * @return {NodeList} 找到的元素列表
     */
    this.$$ = function (selector, context) {
        return (context || document).querySelectorAll(selector);
    };

    /**
     * 防抖函数
     * @param {Function} func 执行函数
     * @param {number} wait 等待时间(ms)
     * @return {Function} 防抖后的函数
     */
    this.debounce = function (func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    /**
     * 检查是否为RTL语言
     * @return {boolean} 是否为RTL语言
     */
    this.isRTL = function () {
        const lang = this.getBrowserLang();
        return lang === 'ar';
    };
}

/**
 * 消息通知器，负责不同窗口间的通讯
 * @constructor
 * @param {string} channelName 频道名称
 */
function MessageNotifier(channelName) {
    this.channelName = channelName;
    this.broadcastChannel = new BroadcastChannel(channelName);
    this.messageHandlers = {};

    // 注册消息处理
    this.broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        if (this.messageHandlers[type]) {
            this.messageHandlers[type](data);
        }
    };

    // 自动注册onMsg开头的方法作为消息处理器
    for (const prop in this) {
        if (typeof this[prop] === 'function' && prop.startsWith('onMsg')) {
            const msgType = prop.substring(5).toLowerCase();
            this.messageHandlers[msgType] = this[prop].bind(this);
        }
    }
}

/**
 * 发送消息
 * @param {string} type 消息类型
 * @param {Object} data 消息数据
 * @param {Window} [targetWindow] 目标窗口，不指定则广播
 */
MessageNotifier.prototype.send = function (type, data, targetWindow) {
    const message = { type, data };
    if (targetWindow) {
        targetWindow.postMessage(message, '*');
    } else {
        this.broadcastChannel.postMessage(message);
    }
};

/**
 * 通用页面驱动，其他AI驱动继承自此
 * @constructor
 */
function GenericPageDriver() {
    this.utils = new Utils();
    // 选择器配置，派生类可以重写
    this.selectors = {
        inputArea: 'input[type="text"], textarea',
        sendButton: 'button[type="submit"], button:contains("发送"), button:contains("Send")',
        chatHistory: '.chat-messages, .messages, #chat-area',
        messageItem: '.message, .chat-message',
        userMessage: '.user-message',
        aiMessage: '.ai-message',
        newChatButton: '.new-chat-button, .new-conversation'
    };
}

/**
 * 获取登录用户名
 * @return {Promise<string>} 用户名
 */
GenericPageDriver.prototype.getUsername = function () {
    return new Promise(resolve => {
        // 通用实现，派生类应重写
        setTimeout(() => resolve('User'), 100);
    });
};

/**
 * 获取会话历史清单
 * @return {Promise<Array>} 会话历史列表
 */
GenericPageDriver.prototype.getChatHistory = function () {
    return new Promise(resolve => {
        // 通用实现，派生类应重写
        resolve([]);
    });
};

/**
 * 发送消息到AI
 * @param {string} message 消息内容
 * @return {Promise<void>} 发送完成
 */
GenericPageDriver.prototype.sendMessage = function (message) {
    return new Promise(resolve => {
        const input = this.utils.$(this.selectors.inputArea);
        if (input) {
            input.value = message;
            // 触发输入事件
            input.dispatchEvent(new Event('input', { bubbles: true }));

            const sendBtn = this.utils.$(this.selectors.sendButton);
            if (sendBtn) {
                sendBtn.click();
                setTimeout(resolve, 1000);
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
};

/**
 * 获取AI回答内容
 * @return {Promise<string>} 回答的HTML内容
 */
GenericPageDriver.prototype.getAnswer = function () {
    return new Promise(resolve => {
        // 通用实现，派生类应重写
        const chatHistory = this.utils.$(this.selectors.chatHistory);
        if (chatHistory) {
            const messages = this.utils.$$(this.selectors.messageItem, chatHistory);
            const lastMessage = messages[messages.length - 1];
            resolve(lastMessage ? lastMessage.innerHTML : '');
        } else {
            resolve('');
        }
    });
};

/**
 * 为对话内容添加工具条
 */
GenericPageDriver.prototype.addFloatingToolbars = function () {
    const messages = this.utils.$$(this.selectors.messageItem);
    messages.forEach(msg => {
        if (!this.utils.$('.ai-sync-toolbar', msg)) {
            const toolbar = this.utils.createElement('div', {
                class: 'ai-sync-toolbar',
                style: 'position:absolute; top:5px; right:5px; display:flex; gap:5px;'
            }, [
                this.utils.createElement('button', { class: 'copy-btn' }, ['Copy']),
                this.utils.createElement('button', { class: 'collapse-btn' }, ['-']),
                this.utils.createElement('button', { class: 'hide-btn' }, ['×'])
            ]);

            msg.style.position = 'relative';
            msg.appendChild(toolbar);

            // 绑定工具条事件
            this.utils.$('.copy-btn', toolbar).addEventListener('click', () => {
                const text = msg.textContent;
                navigator.clipboard.writeText(text);
            });

            this.utils.$('.collapse-btn', toolbar).addEventListener('click', () => {
                const content = msg.querySelector(':scope > div:not(.ai-sync-toolbar)');
                if (content) {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }
            });

            this.utils.$('.hide-btn', toolbar).addEventListener('click', () => {
                msg.style.display = 'none';
            });
        }
    });
};

/**
 * 创建新会话
 * @return {Promise<Object>} 新会话信息
 */
GenericPageDriver.prototype.createNewThread = function () {
    return new Promise(resolve => {
        const newChatBtn = this.utils.$(this.selectors.newChatButton);
        if (newChatBtn) {
            newChatBtn.click();
            // 等待新会话创建
            setTimeout(() => {
                this.getUsername().then(username => {
                    resolve({
                        url: window.location.href,
                        tabId: this.getTabId(),
                        config: { username }
                    });
                });
            }, 1000);
        } else {
            resolve(null);
        }
    });
};

/**
 * 获取当前标签页ID
 * @return {string} 标签页ID
 */
GenericPageDriver.prototype.getTabId = function () {
    return window.location.href + Date.now();
};

/**
 * 创建分享链接
 * @param {Array} chatIds 聊天ID数组
 * @return {Promise<string>} 分享链接
 */
GenericPageDriver.prototype.createShareLink = function (chatIds) {
    return new Promise(resolve => {
        // 通用实现，派生类应重写
        resolve(window.location.href);
    });
};

/**
 * Kimi页面驱动
 * @constructor
 */
function KimiPageDriver() {
    GenericPageDriver.call(this);
    this.selectors = {
        ...this.selectors,
        inputArea: '#prompt-textarea',
        sendButton: '.send-button',
        chatHistory: '.chat-messages-container',
        messageItem: '.message-item',
        userMessage: '.user-message',
        aiMessage: '.assistant-message',
        newChatButton: '.new-chat-btn'
    };
}

/**
 * Gemini页面驱动
 * @constructor
 */
function GeminiPageDriver() {
    GenericPageDriver.call(this);
    //  Gemini特定选择器
    this.selectors = {
        ...this.selectors,
        inputArea: '.ql-editor',
        sendButton: '.send-button'
    };
}

/**
 * ChatGPT页面驱动
 * @constructor
 */
function ChatGPTPageDriver() {
    GenericPageDriver.call(this);
    // ChatGPT特定选择器
    this.selectors = {
        ...this.selectors,
        inputArea: '#prompt-textarea',
        sendButton: '[data-testid="send-button"]'
    };
}

/**
 * 注入控制器，负责在原生AI页面注入脚本和按钮
 * @constructor
 */
function InjectionController() {
    this.utils = new Utils();
    this.notifier = new MessageNotifier('multi-ai-chat-channel');
    this.driver = this.createDriver();
    this.isConnected = false;

    // 绑定消息处理方法
    this.notifier.onMsgChat = this.handleChatMessage.bind(this);
    this.notifier.onMsgConfig = this.handleConfigMessage.bind(this);
    this.notifier.onMsgThread = this.handleThreadMessage.bind(this);
    this.notifier.onMsgShare = this.handleShareMessage.bind(this);
}

/**
 * 创建合适的页面驱动
 * @return {GenericPageDriver} 页面驱动实例
 */
InjectionController.prototype.createDriver = function () {
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
InjectionController.prototype.init = function () {
    this.addSyncButton();
    this.setupAnswerListener();
    this.driver.addFloatingToolbars();
};

/**
 * 添加"同步对比"按钮
 */
InjectionController.prototype.addSyncButton = function () {
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
InjectionController.prototype.openMainWindow = function () {
    let mainWindow = this.findMainWindow();
    if (!mainWindow) {
        mainWindow = window.open('', 'multi-ai-sync-chat-window');
        this.injectMainWindowContent(mainWindow);
    } else {
        mainWindow.focus();
    }

    // 发送创建消息
    this.driver.getUsername().then(username => {
        this.notifier.send('create', {
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
InjectionController.prototype.findMainWindow = function () {
    for (let i = 0; i < window.frames.length; i++) {
        try {
            if (window.frames[i].name === 'multi-ai-sync-chat-window') {
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
InjectionController.prototype.injectMainWindowContent = function (mainWindow) {
    const utils = new Utils();
    const isRTL = utils.isRTL() ? 'rtl' : 'ltr';
    const lang = utils.getBrowserLang();

    // 主窗口HTML内容
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRTL}">
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
            // 注入工具类
            ${Utils.toString()}
            const utils = new Utils();
            
            // 注入消息通知器
            ${MessageNotifier.toString()}
            const notifier = new MessageNotifier('multi-ai-chat-channel');
            
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
InjectionController.prototype.handleChatMessage = function (data) {
    const { chatId, message } = data;
    this.driver.sendMessage(message).then(() => {
        // 等待回答完成
        const checkAnswer = setInterval(() => {
            this.driver.getAnswer().then(answer => {
                if (answer) {
                    clearInterval(checkAnswer);
                    this.notifier.send('answer', {
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
InjectionController.prototype.handleConfigMessage = function (data) {
    // 处理配置变更，如搜索开关等
    console.log('Config update:', data);
    // 具体实现根据不同AI页面的特性
};

/**
 * 处理线程消息（新建会话）
 * @param {Object} data 消息数据
 */
InjectionController.prototype.handleThreadMessage = function (data) {
    this.driver.createNewThread().then(result => {
        if (result) {
            this.notifier.send('thread_return', result);
        }
    });
};

/**
 * 处理分享消息
 * @param {Object} data 消息数据
 */
InjectionController.prototype.handleShareMessage = function (data) {
    this.driver.createShareLink(data.chatIds).then(link => {
        this.notifier.send('share_return', {
            tabId: this.driver.getTabId(),
            link
        });
    });
};

/**
 * 设置回答监听
 */
InjectionController.prototype.setupAnswerListener = function () {
    const observer = new MutationObserver(this.utils.debounce(() => {
        if (this.isConnected) {
            this.driver.getAnswer().then(answer => {
                if (answer) {
                    this.notifier.send('answer', {
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

/**
 * 内容块控制器，管理主窗口中的单个AI会话区域
 * @constructor
 * @param {Object} options 配置选项
 * @param {string} options.id 内容块ID
 * @param {string} options.url AI页面URL
 * @param {string} options.tabId 标签ID
 * @param {Object} options.config 配置信息
 * @param {MainWindowController} options.mainController 主控制器
 */
function ChatArea(options) {
    this.id = options.id;
    this.url = options.url;
    this.tabId = options.tabId;
    this.config = options.config;
    this.mainController = options.mainController;
    this.utils = new Utils();
    this.notifier = this.mainController.notifier;

    // 创建DOM元素
    this.element = this.createChatAreaElement();
    this.contentElement = this.utils.$('.chatarea-content', this.element);
    this.initEvents();
}

/**
 * 创建内容块元素
 * @return {HTMLElement} 内容块元素
 */
ChatArea.prototype.createChatAreaElement = function () {
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
ChatArea.prototype.getAINameFromUrl = function (url) {
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
ChatArea.prototype.initEvents = function () {
    // 关闭按钮
    this.utils.$('.close-btn', this.element).addEventListener('click', () => {
        this.mainController.removeChatArea(this.id);
    });

    // 分享按钮
    this.utils.$('.share-btn', this.element).addEventListener('click', () => {
        this.notifier.send('share', {
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
        this.notifier.send('config', {
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
ChatArea.prototype.sendHiddenMessage = function () {
    const input = this.utils.$('textarea', this.element);
    const message = input.value.trim();
    if (message) {
        const chatId = 'chat-' + Date.now();
        this.notifier.send('chat', {
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
ChatArea.prototype.findExistingWindow = function () {
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
ChatArea.prototype.addMessage = function (message) {
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
ChatArea.prototype.handleAnswer = function (data) {
    this.addMessage({
        type: 'answer',
        content: data.answer
    });
};

/**
 * 主窗口控制器
 * @constructor
 */
function MainWindowController() {
    this.utils = new Utils();
    this.notifier = new MessageNotifier('multi-ai-chat-channel');
    this.chatAreas = {};
    this.chatAreaCount = 0;
    this.currentLayout = 2;

    // 自动注册消息处理器
    for (const prop in this) {
        if (typeof this[prop] === 'function' && prop.startsWith('onMsg')) {
            const msgType = prop.substring(5).toLowerCase();
            this.notifier.messageHandlers[msgType] = this[prop].bind(this);
        }
    }
}

/**
 * 初始化主窗口
 */
MainWindowController.prototype.init = function () {
    this.initLayoutButtons();
    this.initSendButton();
    this.loadFromLocalStorage();
    this.setupRTLSupport();
};

/**
 * 初始化布局按钮
 */
MainWindowController.prototype.initLayoutButtons = function () {
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
MainWindowController.prototype.initSendButton = function () {
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
MainWindowController.prototype.sendToAll = function () {
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
        this.notifier.send('chat', {
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
MainWindowController.prototype.addChatArea = function (data) {
    this.chatAreaCount++;
    const chatAreaId = `chatarea-${this.chatAreaCount}`;

    // 检查是否已存在相同tabId的内容块
    for (const id in this.chatAreas) {
        if (this.chatAreas[id].tabId === data.tabId) {
            return id; // 已存在，返回现有ID
        }
    }

    const chatArea = new ChatArea({
        id: chatAreaId,
        url: data.url,
        tabId: data.tabId,
        config: data.config,
        mainController: this
    });

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
MainWindowController.prototype.removeChatArea = function (id) {
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
MainWindowController.prototype.updateLayout = function () {
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
MainWindowController.prototype.onMsgCreate = function (data) {
    this.addChatArea(data);
};

/**
 * 处理回答消息
 * @param {Object} data 消息数据
 */
MainWindowController.prototype.onMsgAnswer = function (data) {
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
MainWindowController.prototype.onMsgThreadReturn = function (data) {
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
MainWindowController.prototype.onMsgShareReturn = function (data) {
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
MainWindowController.prototype.saveToLocalStorage = function () {
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
MainWindowController.prototype.loadFromLocalStorage = function () {
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
MainWindowController.prototype.setupRTLSupport = function () {
    if (this.utils.isRTL()) {
        document.body.classList.add('rtl');
        document.body.dir = 'rtl';
    }
};

/**
 * 主函数，根据当前页面类型初始化不同的控制器
 */
function main() {
    // 检查是否为主窗口
    if (window.name === 'multi-ai-sync-chat-window') {
        return; // 主窗口内容在打开时注入
    }

    // 原生AI页面，初始化注入控制器
    const controller = new InjectionController();
    controller.init();
}

// 延迟3秒执行主函数
setTimeout(main, 3000);