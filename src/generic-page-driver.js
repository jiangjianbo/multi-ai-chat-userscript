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

    /**
     * 获取登录用户名
     * @return {Promise<string>} 用户名
     */
    this.getUsername = function () {
        return new Promise(resolve => {
            // 通用实现，派生类应重写
            setTimeout(() => resolve('User'), 100);
        });
    };

    /**
     * 获取会话历史清单
     * @return {Promise<Array>} 会话历史列表
     */
    this.getChatHistory = function () {
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
    this.sendMessage = function (message) {
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
    this.getAnswer = function () {
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
    this.addFloatingToolbars = function () {
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
    this.createNewThread = function () {
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
    this.getTabId = function () {
        return window.location.href + Date.now();
    };

    /**
     * 创建分享链接
     * @param {Array} chatIds 聊天ID数组
     * @return {Promise<string>} 分享链接
     */
    this.createShareLink = function (chatIds) {
        return new Promise(resolve => {
            // 通用实现，派生类应重写
            resolve(window.location.href);
        });
    };
}


export default GenericPageDriver;
