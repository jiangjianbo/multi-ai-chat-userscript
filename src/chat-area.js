/**
 * @description 主窗口中的单个对话面板。
 * @param {MainWindowController} mainController - 父控制器实例。
 * @param {string} id - 唯一标识符。
 * @param {string} url - 对应的原生页面 URL。
 * @param {HTMLElement} container - 对话面板对应的容器对象
 */
function ChatArea(mainController, id, url, container) {
    this.mainController = mainController;
    this.id = id;
    this.url = url;
    this.container = container;
    this.util = mainController.util;

    this.messageCount = 0;

    // Private references to DOM elements
    let contentArea, conversationIndex, inputWrapper, promptInput, sendButton;

    /**
     * @description 初始化，创建并返回 DOM 元素。
     */
    this.init = function() {
        const headerJson = {
            tag: 'header', '@class': 'chat-area-header',
            children: [
                { tag: 'div', '@class': 'left-zone', children: [
                    { tag: 'span', '@class': 'model-name', text: this.id }, // Placeholder name
                    { tag: 'button', '@class': 'new-session-btn', text: 'New' }
                ]},
                { tag: 'div', '@class': 'right-zone', children: [
                    { tag: 'button', text: '⚙️' },
                    { tag: 'button', text: '🔗' },
                    { tag: 'button', text: '📌' },
                    { tag: 'button', '@class': 'close-btn', text: 'X' }
                ]}
            ]
        };

        const contentJson = {
            tag: 'div', '@class': 'chat-content-area',
            children: [
                { tag: 'div', '@class': 'conversation-index' },
                { tag: 'div', '@class': 'conversation-list' }
            ]
        };

        const inputJson = {
            tag: 'div', '@class': 'input-wrapper collapsed', children: [
                { tag: 'div', '@class': 'input-placeholder', text: 'Input...' },
                { tag: 'textarea', '@class': 'prompt-input', rows: 1 },
                { tag: 'button', '@class': 'send-btn', text: 'Send' }
            ]
        };

        const mainElement = this.util.toHtml({
            tag: 'div', '@class': 'chat-area',
            children: [ headerJson, contentJson, inputJson ]
        });

        this.container.appendChild(mainElement);
        this.bindEvents();
    };

    this.bindEvents = function() {
        const closeBtn = this.util.$('.close-btn', this.container);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.mainController.removeChatArea(this.id));
        }

        // Input area logic
        inputWrapper = this.util.$('.input-wrapper', this.container);
        const placeholder = this.util.$('.input-placeholder', inputWrapper);
        promptInput = this.util.$('.prompt-input', inputWrapper);
        sendButton = this.util.$('.send-btn', inputWrapper);

        placeholder.addEventListener('mouseover', () => {
            if (inputWrapper.classList.contains('collapsed')) {
                inputWrapper.classList.remove('collapsed');
                inputWrapper.classList.add('floating');
            }
        });

        inputWrapper.addEventListener('mouseleave', () => {
            if (inputWrapper.classList.contains('floating') && document.activeElement !== promptInput) {
                inputWrapper.classList.add('collapsed');
                inputWrapper.classList.remove('floating');
            }
        });

        promptInput.addEventListener('focus', () => {
            inputWrapper.classList.remove('floating');
            inputWrapper.classList.remove('collapsed');
            inputWrapper.classList.add('embedded');
        });

        promptInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (inputWrapper.classList.contains('embedded')) {
                    inputWrapper.classList.remove('embedded');
                    inputWrapper.classList.add('floating');
                    // Further timeout to collapse if mouse is not over
                    setTimeout(() => {
                         if (!inputWrapper.matches(':hover')) {
                            inputWrapper.classList.add('collapsed');
                            inputWrapper.classList.remove('floating');
                         }
                    }, 1000);
                }
            }, 500);
        });

        sendButton.addEventListener('click', this.sendMessage.bind(this));
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    };

    this.sendMessage = function() {
        const text = promptInput.value.trim();
        if (text) {
            this.mainController.message.send('chat', { id: this.id, content: text });
            this.addMessage(text, 'question');
            promptInput.value = '';
        }
    };

    /**
     * @description 处理来自控制器的答案更新。
     */
    this.handleAnswer = function(data) {
        this.addMessage(data.content, 'answer');
    };

    /**
     * @description 将一条消息（问题或答案）添加到视图中。
     */
    this.addMessage = function(content, type) {
        if (!contentArea) {
            contentArea = this.util.$('.conversation-list', this.container);
            conversationIndex = this.util.$('.conversation-index', this.container);
        }
        const bubble = this.util.toHtml({ 
            tag: 'div', 
            '@class': `message-bubble ${type}`,
            text: content
        });
        contentArea.appendChild(bubble);
        contentArea.scrollTop = contentArea.scrollHeight;

        if (type === 'answer') {
            this.messageCount++;
            const indexItem = this.util.toHtml({ 
                tag: 'div', 
                '@class': 'index-item',
                text: this.messageCount.toString()
            });
            indexItem.addEventListener('click', () => bubble.scrollIntoView({ behavior: 'smooth' }));
            conversationIndex.appendChild(indexItem);
        }
    };

    /**
     * @description 销毁自身，移除 DOM 和事件监听器。
     */
    this.destroy = function() {
        // More complex cleanup might be needed for listeners
        this.container.innerHTML = '';
    };
}

module.exports = ChatArea;
