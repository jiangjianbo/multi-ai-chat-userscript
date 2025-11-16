const Util = require('./util');

/**
 * @description The class for checking and creating the main window.
 */
function SyncChatWindow() {

    this.MULTI_AI_CHAT_MAIN_WINDOW = 'multi-ai-chat-main-window';
    SyncChatWindow.MULTI_AI_CHAT_MAIN_WINDOW = this.MULTI_AI_CHAT_MAIN_WINDOW;

    /**
     * @description Initializes the SyncChatWindow.
     */
    this.init = function() {
        // Initialization logic can be added here if needed.
    };

    /**
     * @description Checks if the main window already exists.
     * @returns {boolean} - True if it exists, false otherwise.
     */
    this.exist = function() {
        // The main window is identified by its window.name.
        // A more robust implementation might involve a BroadcastChannel ping/pong.
        const win = window.top.multiAiChatMainWindow;
        return !!(win && !win.closed);
    };

    function _addStyles(doc) {
        const styles = `
        #root {
            height: 100%;
        }
        :root {
            --border-color: #ddd;
            --background-color: #f4f4f4;
            --title-bg: #fff;
            --text-color: #333;
            --button-bg: #e9e9e9;
            --button-hover-bg: #dcdcdc;
            --button-active-bg: #007bff;
            --button-active-text: #fff;
            --pin-color: #ffc107;
            --index-width: 45px;
        }
        body, html {
            height: 100%;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--background-color);
            position: relative;
        }
        .main-window {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }

        /* Title Bar */
        .main-title-bar {
            flex-shrink: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 15px;
            border-bottom: 1px solid var(--border-color);
            background-color: var(--title-bg);
        }
        .title-section { display: flex; align-items: center; gap: 15px; }
        .title-section.left { justify-content: flex-start; }
        .title-section.center { justify-content: center; flex-grow: 1; }
        .title-section.right { justify-content: flex-end; }
        .product-logo { font-size: 20px; }
        .product-name { font-weight: bold; font-size: 16px; }
        .lang-switcher, .layout-button, .title-action-button {
            cursor: pointer; padding: 6px 10px; border-radius: 5px; border: 1px solid transparent; background-color: var(--button-bg);
        }
        .lang-switcher:hover, .layout-button:hover, .title-action-button:hover { background-color: var(--button-hover-bg); }
        .layout-button.active { background-color: var(--button-active-bg); color: var(--button-active-text); }

        /* Language Dropdown */
        .lang-container { position: relative; }
        .lang-dropdown {
            display: none; position: absolute; top: calc(100% + 5px); left: 0; background-color: white; border: 1px solid var(--border-color); border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 100;
        }
        .lang-dropdown div { padding: 8px 15px; cursor: pointer; white-space: nowrap; }
        .lang-dropdown div:hover { background-color: #f0f0f0; }

        /* Content Area */
        .content-area {
            flex-grow: 1; padding: 10px; display: grid; gap: 10px; overflow: auto; grid-auto-rows: 1fr;
        }
        .content-area[data-layout="1"] { grid-template-columns: 1fr; }
        .content-area[data-layout="2"] { grid-template-columns: 1fr 1fr; }
        .content-area[data-layout="4"] { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .content-area[data-layout="6"] { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; }
        
        /* Prompt Input Area */
        .prompt-area {
            flex-shrink: 0; display: flex; align-items: center; gap: 10px;
            padding: 10px 15px; border-top: 1px solid var(--border-color); background-color: var(--title-bg);
            position: relative;
        }
        .prompt-action-button {
            flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; border: none;
            background-color: var(--button-bg); cursor: pointer; font-size: 20px;
            display: flex; justify-content: center; align-items: center;
        }
        .prompt-action-button:hover { background-color: var(--button-hover-bg); }

        /* Settings Menu */
        .settings-menu {
            display: none; position: absolute; bottom: calc(100% + 5px); left: 15px; background-color: white;
            border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 -4px 8px rgba(0,0,0,0.1);
            padding: 10px; z-index: 100; width: 200px;
        }
        .settings-menu .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
        .settings-menu .setting-item label { cursor: pointer; }
        .settings-menu .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
        .settings-menu .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #2196F3; }
        input:checked + .slider:before { transform: translateX(20px); }

        .prompt-input-wrapper { flex-grow: 1; display: grid; }
        .prompt-input-wrapper::after, .prompt-input-wrapper textarea {
            grid-area: 1 / 1 / 2 / 2; width: 100%; min-height: 20px; max-height: 200px; /* 1/5 of 1000px height or 300px */
            padding: 8px 12px; font-size: 14px; line-height: 1.5; border: 1px solid var(--border-color);
            border-radius: 18px; resize: none; box-sizing: border-box; overflow: auto;
        }
        .prompt-input-wrapper::after { content: attr(data-replicated-value) " "; white-space: pre-wrap; visibility: hidden; }
        .prompt-input-wrapper textarea { overflow: auto; }

        /* ChatArea specific styles */
        .chat-area-container {
            width: 100%;
            height: 100%;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background-color: var(--background-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        .chat-area-title { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--border-color); background-color: #fff; position: relative; }
        .title-left, .title-right, .title-center { display: flex; align-items: center; gap: 12px; }
        .title-center { flex-grow: 1; justify-content: center; }
        .title-button { cursor: pointer; font-size: 18px; padding: 5px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .title-button:hover { background-color: #eee; }
        .pin-button .icon { transition: transform 0.2s ease; display: inline-block; }
        .pin-button.pinned .icon { transform: rotate(-45deg); color: #007bff; }
        .model-selector, .params-selector { position: relative; }
        .model-name, .params-button { cursor: pointer; padding: 5px 8px; border-radius: 5px; font-size: 14px; }
        .model-name { font-weight: bold; }
        .custom-dropdown { display: none; position: absolute; top: calc(100% + 5px); right: 0; background-color: #fff; border: 1px solid var(--border-color); border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 110; padding: 10px; min-width: 200px; }
        .custom-dropdown.model-dropdown { left: 0; right: auto; min-width: 120px; padding: 5px 0; }
        .custom-dropdown.visible { display: block; }
        .model-option { padding: 8px 15px; cursor: pointer; font-size: 14px; }
        .model-option:hover { background-color: #eee; }
        .param-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .param-item:last-child { margin-bottom: 0; }
        .param-item label { font-size: 14px; margin-right: 10px; }
        .toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .param-item select { width: 100%; padding: 5px; border-radius: 4px; border: 1px solid var(--border-color); }
        .chat-area-main { flex-grow: 1; overflow: hidden; position: relative; transition: padding-bottom 0.3s ease; }
        .chat-area-index { position: absolute; top: 0; left: 0; height: 100%; width: var(--index-width); padding: 10px 0; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 10; background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(2px); opacity: 0.85; border-right: 1px solid var(--border-color); }
        .index-button { cursor: pointer; width: 24px; height: 24px; border-radius: 4px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: bold; }
        .index-button:hover { background-color: #ccc; }
        .index-item a { font-size: 14px; color: #666; text-decoration: none; }
        .chat-area-conversation { height: 100%; padding: 20px 20px 20px calc(var(--index-width) + 10px); overflow-y: auto; box-sizing: border-box; scroll-behavior: smooth; }
        .message-bubble { max-width: 90%; padding: 10px 15px; border-radius: 15px; margin-bottom: 15px; position: relative; transition: all 0.3s ease; }
        .message-bubble.question { background-color: #dcf8c6; margin-left: auto; }
        .message-bubble.answer { background-color: #fff; margin-right: auto; border: 1px solid var(--border-color); }
        .message-bubble.answer.collapsed > .bubble-content { max-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .input-placeholder { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 80px; height: 30px; border-radius: 15px; background-color: rgba(0, 0, 0, 0.4); color: white; display: flex; justify-content: center; align-items: center; font-size: 12px; cursor: pointer; pointer-events: all; transition: all 0.3s ease; z-index: 20; }
        .input-placeholder.hidden { opacity: 0; transform: translateX(-50%) scale(0.5); visibility: hidden; }
        .chat-area-input { box-sizing: border-box; position: absolute; bottom: 0; left: 0; width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px; padding-left: calc(var(--index-width) + 10px); background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(5px); border-top: 1px solid var(--border-color); box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 25; opacity: 0; visibility: hidden; transform: translateY(100%); transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease; }
        .chat-area-input.visible { opacity: 1; visibility: visible; transform: translateY(0); }
        .chat-area-input.docked { background-color: #fff; }
        .chat-area-input textarea { flex-grow: 1; border: 1px solid var(--border-color); border-radius: 5px; padding: 8px; font-size: 14px; resize: none; }
        .chat-area-input button { flex-shrink: 0; width: 36px; height: 36px; border: none; background-color: #007bff; color: white; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; justify-content: center; align-items: center; }

        .forced-selection-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 100;
        }

        .chat-area-container.forced-selection .model-selector,
        .chat-area-container.forced-selection .close-button {
            z-index: 101;
            position: relative;
        }

        .chat-area-container.forced-selection .model-selector {
            border: 2px solid red; /* Highlight color */
            border-radius: 5px;
        }
        /* 新增的样式 */
        .model-option.unavailable {
            color: #888; /* 灰色文本 */
            background-color: #f5f5f5; /* 浅灰色背景 */
            cursor: not-allowed;
        }
        /* 为 model-selector 添加相对定位 */
        .model-selector {
            position: relative;
        }
        /* 为 model-dropdown-arrow 添加绝对定位 */
        .model-dropdown-arrow {
            position: absolute;
            right: -5px; /* 调整位置 */
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none; /* 确保点击穿透到 model-name */
        }
        `;
        return styles;
    }

    /**
     * @description Creates the main window content.
     * @param {Document} doc - The document object of the new window.
     * @param {boolean} ignoreScriptForTesting - 这个标志仅用于测试用途，表示跳过初始化脚本生成.
     */
    this.createWindow = function(doc, ignoreScriptForTesting = false) {
        doc.title = 'Multi-AI Sync Chat';
        // Inject styles
        const styles = _addStyles(doc);

        const htmlSrc = `
<div class="main-window">
    <!-- Title Bar -->
    <header class="main-title-bar">
        <div class="title-section left">
            <div class="product-logo">&#129302;</div>
            <div class="product-name" data-lang-key="productName">Multi AI Chat</div>
            <div class="lang-container">
                <div class="lang-switcher" id="lang-switcher">&#127760;</div>
                <div class="lang-dropdown" id="lang-dropdown">
                    <!-- Populated by MainWindowController -->
                </div>
            </div>
            <button class="title-action-button" id="new-chat-button" title="New Chat" data-lang-key="newChatButtonTitle">&#10133;</button>
        </div>
        <div class="title-section center" id="layout-switcher">
            <button class="layout-button active" data-layout="1">1</button>
            <button class="layout-button" data-layout="2">2</button>
            <button class="layout-button" data-layout="4">4</button>
            <button class="layout-button" data-layout="6">6</button>
        </div>
        <div class="title-section right">
            <button class="title-action-button" id="main-window-close-button">&#10006;</button>
        </div>
    </header>

    <!-- Content Area -->
    <main class="content-area" id="content-area">
        <!-- ChatAreas will be added here by MainWindowController -->
    </main>

    <!-- Prompt Input Area -->
    <footer class="prompt-area">
        <button class="prompt-action-button" id="settings-button" title="Settings" data-lang-key="settingsButtonTitle">&#9881;</button>
        <div class="settings-menu" id="settings-menu">
            <div class="setting-item">
                <label for="web-access" data-lang-key="webAccessLabel">Web Access</label>
                <label class="switch">
                    <input type="checkbox" id="web-access">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="setting-item">
                <label for="long-thought" data-lang-key="longThoughtLabel">Long Thought</label>
                <label class="switch">
                    <input type="checkbox" id="long-thought">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
        <div class="prompt-input-wrapper" id="prompt-wrapper">
            <textarea id="prompt-textarea" rows="1" placeholder="Ask all AIs..." data-lang-key="promptTextareaPlaceholder"></textarea>
        </div>
        <button class="prompt-action-button" id="global-send-button" title="Send" data-lang-key="globalSendButtonTitle">&#10148;</button>
    </footer>
</div>
        `;

        const util = new Util();
        const initScriptTemplate = `
                console.log('Initializing main window.');
debugger;
                window.mainWindowName = '${this.MULTI_AI_CHAT_MAIN_WINDOW}';
                // INSERT_MAIN_WINDOW_INDEX_JS_HERE
                console.log('Main window initialized.');
        `;
        const initScript = ignoreScriptForTesting ? '' : initScriptTemplate.replace('// INSERT_MAIN_WINDOW_INDEX_JS_HERE', __MAIN_WINDOW_INITIALIZER_SCRIPT__);
       
        doc.write(`
<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Multi AI Chat</title>
        <style>${styles}</style>
    </head>
    <body>
            <div id="root">${htmlSrc}</div>
            <script>${initScript}</script>
            <div style="position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        max-height: 80vh;
        overflow: auto;
        z-index: 10000;
        font-family: monospace;
        white-space: pre-wrap;
        word-break: break-all;"
            ><textarea style="width: 100%;
            height: 100%;
            resize: none;
            box-sizing: border-box;">${util.escapeHtml(initScript)}</textarea></div>
    </body>
</html>`
        );
        doc.close();

    }

    /**
     * @description Checks for the main window and creates it if it doesn't exist.
     * @returns {Window} - The main window instance.
     */
    this.checkAndCreateWindow = async function() {
        if (this.exist()) {
            console.log('Main window already exists. Focusing on it.');
            const win = window.top.multiAiChatMainWindow;
            win.focus();
            return win;
        }

        console.log('Creating new main window.');
        const newWindow = window.open('', this.MULTI_AI_CHAT_MAIN_WINDOW, 'width=1200,height=800');
        if (newWindow) {
            window.top.multiAiChatMainWindow = newWindow;

            // 在父窗口监听子窗口的错误
            newWindow.onerror = function (msg, url, lineNo, columnNo, error) {
                console.log('子窗口错误:', { msg, url, lineNo, columnNo, error });
                return true;
            };

            this.createWindow(newWindow.document);
            console.log('Main window created.');
        }
        return newWindow;
    };
}

module.exports = SyncChatWindow;