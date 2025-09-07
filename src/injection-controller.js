
import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';
import drivers from './drivers.js';
import GenericPageDriver from './generic-page-driver.js';
import I18n from './i18n.js';
import MainWindowController from './main-window-controller.js';
import ChatArea from './chat-area.js';

const CHANNEL_NAME = 'multi-ai-chat-channel';
const WINDOW_NAME = 'multi-ai-sync-chat-window';

function InjectionController() {
    MessageNotifier.call(this, CHANNEL_NAME);
    this.utils = new Utils();
    this.driver = null;
    this.isConnected = false;

    this.createDriver = function () {
        const url = window.location.href;
        if (url.includes('kimi.com')) return new drivers.KimiPageDriver();
        if (url.includes('gemini.google.com')) return new drivers.GeminiPageDriver();
        if (url.includes('chatgpt.com')) return new drivers.ChatGPTPageDriver();
        return new GenericPageDriver();
    };

    this.init = function () {
        this.driver = this.createDriver();
        this.addSyncButton();
        this.setupAnswerListener();
        this.driver.addFloatingToolbars();
        this.register(this);
    };

    this.addSyncButton = function () {
        const button = this.utils.createElement('button', { id: 'ai-sync-button', style: 'position:fixed; top:20px; right:20px; z-index:9999;' }, [this.utils.getLangText('syncCompare')]);
        button.addEventListener('click', () => this.openMainWindow());
        document.body.appendChild(button);
    };

    this.openMainWindow = function () {
        let mainWindow = window.open('', WINDOW_NAME);
        if (mainWindow) {
            this.injectMainWindowContent(mainWindow);
            mainWindow.focus();
        } else {
            alert('Please allow popups for this site.');
        }
        this.driver.getUsername().then(username => {
            this.send('create', { url: window.location.href, tabId: this.driver.getTabId(), config: { username } }, mainWindow);
        });
        this.isConnected = true;
    };

    this.injectMainWindowContent = function (mainWindow) {
        // This function is now primarily for injecting the base HTML and styles.
        // The main logic is handled by index.js detecting the window name.
        const utils = new Utils();
        mainWindow.document.body.innerHTML = `<div id="chat-areas-container"></div>`; // Simplified
    };

    this.onMsgChat = function (data) {
        this.driver.sendMessage(data.message).then(() => {
            // Simplified answer checking for brevity
            this.driver.getAnswer().then(answer => {
                this.send('answer', { tabId: this.driver.getTabId(), answer });
            });
        });
    };

    this.setupAnswerListener = function () {
        const observer = new MutationObserver(this.utils.debounce(() => {
            if (this.isConnected) {
                this.driver.getAnswer().then(answer => {
                    if (answer) { this.send('answer', { tabId: this.driver.getTabId(), answer }); }
                });
            }
        }, 1000));
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    };

    // Other handlers like onMsgConfig, onMsgThread, etc.
    this.onMsgConfig = function (data) { console.log('Config update:', data); };
    this.onMsgThread = function (data) { this.driver.createNewThread().then(result => { if (result) { this.send('thread_return', result); } }); };
    this.onMsgShare = function (data) { this.driver.createShareLink(data.chatIds).then(link => { this.send('share_return', { tabId: this.driver.getTabId(), link }); }); };
}

export default InjectionController;
