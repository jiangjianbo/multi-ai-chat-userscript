const ChatArea = require('./chat-area');
const Util = require('./util');
const DriverFactory = require('./driver-factory');
const MessageClient = require('./message-client');

/**
 * @description Core controller for the main window.
 * @param {string} receiverId - 用于接收消息的唯一id
 * @param {object} message - The message bus instance.
 * @param {object} config - The configuration instance.
 * @param {object} i18n - The internationalization instance.
 */
function MainWindowController(receiverId, message, config, i18n) {
    this.receiverId = receiverId;
    this.message = message;
    this.msgClient = new MessageClient(message);
    this.config = config;
    this.i18n = i18n;
    this.util = new Util();
    this.chatAreas = new Map();
    this.driverFactory = new DriverFactory(); // 只是用来获取提供商URL和模型列表
    this.defaultDriverParams = null; // 默认的页面参数， webAccess, longThought等  
    this.selectedProviders = new Map(); // K: providerName, V: chatAreaId
    this.element = null;
    this.chatAreaContainer = null;
    this.layoutSwitcher = null;
    this.eventHandlers = {
        onEvtAllWebAccessChanged: (newValue) => {
            this.chatAreas.forEach(area => area.setWebAccess(newValue));
        },
        onEvtAllLongThoughtChanged: (newValue) => {
            this.chatAreas.forEach(area => area.setLongThought(newValue));
        },
        onEvtAllPrompt: (prompt) => {
            this.msgClient.chat(prompt);
        }
    };

    this.setEventHandler = function(eventName, handler) {
        this.eventHandlers[eventName] = handler;
    };
    this._handleNewSession = function(chatArea, providerName) {
        // Use thread message as per design document
        this.msgClient.thread(chatArea.id);
    };

    this._handleShare = function(chatArea, url) {
        navigator.clipboard.writeText(url);
        this.msgClient.focus(chatArea.id);
    };

    this._handleParamChanged = function(chatArea, key, newValue, oldValue) {
        if (key === 'modelVersion') {
            this.msgClient.setModelVersion(chatArea.id, newValue);
        } else if (key === 'webAccess' || key === 'longThought') {
            this.msgClient.setOption(chatArea.id, key, newValue);
        } else {
            // For other parameters, use param_changed message
            this.msgClient.sendParamChanged(chatArea.id, key, newValue, oldValue);
        }
    };

    this._handleProviderChanged = function(chatArea, newProvider, oldProvider) {
        const newUrl = this.driverFactory.getProviderUrl(newProvider);
        this.msgClient.changeProvider(chatArea.id, newUrl);
        chatArea.url = newUrl;
    };

    this._handlePromptSend = function(chatArea, text) {
        this.msgClient.prompt(chatArea.id, text);
    };

    this._handleExport = function(chatArea) {
        this.msgClient.export(chatArea.id);
    };


    /**
     * @description Switches the application language and updates all UI elements with `data-lang-key`.
     * @param {string} newLang - The new language code (e.g., 'en', 'zh').
     */
    this.switchLanguage = function(newLang, rootElement, forceUpdate = false) {
        if (!forceUpdate && this.i18n.getCurrentLang() === newLang) {
            return;
        }
        this.i18n.setCurrentLang(newLang);

        const targetElement = rootElement || this.element;
        const elements = targetElement.querySelectorAll('[data-lang-key]');
        elements.forEach(el => {
            const langKey = el.dataset.langKey;
            const translatedText = this.i18n.getText(langKey);

            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                el.placeholder = translatedText;
            } else if (el.hasAttribute('title')) {
                el.title = translatedText;
            } else {
                el.textContent = translatedText;
            }
        });
        // Close the language dropdown after switching
        this.langDropdown.style.display = 'none';
    };

    /**
     * @description Initializes the controller, renders the layout, and registers listeners.
     */
    this.init = function() {
        this.cacheDOMElements();
        this.initEventListeners();
        this.initMessageListeners();
        this.updateLayout(); // Initial layout update
        this.updateNewChatButtonState();
        this.switchLanguage(this.i18n.getCurrentLang(), this.element, true);    
    };

    /**
     * @description Caches frequently accessed DOM elements.
     */
    this.cacheDOMElements = function() {
        this.element = document.querySelector('.main-window');
        this.chatAreaContainer = this.element.querySelector('.content-area');
        this.layoutSwitcher = this.element.querySelector('#layout-switcher');
        this.globalSendButton = document.getElementById('global-send-button');
        this.promptTextarea = document.getElementById('prompt-textarea');
        this.promptWrapper = document.getElementById('prompt-wrapper');
        this.langSwitcher = document.getElementById('lang-switcher');
        this.langDropdown = document.getElementById('lang-dropdown');
        this.settingsButton = document.getElementById('settings-button');
        this.settingsMenu = document.getElementById('settings-menu');
        this.newChatButton = document.getElementById('new-chat-button');
    };

    /**
     * @description Initializes global event listeners.
     */
    this.initEventListeners = function() {
        // Layout Switcher
        this.layoutSwitcher.addEventListener('click', (e) => {
            if (e.target.matches('.layout-button')) {
                this.setLayout(e.target.dataset.layout);
            }
        });

        // Global Send
        this.globalSendButton.addEventListener('click', () => {
            const prompt = this.promptTextarea.value;
            if (prompt.trim()) {
                this.eventHandlers.onEvtAllPrompt(prompt);
                this.promptTextarea.value = '';
                this.promptWrapper.dataset.replicatedValue = ''; // Reset auto-grow
            }
        });

        // 回车键发送消息，Shift+回车换行
        this.promptTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const prompt = this.promptTextarea.value;
                if (prompt.trim()) {
                    this.eventHandlers.onEvtAllPrompt(prompt);
                    this.promptTextarea.value = '';
                    this.promptWrapper.dataset.replicatedValue = ''; // Reset auto-grow
                }
            }
        });

        // Close Window
        document.getElementById('main-window-close-button').addEventListener('click', () => {
            window.close();
        });

        // Language Switcher
        this.langSwitcher.addEventListener('click', (e) => {
            e.stopPropagation();
            this.langDropdown.style.display = this.langDropdown.style.display === 'block' ? 'none' : 'block';
        });
        this.langDropdown.addEventListener('click', (e) => {
            if (e.target.matches('[data-lang]')) {
                this.switchLanguage(e.target.dataset.lang, this.element, false);
            }
        });

        // Settings Menu
        this.settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isDisplay = this.settingsMenu.style.display === 'block';
            // 切换显示和隐藏
            this.settingsMenu.style.display = isDisplay ? 'none' : 'block';
        });
        this.settingsMenu.addEventListener('click', (e) => e.stopPropagation());

        this.settingsMenu.querySelector('#web-access').addEventListener('change', (e) => {
            this.eventHandlers.onEvtAllWebAccessChanged(e.target.checked);
        });

        this.settingsMenu.querySelector('#long-thought').addEventListener('change', (e) => {
            this.eventHandlers.onEvtAllLongThoughtChanged(e.target.checked);
        });

        this.closeAllDropdowns = function() {
            this.chatAreas.forEach(area => area.closeDropdowns());
        }

        // Global click to close dropdowns
        document.addEventListener('click', (e) => {
            if (this.langDropdown) this.langDropdown.style.display = 'none';
            if (this.settingsMenu) this.settingsMenu.style.display = 'none';

            if (!e.target.closest('.model-selector') && !e.target.closest('.params-selector')) {
                this.closeAllDropdowns();
            }
        });

        // Auto-growing Textarea
        this.promptTextarea.addEventListener('input', () => {
            this.promptWrapper.dataset.replicatedValue = this.promptTextarea.value;
        });

        this.newChatButton.addEventListener('click', () => {
            debugger;
            try {
                const newId = `chat-area-${Date.now()}`;
                const webAccess = this.settingsMenu.querySelector('#web-access').checked;
                const longThought = this.settingsMenu.querySelector('#long-thought').checked;
                this.addChatArea(
                    {
                        id: newId,
                        url: null,
                        providerName: 'New Chat',
                        title: 'New Chat',
                        params: {
                            webAccess, longThought,
                            models: [], // 默认没有模型列表
                            modelVersion: null // 默认没有模型版本
                        },
                        conversation: []
                    }
                );
            }catch(e){
                console.error("error:" + e);
            }
        });

        // Populate Language Dropdown
        const langs = this.i18n.getAllLangs();
        this.langDropdown.innerHTML = langs.map(lang => `<div data-lang="${lang}">${lang}</div>`).join('');
    };

    /**
     * @description Sets the layout for the chat areas.
     * @param {string} layout - The layout to apply (e.g., '1', '2', '4', '6').
     */
    this.setLayout = function(layout) {
        if (layout > 4) {
            layout = '6'; // Max 6
        } else if (layout > 2) {
            layout = '4'; 
        } else if (layout > 1) {
            layout = '2'; 
        } else if (layout < 1) 
            layout = '1'; // Min 6

        if (this.chatAreaContainer.dataset.layout !== layout) {
            this.chatAreaContainer.dataset.layout = layout;
            const currentActive = this.layoutSwitcher.querySelector('.active');
            if (currentActive) currentActive.classList.remove('active');
            const newActive = this.layoutSwitcher.querySelector(`[data-layout="${layout}"]`);
            if (newActive) newActive.classList.add('active');
            this.updateLayout();
            this.updateNewChatButtonState();
        }
    };

    this.updateNewChatButtonState = function() {
        const layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
        const numAreas = this.chatAreas.size;
        this.newChatButton.disabled = numAreas >= layout;
    };

    this.updateLayout = function() {
        const layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
        const allAreas = Array.from(this.chatAreas.values());

        const pinned = allAreas.filter(area => area.isPinned());
        const unpinned = allAreas.filter(area => !area.isPinned());

        const displayOrder = [...pinned, ...unpinned];

        allAreas.forEach(area => {
            if (area.container) {
                area.container.style.display = 'none';
            }
        });

        for (let i = 0; i < Math.min(layout, displayOrder.length); i++) {
            if (displayOrder[i].container) {
                displayOrder[i].container.style.display = 'flex';
            }
        }
    };

    /**
     * @description Initializes message listeners for communication with page drivers.
     */
    this.initMessageListeners = function() {
        this.message.register(this.receiverId, this);
    };

    /**
     * @description Handles the 'create' message to add a new chat area.
     * @param {object} data - Message data {id, providerName, url, pinned, params:{webAccess,longThought, models}, conversation:[{type, content}]}.
     */
    this.onMsgCreate = function(data) {
        // 这里要保存 driver相关的一些参数，检查是否初始化，如果没有初始化，则保存为默认参数
        if (!this.defaultDriverParams) {
            this.defaultDriverParams = {
                webAccess: data.params?.webAccess || false,
                longThought: data.params?.longThought || false
            };
            // 设置参数配置项控件的值
            this.settingsMenu.querySelector('#web-access').checked = this.defaultDriverParams.webAccess;
            this.settingsMenu.querySelector('#long-thought').checked = this.defaultDriverParams.longThought;
        }
        
        this.addChatArea(data);
    };

    /**
     * @description Handles the 'answer' message to update a chat area.
     * @param {object} data - Message data ({ id, content, ... }).
     */
    this.onMsgAnswer = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.handleAnswer(data);
        }
    };

    /**
     * @description Handles the 'destroy' message to remove a chat area.
     * @param {object} data - Message data ({ id }).
     */
    this.onMsgDestroy = function(data) {
        this.removeChatArea(data.id);
    };

    /**
     * @description Handles the 'titleChange' message to update a chat area's title.
     * @param {object} data - Message data ({ id, title }).
     */
    this.onMsgTitleChange = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.updateTitle(data.title);
        }
    };

    /**
     * @description Handles the 'optionChange' message to update a chat area's option.
     * @param {object} data - Message data ({ id, key, value }).
     */
    this.onMsgOptionChange = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.updateOption(data.key, data.value);
        }
    };

    /**
     * @description Handles the 'question' message to add a new question to a chat area.
     * @param {object} data - Message data ({ id, index, content }).
     */
    this.onMsgQuestion = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.addQuestion(data.content);
        }
    };

    /**
     * @description Handles the 'modelVersionChange' message to update a chat area's model version.
     * @param {object} data - Message data ({ id, version }).
     */
    this.onMsgModelVersionChange = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.updateModelVersion(data.version);
        }
    };

    /**
     * @description Handles the 'newSession' message to reset a chat area for a new session.
     * @param {object} data - Message data ({ id }).
     */
    this.onMsgNewSession = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.newSession();
        }
    };

    /**
     * @description Handles the 'thread' message to start a new session (alias for newSession).
     * @param {object} data - Message data ({ id }).
     */
    this.onMsgThread = function(data) {
        // Thread message is equivalent to newSession
        this.onMsgNewSession(data);
    };

    /**
     * @description Adds a new ChatArea instance.
     * @param {object} data - 初始化数据，结构为{id, providerName, url, pinned, params:{webAccess,longThought, models, modelVersion}, conversation:[{type, content}]}.
     */
    this.addChatArea = function(data) {
        console.debug(`add chatarea with ${JSON.stringify(data)}`)

        if (this.chatAreas.has(data.id)) {
            console.warn(`ChatArea with id ${data.id} already exists.`);
            return;
        }

        const container = this.util.toHtml({ tag: 'div', '@class': 'chat-area-container'});
        this.chatAreaContainer.appendChild(container);

        const chatArea = new ChatArea(this, data.id, data.url, container, this.i18n);
        chatArea.init(data);
        this.switchLanguage(this.i18n.getCurrentLang(), chatArea.element, true);

        chatArea.setEventHandler('onEvtNewSession', this._handleNewSession.bind(this));
        chatArea.setEventHandler('onEvtShare', this._handleShare.bind(this));
        chatArea.setEventHandler('onEvtParamChanged', this._handleParamChanged.bind(this));
        chatArea.setEventHandler('onEvtProviderChanged', (ca, newProvider, oldProvider) => {
            if (oldProvider && this.selectedProviders.get(oldProvider) === ca.id) {
                this.selectedProviders.delete(oldProvider);
            }
            if (newProvider) {
                this.selectedProviders.set(newProvider, ca.id);
            }
        });
        chatArea.setEventHandler('onEvtPromptSend', this._handlePromptSend.bind(this));
        chatArea.setEventHandler('onEvtExport', this._handleExport.bind(this));

        this.chatAreas.set(data.id, chatArea);
        this.updateDefaultLayout();
        this.updateNewChatButtonState();
        console.log(`Added ChatArea: ${data.id}`);

        if (data.providerName && data.providerName !== 'New Chat') {
            this.selectedProviders.set(data.providerName, data.id);
        }

        data.conversations?.forEach(item => {
            if (item.type === 'question') {
                chatArea.addQuestion(item.content);
            } else if (item.type === 'answer') {
                chatArea.addAnswer(item.content);
            }
        });
        
    };

    this.updateDefaultLayout = function() {
        const numAreas = this.chatAreas.size;
        let layout = '1';
        if (numAreas > 4) {
            layout = '6';
        } else if (numAreas > 2) {
            layout = '4';
        } else if (numAreas > 1) {
            layout = '2';
        }
        this.setLayout(layout);
    };

    /**
     * @description Removes a ChatArea from the main window.
     * @param {string} id - The unique identifier of the ChatArea.
     */
    this.removeChatArea = function(id) {
        const chatArea = this.chatAreas.get(id);
        if (chatArea) {
            const providerName = chatArea.getProvider();
            if (providerName && this.selectedProviders.get(providerName) === id) {
                this.selectedProviders.delete(providerName);
            }

            chatArea.destroy(); // Let chat area clean up itself
            if (chatArea.container) {
                chatArea.container.remove();
            }
            this.chatAreas.delete(id);
            this.updateDefaultLayout();
            this.updateNewChatButtonState();
            console.log(`Removed ChatArea: ${id}`);
        }
    };

    /**
     * @description 获取当前被其他ChatArea占用的AI提供商列表。
     * @param {string} requestingChatAreaId - 请求此列表的ChatArea的ID，该ChatArea自己的选择不会被视为不可用。
     * @returns {string[]} - 不可用的AI提供商名称数组。
     */
    this.getUnavailableProviders = function(requestingChatAreaId) {
        const unavailable = [];
        this.selectedProviders.forEach((chatAreaId, providerName) => {
            if (chatAreaId !== requestingChatAreaId) {
                unavailable.push(providerName);
            }
        });
        return unavailable;
    };
}

module.exports = MainWindowController;
