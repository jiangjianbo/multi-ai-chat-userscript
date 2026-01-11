const {DriverFactory} = require('./driver-factory');
const { GenericPageDriver } = require('./page-driver');
const SyncChatWindow = require('./sync-chat-window');
const MessageClient = require('./message-client');

/**
 * @description 在原生AI页面运行的核心控制器。
 * @param {Message} message
 * @param {Config} config
 * @param {I18n} i18n
 * @param {Util} util
 */
class PageController {
    constructor(message, config, i18n, util) {
        this.driverFactory = new DriverFactory();

        this.message = message;
        this.msgClient = new MessageClient(message);
        this.config = config;
        this.i18n = i18n;
        this.util = util;

        this.driver = null;
        this.syncChatWindow = null;
        // 为每个页面实例生成一个唯一的ID
        this.pageId = 'page-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * @description 初始化，注入UI，选择驱动。
     */
    async init() {
        const hostname = window.location.hostname;
        this.driver = this.driverFactory.createDriver(hostname);
        const initialized = this.driver.init();
        
        this.syncChatWindow = new SyncChatWindow();

        this.injectUI();

        // 注册所有onMsg*消息监听器
        this.message.register(this.pageId, this);

        // 设置驱动的回调
        this.driver.onAnswer = this.handleDriverAnswer.bind(this);
        this.driver.onChatTitle = this.handleDriverChatTitle.bind(this);
        this.driver.onOption = this.handleDriverOption.bind(this);
        this.driver.onQuestion = this.handleDriverQuestion.bind(this);
        this.driver.onModelVersionChange = this.handleDriverModelVersionChange.bind(this);
        this.driver.onNewSession = this.handleDriverNewSession.bind(this);

        // 开始监控页面变化
        await initialized; // 等待初始化完成
        this.driver.startMonitoring();
    }

    injectUI() {
        // Inject sync button
        const syncButton = this.util.toHtml({
            tag: 'button',
            '@id': 'multi-ai-sync-btn',
            '@style': { position: 'fixed', top: '10px', right: '10px', zIndex: 9999 },
            text: this.i18n.getText('sync_chat_button_label')
        });

        syncButton.addEventListener('click', this.handleSyncButtonClick.bind(this));
        document.body.appendChild(syncButton);

        // Wait for conversation area to be available, then inject enhancements
        this.waitForConversationArea();
    }

    /**
     * @description 等待对话区域加载完成后注入 UI 增强功能
     */
    waitForConversationArea() {
        const checkAndInject = () => {
            const conversationArea = this.driver.elementConversationArea();
            if (conversationArea) {
                this.injectConversationEnhancements();
            } else {
                setTimeout(checkAndInject, 500);
            }
        };
        checkAndInject();
    }

    /**
     * @description 注入对话增强 UI（索引、展开/折叠按钮等）
     */
    injectConversationEnhancements() {
        const conversationArea = this.driver.elementConversationArea();
        if (!conversationArea) return;

        // Inject CSS styles
        this.injectStyles();

        // Ensure the conversation area has relative positioning
        const currentStyle = window.getComputedStyle(conversationArea);
        if (currentStyle.position === 'static') {
            conversationArea.style.position = 'relative';
        }

        // Inject toolbar (expand/collapse all buttons)
        this.injectToolbar();

        // Inject conversation index
        this.injectConversationIndex();

        // Inject hover toolbars for answers
        this.injectAnswerToolbars();
    }

    /**
     * @description 注入 UI 增强功能的 CSS 样式
     */
    injectStyles() {
        if (document.getElementById('multi-ai-enhancement-styles')) return;

        const styles = `
            .multi-ai-answer-collapsed > *:not(.multi-ai-answer-toolbar) {
                max-height: 30px !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }
            .multi-ai-answer-collapsed {
                position: relative;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = 'multi-ai-enhancement-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    /**
     * @description 注入工具栏（全部展开/折叠按钮）
     */
    injectToolbar() {
        const conversationArea = this.driver.elementConversationArea();
        if (!conversationArea || conversationArea.querySelector('.multi-ai-toolbar')) return;

        const toolbar = this.util.toHtml({
            tag: 'div',
            '@class': 'multi-ai-toolbar',
            '@style': {
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                display: 'flex',
                gap: '10px'
            },
            child: [
                {
                    tag: 'button',
                    '@class': 'multi-ai-expand-all',
                    '@style': {
                        padding: '5px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    },
                    text: this.i18n.getText('expandAllButtonTitle') || 'Expand All'
                },
                {
                    tag: 'button',
                    '@class': 'multi-ai-collapse-all',
                    '@style': {
                        padding: '5px 10px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    },
                    text: this.i18n.getText('collapseAllButtonTitle') || 'Collapse All'
                }
            ]
        });

        conversationArea.appendChild(toolbar);

        // Add event listeners
        toolbar.querySelector('.multi-ai-expand-all').addEventListener('click', () => this.expandAllAnswers());
        toolbar.querySelector('.multi-ai-collapse-all').addEventListener('click', () => this.collapseAllAnswers());
    }

    /**
     * @description 注入对话索引（垂直悬浮的数字索引）
     */
    injectConversationIndex() {
        const conversationArea = this.driver.elementConversationArea();
        if (!conversationArea || conversationArea.querySelector('.multi-ai-conversation-index')) return;

        const indexContainer = this.util.toHtml({
            tag: 'div',
            '@class': 'multi-ai-conversation-index',
            '@style': {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '45px',
                height: '100%',
                padding: '10px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                zIndex: 100,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(2px)',
                opacity: '0.9',
                borderRight: '1px solid #ddd'
            }
        });

        conversationArea.appendChild(indexContainer);

        // Update index when conversation changes
        this.updateConversationIndex();

        // Monitor for new answers
        const observer = new MutationObserver(() => {
            this.updateConversationIndex();
            this.injectAnswerToolbars();
        });

        observer.observe(conversationArea, { childList: true, subtree: true });
        this.conversationIndexObserver = observer;
    }

    /**
     * @description 更新对话索引
     */
    updateConversationIndex() {
        const indexContainer = document.querySelector('.multi-ai-conversation-index');
        if (!indexContainer) return;

        const answers = this.driver.elementAnswers();
        const currentIndexes = indexContainer.querySelectorAll('.index-item');
        const currentCount = currentIndexes.length;
        const newCount = answers.length;

        // Add new index items if needed
        for (let i = currentCount; i < newCount; i++) {
            const answerElement = answers[i];
            const questionElement = this.driver.elementQuestion(i);

            const indexItem = this.util.toHtml({
                tag: 'div',
                '@class': 'index-item',
                '@style': {
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#666',
                    transition: 'all 0.3s ease'
                },
                child: [{
                    tag: 'a',
                    '@href': `#multi-ai-answer-${i}`,
                    '@style': {
                        textDecoration: 'none',
                        color: 'inherit'
                    },
                    text: `${i + 1}`
                }]
            });

            // Add hover event to show question preview
            const questionText = questionElement ? this.util.getText(questionElement) : '';
            if (questionText) {
                indexItem.title = questionText;

                // Create tooltip element
                const tooltip = this.util.toHtml({
                    tag: 'div',
                    '@class': 'index-tooltip',
                    '@style': {
                        position: 'absolute',
                        left: '40px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        maxWidth: '300px',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        zIndex: 1000,
                        display: 'none',
                        pointerEvents: 'none'
                    },
                    text: questionText
                });

                indexItem.appendChild(tooltip);

                indexItem.addEventListener('mouseenter', () => {
                    tooltip.style.display = 'block';
                });

                indexItem.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                });
            }

            // Add click event to scroll to answer and expand if collapsed
            indexItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToAnswer(i);
            });

            // Hover effect
            indexItem.addEventListener('mouseenter', () => {
                indexItem.style.backgroundColor = '#007bff';
                indexItem.style.color = 'white';
            });

            indexItem.addEventListener('mouseleave', () => {
                indexItem.style.backgroundColor = '#f0f0f0';
                indexItem.style.color = '#666';
            });

            indexContainer.appendChild(indexItem);

            // Add ID to answer element for anchoring
            if (answerElement && !answerElement.id) {
                answerElement.id = `multi-ai-answer-${i}`;
            }
        }

        // Remove extra index items if answers were deleted
        while (indexContainer.children.length > newCount) {
            indexContainer.removeChild(indexContainer.lastChild);
        }
    }

    /**
     * @description 注入单个答案的悬浮工具条
     */
    injectAnswerToolbars() {
        const answers = this.driver.elementAnswers();
        answers.forEach((answer, index) => {
            // Check if toolbar already exists
            if (answer.querySelector('.multi-ai-answer-toolbar')) return;

            // Add collapsed class if needed
            const isCollapsed = this.driver.getAnswerStatus(index);
            if (isCollapsed) {
                answer.classList.add('multi-ai-answer-collapsed');
            }

            const toolbar = this.util.toHtml({
                tag: 'div',
                '@class': 'multi-ai-answer-toolbar',
                '@style': {
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'none',
                    gap: '5px',
                    zIndex: 100
                },
                child: [
                    {
                        tag: 'button',
                        '@class': 'multi-ai-answer-expand',
                        '@style': {
                            padding: '3px 8px',
                            fontSize: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        },
                        text: '⬇'
                    },
                    {
                        tag: 'button',
                        '@class': 'multi-ai-answer-collapse',
                        '@style': {
                            padding: '3px 8px',
                            fontSize: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        },
                        text: '⬆'
                    }
                ]
            });

            answer.style.position = 'relative';
            answer.appendChild(toolbar);

            // Show toolbar on hover
            answer.addEventListener('mouseenter', () => {
                toolbar.style.display = 'flex';
            });

            answer.addEventListener('mouseleave', () => {
                toolbar.style.display = 'none';
            });

            // Add event listeners
            toolbar.querySelector('.multi-ai-answer-expand').addEventListener('click', () => {
                this.expandAnswer(index);
            });

            toolbar.querySelector('.multi-ai-answer-collapse').addEventListener('click', () => {
                this.collapseAnswer(index);
            });
        });
    }

    /**
     * @description 滚动到指定答案并展开
     */
    scrollToAnswer(index) {
        const answer = this.driver.elementAnswer(index);
        if (!answer) return;

        // Expand if collapsed
        this.expandAnswer(index);

        // Scroll to answer
        answer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * @description 展开所有答案
     */
    expandAllAnswers() {
        const answers = this.driver.elementAnswers();
        answers.forEach((_, index) => {
            this.expandAnswer(index);
        });
    }

    /**
     * @description 折叠所有答案
     */
    collapseAllAnswers() {
        const answers = this.driver.elementAnswers();
        answers.forEach((_, index) => {
            this.collapseAnswer(index);
        });
    }

    /**
     * @description 展开单个答案
     */
    expandAnswer(index) {
        const answer = this.driver.elementAnswer(index);
        if (!answer) return;

        answer.classList.remove('multi-ai-answer-collapsed');
        this.driver.setAnswerStatus(index, false);
    }

    /**
     * @description 折叠单个答案
     */
    collapseAnswer(index) {
        const answer = this.driver.elementAnswer(index);
        if (!answer) return;

        answer.classList.add('multi-ai-answer-collapsed');
        this.driver.setAnswerStatus(index, true);
    }

    async handleSyncButtonClick() {
        await this.syncChatWindow.checkAndCreateWindow();

        // 初始化数据，结构为{id, providerName, url, pinned, params:{webAccess,longThought, models}, conversation:[{type, content}]}.
        // 确保窗口创建后再发送消息
        setTimeout(() => {
            this.msgClient.create({
                id: this.pageId,
                url: window.location.href,
                providerName: this.driver.getProviderName(),
                title: this.driver.getChatTitle() || document.title,
                params : {
                    ... this.driver.getOptions(),
                    models: this.driver.getModelVersionList(),
                    modelVersion: this.driver.getCurrentModelVersion()
                },
                conversation: this.driver.getConversations()
            });
        }, 500);
    }

    /**
     * @description 处理来自主窗口的提示词消息（发送给特定 ChatArea）
     */
    onMsgPrompt(data) {
        // 检查 receiverId 是否匹配当前页面
        if (data.receiverId && data.receiverId !== this.pageId) {
            return;
        }
        if (data.text) {
            this.driver.setPrompt(data.text);
            this.driver.send();
        }
    }

    /**
     * @description 处理来自主窗口的聊天消息。
     */
    onMsgChat(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        // 支持两种格式：data.content 和 data.prompt
        const content = data.content || data.prompt;
        if (content) {
            this.driver.setPrompt(content);
            this.driver.send();
        }
    }
    
    /**
     * @description 处理来自主窗口的创建新会话的指令。
     */
    onMsgThread(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        // 点击原生页面的新会话按钮
        this.driver.newSession();
    }

    /**
     * @description 处理来自主窗口的设置选项的指令。
     */
    onMsgSetOption(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.key && data.value !== undefined) {
            this.driver.setOption(data.key, data.value);
        }
    }

    /**
     * @description 处理来自主窗口的设置模型版本的指令。
     */
    onMsgSetModelVersion(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.version) {
            this.driver.setModelVersion(data.version);
        }
    }

    /**
     * @description 处理来自主窗口的设置答案状态的指令。
     */
    onMsgSetAnswerStatus(data) {
        // 如果消息包含id，则只响应特定页面的请求
        if (data.id && data.id !== this.pageId) {
            return;
        }
        if (data.index !== undefined && data.collapsed !== undefined) {
            this.driver.setAnswerStatus(data.index, data.collapsed);
        }
    }

    // --- Driver Event Handlers ---

    handleDriverAnswer(index, element) {
        this.msgClient.answer(this.pageId, index, this.driver.getAnswer(index));
    }

    handleDriverChatTitle(title) {
        this.msgClient.titleChange(this.pageId, title);
    }

    handleDriverOption(key, value) {
        this.msgClient.optionChange(this.pageId, key, value);
    }

    handleDriverQuestion(index, element) {
        this.msgClient.question(this.pageId, index, this.util.getText(element));
    }

    handleDriverModelVersionChange(version) {
        this.msgClient.modelVersionChange(this.pageId, version);
    }

    handleDriverNewSession() {
        this.msgClient.newSession(this.pageId);
    }
}

module.exports = PageController;
