const Util = require('./util')
const Storage = require('./storage')
const Config = require('./config')
const I18n = require('./i18n')
const Message = require('./message')
const DriverFactory = require('./driver-factory')
const ChatArea = require('./chat-area')
const MainWindowController = require('./main-window-controller')
const resources = require('./lang');

function MainWindowInitializer() {
    console.log("Main window initializer loading ...");

    const util = new Util(); 
    const storage = new Storage();
    const defaultConfig = { channelName: 'multi-ai-chat' };
    const config = new Config(storage, defaultConfig);
    const i18n = new I18n(config, resources);
    const message = new Message(config.get('channelName'));

    const mainWindowController = new MainWindowController(window.mainWindowName, message, config, i18n);
    mainWindowController.init();

    console.log("Main window initializer loaded.");
}

MainWindowInitializer();