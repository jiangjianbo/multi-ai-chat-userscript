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
        const mainWindowHtml = this.render(); // Now returns HTML string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mainWindowHtml;
        this.element = tempDiv.firstElementChild; // Get the actual element
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
        return `
            <div class="main-window">
                <header class="main-title-bar">
                    <div class="title-section left">
                        <div class="product-logo">&#129302;</div>
                        <div class="product-name">Multi AI Chat</div>
                    </div>
                    <div class="title-section center layout-switcher">
                        <button class="layout-button active" data-layout="1">1</button>
                        <button class="layout-button" data-layout="2">2</button>
                        <button class="layout-button" data-layout="4">4</button>
                    </div>
                    <div class="title-section right">
                        <button class="title-action-button">&#10006;</button>
                    </div>
                </header>
                <main class="content-area" data-layout="1"></main>
                <footer class="prompt-area">
                    <button class="prompt-action-button">&#9881;</button>
                    <div class="prompt-input-wrapper">
                        <textarea id="prompt-textarea" rows="1" placeholder="Ask all AIs..."></textarea>
                    </div>
                    <button class="prompt-action-button">&#10148;</button>
                </footer>
            </div>
        `;
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
