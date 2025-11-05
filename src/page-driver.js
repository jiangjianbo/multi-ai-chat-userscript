const Util = require('./util');

/**
 * @description 页面驱动的抽象基类。
 * @property {object} selectors - 包含所有CSS选择器的对象。
 * @property {function} onAnswer - 回调函数，当新答案出现时调用。
 * @property {function} onChatTitle - 回调函数，当会话标题更改时调用。
 * @property {function} onOption - 回调函数，当选项更改时调用。
 */
function GenericPageDriver() {
    this.util = new Util();

    this.selectors = {
        promptInput: 'textarea',
        sendButton: 'button[type="submit"]',
        questions: '.question',
        answers: '.answer',
        conversationArea: '#conversation',
        chatTitle: 'h1',
        historyItems: '.history-item',
        answerCollapsedClass: 'collapsed',
        newSessionButton: 'button.new-session',
        webAccessOption: 'input#web-access',
        longThoughtOption: 'input#long-thought',
        modelVersionList: 'select.model-version',
        currentModelVersion: 'span.current-model'
    }; // 应由具体驱动覆盖
    this.onAnswer = (index, element) => {};
    this.onChatTitle = (title) => {};
    this.onOption = (key, value) => {};
    this.onQuestion = (index, element) => {};
    this.onModelVersionChange = (version) => {};
    this.onNewSession = () => {};

    this.className = this.util.getFunctionName(this);
    this.observer = null;
    this.currentModelVersionObserver = null;
    this.optionObservers = [];
    this.newSessionButtonListener = null;

    /**
     * @description 异步初始化方法，可用于预加载或缓存元素。
     */
    this.init = async function() {
        // Base implementation is empty. Should be overridden by specific drivers if needed.
    };

    // --- DOM Element Accessors ---

    /**
     * 获取提示输入框对应的元素。
     * @returns {HTMLElement|null}  提示输入框元素。
     */
    this.elementPromptInput = function() {
        return this.util.$(this.selectors.promptInput);
    };

    /**
     * 获取发送按钮对应的元素。
     * @returns {HTMLElement|null} 发送按钮元素。
     */
    this.elementSendButton = function() {
        return this.util.$(this.selectors.sendButton);
    };

    /**
     * 获取对话区域对应的元素
     * @returns {HTMLElement|null} 对话区域元素。
     */
    this.elementConversationArea = function() {
        return this.util.$(this.selectors.conversationArea);
    };

    /**
     * 获取历史记录区域对应的元素
     * @returns {HTMLElement|null} 历史记录区域元素。
     */
    this.elementHistoryArea = function() {
        return this.util.$(this.selectors.historyArea);
    };

    /**
     * 获取所用户所问问题元素列表。 
     * @returns {NodeListOf<HTMLElement>} 用户问题元素列表。
     */
    this.elementQuestions = function() {
        return this.util.$$(this.selectors.questions);
    };

    /**
     * 获取回答元素列表。
     * @returns {NodeListOf<HTMLElement>} 回答元素列表。
     */
    this.elementAnswers = function() {
        return this.util.$$(this.selectors.answers);
    };

    /**
     * 获取历史记录项元素列表。
     * @returns {NodeListOf<HTMLElement>} 历史记录项元素列表。
     */
    this.elementHistoryItems = function() {
        return this.util.$$(this.selectors.historyItems);
    };

    /**
     * 获取指定索引的问题元素。
     * @param {Int} index - 问题的索引下标
     * @returns 问题元素
     */
    this.elementQuestion = function(index) {
        return this.elementQuestions()[index] || null;
    };

    /**
     * 获取指定索引的回答元素。
     * @param {Int} index - 回答的索引下标 
     * @returns 回答元素
     */
    this.elementAnswer = function(index) {
        return this.elementAnswers()[index] || null;
    };

    /**
     * 获取会话标题元素。
     * @returns {HTMLElement|null} 会话标题元素。
     */
    this.elementChatTitle = function() {
        return this.util.$(this.selectors.chatTitle);
    };

    /**
     * 获取指定索引的历史记录项元素。
     * @param {Int} index - 历史记录项的索引下标 
     * @returns 历史记录项元素
     */
    this.elementHistoryItem = function(index) {
        return this.elementHistoryItems()[index] || null;
    };

    /**
     * 获取新会话按钮元素。
     * @returns {HTMLElement|null} 新会话按钮元素。
     */
    this.elementNewSessionButton = function() {
        return this.util.$(this.selectors.newSessionButton);
    };

    /**
     * 获取网页访问选项元素。
     * @returns {HTMLElement|null} 网页访问选项元素。
     */
    this.elementWebAccessOption = function() {
        return this.util.$(this.selectors.webAccessOption);
    };

    /**
     * 获取长思选项元素。
     * @returns {HTMLElement|null} 长思选项元素。
     */
    this.elementLongThoughtOption = function() {
        return this.util.$(this.selectors.longThoughtOption);
    };

    /**
     * 获取模型版本列表元素。
     * @returns {HTMLElement|null} 模型版本列表元素。
     */
    this.elementModelVersionList = function() {
        return this.util.$(this.selectors.modelVersionList);
    };

    /**
     * 获取当前模型版本元素。
     * @returns {HTMLElement|null} 当前模型版本元素。
     */
    this.elementCurrentModelVersion = function() {
        return this.util.$(this.selectors.currentModelVersion);
    };

    // --- DOM Data Getters ---

    /**
     * 获取提示词输入框中的文字
     * @returns {string} 提示输入框元素。
     */
    this.getPromptInput = function() {
        return this.util.getText(this.elementPromptInput());
    };

    /**
     * 获取会话轮数
     * @returns {number} 会话轮数
     */
    this.getConversationCount = function() {
        return this.elementQuestions().length;
    };

    /**
     * 获取历史记录数量
     * @returns {number} 历史记录数量
     */
    this.getHistoryCount = function() {
        return this.elementHistoryItems().length;
    };

    /**
     * 获取指定索引的历史记录项数据
     * @param {number} index - 历史记录索引
     * @returns 历史纪录项数据
     */
    this.getHistory = function(index) {
        const el = this.elementHistoryItem(index);
        if (!el) return null;
        return {
            title: el.textContent.trim(),
            url: el.href
        };
    }
     
    /**
     * 获取指定索引的问题内容
     * @param {number} index - 问题索引
     * @returns 问题内容
     */
    this.getQuestion = function(index) {
        const el = this.elementQuestion(index);
        return el ? el.textContent.trim() : '';
    };

    /**
     * 获取指定索引的回答内容
     * @param {number} index - 回答索引
     * @returns 回答内容
     */
    this.getAnswer = function(index) {
        const el = this.elementAnswer(index);
        return el ? el.textContent.trim() : '';
    };

    /**
     * 获取网页访问选项状态
     * @returns {boolean|null} 网页访问选项状态
     */
    this.getWebAccessOption = function() {
        const el = this.elementWebAccessOption();
        return this.util.getBoolean(el)
    };

    /**
     * 获取长思考选项值
     * @returns {boolean|null} 长思选项状态
     */
    this.getLongThoughtOption = function() {
        const el = this.elementLongThoughtOption();
        return this.util.getBoolean(el)
    };

    /**
     * 获取模型版本列表
     * @returns {Array<string>} 模型版本列表
     */
    this.getModelVersionList = function() {
        return Array.from(this.elementModelVersionList(), node => node.textContent);
    };

    /**
     * 获取当前模型版本
     * @returns {string} 当前模型版本
     */
    this.getCurrentModelVersion = function() {
        return this.util.getText(this.elementCurrentModelVersion());
    };

    /**
     * 获取会话标题
     * @returns {string} 会话标题
     */
    this.getChatTitle = function() {
        const el = this.elementChatTitle();
        return this.util.getText(el, '');
    };

    /**
     * 获取所有选项的键值对
     * @returns {object} 选项键值对
     */
    this.getOptions = function() {
        // 此方法需要具体驱动实现复杂的逻辑
        return {
            webAccess: this.getWebAccessOption(),
            longThought: this.getLongThoughtOption()
        };
    };

    this.getAnswerStatus = function(index) {
        // 假设折叠状态由一个特定的 class 或 attribute 表示
        const answer = this.elementAnswer(index);
        return answer ? answer.classList.contains(this.selectors.answerCollapsedClass) : false;
    };

    // --- DOM 操作方法 ---

    /**
     * 填充消息到提示词输入框
     * @param {string} message 要发送的消息
     */
    this.setPrompt = function(message) {
        const input = this.util.$(this.selectors.promptInput);
        if (input) {
            input.value = message;
            // 触发输入事件，以防页面有自己的监听器
            input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            console.error('Prompt input not found');
        }
    };

    /**
     * 发送当前提示词输入框的内容
     */
    this.send = function() {
        if (this.selectors.sendButton !== '') {
            const button = this.util.$(this.selectors.sendButton);
            if (button) {
                button.click();
            } else {
                console.error('Send button not found');
            }
        } else {
            // 直接在prompt输入框按下Enter键发送
            const input = this.elementPromptInput();
            if (input) {
                const enterEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13
                });
                input.dispatchEvent(enterEvent);
            } else {
                console.error('Prompt input not found for Enter key simulation.');
            }
        }
    };

    this.addAttachment = function(file) {
        console.warn('addAttachment() is not implemented. This may be restricted by browser security.');
    };

    this.setOption = function(key, value) {
        console.warn('setOption() is not implemented in the generic driver.');
    };

    this.setAnswerStatus = function(index, collapsed) {
        const answer = this.elementAnswer(index);
        if (!answer || !this.selectors.answerCollapsedClass) return;
        if (collapsed) {
            answer.classList.add(this.selectors.answerCollapsedClass);
        } else {
            answer.classList.remove(this.selectors.answerCollapsedClass);
        }
    };

    this.setModelVersion = function(version) {
        console.warn(`setModelVersion() is not implemented in the generic driver. Attempted to set version: ${version}`);
    };

    this.newSession = function() {
        console.warn('newSession() is not implemented in the generic driver.');
    };

    // --- 事件监控 ---

    this.startMonitoring = async function() {
        let lastQuestionCount = this.getConversationCount();
        let lastAnswerCount = this.elementAnswers().length;
        let lastChatTitle = this.getChatTitle();
        let lastModelVersion = this.getCurrentModelVersion();
        let lastWebAccessOption = this.getWebAccessOption();
        let lastLongThoughtOption = this.getLongThoughtOption();

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Monitor for new questions
                    const currentQuestionCount = this.getConversationCount();
                    if (currentQuestionCount > lastQuestionCount) {
                        const newQuestionIndex = currentQuestionCount - 1;
                        const newQuestionElement = this.elementQuestion(newQuestionIndex);
                        if (newQuestionElement) {
                            this.onQuestion(newQuestionIndex, newQuestionElement);
                        }
                        lastQuestionCount = currentQuestionCount;
                    }

                    // Monitor for new answers
                    const currentAnswerCount = this.elementAnswers().length;
                    if (currentAnswerCount > lastAnswerCount) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1 && node.matches(this.selectors.answers)) {
                                const allAnswers = Array.from(this.util.$$(this.selectors.answers));
                                const newAnswerIndex = allAnswers.indexOf(node);
                                this.onAnswer(newAnswerIndex, node);
                            }
                        });
                        lastAnswerCount = currentAnswerCount;
                    }
                }

                // Monitor for chat title changes
                const currentChatTitle = this.getChatTitle();
                if (currentChatTitle !== lastChatTitle) {
                    this.onChatTitle(currentChatTitle);
                    lastChatTitle = currentChatTitle;
                }
            });
        });

        const conversationArea = this.util.$(this.selectors.conversationArea);
        if (conversationArea) {
            this.observer.observe(conversationArea, { childList: true, subtree: true, attributes: true, characterData: true });
        } else {
            console.error('Conversation area not found for monitoring.');
        }

        // Monitor for model version changes
        const currentModelVersionElement = this.elementCurrentModelVersion();
        if (currentModelVersionElement) {
            this.currentModelVersionObserver = new MutationObserver(() => {
                const newModelVersion = this.getCurrentModelVersion();
                if (newModelVersion !== lastModelVersion) {
                    this.onModelVersionChange(newModelVersion);
                    lastModelVersion = newModelVersion;
                }
            });
            this.currentModelVersionObserver.observe(currentModelVersionElement, { childList: true, subtree: true, characterData: true });
        }

        // Monitor for option changes (web access, long thought)
        const webAccessElement = this.elementWebAccessOption();
        if (webAccessElement) {
            const webAccessObserver = new MutationObserver(() => {
                const newWebAccessOption = this.getWebAccessOption();
                if (newWebAccessOption !== lastWebAccessOption) {
                    this.onOption('webAccess', newWebAccessOption);
                    lastWebAccessOption = newWebAccessOption;
                }
            });
            webAccessObserver.observe(webAccessElement, { attributes: true, attributeFilter: ['checked'] });
            this.optionObservers.push(webAccessObserver);
        }

        const longThoughtElement = this.elementLongThoughtOption();
        if (longThoughtElement) {
            const longThoughtObserver = new MutationObserver(() => {
                const newLongThoughtOption = this.getLongThoughtOption();
                if (newLongThoughtOption !== lastLongThoughtOption) {
                    this.onOption('longThought', newLongThoughtOption);
                    lastLongThoughtOption = newLongThoughtOption;
                }
            });
            longThoughtObserver.observe(longThoughtElement, { attributes: true, attributeFilter: ['checked'] });
            this.optionObservers.push(longThoughtObserver);
        }

        // Monitor for new session button clicks
        const newSessionButton = this.elementNewSessionButton();
        if (newSessionButton) {
            this.newSessionButtonListener = () => this.onNewSession();
            newSessionButton.addEventListener('click', this.newSessionButtonListener);
        }
    };

    this.stopMonitoring = function() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.currentModelVersionObserver) {
            this.currentModelVersionObserver.disconnect();
        }
        this.optionObservers.forEach(observer => observer.disconnect());
        if (this.newSessionButtonListener && this.elementNewSessionButton()) {
            this.elementNewSessionButton().removeEventListener('click', this.newSessionButtonListener);
        }
    };
}
// --- 具体驱动实现 ---

