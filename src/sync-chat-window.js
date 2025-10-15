const ChatArea = require('./chat-area');
const Util = require('./util');
const utils = new Util();

/**
 * @description Manages the main chat window, including layout and child ChatArea instances.
 */
function MainWindowController() {
    this.chatAreas = new Map();
    this.element = null;
    this.chatAreaContainer = null;

    /**
     * @description Initializes the main window, renders its structure, and sets up global listeners.
     */
    this.init = function() {
        const mainWindowJson = this.render();
        this.element = utils.toHtml(mainWindowJson);
        document.body.appendChild(this.element);

        this.cacheDOMElements();
        this.initEventListeners();
    };

    /**
     * @description Renders the main window structure as a JSON object.
     * @returns {object}
     */
    this.render = function() {
        // Based on research/main-window.html
        return {
            tag: 'div', '@class': 'main-window', child: [
                { tag: 'header', '@class': 'main-title-bar', child: [
                    { tag: 'div', '@class': 'title-section left', child: [
                        { tag: 'div', '@class': 'product-logo', text: '&#129302;' },
                        { tag: 'div', '@class': 'product-name', text: 'Multi AI Chat' },
                    ]},
                    { tag: 'div', '@class': 'title-section center layout-switcher', child: [
                        { tag: 'button', '@class': 'layout-button active', '@data-layout': '1', text: '1' },
                        { tag: 'button', '@class': 'layout-button', '@data-layout': '2', text: '2' },
                        { tag: 'button', '@class': 'layout-button', '@data-layout': '4', text: '4' },
                    ]},
                    { tag: 'div', '@class': 'title-section right', child: [
                        { tag: 'button', '@class': 'title-action-button', innerHTML: '&#10006;' }
                    ]}
                ]},
                { tag: 'main', '@class': 'content-area', '@data-layout': '1' },
                { tag: 'footer', '@class': 'prompt-area', child: [
                    { tag: 'button', '@class': 'prompt-action-button', innerHTML: '&#9881;' },
                    { tag: 'div', '@class': 'prompt-input-wrapper', child: [
                        { tag: 'textarea', '@id': 'prompt-textarea', '@rows': '1', '@placeholder': 'Ask all AIs...' }
                    ]},
                    { tag: 'button', '@class': 'prompt-action-button', innerHTML: '&#10148;' }
                ]}
            ]
        };
    };

    this.cacheDOMElements = function() {
        this.chatAreaContainer = this.element.querySelector('.content-area');
        this.layoutSwitcher = this.element.querySelector('.layout-switcher');
    };

    this.initEventListeners = function() {
        // Layout switching
        this.layoutSwitcher.addEventListener('click', (e) => {
            if (e.target.matches('.layout-button')) {
                const layout = e.target.dataset.layout;
                this.chatAreaContainer.dataset.layout = layout;
                this.layoutSwitcher.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
            }
        });

        // Global dropdown closing logic
        document.addEventListener('close-all-dropdowns', () => {
             this.element.querySelectorAll('.custom-dropdown.visible').forEach(d => d.classList.remove('visible'));
        });
        document.addEventListener('click', (e) => {
            const isDropdownClick = e.target.closest('.custom-dropdown');
            const isToggleClick = e.target.closest('.model-name, .params-button');
            if (!isDropdownClick && !isToggleClick) {
                this.element.querySelectorAll('.custom-dropdown.visible').forEach(d => d.classList.remove('visible'));
            }
        });
    };

    /**
     * @description Creates and adds a new ChatArea to the window.
     * @param {string} id - Unique ID for the new chat area.
     * @param {string} url - URL of the AI chat page.
     * @param {object} data - Initial data for the chat area.
     */
    this.addChatArea = function(id, url, data) {
        if (this.chatAreas.has(id)) {
            console.warn(`ChatArea with id ${id} already exists.`);
            return;
        }

        const chatContainer = utils.toHtml({ tag: 'div', '@class': 'chat-area-wrapper' });
        this.chatAreaContainer.appendChild(chatContainer);

        const chatArea = new ChatArea(this, id, url, chatContainer);
        chatArea.init(data);
        this.chatAreas.set(id, chatArea);
        console.log(`Added ChatArea: ${id}`);
    };

    /**
     * @description Removes a ChatArea from the window.
     * @param {string} id - The ID of the chat area to remove.
     */
    this.removeChatArea = function(id) {
        if (this.chatAreas.has(id)) {
            this.chatAreas.delete(id);
            console.log(`Removed ChatArea: ${id}`);
        }
    };

    /**
     * @description Routes a message to the appropriate ChatArea.
     * @param {object} msg - The message object from the message bus.
     */
    this.routeMessage = function(msg) {
        if (msg && msg.id && this.chatAreas.has(msg.id)) {
            const chatArea = this.chatAreas.get(msg.id);
            if (msg.type === 'answer' && chatArea.addMessage) {
                chatArea.addMessage(msg.content, 'answer');
            }
        }
    };
}

module.exports = MainWindowController;
