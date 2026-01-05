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
        this.element = this.container.querySelector('.chat-area-instance');
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
            <div class="chat-area-instance">
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
        this.element.querySelector('.export-button').addEventListener('click', () => {
            this.eventHandlers.onEvtExport(this);
        });
        this.placeholder.addEventListener('mouseenter', () => this.showInput());
        this.inputArea.addEventListener('mouseenter', () => this.showInput());
        this.inputArea.addEventListener('mouseleave', () => this.undockInput());
        this.textarea.addEventListener('focus', () => this.dockInput());
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
    
    this.expandAll = () => this.answerBubbles.forEach(b => b.classList.remove('collapsed'));
    this.collapseAll = () => this.answerBubbles.forEach(b => b.classList.add('collapsed'));

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

    this.addMessage = function(content, type) {
        const answers = Array.from(this.answerBubbles);
        const answerIndex = answers.length;
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

    this.addAnswer = function(content) {
        this.addMessage(content, 'answer');
    };

    this.handleAnswer = function(data) {
        if (data && data.content) {
            this.addAnswer(data.content);
        }
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
}

module.exports = ChatArea;
