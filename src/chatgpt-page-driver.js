const Util = require('./util');
const { GenericPageDriver } = require('./page-driver');
const { DriverFactory, registerDriver } = require('./driver-factory');

/**
 * ChatGPT 页面驱动
 */
class ChatGPTPageDriver extends GenericPageDriver {
    constructor() {
        super();
    
        const chatGPTSelectors = {
            // ... ChatGPT 对应的选择器 (占位)
        };
        this.selectors = Object.assign({}, this.selectors, chatGPTSelectors);
        this.providerName = 'ChatGPT';
    }
}

registerDriver(ChatGPTPageDriver, 'ChatGPT', 'https://chat.openai.com', ['chat.openai.com']);


module.exports = {
    ChatGPTPageDriver
};
