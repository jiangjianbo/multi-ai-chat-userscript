const ChatArea = require('./chat-area');
const Util = require('./util');
const DriverFactory = require('./driver-factory');

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
    this.config = config;
    this.i18n = i18n;
    this.util = new Util();
    this.chatAreas = new Map();
    this.driverFactory = new DriverFactory();
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
            this.message.broadcast('chat', { prompt });
        }
    };

    this.setEventHandler = function(eventName, handler) {
        this.eventHandlers[eventName] = handler;
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

        // Update internationalized text
        this.element.querySelector('.product-name').textContent = this.i18n.getText('app.title');
        this.globalSendButton.innerHTML = '&#10148;';
        this.globalSendButton.title = this.i18n.getText('button.send.title');
        this.promptTextarea.placeholder = this.i18n.getText('prompt.placeholder');
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

        // Close Window
        this.element.querySelector('.title-action-button').addEventListener('click', () => {
            window.close();
        });

        // Language Switcher
        this.langSwitcher.addEventListener('click', (e) => {
            e.stopPropagation();
            this.langDropdown.style.display = this.langDropdown.style.display === 'block' ? 'none' : 'block';
        });
        this.langDropdown.addEventListener('click', (e) => {
            if (e.target.matches('[data-lang]')) {
                this.i18n.setCurrentLang(e.target.dataset.lang);
                // Could add a full UI refresh logic here if needed
                alert(`Language changed to: ${e.target.dataset.lang}`);
                this.langDropdown.style.display = 'none';
            }
        });

        // Settings Menu
        this.settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.settingsMenu.style.display = this.settingsMenu.style.display === 'block' ? 'none' : 'block';
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
                    const newId = `chat-area-${Date.now()}`;
                    const webAccess = this.settingsMenu.querySelector('#web-access').checked;
                    const longThought = this.settingsMenu.querySelector('#long-thought').checked;
                    this.addChatArea({ id: newId, url: null, providerName: 'New Chat', params: { webAccess, longThought } });        });

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
            if (area.container.parentElement) {
                area.container.parentElement.style.display = 'none';
            }
        });

        for (let i = 0; i < Math.min(layout, displayOrder.length); i++) {
            if (displayOrder[i].container.parentElement) {
                displayOrder[i].container.parentElement.style.display = 'block';
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
     * @param {object} data - Message data ({ id, url, title, ... }).
     */
    this.onMsgCreate = function(data) {
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
     * @description Adds a new ChatArea instance.
     * @param {object} data - 初始化数据，结构为{id, providerName, url, pinned, params:{webAccess,longThought, models}, conversation:[{type, content}]}.
     */
    this.addChatArea = function(data) {
        if (this.chatAreas.has(data.id)) {
            console.warn(`ChatArea with id ${data.id} already exists.`);
            return;
        }

        const wrapper = this.util.toHtml({ tag: 'div', '@class': 'chat-area-wrapper' });
        const container = this.util.toHtml({ tag: 'div', '@class': 'chat-area-container'});
        this.chatAreaContainer.appendChild(wrapper);
        wrapper.appendChild(container);

        const chatArea = new ChatArea(this, data.id, data.url, container);
        chatArea.init(data);

        chatArea.setEventHandler('onEvtNewSession', this._handleNewSession.bind(this));
        chatArea.setEventHandler('onEvtShare', this._handleShare.bind(this));
        chatArea.setEventHandler('onEvtParamChanged', this._handleParamChanged.bind(this));
        chatArea.setEventHandler('onEvtProviderChanged', this._handleProviderChanged.bind(this));
        chatArea.setEventHandler('onEvtPromptSend', this._handlePromptSend.bind(this));
        chatArea.setEventHandler('onEvtExport', this._handleExport.bind(this));

        this.chatAreas.set(data.id, chatArea);
        this.updateDefaultLayout();
        this.updateNewChatButtonState();
        console.log(`Added ChatArea: ${data.id}`);
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
            const wrapper = chatArea.container.parentElement;
            chatArea.destroy(); // Let chat area clean up itself
            if (wrapper) {
                wrapper.remove(); // Controller removes the wrapper it created
            }
            this.chatAreas.delete(id);
            this.updateDefaultLayout();
            this.updateNewChatButtonState();
            console.log(`Removed ChatArea: ${id}`);
        }
    };

    this._handleNewSession = function(chatArea, providerName) {
        this.message.send(chatArea.id, 'new_session', { providerName });
    };

    this._handleShare = function(chatArea, url) {
        navigator.clipboard.writeText(url);
        this.message.send(chatArea.id, 'focus', {});
    };

    this._handleParamChanged = function(chatArea, key, newValue, oldValue) {
        this.message.send(chatArea.id, 'param_changed', { key, newValue, oldValue });
    };

    this._handleProviderChanged = function(chatArea, newProvider, oldProvider) {
        const newUrl = this.driverFactory.getProviderUrl(newProvider);
        this.message.send(chatArea.id, 'change_provider', { url: newUrl });
        chatArea.url = newUrl;
    };

    this._handlePromptSend = function(chatArea, text) {
        this.message.send(chatArea.id, 'prompt', { text });
    };

    this._handleExport = function(chatArea) {
        this.message.send(chatArea.id, 'export', {});
    };
}

module.exports = MainWindowController;