function KimiPageDriver() {
    GenericPageDriver.call(this);
    const kimiSelectors = {
        // ... Kimi.ai 对应的选择器 (占位)
        promptInput: 'div.chat-action > div.chat-editor > div.chat-input div.chat-input-editor',
        sendButton: 'div.chat-action > div.chat-editor > div.chat-editor-action div.send-button-container > div.send-button',
        questions: 'div.chat-content-item.chat-content-item-user div.segment-content div.segment-content-box',
        answers: 'div.chat-content-item.chat-content-item-assistant div.segment-content div.segment-content-box',
        conversationArea: '#app div.main div.layout-content-main div.chat-content-container',
        chatTitle: '#app div.main div.layout-header header.chat-header-content h2',
        historyItems: '.sidebar div.history-part ul li',
        newSessionButton: '#app aside div.sidebar-nav a.new-chat-btn',
        webAccessOption: 'body div.toolkit-popover > div.toolkit-container div.toolkit-item:nth-child(1) > div.search-switch > label > input',
        longThoughtOption: 'body div.toolkit-popover > div.toolkit-container div.toolkit-item:nth-child(2) > div.search-switch > label > input',
        modelVersionList: 'body div.models-popover div.models-container div.model-item div.model-name > span.name',
        currentModelVersion: '#app div.main div.chat-action > div.chat-editor > div.chat-editor-action div.current-model span.name',
        
        modelVersionButton: 'div.current-model',
        optionButton: 'div.toolkit-trigger-btn'
    };
    this.selectors = Object.assign({}, this.selectors, kimiSelectors);
    
    this.optionButton = this.util.$(this.selectors.optionButton);
    this.modelVersionButton = this.util.$(this.selectors.modelVersionButton);

    this.cachedWebAccess = null;
    this.cachedLongThought = null;
    this.cachedVersions = null;

    /**
     * @description Initializes the Kimi driver by performing async operations to cache elements.
     */
    this.init = async function() {
        // Initial caching for WebAccess and LongThought options
        if (this.optionButton) {
            await this.util.clickAndGet(this.optionButton, () => {
                this.cachedWebAccess = this.util.getBoolean(this.util.$(this.selectors.webAccessOption));
                this.cachedLongThought = this.util.getBoolean(this.util.$(this.selectors.longThoughtOption));
            });

            // Add event listener to refresh cache on subsequent clicks
            this.optionButton.addEventListener('click', async () => {
                // A short delay to allow the popover to open
                await new Promise(resolve => setTimeout(resolve, 200));
                this.cachedWebAccess = this.util.getBoolean(this.util.$(this.selectors.webAccessOption));
                this.cachedLongThought = this.util.getBoolean(this.util.$(this.selectors.longThoughtOption));
            });
        }

        // Initial caching for Model Versions
        if (this.modelVersionButton) {
            await this.util.clickAndGet(this.modelVersionButton, () => {
                this.cachedVersions = Array.from(this.util.$(this.selectors.modelVersionList), node => node.textContent);
            });
        }
    };

    this.getWebAccessOption = function() {
        if (this.cachedWebAccess === null) {
            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
        }
        return this.cachedWebAccess;
    };

    this.getLongThoughtOption = function() {
        if (this.cachedLongThought === null) {
            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
        }
        return this.cachedLongThought;
    };

    this.getModelVersionList = function() {
        if (this.cachedVersions === null) {
            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
        }
        return this.cachedVersions;
    };    
}
//KimiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

