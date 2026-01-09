const Util = require('./util');
const { GenericPageDriver } = require('./page-driver');


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



module.exports = {
    ChatGPTPageDriver
};
