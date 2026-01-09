const Util = require('./util');
const { GenericPageDriver } = require('./page-driver');


function ChatGPTPageDriver() {
    GenericPageDriver.call(this);
    const chatGPTSelectors = {
        // ... ChatGPT 对应的选择器 (占位)
    };
    this.selectors = Object.assign({}, this.selectors, chatGPTSelectors);
    this.providerName = 'ChatGPT';
}
//ChatGPTPageDriver.prototype = Object.create(GenericPageDriver.prototype);


module.exports = {
    ChatGPTPageDriver
};