function GeminiPageDriver() {
    GenericPageDriver.call(this);
    const geminiSelectors = {
        // ... Gemini 对应的选择器 (占位)
        promptInput: 'input-container div.input-area rich-textarea',
        sendButton: '',
        questions: 'div#chat-history div.conversation-container div.query-content',
        answers: 'div#chat-history div.response-content message-content',
        conversationArea: 'div#chat-history',
        chatTitle: '',
        historyItems: 'div.conversation-title',
        newSessionButton: 'side-nav-action-button button',
        webAccessOption: '',
        longThoughtOption: '',
        modelVersionList: 'div.mat-mdc-menu-panel div.mat-mdc-menu-content > button.mat-mdc-menu-item span.mat-mdc-menu-item-text div.title-and-description > span.mode-desc.gds-label-m-alt',
        currentModelVersion: 'bard-mode-switcher button.mdc-button > span.mdc-button__label > div > span',

        modelVersionButton: 'bard-mode-switcher button.mdc-button',
        optionButton: '' //'toolbox-drawer div.toolbox-drawer-button-container button'
    };
    this.selectors = Object.assign({}, this.selectors, geminiSelectors);
}
//GeminiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

function ChatGPTPageDriver() {
    GenericPageDriver.call(this);
    const chatGPTSelectors = {
        // ... ChatGPT 对应的选择器 (占位)
    };
    this.selectors = Object.assign({}, this.selectors, chatGPTSelectors);
}
//ChatGPTPageDriver.prototype = Object.create(GenericPageDriver.prototype);


// --- 驱动工厂 ---

module.exports = {
    GenericPageDriver,
    KimiPageDriver,
    GeminiPageDriver,
    ChatGPTPageDriver
};
