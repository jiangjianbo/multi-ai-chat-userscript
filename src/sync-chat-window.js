const Util = require('./util');
const ChatArea = require('./chat-area');
const Message = require('./message');
const Config = require('./config');
const I18n = require('./i18n');
const Storage = require('./storage');

const WINDOW_NAME = 'multi-ai-sync-chat-window';
const util = new Util();

/**
 * @description 主窗口的检查和创建类
 */
function SyncChatWindow() {
    this.window = null;

    /**
     * @description 检查主窗口是否已经存在且可用。
     * @returns {boolean} true表示已经存在，false表示不存在
     */
    this.exist = function() {
        return !!(this.window && !this.window.closed);
    };

    /**
     * @description 创建主窗口，填充框架代码和依赖的脚本。
     * @param {Window} win - 新创建的窗口对象
     */
    this.createWindow = function(win) {
        const doc = win.document;
        const embeddedCode = `
            // Embedded dependencies
            const Util = ${Util.toString()};
            const Storage = ${Storage.toString()};
            const Config = ${Config.toString()};
            const I18n = ${I18n.toString()};
            const Message = ${Message.toString()};
            const ChatArea = ${ChatArea.toString()};
            const MainWindowController = ${MainWindowController.toString()};

            // App Entry Point
            document.addEventListener('DOMContentLoaded', () => {
                const util = new Util();
                const storage = new Storage();
                const config = new Config({ storage });
                const i18n = new I18n({ config });
                const message = new Message('multi-ai-sync-chat-channel');

                const controller = new MainWindowController({
                    message,
                    config,
                    i18n,
                    util: util,
                    ChatArea
                });
                controller.init();
                window.controller = controller; // For debugging
            });
        `;

        const html = util.toHtml({
            tag: 'html',
            children: [
                { tag: 'head',
                  children: [
                    { tag: 'meta', '@charset': 'UTF-8' },
                    { tag: 'title', text: 'Multi-AI Sync Chat' },
                    // TODO: Add CSS
                  ]
                },
                { tag: 'body',
                  children: [
                    { tag: 'div', '@id': 'app-container' },
                    { tag: 'script', text: embeddedCode }
                  ]
                }
            ]
        });

        doc.open();
        doc.write(html.outerHTML);
        doc.close();
    };

    /**
     * @description 检查并创建/激活窗口。
     * @returns {Window}
     */
    this.checkAndCreateWindow = function() {
        if (this.exist()) {
            this.window.focus();
        } else {
            this.window = window.open('', WINDOW_NAME);
            if (this.window) {
                // Check if the window is fresh (document is empty)
                if (this.window.document.body.innerHTML.trim() === '') {
                    this.createWindow(this.window);
                }
                this.window.focus();
            } else {
                alert('Please allow popups for this site to use the Multi-AI Sync Chat feature.');
            }
        }
        return this.window;
    };
}

/**
 * @description 主窗口的核心控制器。
 * @param {object} args - 构造函数参数。
 */
function MainWindowController(args) {
    this.message = args.message;
    this.config = args.config;
    this.i18n = args.i18n;
    this.util = args.util;
    this.ChatArea = args.ChatArea;
    this.chatAreas = new Map();
    this.pinnedAreas = new Set();
    this.layouts = [1, 2, 4, 6];

    /**
     * @description 初始化，渲染布局，注册消息监听。
     */
    this.init = function() {
        this.renderLayout();
        this.message.register(this);
    };

    this.renderLayout = function() {
        // This is a placeholder. A full implementation would use Util.toHtml
        const appContainer = this.util.$('#app-container');
        appContainer.innerHTML = `
            <header id="main-header">Header</header>
            <main id="chat-area-container"></main>
            <footer id="global-input-bar">Global Input</footer>
        `;
        // Add event listeners for layout buttons, etc.
    };

    /**
     * @description 处理来自原生页面的创建内容块的消息。
     */
    this.onMsgCreate = function(data) {
        if (this.chatAreas.has(data.id)) {
            // Maybe focus the existing area
            return;
        }
        this.addChatArea(data);
    };

    /**
     * @description 处理来自原生页面的答案消息。
     */
    this.onMsgAnswer = function(data) {
        const chatArea = this.chatAreas.get(data.id);
        if (chatArea) {
            chatArea.handleAnswer(data);
        }
    };

    this.addChatArea = function(data) {
        const container = document.createElement('div');
        container.className = 'chat-area-wrapper';
        this.util.$('#chat-area-container').appendChild(container);

        const chatArea = new this.ChatArea(this, data.id, data.url, container);
        chatArea.init();
        this.chatAreas.set(data.id, chatArea);

        this.updateLayout();
    };

    this.removeChatArea = function(id) {
        const chatArea = this.chatAreas.get(id);
        if (chatArea) {
            chatArea.destroy();
            this.chatAreas.delete(id);
            this.pinnedAreas.delete(id);
            this.updateLayout();
        }
    };

    this.updateLayout = function() {
        const areaCount = this.chatAreas.size;
        const currentLayout = parseInt(this.config.get('layout', 2));
        let newLayout = currentLayout;

        if (areaCount > currentLayout) {
            for (const layout of this.layouts) {
                if (layout >= areaCount) {
                    newLayout = layout;
                    break;
                }
            }
            if (newLayout === currentLayout) newLayout = this.layouts[this.layouts.length - 1]; // Max layout
        }
        
        if (newLayout !== currentLayout) {
            this.config.set('layout', newLayout);
        }

        // Logic to show/hide/rearrange areas based on new layout and pinned status
        const container = this.util.$('#chat-area-container');
        container.className = `layout-${newLayout}`;
        // ... more complex logic for pinning and visibility ...
    };
}

module.exports = { SyncChatWindow, MainWindowController };