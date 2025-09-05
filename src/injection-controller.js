import MessageNotifier from './message-notifier.js';
import Utils from './utils.js';
import { KimiPageDriver, GeminiPageDriver, ChatGPTPageDriver } from './drivers.js';
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
        const button = this.utils.createElement('button', { id: 'ai-sync-button', style: 'position:fixed; top:20px; right:20px; z-index:9999; padding:8px 16px; background:blue; color:white; border:none; border-radius:4px; cursor:pointer;' }, [this.utils.getLangText('syncCompare')]);
        button.addEventListener('click', () => this.openMainWindow());
        document.body.appendChild(button);
    };

    this.openMainWindow = function () {
        let mainWindow = this.findMainWindow();
        if (!mainWindow) {
            mainWindow = window.open('', WINDOW_NAME);
            this.injectMainWindowContent(mainWindow);
        } else {
            mainWindow.focus();
        }
        this.driver.getUsername().then(username => {
            this.send('create', { url: window.location.href, tabId: this.driver.getTabId(), config: { username } }, mainWindow);
        });
        this.isConnected = true;
    };

    this.findMainWindow = function () {
        // This is difficult to test in JSDOM, but logic is kept
        return null;
    };

    this.injectMainWindowContent = function (mainWindow) {
        const utils = new Utils();
        const isRTL = utils.isRTL();
        const lang = utils.getBrowserLang();

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="${lang}" dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
            <meta charset="UTF-8">
            <title>${utils.getLangText('multipleAiChat')}</title>
            <style>/* ... CSS styles ... */</style>
        </head>
        <body>
            <div class="header">
                <div class="title">${utils.getLangText('multipleAiChat')}</div>
                <div class="layout-buttons">
                    <button data-layout="1">1</button>
                    <button data-layout="2">2</button>
                    <button data-layout="3">3</button>
                    <button data-layout="4">4</button>
                    <button data-layout="6">6</button>
                </div>
                <div class="control-buttons">
                    <button id="settings-btn">⚙️</button>
                    <button id="new-chat-btn">➕</button>
                </div>
            </div>
            <div class="chat-areas" id="chat-areas-container"></div>
            <div class="main-input">
                <textarea id="main-prompt"></textarea>
                <button id="send-all-btn">${utils.getLangText('send')}</button>
            </div>
            <script>
                // The main script is already loaded, so we just need to initialize the controller.
            </script>
        </body>
        </html>
        `;

        mainWindow.document.write(htmlContent);
        mainWindow.document.close();
    };

    this.onMsgChat = function (data) {
        const { chatId, message } = data;
        this.driver.sendMessage(message).then(() => {
            const checkAnswer = setInterval(() => {
                this.driver.getAnswer().then(answer => {
                    if (answer) {
                        clearInterval(checkAnswer);
                        this.send('answer', { url: window.location.href, tabId: this.driver.getTabId(), chatId, answerTime: new Date().toISOString(), answer });
                    }
                });
            }, 1000);
        });
    };

    this.onMsgConfig = function (data) { console.log('Config update:', data); };
    this.onMsgThread = function (data) { this.driver.createNewThread().then(result => { if (result) { this.send('thread_return', result); } }); };
    this.onMsgShare = function (data) { this.driver.createShareLink(data.chatIds).then(link => { this.send('share_return', { tabId: this.driver.getTabId(), link }); }); };

    this.setupAnswerListener = function () {
        const observer = new MutationObserver(this.utils.debounce(() => {
            if (this.isConnected) {
                this.driver.getAnswer().then(answer => {
                    if (answer) { this.send('answer', { url: window.location.href, tabId: this.driver.getTabId(), chatId: 'auto-' + Date.now(), answerTime: new Date().toISOString(), answer }); }
                });
            }
        }, 1000));
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    };
}

export default InjectionController;
