const {DriverFactory} = require('./driver-factory');
const Util = require('./util');
const markedModule = require('marked');
const marked = markedModule.default || markedModule;

// 配置 marked 选项
marked.use({
    breaks: true,      // 支持 GitHub 风格的换行
    gfm: true,         // 启用 GitHub 风格的 Markdown
    headerIds: false,  // 不生成 header id，避免冲突
    mangle: false      // 不混淆 email 地址
});

/**
 * @class ChatArea
 * @description Manages a single chat area in the main window, including its UI, state, and event handling.
 */
class ChatArea {
    /**
     * @param {object} mainController - The main window controller instance.
     * @param {string} id - The unique ID for this chat area.
     * @param {string} url - The URL of the AI provider.
     * @param {HTMLElement} container - The container element for this chat area.
     * @param {I18n} i18n - The internationalization instance.
     */
    constructor(mainController, id, url, container, i18n) {
        this.mainController = mainController;
        this.id = id;
        this.url = url;
        this.container = container;
        this.i18n = i18n;
        
        // 点击新会话时候设置该标志，然后发出thread事件给原生窗口，
        // 原生窗口会返回new_session事件，检查到该标志后复用当前chatArea
        this.readyForReUse = false; 

        this.driverFactory = new DriverFactory();
        this.utils = new Util();
        
        this.element = null;
        this.hideTimeout = null;
        this.indexTooltipTimer = null;
        this.indexTooltipElement = null;
        this.currentHoverIndex = null;
        this.pinned = false;
        // 此处为各种事件的默认空处理函数，提供外部挂接
        this.eventHandlers = {
            onEvtClose: (chatArea) => {},
            onEvtNewSession: (chatArea, providerName) => { },
            onEvtShare: (chatArea, url) => { },
            onEvtParamChanged: (chatArea, key, newValue, oldValue) => { },
            onEvtProviderChanged: (chatArea, newProvider, oldProvider) => { },
            onEvtPromptSend: (chatArea, text) => { },
            onEvtExport: () => {}
        };

        // 折叠状态枚举
        this.CollapseState = {
            FULLY_COLLAPSED: 'fully_collapsed',
            PARTIAL: 'partial',
            FULLY_EXPANDED: 'fully_expanded'
        };
        this.collapseState = this.CollapseState.FULLY_EXPANDED;
    }

    /**
     * 获取可重用标志
     * @returns 可重用标志
     */
    getReadyForReUse() {
        return this.readyForReUse;
    }

    /**
     * 设置可重用标志
     * @param {boolean} value - 可重用标志值
     */
    setReadyForReUse(value) {
        this.readyForReUse = value;
    }

    setEventHandler(eventName, handler) {
        let name = "";
        let ev = eventName.toLowerCase();
        if (ev == "onEvtClose".toLowerCase() || ev == "Close".toLowerCase()) name = "onEvtClose";
        if (ev == "onEvtNewSession".toLowerCase() || ev == "NewSession".toLowerCase()) name = "onEvtNewSession";
        if (ev == "onEvtShare".toLowerCase() || ev == "Share".toLowerCase()) name = "onEvtShare";
        if (ev == "onEvtParamChanged".toLowerCase() || ev == "ParamChanged".toLowerCase()) name = "onEvtParamChanged";
        if (ev == "onEvtProviderChanged".toLowerCase() || ev == "ProviderChanged".toLowerCase()) name = "onEvtProviderChanged";
        if (ev == "onEvtPromptSend".toLowerCase() || ev == "PromptSend".toLowerCase()) name = "onEvtPromptSend";
        if (ev == "onEvtExport".toLowerCase() || ev == "Export".toLowerCase()) name = "onEvtExport";
        
        if (name.length > 0) this.eventHandlers[name] = handler;
    }

    /**
     * Initializes the chat area structure and content.
     * @param {object} instanceData - Initialization data: {id, providerName, params:{webAccess,longThought, models}, conversation:[{type, content}], pinned}
     */
    init(instanceData) {
        const chatAreaHtml = this.render(instanceData);
        this.container.innerHTML = chatAreaHtml;
        this.element = this.container;
        if (!this.url) {
            this.element.classList.add('forced-selection');
        }
        this.pinned = instanceData.pinned || false;

        this.cacheDOMElements();
        this.initEventListeners();
        this.updatePinState();
    }

