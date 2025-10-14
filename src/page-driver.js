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
    this.selectors = {}; // 应由具体驱动覆盖
    this.onAnswer = (index, element) => {};
    this.onChatTitle = (title) => {};
    this.onOption = (key, value) => {};

    this.observer = null;
}

// --- DOM 读取方法 ---

GenericPageDriver.prototype.getConversationCount = function() {
    return util.$$(this.selectors.questions).length;
};

GenericPageDriver.prototype.getQuestion = function(index) {
    return util.$$(this.selectors.questions)[index] || null;
};

GenericPageDriver.prototype.getAnswer = function(index) {
    const answers = util.$$(this.selectors.answers);
    return answers[index] || null;
};

GenericPageDriver.prototype.getChatTitle = function() {
    const el = util.$(this.selectors.chatTitle);
    return el ? el.textContent.trim() : '';
};

GenericPageDriver.prototype.getHistoryCount = function() {
    return util.$$(this.selectors.historyItems).length;
};

GenericPageDriver.prototype.getHistory = function(index) {
    const el = util.$$(this.selectors.historyItems)[index];
    if (!el) return null;
    return {
        title: el.textContent.trim(),
        url: el.href
    };
};

GenericPageDriver.prototype.getOptions = function() {
    // 此方法需要具体驱动实现复杂的逻辑
    console.warn('getOptions() is not implemented in the generic driver.');
    return {};
};

GenericPageDriver.prototype.getAnswerStatus = function(index) {
    // 假设折叠状态由一个特定的 class 或 attribute 表示
    const answer = this.getAnswer(index);
    return answer ? answer.classList.contains(this.selectors.answerCollapsedClass) : false;
};

// --- DOM 操作方法 ---

GenericPageDriver.prototype.setPrompt = function(message) {
    const input = util.$(this.selectors.promptInput);
    if (input) {
        input.value = message;
        // 触发输入事件，以防页面有自己的监听器
        input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.error('Prompt input not found');
    }
};

GenericPageDriver.prototype.send = function() {
    const button = util.$(this.selectors.sendButton);
    if (button) {
        button.click();
    } else {
        console.error('Send button not found');
    }
};

GenericPageDriver.prototype.addAttachment = function(file) {
    console.warn('addAttachment() is not implemented. This may be restricted by browser security.');
};

GenericPageDriver.prototype.setOption = function(key, value) {
    console.warn('setOption() is not implemented in the generic driver.');
};

GenericPageDriver.prototype.setAnswerStatus = function(index, collapsed) {
    const answer = this.getAnswer(index);
    if (!answer || !this.selectors.answerCollapsedClass) return;
    if (collapsed) {
        answer.classList.add(this.selectors.answerCollapsedClass);
    } else {
        answer.classList.remove(this.selectors.answerCollapsedClass);
    }
};

// --- 事件监控 ---

GenericPageDriver.prototype.startMonitoring = function() {
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

GenericPageDriver.prototype.stopMonitoring = function() {
    if (this.observer) {
        this.observer.disconnect();
    }
};

// --- 具体驱动实现 ---

function KimiPageDriver() {
    GenericPageDriver.call(this);
    this.selectors = {
        // ... Kimi.ai 对应的选择器 (占位)
        promptInput: '#kimi-input',
        sendButton: '#kimi-send-btn',
        questions: '.question-bubble',
        answers: '.answer-bubble',
        conversationArea: '#chat-container',
        chatTitle: '.chat-title'
    };
}
KimiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

function GeminiPageDriver() {
    GenericPageDriver.call(this);
    this.selectors = {
        // ... Gemini 对应的选择器 (占位)
    };
}
GeminiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

function ChatGPTPageDriver() {
    GenericPageDriver.call(this);
    this.selectors = {
        // ... ChatGPT 对应的选择器 (占位)
    };
}
ChatGPTPageDriver.prototype = Object.create(GenericPageDriver.prototype);


// --- 驱动工厂 ---

const driverMap = {
    'kimi.ai': KimiPageDriver,
    'gemini.google.com': GeminiPageDriver,
    'chat.openai.com': ChatGPTPageDriver,
};

/**
 * @description 根据主机名获取对应的页面驱动实例。
 * @param {string} hostname - window.location.hostname
 * @returns {GenericPageDriver}
 */
function driverFactory(hostname) {
    const Driver = driverMap[hostname];
    if (Driver) {
        return new Driver();
    }
    console.warn(`No specific driver found for ${hostname}. Using GenericPageDriver.`);
    return new GenericPageDriver();
}

module.exports = {
    GenericPageDriver,
    KimiPageDriver,
    GeminiPageDriver,
    ChatGPTPageDriver,
    driverFactory
};
