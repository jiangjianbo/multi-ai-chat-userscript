const Util = require('./util');
const utils = new Util();

function ChatArea(mainController, id, url, container) {
    this.mainController = mainController;
    this.id = id;
    this.url = url;
    this.container = container;
    this.element = null;
    this.hideTimeout = null;

    this.init = function(instanceData) {
        const chatAreaHtml = this.render(instanceData);
        this.container.innerHTML = chatAreaHtml;
        this.element = this.container.querySelector('.chat-area-instance');

        this.cacheDOMElements();
        this.initEventListeners();
    };

    this.render = function(data) {
        const answers = data.conversation.filter(msg => msg.type === 'answer');
        
        const indexHtml = answers.map((ans, i) => 
            `<div class="index-item"><a href="#answer-${data.id}-${i}">${i + 1}</a></div>`
        ).join('');

        const conversationHtml = data.conversation.map(msg => {
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
                        <div class="model-name">${data.modelName} &#9662;</div>
                        <div class="custom-dropdown model-dropdown">
                            <div class="model-option" data-value="Gemini">Gemini</div>
                            <div class="model-option" data-value="ChatGPT">ChatGPT</div>
                        </div>
                    </div>
                    <div class="title-button new-session-button" title="New Session">&#10133;</div>
                </div>
                <div class="title-right">
                    <div class="params-selector">
                        <div class="title-button params-button" title="Parameters">&#9881;</div>
                        <div class="custom-dropdown params-dropdown">
                            <div class="param-item"><label>Web Access</label><label class="toggle-switch"><input type="checkbox" ${data.params.webAccess ? 'checked' : ''}><span class="slider"></span></label></div>
                            <hr>
                            <div class="param-item"><label>Model Version</label><select><option>V2.2</option><option>V1.5 Pro</option></select></div>
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
        this.modelNameDisplay = this.modelSelector.querySelector('.model-name');
        this.modelDropdown = this.modelSelector.querySelector('.model-dropdown');
        this.paramsSelector = this.element.querySelector('.params-selector');
        this.paramsButton = this.paramsSelector.querySelector('.params-button');
        this.paramsDropdown = this.paramsSelector.querySelector('.params-dropdown');
    };

    this.initEventListeners = function() {
        this.element.querySelector('.pin-button').addEventListener('click', (e) => e.currentTarget.classList.toggle('pinned'));
        this.element.querySelector('.close-button').addEventListener('click', () => this.destroy());
        this.element.querySelector('.new-session-button').addEventListener('click', () => alert('New Session clicked'));
        this.element.querySelector('.share-button').addEventListener('click', () => alert('Share clicked'));
        this.modelNameDisplay.addEventListener('click', (e) => this.toggleDropdown(e, this.modelDropdown));
        this.paramsButton.addEventListener('click', (e) => this.toggleDropdown(e, this.paramsDropdown));
        this.modelDropdown.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.modelNameDisplay.innerHTML = `${e.currentTarget.dataset.value} &#9662;`;
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

    this.toggleDropdown = function(event, dropdown) {
        event.stopPropagation();
        const isVisible = dropdown.classList.contains('visible');
        document.dispatchEvent(new CustomEvent('close-all-dropdowns'));
        if (!isVisible) dropdown.classList.add('visible');
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
        this.mainController.removeChatArea(this.id);
        this.element.remove();
    };
}

module.exports = ChatArea;
