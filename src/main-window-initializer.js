const Util = require('./util')
const Storage = require('./storage')
const Config = require('./config')
const I18n = require('./i18n')
const Message = require('./message')
const DriverFactory = require('./driver-factory')
const ChatArea = require('./chat-area')
const MainWindowController = require('./main-window-controller')
const resources = require('./lang');

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
    }
}

new MainWindowInitializer();