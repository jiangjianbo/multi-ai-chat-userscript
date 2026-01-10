
const PageController = require('./page-controller');
const Util = require('./util');
const Message = require('./message');
const Config = require('./config');
const I18n = require('./i18n');
const Storage = require('./storage');

// 导入所有驱动模块，触发它们的注册代码
require('./kimi-page-driver');
require('./gemini-page-driver');
require('./chatgpt-page-driver');

/**
 * @description The entry point of the userscript.
 * It determines whether the current page is the main window or a target chat page,
 * and initializes the corresponding controller.
 */
function main() {
    const util = new Util();
    console.log('Multi AI Chat Userscript loaded.');

    // As per design/architect.md, window.name is used to identify the main window.
    if (window.name === 'multi-ai-chat-main-window') {
        console.log('Skip MainWindow');
    } else {
        util.documentReady(() => {
            console.log('Initializing PageController after delay...');
            const storage = new Storage();
            const defaultConfig = { channelName: 'multi-ai-chat' };
            const config = new Config(storage, defaultConfig);
            const resources = require('./lang');
            const i18n = new I18n(config, resources);
            const message = new Message(config.get('channelName'));
            const pageController = new PageController(message, config, i18n, util);
            pageController.init();
            console.log('PageController Initialized!');
        });
    }
}

// Run the main function
main();