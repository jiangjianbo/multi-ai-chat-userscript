const Util = require('./util');
const TurndownServiceModule = require('turndown');
const TurndownService = TurndownServiceModule.default || TurndownServiceModule;
const { PageProxy } = require('./page-proxy');


const turndownService = new TurndownService();

/**
 * 将html转化为markdown格式，并且做一些内容修正
 * @param {string} html 传入的html内容
 * @returns 对应的markdown格式内容
 */
function htmlToMarkdown(html) {
    let text = turndownService.turndown(html);
    text = text.replace(/(\S)((\\n|\n)\s*)+([，。])/g, '$1$4'); // 为kimi处理\n    \n    。\n的参考文学位置空白的异常情况
    return text;
}

/**
 * @description 页面驱动的抽象基类。
 * @property {object} selectors - 包含所有CSS选择器的对象。
 * @property {function} onAnswer - 回调函数，当新答案出现时调用。
 * @property {function} onChatTitle - 回调函数，当会话标题更改时调用。
 * @property {function} onOption - 回调函数，当选项更改时调用。
 */
class GenericPageDriver {

    constructor() {
        this.util = new Util();
        this.pageProxy = new PageProxy(); // 添加 PageProxy 实例

        this.selectors = {
            promptInput: 'textarea',
            sendButton: 'button[type="submit"]',
            questions: '.question',
            answers: '.answer',
            answer_thinking: '', // 每个答案的思考内容元素
            answer_result: '', // 每个答案的最终输出结果元素
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
        this.providerName = null;
        this.lastAnswerContentObserver = null;
        this.lastAnswerDebounceTimer = null;
    }

    /**
     * @description 异步初始化方法，可用于预加载或缓存元素。
     */
    async init() {
        // Base implementation is empty. Should be overridden by specific drivers if needed.
    }

    /**
     * 返回当前驱动的提供商代号
     */
    getProviderName() {
        return this.providerName;
    }

    // --- DOM Element Accessors ---

    /**
     * 获取提示输入框对应的元素。
     * @returns {HTMLElement|null}  提示输入框元素。
     */
    elementPromptInput() {
        return this.util.$(this.selectors.promptInput);
    }

    /**
     * 获取发送按钮对应的元素。
     * @returns {HTMLElement|null} 发送按钮元素。
     */
    elementSendButton() {
        return this.util.$(this.selectors.sendButton);
    }

    /**
     * 获取对话区域对应的元素
     * @returns {HTMLElement|null} 对话区域元素。
     */
    elementConversationArea() {
        return this.util.$(this.selectors.conversationArea);
    }

    /**
     * 获取历史记录区域对应的元素
     * @returns {HTMLElement|null} 历史记录区域元素。
     */
    elementHistoryArea() {
        return this.util.$(this.selectors.historyArea);
    }

    /**
     * 获取所用户所问问题元素列表。 
     * @returns {NodeListOf<HTMLElement>} 用户问题元素列表。
     */
    elementQuestions() {
        return this.util.$$(this.selectors.questions);
    }

    /**
     * 获取回答元素列表。
     * @returns {NodeListOf<HTMLElement>} 回答元素列表。
     */
    elementAnswers() {
        return this.util.$$(this.selectors.answers);
    }

    /**
     * 获取历史记录项元素列表。
     * @returns {NodeListOf<HTMLElement>} 历史记录项元素列表。
     */
    elementHistoryItems() {
        return this.util.$$(this.selectors.historyItems);
    }

    /**
     * 获取指定索引的问题元素。
     * @param {Int} index - 问题的索引下标
     * @returns 问题元素
     */
    elementQuestion(index) {
        return this.elementQuestions()[index] || null;
    }

    /**
     * 获取指定索引的回答元素。
     * @param {Int} index - 回答的索引下标 
     * @returns 回答元素
     */
    elementAnswer(index) {
        return this.elementAnswers()[index] || null;
    }

    /**
     * 获取会话标题元素。
     * @returns {HTMLElement|null} 会话标题元素。
     */
    elementChatTitle() {
        return this.util.$(this.selectors.chatTitle);
    }

    /**
     * 获取指定索引的历史记录项元素。
     * @param {Int} index - 历史记录项的索引下标 
     * @returns 历史记录项元素
     */
    elementHistoryItem(index) {
        return this.elementHistoryItems()[index] || null;
    }

    /**
     * 获取新会话按钮元素。
     * @returns {HTMLElement|null} 新会话按钮元素。
     */
    elementNewSessionButton() {
        return this.util.$(this.selectors.newSessionButton);
    }

    /**
     * 获取网页访问选项元素。
     * @returns {HTMLElement|null} 网页访问选项元素。
     */
    elementWebAccessOption() {
        return this.util.$(this.selectors.webAccessOption);
    }

    /**
     * 获取长思选项元素。
     * @returns {HTMLElement|null} 长思选项元素。
     */
    elementLongThoughtOption() {
        return this.util.$(this.selectors.longThoughtOption);
    }

    /**
     * 获取模型版本列表元素。
     * @returns {HTMLElement|null} 模型版本列表元素。
     */
    elementModelVersionList() {
        return this.util.$(this.selectors.modelVersionList);
    }

    /**
     * 获取当前模型版本元素。
     * @returns {HTMLElement|null} 当前模型版本元素。
     */
    elementCurrentModelVersion() {
        return this.util.$(this.selectors.currentModelVersion);
    }

    // --- DOM Data Getters ---

    /**
     * 获取提示词输入框中的文字
     * @returns {string} 提示输入框元素。
     */
    getPromptInput() {
        return this.util.getText(this.elementPromptInput());
    }

    /**
     * 获取会话轮数
     * @returns {number} 会话轮数
     */
    getConversationCount() {
        return this.elementQuestions().length;
    }

    /**
     * 获取历史记录数量
     * @returns {number} 历史记录数量
     */
    getHistoryCount() {
        return this.elementHistoryItems().length;
    }

    /**
     * 获取指定索引的历史记录项数据
     * @param {number} index - 历史记录索引
     * @returns 历史纪录项数据
     */
    getHistory(index) {
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
    getQuestion(index) {
        const el = this.elementQuestion(index);
        return el ? el.textContent.trim() : '';
    }

    /**
     * 获取指定索引的回答内容（包含思考和结果）
     * @param {number} index - 回答索引
     * @returns {{thinking: string, result: string}} 回答内容
     */
    getAnswer(index) {
        const el = this.elementAnswer(index);
        if (!el) return {};

        const thinkingEl = this.util.$(this.selectors.answer_thinking, el);
        let resultEl = this.util.$(this.selectors.answer_result, el);
        
        return { 
            thinking: thinkingEl ? htmlToMarkdown(thinkingEl.innerHTML) : '', 
            result: resultEl ? htmlToMarkdown(resultEl.innerHTML) : '' 
        };
    }

    /**
     * 获取指定索引的回答思考元素
     * @param {number} index - 回答索引
     * @returns 回答思考元素
     */
    elementAnswerThinking(index) {
        const answerEl = this.elementAnswer(index);
        if (!answerEl) return null;

        if (this.selectors.answer_thinking) {
            return answerEl.querySelector(this.selectors.answer_thinking);
        }
        return answerEl;
    }

    /**
     * 获取指定索引的回答结果元素
     * @param {number} index - 回答索引
     * @returns 回答结果元素
     */
    elementAnswerResult(index) {
        const answerEl = this.elementAnswer(index);
        if (!answerEl) return null;

        if (this.selectors.answer_result) {
            return answerEl.querySelector(this.selectors.answer_result);
        }
        return answerEl;
    }

    /**
     * 获取当前的所有对话内容
     * @returns {Array<{type: string, content: string}>} 对话内容数组
     */
    getConversations(){
        const conversations = [];
        const count = this.getConversationCount();

        for(let i = 0; i < count; ++i) {
            conversations.push({
                content: this.getQuestion(i),
                type: 'question'
            });
            // 使用getAnswerFull获取完整内容（包含思考和结果）
            conversations.push({
                type: 'answer',
                content: this.getAnswer(i)
            });
        }
        return conversations;
    }

    /**
     * 获取网页访问选项状态
     * @returns {boolean|null} 网页访问选项状态
     */
    getWebAccessOption() {
        const el = this.elementWebAccessOption();
        return this.util.getBoolean(el)
    }

    /**
     * 获取长思考选项值
     * @returns {boolean|null} 长思选项状态
     */
    getLongThoughtOption() {
        const el = this.elementLongThoughtOption();
        return this.util.getBoolean(el)
    }

    /**
     * 获取模型版本列表
     * @returns {Array<string>} 模型版本列表
     */
    getModelVersionList() {
        return Array.from(this.elementModelVersionList(), node => node.textContent);
    }

    /**
     * 获取当前模型版本
     * @returns {string} 当前模型版本
     */
    getCurrentModelVersion() {
        return this.util.getText(this.elementCurrentModelVersion());
    }

    /**
     * 获取会话标题
     * @returns {string} 会话标题
     */
    getChatTitle() {
        const el = this.elementChatTitle();
        return this.util.getText(el, '');
    }

    /**
     * 获取所有选项的键值对
     * @returns {object} 选项键值对
     */
    getOptions() {
        // 此方法需要具体驱动实现复杂的逻辑
        return {
            webAccess: this.getWebAccessOption(),
            longThought: this.getLongThoughtOption()
        };
    }

    getAnswerStatus(index) {
        // 假设折叠状态由一个特定的 class 或 attribute 表示
        const answer = this.elementAnswer(index);
        return answer ? answer.classList.contains(this.selectors.answerCollapsedClass) : false;
    }

    // --- DOM 操作方法 ---

    /**
     * 填充消息到提示词输入框
     * @param {string} message 要发送的消息
     */
    setPrompt(message) {
        const input = this.util.$(this.selectors.promptInput);
        if (input) {
            const editorType = this.util.detectEditorType(input);

            switch (editorType) {
                case 'lexical':
                    // 使用专门处理 Lexical 编辑器的方法
                    this.util.setLexicalContent(input, message);
                    break;

                case 'contenteditable':
                    // 对于其他 contenteditable 元素，直接设置内容
                    input.textContent = message;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    break;

                case 'input':
                case 'textarea':
                    // 对于普通的 input/textarea 元素
                    input.value = message;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    break;

                default:
                    console.warn(`Unknown editor type: ${editorType}`);
                    break;
            }
        } else {
            console.error('Prompt input not found');
        }
    }

    /**
     * 发送当前提示词输入框的内容
     */
    async send() {
        // 等待一小段时间，确保编辑器处理完内容
        await new Promise(resolve => setTimeout(resolve, 100));

        if (this.selectors.sendButton !== '') {
            const button = this.util.$(this.selectors.sendButton);
            if (button) {
                console.debug('Found send button, clicking it:', button);
                // 聚焦输入框，确保发送按钮可点击
                const input = this.elementPromptInput();
                if (input) {
                    input.focus();
                }
                // 再次等待，确保焦点切换完成
                await new Promise(resolve => setTimeout(resolve, 50));
                button.click();
            } else {
                console.error('Send button not found with selector:', this.selectors.sendButton);
            }
        } else {
            // 直接在prompt输入框按下Enter键发送
            const input = this.elementPromptInput();
            if (input) {
                console.debug('Using Enter key to send');
                input.focus();
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
    }

    addAttachment(file) {
        console.warn('addAttachment() is not implemented. This may be restricted by browser security.');
    }

    setOption(key, value) {
        console.warn('setOption() is not implemented in the generic driver.');
    }

    setAnswerStatus(index, collapsed) {
        const answer = this.elementAnswer(index);
        if (!answer || !this.selectors.answerCollapsedClass) return;
        if (collapsed) {
            answer.classList.add(this.selectors.answerCollapsedClass);
        } else {
            answer.classList.remove(this.selectors.answerCollapsedClass);
        }
    }

    setModelVersion(version) {
        console.warn(`setModelVersion() is not implemented in the generic driver. Attempted to set version: ${version}`);
    }

    newSession() {
        this.elementNewSessionButton()?.click();
    }

    // --- 事件监控 ---

    async startMonitoring() {
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
                        // 获取最新的答案元素（索引为 currentAnswerCount - 1）
                        const allAnswers = this.elementAnswers();
                        const newAnswerIndex = currentAnswerCount - 1;
                        const newAnswer = allAnswers[newAnswerIndex];

                        if (newAnswer) {
                            // 不立即触发 onAnswer，只监听内容变化
                            // 等内容稳定后（防抖）再触发一次 onAnswer
                            this.startMonitoringAnswerContent(newAnswer, newAnswerIndex);
                        } else {
                            console.error('[PageDriver] 无法获取新答案元素，索引:', newAnswerIndex, '总数:', currentAnswerCount);
                        }

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
            // 使用 PageProxy 托管事件监听器
            this.pageProxy.addEventListener(newSessionButton, 'click', this.newSessionButtonListener);
        }
    }

    /**
     * @description 监听答案元素的内容变化，用于处理流式输出的AI回复。
     * @param {HTMLElement} answerElement - 要监听的答案元素。
     * @param {number} answerIndex - 答案的索引。
     */
    startMonitoringAnswerContent(answerElement, answerIndex) {
        // 清除之前的监听器
        if (this.lastAnswerContentObserver) {
            this.lastAnswerContentObserver.disconnect();
        }

        this.lastAnswerContentObserver = new MutationObserver(() => {
            // 使用防抖，避免频繁触发回调
            if (this.lastAnswerDebounceTimer) {
                this.pageProxy.clearTimeout(this.lastAnswerDebounceTimer);
            }
            // 使用 PageProxy 托管 setTimeout
            this.lastAnswerDebounceTimer = this.pageProxy.setTimeout(() => {
                // 重新获取答案元素，确保元素仍然存在
                const currentAnswers = this.elementAnswers();
                if (answerIndex < currentAnswers.length) {
                    const currentAnswer = currentAnswers[answerIndex];
                    // 触发 onAnswer 回调，传递更新后的内容
                    this.onAnswer(answerIndex, currentAnswer);
                }
            }, 500); // 500ms 防抖延迟
        });

        // 监听答案元素的内容变化（子节点、文本内容等）
        this.lastAnswerContentObserver.observe(answerElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    stopMonitoring() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.currentModelVersionObserver) {
            this.currentModelVersionObserver.disconnect();
        }
        this.optionObservers.forEach(observer => observer.disconnect());
        if (this.lastAnswerContentObserver) {
            this.lastAnswerContentObserver.disconnect();
        }
        // 使用 PageProxy 清理所有托管的资源（事件监听器、定时器等）
        this.pageProxy.cleanup();
    }
}

module.exports = {
    GenericPageDriver
};
