import GenericPageDriver from "./generic-page-driver";

/**
 * Kimi页面驱动
 * @constructor
 */
function KimiPageDriver() {
    GenericPageDriver.call(this);
    this.selectors = {
        ...this.selectors,
        inputArea: '#prompt-textarea',
        sendButton: '.send-button',
        chatHistory: '.chat-messages-container',
        messageItem: '.message-item',
        userMessage: '.user-message',
        aiMessage: '.assistant-message',
        newChatButton: '.new-chat-btn'
    };
}

/**
 * Gemini页面驱动
 * @constructor
 */
function GeminiPageDriver() {
    GenericPageDriver.call(this);
    //  Gemini特定选择器
    this.selectors = {
        ...this.selectors,
        inputArea: '.ql-editor',
        sendButton: '.send-button'
    };
}

/**
 * ChatGPT页面驱动
 * @constructor
 */
function ChatGPTPageDriver() {
    GenericPageDriver.call(this);
    // ChatGPT特定选择器
    this.selectors = {
        ...this.selectors,
        inputArea: '#prompt-textarea',
        sendButton: '[data-testid="send-button"]'
    };
}

export default {
    ChatGPTPageDriver, 
    KimiPageDriver,
    GeminiPageDriver
};
