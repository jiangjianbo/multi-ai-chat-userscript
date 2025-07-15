// ==UserScript==
// @name         Multi-AI Sync Chat Pro
// @namespace    https://github.com/jiangjianbo/multi-ai-chat-userscript
// @version      3.0.0
// @description  Professional multi-AI synchronization with full i18n, async handling and extensible drivers
// @author       jiangjianbo
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_notification
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /* ========================= 常量定义 ========================= */
    const CONST = {
        STORAGE: {
            PROVIDERS: 'multi_ai_sync_providers',
            LANGUAGE: 'multi_ai_sync_lang'
        },
        DEFAULT_PROVIDERS: [
            { name: 'Kimi', url: 'https://www.kimi.com/chat/' },
            { name: 'Gemini', url: 'https://gemini.google.com/' },
            { name: 'ChatGPT', url: 'https://chatgpt.com/' },
            { name: 'DeepSeek', url: 'https://chat.deepseek.com/' },
            { name: 'Grok', url: 'https://x.com/i/grok' },
            { name: '通义', url: 'https://www.tongyi.com/' }
        ],
        LAYOUTS: [1, 2, 3, 4, 6],
        CHANNEL_NAME: 'multi-ai-sync-pro',
        WINDOW_NAME: 'multi-ai-sync-chat-window'
    };

    /* ========================= 国际化 ========================= */
    function I18n() {
        this.lang = this.detectLanguage();
        this.messages = {
            en: {
                syncBtn: 'Sync Compare',
                title: 'Multi-AI Sync Chat',
                config: 'Config',
                newChat: 'New Chat',
                send: 'Send',
                promptPlaceholder: 'Enter your prompt...',
                confirmSwitch: 'Switch AI provider? Current content will be lost.',
                confirmClose: 'Close this chat area?',
                confirmDelete: 'Delete this provider?',
                confirmRestore: 'Restore default providers? All changes will be lost.',
                webSearch: 'Web Search',
                share: 'Share',
                openWindow: 'Open in New Tab',
                close: 'Close',
                addProvider: 'Add Provider',
                saveConfig: 'Save Configuration',
                closeConfig: 'Close',
                restoreDefaults: 'Restore Defaults',
                waiting: 'Waiting for connection...',
                copy: 'Copy',
                toggle: 'Toggle',
                collapse: 'Collapse'
            },
            zh: {
                syncBtn: '同步对比',
                title: '多个AI同步聊天',
                config: '配置',
                newChat: '新对话',
                send: '发送',
                promptPlaceholder: '输入提示词...',
                confirmSwitch: '切换AI提供商？当前内容将丢失。',
                confirmClose: '关闭此聊天区域？',
                confirmDelete: '删除此提供商？',
                confirmRestore: '恢复默认提供商？所有更改将丢失。',
                webSearch: '联网搜索',
                share: '分享',
                openWindow: '新标签页打开',
                close: '关闭',
                addProvider: '添加提供商',
                saveConfig: '保存配置',
                closeConfig: '关闭',
                restoreDefaults: '恢复默认',
                waiting: '等待连接...',
                copy: '复制',
                toggle: '切换',
                collapse: '折叠'
            },
            fr: {
                syncBtn: 'Synchroniser',
                title: 'Chat IA Multi-Sync',
                config: 'Config',
                newChat: 'Nouveau',
                send: 'Envoyer',
                promptPlaceholder: 'Entrez votre prompt...',
                confirmSwitch: 'Changer de fournisseur IA ? Le contenu actuel sera perdu.',
                confirmClose: 'Fermer cette zone de chat ?',
                confirmDelete: 'Supprimer ce fournisseur ?',
                confirmRestore: 'Restaurer les fournisseurs par défaut ? Toutes les modifications seront perdues.',
                webSearch: 'Recherche Web',
                share: 'Partager',
                openWindow: 'Ouvrir dans un nouvel onglet',
                close: 'Fermer',
                addProvider: 'Ajouter un fournisseur',
                saveConfig: 'Sauvegarder',
                closeConfig: 'Fermer',
                restoreDefaults: 'Restaurer les paramètres par défaut',
                waiting: 'En attente de connexion...',
                copy: 'Copier',
                toggle: 'Basculer',
                collapse: 'Réduire'
            },
            ja: {
                syncBtn: '同期比較',
                title: 'マルチAI同期チャット',
                config: '設定',
                newChat: '新規チャット',
                send: '送信',
                promptPlaceholder: 'プロンプトを入力...',
                confirmSwitch: 'AIプロバイダーを切り替えますか？現在の内容は失われます。',
                confirmClose: 'このチャットエリアを閉じますか？',
                confirmDelete: 'このプロバイダーを削除しますか？',
                confirmRestore: 'デフォルトのプロバイダーを復元しますか？すべての変更が失われます。',
                webSearch: 'ウェブ検索',
                share: '共有',
                openWindow: '新しいタブで開く',
                close: '閉じる',
                addProvider: 'プロバイダーを追加',
                saveConfig: '保存',
                closeConfig: '閉じる',
                restoreDefaults: 'デフォルトに戻す',
                waiting: '接続待機中...',
                copy: 'コピー',
                toggle: '切り替え',
                collapse: '折りたたむ'
            },
            ko: {
                syncBtn: '동기화 비교',
                title: '멀티 AI 동기화 채팅',
                config: '설정',
                newChat: '새 대화',
                send: '전송',
                promptPlaceholder: '프롬프트를 입력하세요...',
                confirmSwitch: 'AI 공급자를 변경하시겠습니까? 현재 콘텐츠가 손실됩니다.',
                confirmClose: '이 채팅 영역을 닫으시겠습니까?',
                confirmDelete: '이 제공업체를 삭제하시겠습니까?',
                confirmRestore: '기본 제공업체를 복원하시겠습니까? 모든 변경 사항이 손실됩니다.',
                webSearch: '웹 검색',
                share: '공유',
                openWindow: '새 탭에서 열기',
                close: '닫기',
                addProvider: '공급자 추가',
                saveConfig: '저장',
                closeConfig: '닫기',
                restoreDefaults: '기본값 복원',
                waiting: '연결 대기 중...',
                copy: '복사',
                toggle: '전환',
                collapse: '접기'
            },
            es: {
                syncBtn: 'Sincronizar',
                title: 'Chat Multi-IA Sincronizado',
                config: 'Configuración',
                newChat: 'Nuevo chat',
                send: 'Enviar',
                promptPlaceholder: 'Ingrese su prompt...',
                confirmSwitch: '¿Cambiar de proveedor IA? Se perderá el contenido actual.',
                confirmClose: '¿Cerrar esta área de chat?',
                confirmDelete: '¿Eliminar este proveedor?',
                confirmRestore: '¿Restaurar proveedores predeterminados? Se perderán todos los cambios.',
                webSearch: 'Búsqueda web',
                share: 'Compartir',
                openWindow: 'Abrir en nueva pestaña',
                close: 'Cerrar',
                addProvider: 'Agregar proveedor',
                saveConfig: 'Guardar',
                closeConfig: 'Cerrar',
                restoreDefaults: 'Restaurar valores predeterminados',
                waiting: 'Esperando conexión...',
                copy: 'Copiar',
                toggle: 'Alternar',
                collapse: 'Colapsar'
            },
            pt: {
                syncBtn: 'Sincronizar',
                title: 'Chat Multi-IA Sincronizado',
                config: 'Configuração',
                newChat: 'Novo chat',
                send: 'Enviar',
                promptPlaceholder: 'Digite seu prompt...',
                confirmSwitch: 'Mudar de provedor IA? O conteúdo atual será perdido.',
                confirmClose: 'Fechar esta área de chat?',
                confirmDelete: 'Excluir este provedor?',
                confirmRestore: 'Restaurar provedores padrão? Todas as alterações serão perdidas.',
                webSearch: 'Pesquisa web',
                share: 'Compartilhar',
                openWindow: 'Abrir em nova aba',
                close: 'Fechar',
                addProvider: 'Adicionar provedor',
                saveConfig: 'Salvar',
                closeConfig: 'Fechar',
                restoreDefaults: 'Restaurar padrões',
                waiting: 'Aguardando conexão...',
                copy: 'Copiar',
                toggle: 'Alternar',
                collapse: 'Recolher'
            },
            ar: {
                syncBtn: 'مزامنة المقارنة',
                title: 'دردشة متعددة AI متزامنة',
                config: 'الإعدادات',
                newChat: 'دردشة جديدة',
                send: 'إرسال',
                promptPlaceholder: 'أدخل موجهك...',
                confirmSwitch: 'تغيير مزود AI؟ سيتم فقدان المحتوى الحالي.',
                confirmClose: 'إغلاق منطقة الدردشة هذه؟',
                confirmDelete: 'حذف هذا المزود؟',
                confirmRestore: 'استعادة المزودين الافتراضيين؟ سيتم فقدان جميع التغييرات.',
                webSearch: 'البحث على الويب',
                share: 'مشاركة',
                openWindow: 'فتح في علامة تبويب جديدة',
                close: 'إغلاق',
                addProvider: 'إضافة مزود',
                saveConfig: 'حفظ',
                closeConfig: 'إغلاق',
                restoreDefaults: 'استعادة الإعدادات الافتراضية',
                waiting: 'انتظار الاتصال...',
                copy: 'نسخ',
                toggle: 'تبديل',
                collapse: 'طي'
            }
        };

        /**
         * Detect browser language
         * @returns {string} language code
         */
        this.detectLanguage = function () {
            return localStorage.getItem(CONST.STORAGE.LANGUAGE) ||
                navigator.language.substring(0, 2) || 'en';
        };

        /**
         * Get translated text
         * @param {string} key - Message key
         * @returns {string} Translated text
         */
        this.t = function (key) {
            return this.messages[this.lang]?.[key] || this.messages.en[key];
        };

        /**
         * Check if RTL language
         * @returns {boolean} True if RTL
         */
        this.isRTL = function () {
            return this.lang === 'ar';
        };

        /**
         * Set language
         * @param {string} lang - Language code
         */
        this.setLanguage = function (lang) {
            this.lang = lang;
            localStorage.setItem(CONST.STORAGE.LANGUAGE, lang);
        };
    }

    /* ========================= 工具类 ========================= */
    function Utils() {
        /**
         * Query single element
         * @param {string} selector - CSS selector
         * @param {Element} context - Context element
         * @returns {Element|null} Found element
         */
        this.$ = function (selector, context) {
            return (context || document).querySelector(selector);
        };

        /**
         * Query multiple elements
         * @param {string} selector - CSS selector
         * @param {Element} context - Context element
         * @returns {NodeList} Found elements
         */
        this.$$ = function (selector, context) {
            return (context || document).querySelectorAll(selector);
        };

        /**
         * Create element with attributes
         * @param {string} tag - Tag name
         * @param {Object} attrs - Attributes object
         * @returns {Element} Created element
         */
        this.createElement = function (tag, attrs) {
            const el = document.createElement(tag);
            Object.entries(attrs || {}).forEach(([k, v]) => {
                if (k === 'innerHTML') {
                    el.innerHTML = v;
                } else if (k === 'textContent') {
                    el.textContent = v;
                } else if (k === 'style' && typeof v === 'object') {
                    Object.assign(el.style, v);
                } else {
                    el.setAttribute(k, v);
                }
            });
            return el;
        };

        /**
         * Wait for element to appear
         * @param {string} selector - CSS selector
         * @param {number} timeout - Timeout in ms
         * @returns {Promise<Element>} Found element
         */
        this.waitFor = function (selector, timeout) {
            timeout = timeout || 5000;
            return new Promise((resolve, reject) => {
                const el = this.$(selector);
                if (el) return resolve(el);

                const observer = new MutationObserver(() => {
                    const el = this.$(selector);
                    if (el) {
                        observer.disconnect();
                        resolve(el);
                    }
                });

                observer.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found`));
                }, timeout);
            });
        };
    }

    /* ========================= 消息通知器 ========================= */
    function MessageNotifier() {
        this.channel = new BroadcastChannel(CONST.CHANNEL_NAME);
        this.handlers = {};

        // Auto-register onMsg* methods
        /**
         * register message handlers from target object
         * @param {Object} target object with onMsg* methods
         */
        this.register = function (target) {
            const proto = Object.getPrototypeOf(target);
            Object.getOwnPropertyNames(proto).forEach(name => {
                if (name.startsWith('onMsg') && typeof this[name] === 'function') {
                    const type = name.slice(5).toLowerCase();
                    this.on(type, target[name].bind(target));
                }
            });
        };

        /**
         * Register message handler
         * @param {string} type - Message type
         * @param {Function} handler - Handler function
         */
        this.on = function (type, handler) {
            if (!this.handlers[type]) this.handlers[type] = [];
            this.handlers[type].push(handler);
        };

        /**
         * Emit message
         * @param {string} type - Message type
         * @param {*} data - Message data
         */
        this.emit = function (type, data) {
            this.channel.postMessage({ type, data, timestamp: Date.now() });
        };

        this.channel.onmessage = (event) => {
            const { type, data } = event.data;
            if (this.handlers[type]) {
                this.handlers[type].forEach(handler => handler(data));
            }
        };
    }

    /* ========================= 配置管理 ========================= */
    function ConfigManager() {
        /**
         * Get providers from storage
         * @returns {Array} Providers array
         */
        this.getProviders = function () {
            const stored = GM_getValue(CONST.STORAGE.PROVIDERS);
            return stored ? JSON.parse(stored) : [...CONST.DEFAULT_PROVIDERS];
        };

        /**
         * Save providers to storage
         * @param {Array} providers - Providers array
         */
        this.saveProviders = function (providers) {
            GM_setValue(CONST.STORAGE.PROVIDERS, JSON.stringify(providers));
        };

        /**
         * Restore default providers
         */
        this.restoreDefaults = function () {
            GM_setValue(CONST.STORAGE.PROVIDERS, JSON.stringify([...CONST.DEFAULT_PROVIDERS]));
        };
    }

    const notifier = new MessageNotifier();
    const config = new ConfigManager();
    const i18n = new I18n();
    const utils = new Utils();

    /* ========================= 通用页面驱动 ========================= */
    function GenericPageDriver(name, url) {
        this.name = name;
        this.url = url;

        this.selectors = {
            input: [
                'textarea[placeholder*="message"]',
                'textarea[placeholder*="输入"]',
                'textarea[placeholder*="prompt"]',
                'input[type="text"][placeholder*="message"]',
                '[contenteditable="true"]',
                'textarea'
            ],
            sendButton: [
                'button[type="submit"]',
                'button[data-testid="send-button"]',
                'button[aria-label="Send"]',
                '.send-button',
                'button:has-text("发送")',
                'button:has-text("Send")'
            ],
            username: [
                '.user-name',
                '.username',
                '[data-username]',
                '.profile-name',
                '.account-name'
            ],
            newChat: [
                '[data-testid="new-chat"]',
                '.new-chat-btn',
                'button[aria-label="New chat"]'
            ],
            shareButton: [
                '[data-testid="share-button"]',
                '.share-btn',
                'button[aria-label="Share"]'
            ],
            webSearchToggle: [
                '[data-testid="web-search-toggle"]',
                '.web-search-toggle',
                'input[type="checkbox"][name*="search"]'
            ],
            longThinkingToggle: [
                '[data-testid="long-thinking-toggle"]',
                '.long-thinking-toggle'
            ]
        };

        /**
         * Get current configuration
         * @returns {Object} Configuration object
         */
        this.getConfig = function () {
            return {
                username: this.getUsername(),
                webSearch: this.getWebSearchStatus(),
                model: this.getCurrentModel(),
                longThinking: this.getLongThinkingStatus()
            };
        };

        /**
         * Get username
         * @returns {string} Username or empty string
         */
        this.getUsername = function () {
            for (const selector of this.selectors.username) {
                const el = utils.$(selector);
                if (el) return el.textContent.trim();
            }
            return '';
        };

        /**
         * Get web search status
         * @returns {boolean} Web search enabled
         */
        this.getWebSearchStatus = function () {
            for (const selector of this.selectors.webSearchToggle) {
                const el = utils.$(selector);
                if (el) return el.checked;
            }
            return false;
        };

        /**
         * Get current model
         * @returns {string} Model name
         */
        this.getCurrentModel = function () {
            const modelSelect = utils.$('select[name="model"], .model-selector');
            return modelSelect ? modelSelect.value : 'default';
        };

        /**
         * Get long thinking status
         * @returns {boolean} Long thinking enabled
         */
        this.getLongThinkingStatus = function () {
            for (const selector of this.selectors.longThinkingToggle) {
                const el = utils.$(selector);
                if (el) return el.checked;
            }
            return false;
        };

        /**
         * Send message
         * @param {string} message - Message to send
         * @returns {Promise} Promise that resolves when message is sent
         */
        this.sendMessage = async function (message) {
            const input = await utils.waitFor(this.selectors.input.join(', '));
            input.value = message;
            input.dispatchEvent(new Event('input', { bubbles: true }));

            const sendBtn = await utils.waitFor(this.selectors.sendButton.join(', '));
            if (sendBtn && !sendBtn.disabled) {
                sendBtn.click();
            }
        };

        /**
         * Create new thread
         */
        this.createNewThread = function () {
            for (const selector of this.selectors.newChat) {
                const el = utils.$(selector);
                if (el) {
                    el.click();
                    return;
                }
            }
        };

        /**
         * Share current chat
         */
        this.shareChat = function () {
            for (const selector of this.selectors.shareButton) {
                const el = utils.$(selector);
                if (el) {
                    el.click();
                    return;
                }
            }
        };

        /**
         * Set configuration
         * @param {string} key - Config key
         * @param {boolean} value - Config value
         */
        this.setConfig = function (key, value) {
            const selectors = {
                webSearch: this.selectors.webSearchToggle,
                longThinking: this.selectors.longThinkingToggle
            };

            if (selectors[key]) {
                for (const selector of selectors[key]) {
                    const el = utils.$(selector);
                    if (el && el.checked !== value) {
                        el.click();
                        break;
                    }
                }
            }
        };
    }

    /* ========================= 注入控制器 ========================= */
    function InjectionController() {
        this.driver = null;

        /**
         * Initialize injection
         */
        this.init = function () {
            this.detectProvider();
            this.injectButton();
        };

        /**
         * Detect current AI provider
         */
        this.detectProvider = function () {
            const url = window.location.href;
            const providers = config.getProviders();
            const provider = providers.find(p => url.includes(p.url));
            if (provider) {
                this.driver = new GenericPageDriver(provider.name, url);
            }
        };

        /**
         * Inject sync button
         */
        this.injectButton = function () {
            setTimeout(() => {
                const btn = utils.createElement('button', {
                    textContent: i18n.t('syncBtn'),
                    style: {
                        position: 'fixed',
                        top: '10px',
                        [i18n.isRTL() ? 'left' : 'right']: '10px',
                        zIndex: '10000',
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s'
                    }
                });

                btn.onmouseover = () => {
                    btn.style.transform = 'scale(1.05)';
                    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                };

                btn.onmouseout = () => {
                    btn.style.transform = 'scale(1)';
                    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                };

                btn.onclick = () => {
                    const syncWindow = new SyncChatWindow();
                    syncWindow.open();

                    this.notifier.emit('create', {
                        url: window.location.href,
                        tabId: window.name || Date.now().toString(),
                        config: this.driver ? this.driver.getConfig() : {}
                    });
                };

                document.body.appendChild(btn);
            }, 3000);
        };
    }

    /* ========================= 同步聊天窗口脚本 ========================= */
    function SyncChatWindowScript() {
        const areas = {};
        let layout = 1;

        /* ========================= 布局管理 ========================= */
        function setLayout(num) {
            layout = num;
            const container = document.getElementById('chatContainer');
            container.style.gridTemplateColumns = `repeat(${Math.min(num, 3)}, 1fr)`;
            container.style.gridTemplateRows = '1fr';

            if (num === 4) {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
                container.style.gridTemplateRows = 'repeat(2, 1fr)';
            } else if (num === 6) {
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
                container.style.gridTemplateRows = 'repeat(2, 1fr)';
            }

            document.querySelectorAll('.layout-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.layout) === num);
            });
        }

        /* ========================= 聊天区域 ========================= */
        function createChatArea(url, tabId) {
            const id = `area-${Date.now()}`;
            const area = document.createElement('div');
            area.className = 'chat-area';
            area.id = id;

            area.innerHTML = `
                    <div class="chat-header">
                        <select class="ai-select">
                            ${config.getProviders().map(p =>
                `<option value="${p.url}" ${p.url === url ? 'selected' : ''}>${p.name}</option>`
            ).join('')}
                        </select>
                        <button class="icon-btn web-search-btn" title="${i18n.t('webSearch')}">🔍</button>
                        <div style="margin-${i18n.isRTL() ? 'right' : 'left'}: auto; display: flex; gap: 5px;">
                            <button class="icon-btn share-btn" title="${i18n.t('share')}">📤</button>
                            <button class="icon-btn open-window-btn" title="${i18n.t('openWindow')}">🔗</button>
                            <button class="icon-btn close-btn" title="${i18n.t('close')}">❌</button>
                        </div>
                    </div>
                    <div class="chat-content" data-url="${url}" data-tabid="${tabId}">
                        <p style="text-align: center; color: #666;">${i18n.t('waiting')}</p>
                    </div>
                    <button class="hover-trigger">⬆️</button>
                    <div class="hover-input">
                        <input type="text" placeholder="${i18n.t('promptPlaceholder')}">
                    </div>
                `;

            document.getElementById('chatContainer').appendChild(area);
            areas[id] = { url, tabId };

            /* 绑定事件 */
            area.querySelector('.close-btn').onclick = () => {
                showConfirmDialog(area, () => {
                    area.remove();
                    delete areas[id];
                });
            };

            area.querySelector('.open-window-btn').onclick = () => {
                window.open(url, '_blank');
            };

            area.querySelector('.ai-select').onchange = (e) => {
                const newUrl = e.target.value;
                if (area.querySelector('.chat-content').children.length > 1) {
                    showConfirmDialog(area, () => {
                        switchProvider(id, newUrl);
                    });
                } else {
                    switchProvider(id, newUrl);
                }
            };

            /* 悬停输入框 */
            const trigger = area.querySelector('.hover-trigger');
            const hoverInput = area.querySelector('.hover-input');
            const hoverInputField = hoverInput.querySelector('input');

            trigger.onclick = () => {
                trigger.style.display = 'none';
                hoverInput.style.display = 'block';
                hoverInputField.focus();
            };

            hoverInputField.onblur = () => {
                hoverInput.style.display = 'none';
                trigger.style.display = 'flex';
            };

            hoverInputField.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    const message = hoverInputField.value.trim();
                    if (message) {
                        notifier.emit('chat', {
                            chatId: Date.now(),
                            message,
                            url: areas[id].url,
                            tabId: areas[id].tabId
                        });
                        hoverInputField.value = '';
                    }
                    hoverInputField.blur();
                }
            };
        }

        function switchProvider(areaId, newUrl) {
            const area = document.getElementById(areaId);
            if (!area) return;

            area.querySelector('.chat-content').dataset.url = newUrl;
            area.querySelector('.chat-content').innerHTML = `<p style="text-align: center; color: #666;">${i18n.t('waiting')}</p>`;
            areas[areaId] = { url: newUrl, tabId: areas[areaId].tabId };

            notifier.emit('switch', { id: areaId, url: newUrl });
        }

        /* ========================= 确认对话框 ========================= */
        function showConfirmDialog(parent, onConfirm) {
            const backdrop = document.createElement('div');
            backdrop.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    max-width: 300px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                `;
            dialog.innerHTML = `
                    <p>${i18n.t('confirmSwitch')}</p>
                    <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                        <button class="confirm-btn" style="padding: 5px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">${i18n.t('config')}</button>
                        <button class="cancel-btn" style="padding: 5px 15px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">${i18n.t('close')}</button>
                    </div>
                `;

            backdrop.appendChild(dialog);
            parent.appendChild(backdrop);

            dialog.querySelector('.confirm-btn').onclick = () => {
                onConfirm();
                backdrop.remove();
            };

            dialog.querySelector('.cancel-btn').onclick = () => {
                backdrop.remove();
            };
        }

        /* ========================= 配置管理 ========================= */
        function updateProviderList() {
            const list = document.getElementById('providerList');
            list.innerHTML = config.getProviders().map((p, i) => `
                    <div class="provider-item">
                        <input placeholder="Name" value="${p.name}" onchange="updateProvider(${i}, 'name', this.value)">
                        <input placeholder="URL" value="${p.url}" onchange="updateProvider(${i}, 'url', this.value)">
                        <button onclick="removeProvider(${i})">🗑️</button>
                    </div>
                `).join('');
        }

        window.updateProvider = (i, key, value) => {
            const providers = config.getProviders();
            providers[i][key] = value;
        };

        window.addProvider = () => {
            const providers = config.getProviders();
            providers.push({ name: 'New Provider', url: 'https://example.com' });
            updateProviderList();
        };

        window.removeProvider = (i) => {
            if (confirm(i18n.t('confirmDelete'))) {
                const providers = config.getProviders();
                providers.splice(i, 1);
                updateProviderList();
            }
        };

        window.saveConfig = () => {
            config.saveProviders(config.getProviders());
            closeConfig();
        };

        window.restoreDefaults = () => {
            if (confirm(i18n.t('confirmRestore'))) {
                config.restoreDefaults();
                updateProviderList();
            }
        };

        function openConfig() {
            document.querySelector('.config-modal').style.display = 'block';
            document.querySelector('.modal-backdrop').style.display = 'block';
            updateProviderList();
        }

        function closeConfig() {
            document.querySelector('.config-modal').style.display = 'none';
            document.querySelector('.modal-backdrop').style.display = 'none';
        }

        /* ========================= 事件绑定 ========================= */
        document.querySelector('.config-btn').onclick = openConfig;
        document.querySelector('.modal-backdrop').onclick = closeConfig;
        window.closeConfig = closeConfig;

        document.querySelector('.send-btn').onclick = () => {
            const message = document.querySelector('.prompt-input').value.trim();
            if (!message) return;

            Object.keys(areas).forEach(id => {
                notifier.emit('chat', {
                    chatId: Date.now(),
                    message,
                    url: areas[id].url,
                    tabId: areas[id].tabId
                });
            });

            document.querySelector('.prompt-input').value = '';
        };

        document.querySelector('.prompt-input').onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.querySelector('.send-btn').click();
            }
        };

        /* ========================= 语言切换 ========================= */
        document.querySelector('.lang-btn').onclick = () => {
            const dropdown = document.querySelector('.lang-dropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        };

        document.querySelectorAll('.lang-option').forEach(option => {
            option.onclick = () => {
                const lang = option.dataset.lang;
                i18n.setLanguage(lang);
                location.reload();
            };

            if (option.dataset.lang === i18n.lang) {
                option.classList.add('active');
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lang-selector')) {
                document.querySelector('.lang-dropdown').style.display = 'none';
            }
        });

        /* ========================= 布局按钮 ========================= */
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.onclick = () => setLayout(parseInt(btn.dataset.layout));
        });

        /* ========================= 消息监听 ========================= */
        notifier.onMsg('create', (data) => {
            if (Object.keys(areas).length >= layout) {
                setLayout(Math.min(layout + 1, 6));
            }

            setTimeout(() => {
                createChatArea(data.url, data.tabId);
            }, 100);
        });

        notifier.onMsg('answer', (data) => {
            Object.keys(areas).forEach(id => {
                if (areas[id].url === data.url && areas[id].tabId === data.tabId) {
                    const content = document.getElementById(id).querySelector('.chat-content');
                    const div = document.createElement('div');
                    div.className = 'message';
                    div.innerHTML = data.answer;
                    content.appendChild(div);
                    content.scrollTop = content.scrollHeight;
                }
            });
        });

        /* ========================= 初始化 ========================= */
        setLayout(1);
    }

    /* ========================= 同步聊天窗口 ========================= */
    function SyncChatWindow() {
        this.areas = {};
        this.layout = 1;
        this.win = null;

        const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="${i18n.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${i18n.t('title')}</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            direction: ${i18n.isRTL() ? 'rtl' : 'ltr'};
        }
        .header {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            gap: 15px;
            flex-wrap: wrap;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            white-space: nowrap;
        }
        .lang-selector {
            position: relative;
        }
        .lang-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 5px;
            border-radius: 4px;
        }
        .lang-btn:hover {
            background: #f0f0f0;
        }
        .lang-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            ${i18n.isRTL() ? 'right' : 'left'}: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 100;
            min-width: 120px;
            max-height: 300px;
            overflow-y: auto;
        }
        .lang-option {
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .lang-option:hover {
            background: #f0f0f0;
        }
        .lang-option.active::before {
            content: '✓';
            color: #007bff;
        }
        .layout-btns {
            display: flex;
            gap: 5px;
            margin: 0 auto;
        }
        .layout-btn {
            padding: 8px 12px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
            font-size: 14px;
        }
        .layout-btn:hover {
            background: #f0f0f0;
        }
        .layout-btn.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }
        .right-btns {
            display: flex;
            gap: 10px;
            margin-left: auto;
        }
        .icon-btn {
            padding: 8px;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .icon-btn:hover {
            background: #f0f0f0;
        }
        .chat-container {
            display: grid;
            gap: 10px;
            padding: 10px;
            height: calc(100vh - 140px);
            transition: all 0.3s;
        }
        .chat-area {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            min-height: 200px;
        }
        .chat-header {
            padding: 10px 15px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #eee;
            flex-wrap: wrap;
        }
        .ai-select {
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            font-size: 14px;
        }
        .chat-content {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            min-height: 150px;
        }
        .prompt-bar {
            display: flex;
            padding: 10px;
            background: white;
            border-top: 1px solid #eee;
            gap: 10px;
            align-items: center;
        }
        .prompt-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            resize: none;
            min-height: 40px;
            max-height: 120px;
        }
        .send-btn {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            white-space: nowrap;
        }
        .send-btn:hover {
            background: #0056b3;
        }
        .config-modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        }
        .provider-item {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            align-items: center;
        }
        .provider-item input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .provider-item button {
            padding: 8px 12px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .hover-input {
            position: absolute;
            bottom: 10px;
            ${i18n.isRTL() ? 'left' : 'right'}: 10px;
            display: none;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .hover-input input {
            width: 200px;
            padding: 8px;
            border: none;
            outline: none;
            font-size: 14px;
        }
        .hover-trigger {
            position: absolute;
            bottom: 10px;
            ${i18n.isRTL() ? 'left' : 'right'}: 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        .chat-area:hover .hover-trigger {
            display: flex;
        }
        .message {
            margin-bottom: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            position: relative;
        }
        .message:hover .floating-toolbar {
            display: flex;
        }
        .floating-toolbar {
            display: none;
            position: absolute;
            top: 5px;
            ${i18n.isRTL() ? 'left' : 'right'}: 5px;
            background: rgba(0,0,0,0.7);
            border-radius: 4px;
            padding: 2px;
            gap: 5px;
        }
        .floating-toolbar button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 2px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${i18n.t('title')}</div>
        <div class="lang-selector">
            <button class="lang-btn" title="Language">🌐</button>
            <div class="lang-dropdown">
                <div class="lang-option" data-lang="en">🇺🇸 English</div>
                <div class="lang-option" data-lang="zh">🇨🇳 中文</div>
                <div class="lang-option" data-lang="fr">🇫🇷 Français</div>
                <div class="lang-option" data-lang="ja">🇯🇵 日本語</div>
                <div class="lang-option" data-lang="ko">🇰🇷 한국어</div>
                <div class="lang-option" data-lang="es">🇪🇸 Español</div>
                <div class="lang-option" data-lang="pt">🇵🇹 Português</div>
                <div class="lang-option" data-lang="ar">🇸🇦 العربية</div>
            </div>
        </div>
        <div class="layout-btns">
            <button class="layout-btn active" data-layout="1">1️⃣</button>
            <button class="layout-btn" data-layout="2">2️⃣</button>
            <button class="layout-btn" data-layout="3">3️⃣</button>
            <button class="layout-btn" data-layout="4">4️⃣</button>
            <button class="layout-btn" data-layout="6">6️⃣</button>
        </div>
        <div class="right-btns">
            <button class="icon-btn config-btn" title="${i18n.t('config')}">⚙️</button>
            <button class="icon-btn new-chat-btn" title="${i18n.t('newChat')}">➕</button>
        </div>
    </div>
    
    <div class="chat-container" id="chatContainer"></div>
    
    <div class="prompt-bar">
        <textarea class="prompt-input" placeholder="${i18n.t('promptPlaceholder')}"></textarea>
        <button class="send-btn">${i18n.t('send')}</button>
    </div>

    <div class="modal-backdrop"></div>
    <div class="config-modal">
        <h3>${i18n.t('config')}</h3>
        <div id="providerList"></div>
        <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="addProvider()">➕ ${i18n.t('addProvider')}</button>
            <button onclick="restoreDefaults()">🔄 ${i18n.t('restoreDefaults')}</button>
            <button onclick="saveConfig()">💾 ${i18n.t('saveConfig')}</button>
            <button onclick="closeConfig()">❌ ${i18n.t('closeConfig')}</button>
        </div>
    </div>

    <script>
        ${MessageNotifier.toString()}
        ${ConfigManager.toString()}
        ${I18n.toString()}
        ${Utils.toString()}

        const notifier = new MessageNotifier();
        const config = new ConfigManager();
        const i18n = new I18n();
        const utils = new Utils();

        ${SyncChatWindowScript.toString()}
        SyncChatWindowScript();
    </script>
</html>`;

        /**
         * Open or focus sync window
         */
        this.open = function () {
            if (this.win && !this.win.closed) {
                this.win.focus();
                return;
            }

            this.win = window.open('', CONST.WINDOW_NAME);
            this.win.document.write(HTML_TEMPLATE);
            this.win.document.close();
        };
    }

    /* ========================= 启动 ========================= */
    const controller = new InjectionController();
    controller.init();
})();
