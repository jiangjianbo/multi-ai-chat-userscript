
const Util = require('./util');
const { GenericPageDriver } = require('./page-driver');


class GeminiPageDriver extends GeminiPageDriver {

    constructor() {
        super();
        const geminiSelectors = {
            // ... Gemini 对应的选择器 (占位)
            promptInput: 'input-container div.input-area rich-textarea',
            sendButton: '',
            questions: 'div#chat-history div.conversation-container div.query-content',
            answers: 'div#chat-history div.response-content message-content',
            conversationArea: 'div#chat-history',
            chatTitle: '',
            historyItems: 'div.conversation-title',
            newSessionButton: 'side-nav-action-button button',
            webAccessOption: '',
            longThoughtOption: '',
            modelVersionList: 'div.mat-mdc-menu-panel div.mat-mdc-menu-content > button.mat-mdc-menu-item span.mat-mdc-menu-item-text div.title-and-description > span.mode-desc.gds-label-m-alt',
            currentModelVersion: 'bard-mode-switcher button.mdc-button > span.mdc-button__label > div > span',

            modelVersionButton: 'bard-mode-switcher button.mdc-button',
            optionButton: '' //'toolbox-drawer div.toolbox-drawer-button-container button'
        };
        this.selectors = Object.assign({}, this.selectors, geminiSelectors);

        this.providerName = 'Gemini';
    }
}


module.exports = {
    GeminiPageDriver
};
