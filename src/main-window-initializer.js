const Util = require('./util')
const Storage = require('./storage')
const Config = require('./config')
const I18n = require('./i18n')
const Message = require('./message')
const {DriverFactory} = require('./driver-factory')
const ChatArea = require('./chat-area')
const MainWindowController = require('./main-window-controller')
const resources = require('./lang');

// 导入所有驱动模块，触发它们的注册代码
require('./kimi-page-driver');
require('./gemini-page-driver');
require('./chatgpt-page-driver');

/**
 * 主窗口使用的完整代码和依赖全部放在这里，并且会在编译时候嵌入到主窗口的代码中，实现完整的页面功能。
 */
class MainWindowInitializer {
    constructor() {
        console.log("Main window initializer loading ...");

        // 加入错误处理
        window.onerror = (msg, src, line, col, err) => {
            console.error('Global error caught:\\n' + (err && err.stack || msg));
            return true;   // 阻止默认处理
        };
        window.addEventListener('unhandledrejection', e => {
            console.error('Unhandled rejection:\\n' + e.reason);
        });

        this.util = new Util();
        this.storage = new Storage();
        this.defaultConfig = { channelName: 'multi-ai-chat' };
        this.config = new Config(this.storage, this.defaultConfig);
        this.i18n = new I18n(this.config, resources);
        this.message = new Message(this.config.get('channelName'));

        this.mainWindowController = new MainWindowController(window.mainWindowName, this.message, this.config, this.i18n);
        this.mainWindowController.init();

        console.log("Main window initializer loaded.");
        debugger;
    }
}

// 因为嵌入在html中，所以直接 new 即可。
new MainWindowInitializer();