const { getProviders, getProviderUrl } = require('./page-driver');
const Util = require('./util');
const utils = new Util();

function ChatArea(mainController, id, url, container) {
    this.mainController = mainController;
    this.id = id;
    this.url = url;
    this.container = container;
    this.element = null;
    this.hideTimeout = null;
    this.pinned = false;

    /**
     * 初始化结构
     * @param {object} instanceData 初始化数据，结构为{id, providerName, params:{webAccess,longThought, models}, conversation:[{type, content}], pinned}
     */
    this.init = function(instanceData) {
        const chatAreaHtml = this.render(instanceData);
        this.container.innerHTML = chatAreaHtml;
        this.element = this.container.querySelector('.chat-area-instance');
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
        const providers = getProviders().map((m, i) => 
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

        return `
        <div class="chat-area-instance">
            <div class="chat-area-title">
                <div class="title-left">
                    <div class="model-selector">
                        <div class="model-name">${data.providerName} &#9662;</div>
                        <div class="custom-dropdown model-dropdown">
                            ${providers}
                        </div>
                    </div>
                    <div class="title-button new-session-button" title="New Session">&#10133;</div>
                </div>
                <div class="title-right">
                    <div class="params-selector">
                        <div class="title-button params-button" title="Parameters">&#9881;</div>
                        <div class="custom-dropdown params-dropdown">
                            <div class="param-item"><label>Web Access</label><label class="toggle-switch"><input type="checkbox" ${data.params.webAccess ? 'checked' : ''}><span class="slider"></span></label></div>
                            <div class="param-item"><label>Long Thought</label><label class="toggle-switch"><input type="checkbox" ${data.params.longThought ? 'checked' : ''}><span class="slider"></span></label></div>
                            <hr>
                            <div class="param-item"><label>Model Version</label>
                                <select>${versions}</select>
                            </div>
                        </div>
                    </div>
                    <div class="title-button share-button" title="Share">&#128279;</div>
                    <div class="title-button pin-button" title="Pin"><span class="icon">&#128204;</span></div>
                    <div class="title-button close-button" title="Close">&#10006;</div>
                </div>
            </div>
            <div class="chat-area-main">
                <div class="chat-area-index">
                    <div class="index-button expand-all" title="Expand All">&#x2924;</div>
                    <div class="index-button collapse-all" title="Collapse All">&#x2922;</div>
                    ${indexHtml}
                </div>
                <div class="chat-area-conversation">${conversationHtml}</div>
            </div>
            <div class="input-placeholder">Input</div>
            <div class="chat-area-input">
                <textarea rows="1" placeholder="Type your message..."></textarea>
                <button title="Send">&#10148;</button>
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
        this.element.querySelector('.close-button').addEventListener('click', () => this.mainController.removeChatArea(this.id));
        this.element.querySelector('.new-session-button').addEventListener('click', () => alert('New Session clicked'));
        this.element.querySelector('.share-button').addEventListener('click', () => alert('Share clicked'));
        this.providerNameDisplay.addEventListener('click', (e) => this.toggleDropdown(e, this.modelDropdown));
        this.paramsButton.addEventListener('click', (e) => this.toggleDropdown(e, this.paramsDropdown));
        this.modelDropdown.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.providerNameDisplay.innerHTML = `${e.currentTarget.dataset.value} &#9662;`;
            });
        });
        this.element.querySelector('.expand-all').addEventListener('click', () => this.expandAll());
        this.element.querySelector('.collapse-all').addEventListener('click', () => this.collapseAll());
        this.placeholder.addEventListener('mouseenter', () => this.showInput());
        this.inputArea.addEventListener('mouseenter', () => this.showInput());
        this.inputArea.addEventListener('mouseleave', () => this.undockInput());
        this.textarea.addEventListener('focus', () => this.dockInput());
        this.inputArea.addEventListener('focusout', (e) => this.handleFocusOut(e));
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

    this.toggleDropdown = function(event, dropdown) {
        event.stopPropagation();
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
}

module.exports = ChatArea;