    /**
     * Renders the chat content.
     * @param {object} data - Data for rendering: {id, providerName, params:{webAccess,longThought, models}, conversation:{type, content}[], pinned}
     * @returns {string} The rendered HTML string.
     */
    render(data) {
        console.debug(`Rendering ChatArea ${data.id} with provider ${data.providerName}, data = ${JSON.stringify(data)}`);

        const providers = this.driverFactory.getProviders().map((m, i) =>
            `<div class="model-option" data-value="${m}">${m}</div>`
        ).join('');
        const versions = (data.params.models || []).map((m, i) =>
            `<option>${m}</option>`
        ).join('');

        const answers = (data.conversation||[]).filter(msg => msg.type === 'answer');

        const indexHtml = answers.map((ans, i) =>
            `<div class="index-item"><a href="#answer-${data.id}-${i}">${i + 1}</a></div>`
        ).join('');

        const longThought = data.params.longThought;

        const conversationHtml = (data.conversation||[]).map(msg => {
            let id = '';
            if (msg.type === 'answer') {
                const answerIndex = answers.indexOf(msg);
                id = `id="answer-${data.id}-${answerIndex}"`;
            }
            const formattedContent = this._formatMessageContent(msg.content, msg.type, longThought);
            return `<div class="message-bubble ${msg.type}" ${id}><div class="bubble-content">${formattedContent}</div></div>`;
        }).join('');

        const overlayHtml = this.url ? '' : `
            <div class="forced-selection-overlay">
                <div class="selection-hint" style="position: absolute; top: 10px; left: 10px; text-align: left; color: white; font-size: 1.2em; background-color: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px; z-index: 10; display: flex; align-items: center;">
                    <div style="font-size: 2em; margin-right: 10px; line-height: 1;">↖️</div>
                    <span data-lang-key="selectProviderHint">Please select an AI provider from the dropdown above to start chatting.</span>
                </div>
            </div>
        `;

        const modelSelectorClass = this.url ? 'model-selector' : 'model-selector highlight-dropdown';

        return `
            ${overlayHtml}
            <div class="chat-area-title">
                <div class="title-left">
                    <div class="${modelSelectorClass}">
                        <div class="model-name">${data.providerName}</div>
                        <div class="model-dropdown-arrow">&#9662;</div>
                        <div class="custom-dropdown model-dropdown">
                            ${providers}
                        </div>
                    </div>
                    <div class="title-button new-session-button" title="New Session" data-lang-key="newSessionButtonTitle">&#10133;</div>
                </div>
                <div class="title-center">
                    <div class="title-button expand-all" title="Expand All" data-lang-key="expandAllButtonTitle">&#x2924;</div>
                    <div class="title-button collapse-all" title="Collapse All" data-lang-key="collapseAllButtonTitle">&#x2922;</div>
                    <div class="title-button export-button" title="Export Content" data-lang-key="exportContentButtonTitle">&#128228;</div>
                </div>
                <div class="title-right">
                    <div class="params-selector">
                        <div class="title-button params-button" title="Parameters" data-lang-key="parametersButtonTitle">&#9881;</div>
                        <div class="custom-dropdown params-dropdown">
                            <div class="param-item" data-param-name="webAccess"><label data-lang-key="webAccessLabel">Web Access</label><label class="toggle-switch"><input type="checkbox" id="web-access-${data.id}" ${data.params.webAccess ? 'checked' : ''}><span class="slider"></span></label></div>
                            <div class="param-item" data-param-name="longThought"><label data-lang-key="longThoughtLabel">Long Thought</label><label class="toggle-switch"><input type="checkbox" id="long-thought-${data.id}" ${data.params.longThought ? 'checked' : ''}><span class="slider"></span></label></div>
                            <hr>
                            <div class="param-item" data-param-name="modelVersion"><label data-lang-key="modelVersionLabel">Model Version</label>
                                <select>${versions}</select>
                            </div>
                        </div>
                    </div>
                    <div class="title-button share-button" title="Share" data-lang-key="shareButtonTitle">&#128279;</div>
                    <div class="title-button pin-button" title="Pin" data-lang-key="pinButtonTitle"><span class="icon">&#128204;</span></div>
                    <div class="title-button close-button" title="Close" data-lang-key="closeButtonTitle">&#10006;</div>
                </div>
            </div>
            <div class="chat-area-main">
                <div class="chat-area-index">
                    ${indexHtml}
                </div>
                <div class="chat-area-conversation">${conversationHtml}</div>
            </div>
            <div class="input-placeholder" data-lang-key="inputPlaceholder">Input</div>
            <div class="chat-area-input">
                <textarea rows="1" placeholder="Type your message..." data-lang-key="typeMessagePlaceholder"></textarea>
                <button title="Send" data-lang-key="sendButtonTitle">&#10148;</button>
            </div>
        `;
    }

