const DriverFactory = require('./driver-factory');
const Util = require('./util');

function ChatArea(mainController, id, url, container, i18n) {
    const driverFactory = new DriverFactory();
    const utils = new Util();
    
    this.mainController = mainController;
    this.id = id;
    this.url = url;
    this.container = container;
    this.i18n = i18n;
    this.element = null;
    this.hideTimeout = null;
    this.indexTooltipTimer = null;
    this.indexTooltipElement = null;
    this.currentHoverIndex = null;
    this.pinned = false;
    this.eventHandlers = {
        onEvtClose: (chatArea) => {},
        onEvtNewSession: (chatArea, providerName) => { },
        onEvtShare: (chatArea, url) => { },
        onEvtParamChanged: (chatArea, key, newValue, oldValue) => { },
        onEvtProviderChanged: (chatArea, newProvider, oldProvider) => { },
        onEvtPromptSend: (chatArea, text) => { },
        onEvtExport: () => {}
    };

    this.setEventHandler = function(eventName, handler) {
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
    };

    /**
     * 初始化结构
     * @param {object} instanceData 初始化数据，结构为{id, providerName, params:{webAccess,longThought, models}, conversation:[{type, content}], pinned}
     */
    this.init = function(instanceData) {
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
    };

    /**
     * 渲染问答内容
     * @param {object} data 初始化渲染问答内容，结构为{id, providerName, params:{webAccess,longThought, models}, conversation:{type, content}[], pinned}
     * @returns
     */
    this.render = function(data) {
        console.debug(`Rendering ChatArea ${data.id} with provider ${data.providerName}, data = ${JSON.stringify(data)}`);

        const providers = driverFactory.getProviders().map((m, i) =>
            `<div class="model-option" data-value="${m}">${m}</div>`
        ).join('');
        const versions = (data.params.models || []).map((m, i) =>
            `<option>${m}</option>`
        ).join('');

        const answers = (data.conversation||[]).filter(msg => msg.type === 'answer');

        const indexHtml = answers.map((ans, i) =>
            `<div class="index-item"><a href="#answer-${data.id}-${i}">${i + 1}</a></div>`
        ).join('');

        const conversationHtml = (data.conversation||[]).map(msg => {
            let id = '';
            if (msg.type === 'answer') {
                const answerIndex = answers.indexOf(msg);
                id = `id="answer-${data.id}-${answerIndex}"`;
            }
            return `<div class="message-bubble ${msg.type}" ${id}><div class="bubble-content">${msg.content}</div></div>`;
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
                        <div class="model-dropdown-arrow">&#9662;</div> <!-- 新增的箭头div -->
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
    };

    this.cacheDOMElements = function() {
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
    };

    this.initEventListeners = function() {
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
                    this.url = driverFactory.getProviderUrl(newProvider);
                }
            });
        });
        this.element.querySelector('.expand-all').addEventListener('click', () => this.expandAll());
        this.element.querySelector('.collapse-all').addEventListener('click', () => this.collapseAll());

        // 关键：索引链接点击事件处理（使用事件委托，支持动态添加的索引）
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

        // 索引栏鼠标悬浮显示问题预览
        this.element.querySelector('.chat-area-index').addEventListener('mouseenter', (e) => {
            const indexItem = e.target.closest('.index-item');
            if (indexItem) {
                const anchor = indexItem.querySelector('a');
                if (anchor) {
                    const href = anchor.getAttribute('href');
                    // 从 href 中提取索引（格式：#answer-{id}-{index}）
                    const match = href.match(/#answer-.*-(\d+)$/);
                    if (match) {
                        const answerIndex = parseInt(match[1]);
                        this.showIndexTooltip(indexItem, answerIndex);
                    }
                }
            }
        }, true);

        // 索引栏鼠标离开隐藏 tooltip
        this.element.querySelector('.chat-area-index').addEventListener('mouseleave', (e) => {
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
            // 回车键发送消息，Shift+回车换行
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
    };

    this.isPinned = function() {
        return this.pinned;
    };

    this.setPin = function(isPinned) {
        this.pinned = isPinned;
        this.updatePinState();
        // Notify main controller to update layout
        if (this.mainController && this.mainController.updateLayout) {
            this.mainController.updateLayout();
        }
    };

    this.updatePinState = function() {
        if (this.pinButton) {
            this.pinButton.classList.toggle('pinned', this.pinned);
        }
    };

    /**
     * @description 根据不可用提供商列表更新下拉选项的UI状态。
     * @param {string[]} unavailableProviders - 不可用的AI提供商名称数组。
     */
    this.updateProviderOptions = function(unavailableProviders) {
        const currentSelectedProvider = this.getProvider(); // 获取当前ChatArea已选择的提供商

        this.modelDropdown.querySelectorAll('.model-option').forEach(option => {
            const providerName = option.dataset.value;
            // 如果提供商在不可用列表中，并且不是当前ChatArea自己的选择，则禁用
            if (unavailableProviders.includes(providerName) && providerName !== currentSelectedProvider) {
                option.classList.add('unavailable');
                option.style.pointerEvents = 'none'; // 阻止点击
                option.setAttribute('title', this.i18n.getText('providerUnavailable')); // 提示不可用语言key
            } else {
                option.classList.remove('unavailable');
                option.style.pointerEvents = 'auto'; // 允许点击
                option.removeAttribute('title');
            }
        });
    };

    this.toggleDropdown = function(event, dropdown) {
        event.stopPropagation();
        if (dropdown === this.modelDropdown) {
            const unavailable = this.mainController.getUnavailableProviders(this.id);
            this.updateProviderOptions(unavailable);
        }
        dropdown.classList.toggle('visible');
    };

    this.closeDropdowns = function() {
        this.modelDropdown.classList.remove('visible');
        this.paramsDropdown.classList.remove('visible');
    };

    // 折叠状态枚举
    this.CollapseState = {
        FULLY_COLLAPSED: 'fully_collapsed',   // 全折叠
        PARTIAL: 'partial',                     // 半折叠/半展开（问题和答案展开，思考折叠）
        FULLY_EXPANDED: 'fully_expanded'        // 全展开
    };

    // 当前折叠状态
    this.collapseState = this.CollapseState.FULLY_EXPANDED;

    /**
     * @description 更新展开/折叠按钮的状态显示
     */
    this.updateCollapseButtons = function() {
        const expandBtn = this.element.querySelector('.expand-all');
        const collapseBtn = this.element.querySelector('.collapse-all');

        // 移除所有状态类
        expandBtn.classList.remove('partial-state', 'disabled');
        collapseBtn.classList.remove('partial-state', 'disabled');

        // 根据折叠状态设置按钮禁用
        if (this.collapseState === this.CollapseState.FULLY_EXPANDED) {
            // 全展开状态：展开按钮禁用
            expandBtn.classList.add('disabled');
        } else if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
            // 全折叠状态：折叠按钮禁用
            collapseBtn.classList.add('disabled');
        }
        // 半折叠状态：两个按钮都可用，添加视觉提示
        else if (this.collapseState === this.CollapseState.PARTIAL) {
            expandBtn.classList.add('partial-state');
            collapseBtn.classList.add('partial-state');
        }
    };

    this.expandAll = function() {
        // 全展开状态下，展开按钮禁用，不执行操作
        if (this.collapseState === this.CollapseState.FULLY_EXPANDED) {
            return;
        }

        const longThought = this.getLongThought();

        if (!longThought) {
            // 长思考模式关闭：从全折叠到全展开
            this.answerBubbles.forEach(b => b.classList.remove('collapsed'));
            this.collapseState = this.CollapseState.FULLY_EXPANDED;
        } else {
            // 长思考模式开启
            if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
                // 从全折叠到半折叠：展开问题和答案，思考保持折叠
                this.answerBubbles.forEach(b => b.classList.remove('collapsed'));
                this.element.querySelectorAll('.answer-thinking').forEach(el => el.classList.add('collapsed'));
                this.collapseState = this.CollapseState.PARTIAL;
            } else if (this.collapseState === this.CollapseState.PARTIAL) {
                // 从半折叠到全展开：展开思考
                this.element.querySelectorAll('.answer-thinking').forEach(el => el.classList.remove('collapsed'));
                this.collapseState = this.CollapseState.FULLY_EXPANDED;
            }
        }
        this.updateCollapseButtons();
    };

    this.collapseAll = function() {
        // 全折叠状态下，折叠按钮禁用，不执行操作
        if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
            return;
        }

        const longThought = this.getLongThought();

        if (!longThought) {
            // 长思考模式关闭：从全展开到全折叠
            this.answerBubbles.forEach(b => b.classList.add('collapsed'));
            this.collapseState = this.CollapseState.FULLY_COLLAPSED;
        } else {
            // 长思考模式开启
            if (this.collapseState === this.CollapseState.FULLY_EXPANDED) {
                // 从全展开到半折叠：折叠思考
                this.element.querySelectorAll('.answer-thinking').forEach(el => el.classList.add('collapsed'));
                this.collapseState = this.CollapseState.PARTIAL;
            } else if (this.collapseState === this.CollapseState.PARTIAL) {
                // 从半折叠到全折叠：折叠问题和答案
                this.answerBubbles.forEach(b => b.classList.add('collapsed'));
                this.collapseState = this.CollapseState.FULLY_COLLAPSED;
            }
        }
        this.updateCollapseButtons();
    };

    this.showInput = function() {
        clearTimeout(this.hideTimeout);
        this.placeholder.classList.add('hidden');
        this.inputArea.classList.add('visible');
    };

    this.dockInput = function() {
        this.showInput();
        this.inputArea.classList.add('docked');
        this.mainArea.style.paddingBottom = `${this.inputArea.offsetHeight}px`;
    };

    this.undockInput = function() {
        this.inputArea.classList.remove('docked');
        this.mainArea.style.paddingBottom = '0px';
        this.hideTimeout = setTimeout(() => {
            if (!this.inputArea.contains(document.activeElement)) {
                this.inputArea.classList.remove('visible');
                this.placeholder.classList.remove('hidden');
            }
        }, 300);
    };
    
    this.handleFocusOut = function(event) {
        if (!this.inputArea.contains(event.relatedTarget)) this.undockInput();
    };

    /**
     * 添加消息
     * @param {string} content html内容
     * @param {string} type 取值question或answer
     * @param {number|null} index 可选的消息索引，如果为null则自动计算
     */
    this.addMessage = function(content, type, index = null) {
        // 验证索引范围
        if (index !== null && index !== undefined) {
            if (index < 0 || index > 1000) {
                throw new Error(`Index ${index} out of range. Valid range is 0-1000.`);
            }
        }

        const answers = Array.from(this.answerBubbles);
        const answerIndex = index !== null && index !== undefined ? index : answers.length;
        const id = `answer-${this.id}-${answerIndex}`;
        const messageJson = {
            tag: 'div', '@class': `message-bubble ${type}`, '@id': (type === 'answer' ? id : ''),
            child: [ { tag: 'div', '@class': 'bubble-content', innerHTML: content } ]
        };
        const messageElement = utils.toHtml(messageJson);
        this.conversationArea.appendChild(messageElement);
        this.conversationArea.scrollTop = this.conversationArea.scrollHeight;
        if (type === 'answer') {
            const indexJson = { tag: 'div', '@class': 'index-item', child: [
                { tag: 'a', '@href': `#${id}`, text: `${answerIndex + 1}` }
            ]};
            this.element.querySelector('.chat-area-index').appendChild(utils.toHtml(indexJson));
            this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');

            // 处理思考和结果结构
            this.updateAnswerContent(messageElement, content);
        }
    };

    this.destroy = function() {
        // Internal cleanup can go here. DOM removal is handled by the controller.
    };

    this.getProvider = function() {
        return this.providerNameDisplay.textContent.trim();
    };

    this.getWebAccess = function() {
        return this.element.querySelector(`#web-access-${this.id}`).checked;
    };

    this.getLongThought = function() {
        return this.element.querySelector(`#long-thought-${this.id}`).checked;
    };

    this.getModelVersion = function() {
        return this.paramsDropdown.querySelector('select').value;
    };

    this.getUrl = function() {
        return this.url;
    };

    this.setWebAccess = function(value) {
        this.element.querySelector(`#web-access-${this.id}`).checked = value;
    };

    this.setLongThought = function(value) {
        this.element.querySelector(`#long-thought-${this.id}`).checked = value;

        // 更新思考内容的显示
        const thinkingElements = this.element.querySelectorAll('.answer-thinking');
        if (value) {
            // 长思考模式开启，显示思考内容（折叠状态）
            thinkingElements.forEach(el => {
                el.style.display = '';
                el.classList.add('collapsed');
            });
            // 如果之前是全展开或全折叠，切换到半折叠
            if (this.collapseState === this.CollapseState.FULLY_EXPANDED) {
                this.collapseState = this.CollapseState.PARTIAL;
            } else if (this.collapseState === this.CollapseState.FULLY_COLLAPSED) {
                this.collapseState = this.CollapseState.PARTIAL;
            }
        } else {
            // 长思考模式关闭，隐藏思考内容
            thinkingElements.forEach(el => el.style.display = 'none');
            // 切换到全展开状态
            this.collapseState = this.CollapseState.FULLY_EXPANDED;
        }
        this.updateCollapseButtons();
    };

    this.updateTitle = function(title) {
        // Assuming there's an element to display the title, e.g., this.element.querySelector('.chat-title-display')
        // For now, we'll just log it.
        console.log(`ChatArea ${this.id}: Title updated to ${title}`);
    };

    this.updateOption = function(key, value) {
        if (key === 'webAccess') {
            this.setWebAccess(value);
        } else if (key === 'longThought') {
            this.setLongThought(value);
        } else {
            console.log(`ChatArea ${this.id}: Option ${key} updated to ${value}`);
        }
    };

    this.addQuestion = function(content) {
        this.addMessage(content, 'question');
    };

    this.addAnswer = function(content, index = null, thinking = null) {
        this.addMessage(content, 'answer', index, thinking);
    };

    this.handleAnswer = function(data) {
        if (data && data.content !== undefined) {
            const index = data.index;
            const content = data.content;

            // 检查是否已经存在该索引的答案
            const existingAnswerId = `answer-${this.id}-${index}`;
            const existingAnswer = this.conversationArea.querySelector(`#${existingAnswerId}`);

            if (existingAnswer) {
                // 更新已有答案的内容
                this.updateAnswerContent(existingAnswer, content);
            } else {
                // 添加新答案
                this.addAnswer(content, index);
            }
        }
    };

    /**
     * @description 更新答案内容（包含思考和结果）
     * @param {HTMLElement} answerElement - 答案元素
     * @param {string} content - 完整的答案HTML内容
     */
    this.updateAnswerContent = function(answerElement, content) {
        const bubbleContent = answerElement.querySelector('.bubble-content');
        if (!bubbleContent) return;

        const longThought = this.getLongThought();

        // 创建临时容器来解析内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // 查找思考内容（通过 class 包含 thinking）
        const thinkingElement = tempDiv.querySelector('[class*="thinking"]') ||
                               tempDiv.querySelector('.toolcall-container') ||
                               tempDiv.querySelector('.thinking-container');

        // 查找结果内容（通过 class 包含 markdown 或 result）
        const resultElement = tempDiv.querySelector('[class*="markdown"]') ||
                             tempDiv.querySelector('[class*="result"]') ||
                             tempDiv.querySelector('.markdown-container');

        // 构建新的内容结构
        let newContent = '';

        if (thinkingElement && longThought) {
            // 有思考内容且长思考模式开启
            newContent = `
                <div class="answer-thinking collapsed">
                    <div class="thinking-toggle" onclick="this.parentElement.classList.toggle('collapsed')">
                        <span class="thinking-icon">💭</span>
                        <span class="thinking-title">Thinking</span>
                    </div>
                    <div class="thinking-content">${thinkingElement.innerHTML}</div>
                </div>
                <div class="answer-result">${resultElement ? resultElement.innerHTML : content}</div>
            `;
        } else if (resultElement) {
            // 只有结果内容
            newContent = `<div class="answer-result">${resultElement.innerHTML}</div>`;
        } else {
            // 没有特殊结构，使用原始内容
            newContent = content;
        }

        bubbleContent.innerHTML = newContent;
    };

    this.updateModelVersion = function(version) {
        const selectElement = this.paramsDropdown.querySelector('select');
        if (selectElement) {
            // Check if the version exists in the options
            const optionExists = Array.from(selectElement.options).some(option => option.value === version);
            if (optionExists) {
                selectElement.value = version;
            } else {
                // If version doesn't exist, add it as a new option
                const newOption = document.createElement('option');
                newOption.value = version;
                newOption.textContent = version;
                selectElement.appendChild(newOption);
                selectElement.value = version;
            }
        }
        console.log(`ChatArea ${this.id}: Model version updated to ${version}`);
    };

    this.newSession = function() {
        // Clear conversation, reset state for a new session.
        this.conversationArea.innerHTML = '';
        this.element.querySelector('.chat-area-index').innerHTML = '';
        this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
        console.log(`ChatArea ${this.id}: Started new session.`);
    };

    /**
     * @description 显示索引 tooltip，显示对应位置问题的前 15 个字
     * @param {HTMLElement} indexItem - 索引元素
     * @param {number} answerIndex - 答案索引
     */
    this.showIndexTooltip = function(indexItem, answerIndex) {
        // 如果是同一个索引，直接显示，不需要等待
        if (this.currentHoverIndex === answerIndex && this.indexTooltipElement) {
            this.updateTooltipPosition(indexItem);
            return;
        }

        // 清除之前的定时器
        if (this.indexTooltipTimer) {
            clearTimeout(this.indexTooltipTimer);
            this.indexTooltipTimer = null;
        }

        // 如果是切换到不同的索引，立即显示
        if (this.currentHoverIndex !== null && this.currentHoverIndex !== answerIndex) {
            this.displayTooltip(indexItem, answerIndex);
            this.currentHoverIndex = answerIndex;
            return;
        }

        // 第一次悬浮，等待 2 秒后显示
        this.indexTooltipTimer = setTimeout(() => {
            this.displayTooltip(indexItem, answerIndex);
            this.currentHoverIndex = answerIndex;
        }, 2000);
    };

    /**
     * @description 实际显示 tooltip 的方法
     * @param {HTMLElement} indexItem - 索引元素
     * @param {number} answerIndex - 答案索引
     */
    this.displayTooltip = function(indexItem, answerIndex) {
        // 获取对应的问题元素（问题在答案之前，所以问题索引和答案索引相同）
        const questions = this.conversationArea.querySelectorAll('.message-bubble.question');
        const questionElement = questions[answerIndex];

        if (!questionElement) return;

        // 获取问题文本并截取前 15 个字
        const questionText = questionElement.textContent.trim();
        const previewText = questionText.length > 15 ? questionText.substring(0, 15) + '...' : questionText;

        // 创建或更新 tooltip
        if (!this.indexTooltipElement) {
            this.indexTooltipElement = document.createElement('div');
            this.indexTooltipElement.className = 'index-tooltip';
            this.element.appendChild(this.indexTooltipElement);
        }

        this.indexTooltipElement.textContent = previewText;
        this.indexTooltipElement.style.display = 'block';
        this.updateTooltipPosition(indexItem);
    };

    /**
     * @description 更新 tooltip 位置
     * @param {HTMLElement} indexItem - 索引元素
     */
    this.updateTooltipPosition = function(indexItem) {
        if (!this.indexTooltipElement) return;

        const indexRect = indexItem.getBoundingClientRect();
        const chatAreaRect = this.element.getBoundingClientRect();

        // 计算 tooltip 相对于 chat-area-container 的位置
        const left = indexRect.right - chatAreaRect.left + 10;
        const top = indexRect.top - chatAreaRect.top;

        this.indexTooltipElement.style.left = `${left}px`;
        this.indexTooltipElement.style.top = `${top}px`;
    };

    /**
     * @description 隐藏索引 tooltip
     */
    this.hideIndexTooltip = function() {
        // 清除定时器
        if (this.indexTooltipTimer) {
            clearTimeout(this.indexTooltipTimer);
            this.indexTooltipTimer = null;
        }

        // 隐藏 tooltip
        if (this.indexTooltipElement) {
            this.indexTooltipElement.style.display = 'none';
        }

        // 重置当前悬浮索引
        this.currentHoverIndex = null;
    };
}

module.exports = ChatArea;
