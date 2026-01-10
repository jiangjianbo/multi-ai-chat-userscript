const Util = require('./util');
const { GenericPageDriver } = require('./page-driver');
const { DriverFactory, registerDriver } = require('./driver-factory');

/**
 * Kimi.ai 页面驱动
 */
class KimiPageDriver extends GenericPageDriver {

    constructor() {
        super();
        const kimiSelectors = {
            // ... Kimi.ai 对应的选择器 (占位)
            promptInput: 'div.chat-action > div.chat-editor > div.chat-input div.chat-input-editor',
            sendButton: 'div.chat-action > div.chat-editor > div.chat-editor-action div.send-button-container > div.send-button',
            questions: 'div.chat-content-item.chat-content-item-user div.segment-content div.segment-content-box',
            answers: 'div.chat-content-item.chat-content-item-assistant div.segment-content div.segment-content-box',
            answer_thinking: '.container-block .block-item',
            answer_result: '.markdown-container',
            conversationArea: '#app div.main div.layout-content-main div.chat-content-container',
            chatTitle: '#app div.main div.layout-header header.chat-header-content h2',
            historyItems: '.sidebar div.history-part ul li',
            newSessionButton: '#app aside div.sidebar-nav a.new-chat-btn',
            webAccessOption: 'body div.toolkit-popover > div.toolkit-container div.toolkit-item:nth-child(1) > div.search-switch > label > input',
            longThoughtOption: 'body div.toolkit-popover > div.toolkit-container div.toolkit-item:nth-child(2) > div.search-switch > label > input',
            modelVersionList: 'body div.models-popover div.models-container div.model-item div.model-name > span.name',
            currentModelVersion: '#app div.main div.chat-action > div.chat-editor > div.chat-editor-action div.current-model span.name',

            modelVersionButton: 'div.current-model',
            optionButton: 'div.toolkit-trigger-btn'
        };
        this.selectors = Object.assign({}, this.selectors, kimiSelectors);
        
        this.optionButton = this.util.$(this.selectors.optionButton);
        this.modelVersionButton = this.util.$(this.selectors.modelVersionButton);

        this.cachedWebAccess = null;
        this.cachedLongThought = null;
        this.cachedVersions = null;

        this.providerName = 'Kimi';
    }
    /**
     * @description Initializes the Kimi driver by performing async operations to cache elements.
     */
    async init() {
        // Initial caching for WebAccess and LongThought options
        if (this.optionButton) {
            await this.util.clickAndGet(this.optionButton, () => {
                this.cachedWebAccess = this.util.getBoolean(this.util.$(this.selectors.webAccessOption));
                this.cachedLongThought = this.util.getBoolean(this.util.$(this.selectors.longThoughtOption));
            });

            // Add event listener to refresh cache on subsequent clicks
            this.optionButton.addEventListener('click', async () => {
                // A short delay to allow the popover to open
                await new Promise(resolve => setTimeout(resolve, 200));
                this.cachedWebAccess = this.util.getBoolean(this.util.$(this.selectors.webAccessOption));
                this.cachedLongThought = this.util.getBoolean(this.util.$(this.selectors.longThoughtOption));
            });
        }

        // Initial caching for Model Versions
        if (this.modelVersionButton) {
            await this.util.clickAndGet(this.modelVersionButton, () => {
                this.cachedVersions = Array.from(this.util.$(this.selectors.modelVersionList), node => node.textContent);
            });
        }
    }

    getWebAccessOption() {
        if (this.cachedWebAccess === null) {
            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
        }
        return this.cachedWebAccess;
    }

    getLongThoughtOption() {
        if (this.cachedLongThought === null) {
            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
        }
        return this.cachedLongThought;
    }

    getModelVersionList() {
        if (this.cachedVersions === null) {
            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
        }
        return this.cachedVersions;
    }
}

registerDriver(KimiPageDriver, 'Kimi', 'https://kimi.ai/chat', ['kimi.ai', 'www.kimi.com']);

module.exports = {
    KimiPageDriver
};