    cacheDOMElements() {
        this.mainArea = this.element.querySelector('.chat-area-main');
        this.placeholder = this.element.querySelector('.input-placeholder');
        this.inputArea = this.element.querySelector('.chat-area-input');
        this.textarea = this.element.querySelector('textarea');
        this.conversationArea = this.element.querySelector('.chat-area-conversation');
        this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
        this.modelSelector = this.element.querySelector('.model-selector');
        this.providerNameDisplay = this.modelSelector.querySelector('.model-name');
        this.modelDropdown = this.modelSelector.querySelector('.model-dropdown');
        this.paramsSelector = this.element.querySelector('.params-selector');
        this.paramsButton = this.paramsSelector.querySelector('.params-button');
        this.paramsDropdown = this.paramsSelector.querySelector('.params-dropdown');
    }

    initEventListeners() {
        this.pinButton = this.element.querySelector('.pin-button');
        this.pinButton.addEventListener('click', () => this.setPin(!this.isPinned()));
        this.element.querySelector('.close-button').addEventListener('click', () => {
            this.eventHandlers.onEvtClose(this);
            this.mainController.removeChatArea(this.id);
        });
        this.element.querySelector('.new-session-button').addEventListener('click', () => {
            this.eventHandlers.onEvtNewSession(this, this.getProvider());
        });
        this.element.querySelector('.share-button').addEventListener('click', () => {
            this.eventHandlers.onEvtShare(this, this.getUrl());
        });
        this.providerNameDisplay.addEventListener('click', (e) => this.toggleDropdown(e, this.modelDropdown));
        this.paramsButton.addEventListener('click', (e) => this.toggleDropdown(e, this.paramsDropdown));

        let selectOldValue;
        const selectElement = this.paramsDropdown.querySelector('select');
        selectElement.addEventListener('focus', (e) => {
            selectOldValue = e.target.value;
        });

        this.paramsDropdown.addEventListener('change', (e) => {
            const target = e.target;
            let name, oldValue, newValue;
            const paramItem = target.closest('.param-item');
            if (!paramItem) return;

            name = paramItem.dataset.paramName;

            if (target.type === 'checkbox') {
                newValue = target.checked;
                oldValue = !newValue;
            } else if (target.tagName === 'SELECT') {
                newValue = target.value;
                oldValue = selectOldValue;
            }

            if (name) {
                this.eventHandlers.onEvtParamChanged(this, name, newValue, oldValue);
            }
        });
        this.modelDropdown.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const oldProvider = this.getProvider();
                const newProvider = e.currentTarget.dataset.value;
                this.providerNameDisplay.textContent = newProvider;
                this.eventHandlers.onEvtProviderChanged(this, newProvider, oldProvider);
                this.modelDropdown.classList.remove('visible');

                if (this.element.classList.contains('forced-selection')) {
                    this.element.classList.remove('forced-selection');
                    const overlay = this.element.querySelector('.forced-selection-overlay');
                    if (overlay) {
                        overlay.remove();
                    }
                    this.url = this.driverFactory.getProviderUrl(newProvider);
                }
            });
        });
        this.element.querySelector('.expand-all').addEventListener('click', () => this.expandAll());
        this.element.querySelector('.collapse-all').addEventListener('click', () => this.collapseAll());

        this.element.querySelector('.chat-area-index').addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (anchor) {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = this.element.querySelector(targetId);
                if (targetElement && this.conversationArea) {
                    this.conversationArea.scrollTop = targetElement.offsetTop - this.conversationArea.offsetTop - 20;
                }
            }
        });

        this.element.querySelector('.chat-area-index').addEventListener('mouseenter', (e) => {
            const indexItem = e.target.closest('.index-item');
            if (indexItem) {
                const anchor = indexItem.querySelector('a');
                if (anchor) {
                    const href = anchor.getAttribute('href');
                    const match = href.match(/#answer-.*-(\d+)$/);
                    if (match) {
                        const answerIndex = parseInt(match[1]);
                        this.showIndexTooltip(indexItem, answerIndex);
                    }
                }
            }
        }, true);

        this.element.querySelector('.chat-area-index').addEventListener('mouseleave', () => {
            this.hideIndexTooltip();
        });

        this.element.querySelector('.export-button').addEventListener('click', () => {
            this.eventHandlers.onEvtExport(this);
        });
        this.placeholder.addEventListener('mouseenter', () => this.showInput());
        this.inputArea.addEventListener('mouseenter', () => this.showInput());
        this.inputArea.addEventListener('mouseleave', () => this.undockInput());
        this.textarea.addEventListener('focus', () => this.dockInput());
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const prompt = this.textarea.value.trim();
                if (prompt) {
                    this.eventHandlers.onEvtPromptSend(this, prompt);
                    this.textarea.value = '';
                }
            }
        });
        this.inputArea.addEventListener('focusout', (e) => this.handleFocusOut(e));

        this.inputArea.querySelector('button').addEventListener('click', () => {
            const prompt = this.textarea.value.trim();
            if (prompt) {
                this.eventHandlers.onEvtPromptSend(this, prompt);
                this.textarea.value = '';
            }
        });
    }

    isPinned() {
        return this.pinned;
    }

    setPin(isPinned) {
        this.pinned = isPinned;
        this.updatePinState();
        if (this.mainController && this.mainController.updateLayout) {
            this.mainController.updateLayout();
        }
    }

    updatePinState() {
        if (this.pinButton) {
            this.pinButton.classList.toggle('pinned', this.pinned);
        }
    }

    /**
     * Updates the UI state of provider options based on a list of unavailable providers.
     * @param {string[]} unavailableProviders - An array of unavailable AI provider names.
     */
    updateProviderOptions(unavailableProviders) {
        const currentSelectedProvider = this.getProvider();
        this.modelDropdown.querySelectorAll('.model-option').forEach(option => {
            const providerName = option.dataset.value;
            if (unavailableProviders.includes(providerName) && providerName !== currentSelectedProvider) {
                option.classList.add('unavailable');
                option.style.pointerEvents = 'none';
                option.setAttribute('title', this.i18n.getText('providerUnavailable'));
            } else {
                option.classList.remove('unavailable');
                option.style.pointerEvents = 'auto';
                option.removeAttribute('title');
            }
        });
    }

    toggleDropdown(event, dropdown) {
        event.stopPropagation();
        if (dropdown === this.modelDropdown) {
            const unavailable = this.mainController.getUnavailableProviders(this.id);
            this.updateProviderOptions(unavailable);
        }
        dropdown.classList.toggle('visible');
    }

    closeDropdowns() {
        this.modelDropdown.classList.remove('visible');
        this.paramsDropdown.classList.remove('visible');
    }

    /**
     * Updates the visual state of the expand/collapse buttons.
     */
    updateCollapseButtons() {
        const expandBtn = this.element.querySelector('.expand-all');
        const collapseBtn = this.element.querySelector('.collapse-all');

        expandBtn.classList.remove('partial-state', 'disabled');
        collapseBtn.classList.remove('partial-state', 'disabled');

        if (this.collapseState === this.CollapseState.FULLY_EXPANDED) {
            expandBtn.classList.add('disabled');
        } else if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
            collapseBtn.classList.add('disabled');
        } else if (this.collapseState === this.CollapseState.PARTIAL) {
            expandBtn.classList.add('partial-state');
            collapseBtn.classList.add('partial-state');
        }
    }

    expandAll() {
        if (this.collapseState === this.CollapseState.FULLY_EXPANDED) return;

        const longThought = this.getLongThought();

        if (!longThought) {
            this.answerBubbles.forEach(b => b.classList.remove('collapsed'));
            this.collapseState = this.CollapseState.FULLY_EXPANDED;
        } else {
            if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
                this.answerBubbles.forEach(b => b.classList.remove('collapsed'));
                this.element.querySelectorAll('.answer-thinking').forEach(el => el.classList.add('collapsed'));
                this.collapseState = this.CollapseState.PARTIAL;
            } else if (this.collapseState === this.CollapseState.PARTIAL) {
                this.element.querySelectorAll('.answer-thinking').forEach(el => el.classList.remove('collapsed'));
                this.collapseState = this.CollapseState.FULLY_EXPANDED;
            }
        }
        this.updateCollapseButtons();
    }

    collapseAll() {
        if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) return;

        const longThought = this.getLongThought();

        if (!longThought) {
            this.answerBubbles.forEach(b => b.classList.add('collapsed'));
            this.collapseState = this.CollapseState.FULLY_COLLAPSED;
        } else {
            if (this.collapseState === this.CollapseState.FULLY_EXPANDED) {
                this.element.querySelectorAll('.answer-thinking').forEach(el => el.classList.add('collapsed'));
                this.collapseState = this.CollapseState.PARTIAL;
            } else if (this.collapseState === this.CollapseState.PARTIAL) {
                this.answerBubbles.forEach(b => b.classList.add('collapsed'));
                this.collapseState = this.CollapseState.FULLY_COLLAPSED;
            }
        }
        this.updateCollapseButtons();
    }

    showInput() {
        clearTimeout(this.hideTimeout);
        this.placeholder.classList.add('hidden');
        this.inputArea.classList.add('visible');
    }

    dockInput() {
        this.showInput();
        this.inputArea.classList.add('docked');
        this.mainArea.style.paddingBottom = `${this.inputArea.offsetHeight}px`;
    }

    undockInput() {
        this.inputArea.classList.remove('docked');
        this.mainArea.style.paddingBottom = '0px';
        this.hideTimeout = setTimeout(() => {
            if (!this.inputArea.contains(document.activeElement)) {
                this.inputArea.classList.remove('visible');
                this.placeholder.classList.remove('hidden');
            }
        }, 300);
    }
    
    handleFocusOut(event) {
        if (!this.inputArea.contains(event.relatedTarget)) this.undockInput();
    }

    /**
     * Adds a message to the conversation area.
     * @param {string} content - The HTML content of the message.
     * @param {string} type - The type of message ('question' or 'answer').
     * @param {number|null} [index=null] - The optional message index.
     */
    addMessage(content, type, index = null) {
        if (index !== null && (index < 0 || index > 1000)) {
            throw new Error(`Index ${index} out of range. Valid range is 0-1000.`);
        }

        const answers = Array.from(this.answerBubbles);
        const answerIndex = index !== null ? index : answers.length;
        const id = `answer-${this.id}-${answerIndex}`;
        const messageJson = {
            tag: 'div', '@class': `message-bubble ${type}`, '@id': (type === 'answer' ? id : ''),
            child: [ { tag: 'div', '@class': 'bubble-content', innerHTML: content } ]
        };
        const messageElement = this.utils.toHtml(messageJson);
        this.conversationArea.appendChild(messageElement);
        this.conversationArea.scrollTop = this.conversationArea.scrollHeight;
        if (type === 'answer') {
            const indexJson = { tag: 'div', '@class': 'index-item', child: [
                { tag: 'a', '@href': `#${id}`, text: `${answerIndex + 1}` }
            ]};
            this.element.querySelector('.chat-area-index').appendChild(this.utils.toHtml(indexJson));
            this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
            this.updateAnswerContent(messageElement, content);
        }
    }

    destroy() {
        // Internal cleanup can go here. DOM removal is handled by the controller.
    }

    getProvider() {
        return this.providerNameDisplay.textContent.trim();
    }

    getWebAccess() {
        return this.element.querySelector(`#web-access-${this.id}`).checked;
    }

    getLongThought() {
        return this.element.querySelector(`#long-thought-${this.id}`).checked;
    }

    getModelVersion() {
        return this.paramsDropdown.querySelector('select').value;
    }

    getUrl() {
        return this.url;
    }

    setWebAccess(value) {
        this.element.querySelector(`#web-access-${this.id}`).checked = value;
    }

    setLongThought(value) {
        this.element.querySelector(`#long-thought-${this.id}`).checked = value;
        const thinkingElements = this.element.querySelectorAll('.answer-thinking');
        if (value) {
            thinkingElements.forEach(el => {
                el.style.display = '';
                el.classList.add('collapsed');
            });
            if (this.collapseState === this.CollapseState.FULLY_EXPANDED || this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
                this.collapseState = this.CollapseState.PARTIAL;
            }
        } else {
            thinkingElements.forEach(el => el.style.display = 'none');
            this.collapseState = this.CollapseState.FULLY_EXPANDED;
        }
        this.updateCollapseButtons();
    }

    updateTitle(title) {
        console.log(`ChatArea ${this.id}: Title updated to ${title}`);
    }



    updateOption(key, value) {
        if (key === 'webAccess') {
            this.setWebAccess(value);
        } else if (key === 'longThought') {
            this.setLongThought(value);
        } else {
            console.log(`ChatArea ${this.id}: Option ${key} updated to ${value}`);
        }
    }

    addQuestion(content) {
        this.addMessage(content, 'question');
    }

    addAnswer(content, index = null, thinking = null) {
        this.addMessage(content, 'answer', index, thinking);
    }

    handleAnswer(data) {
        if (data && data.content !== undefined) {
            const index = data.index;
            const content = data.content;
            const existingAnswerId = `answer-${this.id}-${index}`;
            const existingAnswer = this.conversationArea.querySelector(`#${existingAnswerId}`);

            if (existingAnswer) {
                this.updateAnswerContent(existingAnswer, content);
            } else {
                this.addAnswer(content, index);
            }
        }
    }

    /**
     * @description 更新回答内容，支持 thinking 和 result 的分离显示。
     * @param {HTMLElement} answerElement - 要更新的回答元素。
     * @param {string|object} content - 回答的完整 HTML 内容，或包含 thinking/result 的对象。
     */
    updateAnswerContent(answerElement, content) {
        const bubbleContent = answerElement.querySelector('.bubble-content');
        if (!bubbleContent) return;

        const longThought = this.getLongThought();
        const formattedContent = this._formatMessageContent(content, 'answer', longThought);
        bubbleContent.innerHTML = formattedContent;
    }

    updateModelVersion(version) {
        const selectElement = this.paramsDropdown.querySelector('select');
        if (selectElement) {
            const optionExists = Array.from(selectElement.options).some(option => option.value === version);
            if (optionExists) {
                selectElement.value = version;
            } else {
                const newOption = document.createElement('option');
                newOption.value = version;
                newOption.textContent = version;
                selectElement.appendChild(newOption);
                selectElement.value = version;
            }
        }
        console.log(`ChatArea ${this.id}: Model version updated to ${version}`);
    }

    newSession() {
        this.conversationArea.innerHTML = '';
        this.element.querySelector('.chat-area-index').innerHTML = '';
        this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
        console.log(`ChatArea ${this.id}: Started new session.`);
    }

    /**
     * @description 清理所有问答内容和索引
     */
    clearAllMessages() {
        this.conversationArea.innerHTML = '';
        const indexArea = this.element.querySelector('.chat-area-index');
        if (indexArea) {
            indexArea.innerHTML = '';
        }
        this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
        this.collapseState = this.CollapseState.FULLY_EXPANDED;
        this.updateCollapseButtons();
        console.log(`ChatArea ${this.id}: Cleared all messages.`);
    }

    /**
     * Shows a tooltip with a preview of the question text.
     * @param {HTMLElement} indexItem - The index item being hovered.
     * @param {number} answerIndex - The index of the answer.
     */
    showIndexTooltip(indexItem, answerIndex) {
        if (this.currentHoverIndex === answerIndex && this.indexTooltipElement) {
            this.updateTooltipPosition(indexItem);
            return;
        }
        if (this.indexTooltipTimer) {
            clearTimeout(this.indexTooltipTimer);
            this.indexTooltipTimer = null;
        }
        if (this.currentHoverIndex !== null && this.currentHoverIndex !== answerIndex) {
            this.displayTooltip(indexItem, answerIndex);
            this.currentHoverIndex = answerIndex;
            return;
        }
        this.indexTooltipTimer = setTimeout(() => {
            this.displayTooltip(indexItem, answerIndex);
            this.currentHoverIndex = answerIndex;
        }, 2000);
    }

    /**
     * Displays the tooltip.
     * @param {HTMLElement} indexItem - The index item.
     * @param {number} answerIndex - The answer index.
     */
    displayTooltip(indexItem, answerIndex) {
        const questions = this.conversationArea.querySelectorAll('.message-bubble.question');
        const questionElement = questions[answerIndex];
        if (!questionElement) return;

        const questionText = questionElement.textContent.trim();
        const previewText = questionText.length > 15 ? questionText.substring(0, 15) + '...' : questionText;

        if (!this.indexTooltipElement) {
            this.indexTooltipElement = document.createElement('div');
            this.indexTooltipElement.className = 'index-tooltip';
            this.element.appendChild(this.indexTooltipElement);
        }

        this.indexTooltipElement.textContent = previewText;
        this.indexTooltipElement.style.display = 'block';
        this.updateTooltipPosition(indexItem);
    }

    /**
     * Updates the tooltip's position relative to the index item.
     * @param {HTMLElement} indexItem - The index item.
     */
    updateTooltipPosition(indexItem) {
        if (!this.indexTooltipElement) return;

        const indexRect = indexItem.getBoundingClientRect();
        const chatAreaRect = this.element.getBoundingClientRect();
        const left = indexRect.right - chatAreaRect.left + 10;
        const top = indexRect.top - chatAreaRect.top;

        this.indexTooltipElement.style.left = `${left}px`;
        this.indexTooltipElement.style.top = `${top}px`;
    }

    /**
     * Hides the index tooltip.
     */
    hideIndexTooltip() {
        if (this.indexTooltipTimer) {
            clearTimeout(this.indexTooltipTimer);
            this.indexTooltipTimer = null;
        }
        if (this.indexTooltipElement) {
            this.indexTooltipElement.style.display = 'none';
        }
        this.currentHoverIndex = null;
    }

    /**
     * @description 格式化消息内容，支持 thinking 和 result 的分离显示，并将 markdown 转换为 HTML。
     * @param {string|{thinking:string, result:string}} content - 消息内容，可以是字符串或包含 thinking/result 的对象
     * @param {string} type - 消息类型 ('question' 或 'answer')
     * @param {boolean} longThought - 是否启用长思考模式
     * @returns {string} 格式化后的 HTML 内容
     * @private
     */
    _formatMessageContent(content, type, longThought) {
        // 对于 question 类型，直接返回内容（假设 question 是纯文本或 HTML）
        if (type === 'question') {
            return content;
        }

        // 使用 marked 将 markdown 转换为 HTML
        const thinkingHtml = content.thinking ? marked.parse(String(content.thinking)) : '';
        const resultHtml = content.result ? marked.parse(String(content.result)) : '';

        // 根据 longThought 决定如何显示
        if (content.thinking && longThought) {
            return `
                <div class="answer-thinking collapsed">
                    <div class="thinking-toggle" onclick="this.parentElement.classList.toggle('collapsed')">
                        <span class="thinking-icon">💭</span>
                        <span class="thinking-title">Thinking</span>
                    </div>
                    <div class="thinking-content">${thinkingHtml}</div>
                </div>
                <div class="answer-result">${resultHtml}</div>
            `;
        } else {
            return `<div class="answer-result">${resultHtml}</div>`;
        }
    }
}

module.exports = ChatArea;