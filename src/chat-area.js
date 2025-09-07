
import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';

const CHANNEL_NAME = 'multi-ai-chat-channel';

function ChatArea(mainController, options) {
    MessageNotifier.call(this, CHANNEL_NAME);

    this.mainController = mainController;
    this.id = options.id;
    this.isAssigned = false;
    this.utils = new Utils();
    this.aiProviders = this.utils.getDefaultAiProviders();

    this.init = function () {
        this.register(this);
        this.element = this.createChatAreaElement();
        this.attachEventListeners();
    };

    this.createChatAreaElement = function () {
        const element = document.createElement('div');
        element.className = 'chatarea unassigned';
        element.id = this.id;
        const aiOptions = this.aiProviders.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');

        element.innerHTML = `
            <div class="chatarea-header">
                <select class="ai-selector"><option value="">Select AI...</option>${aiOptions}</select>
                <div>
                    <button class="control-share" title="Share">🔗</button>
                    <button class="control-close" title="Close">❌</button>
                </div>
            </div>
            <div class="chatarea-body">
                <div class="unassigned-overlay">Select an AI Provider</div>
                <div class="chatarea-content"></div>
                <div class="chatarea-input-container">
                    <div class="input-bar"><span>⬆️</span></div>
                    <textarea placeholder="Assign an AI to start..." disabled></textarea>
                </div>
            </div>
        `;
        return element;
    };

    this.attachEventListeners = function () {
        const inputContainer = this.element.querySelector('.chatarea-input-container');
        const textarea = this.element.querySelector('textarea');
        const contentArea = this.element.querySelector('.chatarea-content');

        const activateInput = (isActive) => {
            if (isActive) {
                inputContainer.classList.add('is-active');
                contentArea.style.paddingBottom = (inputContainer.offsetHeight + 10) + 'px';
            } else {
                inputContainer.classList.remove('is-active');
                contentArea.style.paddingBottom = '15px';
            }
        };

        inputContainer.addEventListener('mouseenter', () => !this.isAssigned || activateInput(true));
        inputContainer.addEventListener('mouseleave', () => (document.activeElement !== textarea) && activateInput(false));
        textarea.addEventListener('focus', () => activateInput(true));
        textarea.addEventListener('blur', () => activateInput(false));
        textarea.addEventListener('keydown', (e) => this.handleIndividualSend(e));

        this.element.querySelector('.control-close').addEventListener('click', () => this.mainController.removeChatArea(this.id));
        this.element.querySelector('.control-share').addEventListener('click', () => this.send('share', { tabId: this.tabId, chatIds: [] }));
        this.element.querySelector('.ai-selector').addEventListener('change', (e) => this.assignAI(e));
    };

    this.assignAI = function(event) {
        const selectedAiIndex = event.target.value;
        if (!selectedAiIndex) return;

        const aiName = this.aiProviders[selectedAiIndex].name;
        this.isAssigned = true;
        this.element.classList.remove('unassigned');
        this.element.querySelector('.unassigned-overlay').style.display = 'none';
        
        const textarea = this.element.querySelector('textarea');
        textarea.disabled = false;
        textarea.placeholder = `Send a message to ${aiName}...`;

        const selector = event.target;
        const headerText = document.createElement('span');
        headerText.textContent = aiName;
        selector.parentNode.insertBefore(headerText, selector);
        selector.style.display = 'none';
    };

    this.handleIndividualSend = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = e.target.value.trim();
            if (message) {
                this.addMessage({ type: 'question', content: message });
                this.send('chat', { tabId: this.tabId, chatId: 'chat-' + Date.now(), message });
                e.target.value = '';
            }
        }
    };

    this.addMessage = function (message) {
        const contentArea = this.element.querySelector('.chatarea-content');
        const messageElement = this.utils.createElement('div', { class: `message ${message.type}` });
        messageElement.textContent = message.content;
        contentArea.appendChild(messageElement);
        contentArea.scrollTop = contentArea.scrollHeight;
    };

    this.handleAnswer = function (data) {
        this.addMessage({ type: 'answer', content: data.answer });
    };
}

export default ChatArea;
