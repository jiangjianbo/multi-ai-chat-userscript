const Util = require('./util');
const util = new Util();

/**
 * @description 页面驱动的抽象基类。
 * @property {object} selectors - 包含所有CSS选择器的对象。
 * @property {function} onAnswer - 回调函数，当新答案出现时调用。
 * @property {function} onChatTitle - 回调函数，当会话标题更改时调用。
 * @property {function} onOption - 回调函数，当选项更改时调用。
 */
function GenericPageDriver() {
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

    this.observer = null;

    /**
     * @description Asynchronously initializes the driver. Should be called after instantiation.
     */
    this.init = async function() {
        // Base implementation is empty. Should be overridden by specific drivers if needed.
    };

    // --- DOM Element Accessors ---

    this.elementPromptInput = function() {
        return util.$(this.selectors.promptInput);
    };

    this.elementSendButton = function() {
        return util.$(this.selectors.sendButton);
    };

    this.elementConversationArea = function() {
        return util.$(this.selectors.conversationArea);
    };

    this.elementHistoryArea = function() {
        return util.$(this.selectors.historyArea);
    };

    this.elementQuestions = function() {
        return util.$$(this.selectors.questions);
    };

    this.elementAnswers = function() {
        return util.$$(this.selectors.answers);
    };

    this.elementHistoryItems = function() {
        return util.$$(this.selectors.historyItems);
    };

    this.elementQuestion = function(index) {
        return this.elementQuestions()[index] || null;
    };

    this.elementAnswer = function(index) {
        return this.elementAnswers()[index] || null;
    };

    this.elementChatTitle = function() {
        return util.$(this.selectors.chatTitle);
    };

    this.elementHistoryItem = function(index) {
        return this.elementHistoryItems()[index] || null;
    };

    this.elementNewSessionButton = function() {
        return util.$(this.selectors.newSessionButton);
    };

    this.elementWebAccessOption = function() {
        return util.$(this.selectors.webAccessOption);
    };

    this.elementLongThoughtOption = function() {
        return util.$(this.selectors.longThoughtOption);
    };

    this.elementModelVersionList = function() {
        return util.$(this.selectors.modelVersionList);
    };

    this.elementCurrentModelVersion = function() {
        return util.$(this.selectors.currentModelVersion);
    };

    // --- DOM Data Getters ---

    this.getPromptInput = function() {
        return this.elementPromptInput();
    };

    this.getSendButton = function() {
        return this.elementSendButton();
    };

    this.getConversationArea = function() {
        return this.elementConversationArea();
    };

    this.getHistoryArea = function() {
        return this.elementHistoryArea();
    };

    this.getQuestions = function() {
        return this.elementQuestions();
    };

    this.getAnswers = function() {
        return this.elementAnswers();
    };

    this.getHistoryItems = function() {
        return this.elementHistoryItems();
    };

    this.getNewSessionButton = function() {
        return this.elementNewSessionButton();
    };

    this.getWebAccessOption = function() {
        return this.elementWebAccessOption();
    };

    this.getLongThoughtOption = function() {
        return this.elementLongThoughtOption();
    };

    this.getModelVersionList = function() {
        return this.elementModelVersionList();
    };

    this.getCurrentModelVersion = function() {
        return this.elementCurrentModelVersion();
    };

    this.getConversationCount = function() {
        return this.elementQuestions().length;
    };

    this.getQuestion = function(index) {
        // This method returns the element, which is inconsistent, but per user request to keep functionality.
        const el = this.elementQuestion(index);
        return el;
    };

    this.getAnswer = function(index) {
        // This method returns the element, which is inconsistent, but per user request to keep functionality.
        const el = this.elementAnswer(index);
        return el;
    };

    this.getChatTitle = function() {
        const el = this.elementChatTitle();
        return el ? el.textContent.trim() : '';
    };

    this.getHistoryCount = function() {
        return this.elementHistoryItems().length;
    };

    this.getHistory = function(index) {
        const el = this.elementHistoryItem(index);
        if (!el) return null;
        return {
            title: el.textContent.trim(),
            url: el.href
        };
    };

    this.getOptions = function() {
        // 此方法需要具体驱动实现复杂的逻辑
        console.warn('getOptions() is not implemented in the generic driver.');
        return {};
    };

    this.getAnswerStatus = function(index) {
        // 假设折叠状态由一个特定的 class 或 attribute 表示
        const answer = this.getAnswer(index);
        return answer ? answer.classList.contains(this.selectors.answerCollapsedClass) : false;
    };

    // --- DOM 操作方法 ---

    this.setPrompt = function(message) {
        const input = util.$(this.selectors.promptInput);
        if (input) {
            input.value = message;
            // 触发输入事件，以防页面有自己的监听器
            input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            console.error('Prompt input not found');
        }
    };

    this.send = function() {
        const button = util.$(this.selectors.sendButton);
        if (button) {
            button.click();
        } else {
            console.error('Send button not found');
        }
    };

    this.addAttachment = function(file) {
        console.warn('addAttachment() is not implemented. This may be restricted by browser security.');
    };

    this.setOption = function(key, value) {
        console.warn('setOption() is not implemented in the generic driver.');
    };

    this.setAnswerStatus = function(index, collapsed) {
        const answer = this.getAnswer(index);
        if (!answer || !this.selectors.answerCollapsedClass) return;
        if (collapsed) {
            answer.classList.add(this.selectors.answerCollapsedClass);
        } else {
            answer.classList.remove(this.selectors.answerCollapsedClass);
        }
    };

    // --- 事件监控 ---

    this.startMonitoring = function() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // 检查是否有新答案节点添加
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.matches(this.selectors.answers)) {
                            const allAnswers = Array.from(util.$$(this.selectors.answers));
                            const newAnswerIndex = allAnswers.indexOf(node);
                            this.onAnswer(newAnswerIndex, node);
                        }
                    });
                }
                // 可以在此添加对标题、选项等其他变化的监控
            });
        });

        const conversationArea = util.$(this.selectors.conversationArea);
        if (conversationArea) {
            this.observer.observe(conversationArea, { childList: true, subtree: true });
        } else {
            console.error('Conversation area not found for monitoring.');
        }
    };

    this.stopMonitoring = function() {
        if (this.observer) {
            this.observer.disconnect();
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
        questions: 'div.chat-content-item.chat-content-item-user',
        answers: 'div.chat-content-item.chat-content-item-assistant',
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
    
    this.optionButton = util.$(this.selectors.optionButton);
    this.modelVersionButton = util.$(this.selectors.modelVersionButton);

    this.cachedWebAccess = null;
    this.cachedLongThought = null;
    this.cachedVersions = null;

    /**
     * @description Initializes the Kimi driver by performing async operations to cache elements.
     */
    this.init = async function() {
        // Initial caching for WebAccess and LongThought options
        if (this.optionButton) {
            await util.clickAndGet(this.optionButton, () => {
                this.cachedWebAccess = util.$(this.selectors.webAccessOption);
                this.cachedLongThought = util.$(this.selectors.longThoughtOption);
            });

            // Add event listener to refresh cache on subsequent clicks
            this.optionButton.addEventListener('click', async () => {
                // A short delay to allow the popover to open
                await new Promise(resolve => setTimeout(resolve, 200));
                this.cachedWebAccess = util.$(this.selectors.webAccessOption);
                this.cachedLongThought = util.$(this.selectors.longThoughtOption);
            });
        }

        // Initial caching for Model Versions
        if (this.modelVersionButton) {
            await util.clickAndGet(this.modelVersionButton, () => {
                this.cachedVersions = Array.from(util.$(this.selectors.modelVersionList), node => node.textContent);
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
