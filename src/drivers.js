import GenericPageDriver from "./generic-page-driver";

/**
 * Kimi页面驱动
 * @constructor
 */
function KimiPageDriver() {
    GenericPageDriver.call(this);
    // Kimi-specific selectors that override or extend GenericPageDriver's
    this.selectors = {
        ...this.selectors,
        inputArea: ['#prompt-textarea', ...this.selectors.inputArea],
        sendButton: ['.send-button', ...this.selectors.sendButton],
        chatHistory: ['.chat-messages-container', '.history-part', ...this.selectors.chatHistory],
        messageItem: ['.message-item', 'li', ...this.selectors.messageItem],
        userMessage: ['.user-content', ...this.selectors.userMessage],
        aiMessage: ['.assistant-message', '.chat-content-item-assistant', ...this.selectors.aiMessage],
        responseParagraph: ['.chat-name', ...this.selectors.responseParagraph],
        newChatButton: ['.new-chat-btn', ...this.selectors.newChatButton],
        sessionTitle: ['h2.session-title', ...this.selectors.sessionTitle]
    };
}

/**
 * Gemini页面驱动
 * @constructor
 */
function GeminiPageDriver() {
    GenericPageDriver.call(this);
    // Gemini-specific selectors that override or extend GenericPageDriver's
    this.selectors = {
        ...this.selectors,
        inputArea: ['.ql-editor', ...this.selectors.inputArea],
        sendButton: ['button[aria-label="发送"]', '.send-button', ...this.selectors.sendButton],
        chatHistory: ['.chat-history-scroll-container', '.conversations-container', ...this.selectors.chatHistory],
        messageItem: ['.conversation-container', '.conversation', ...this.selectors.messageItem],
        userMessage: ['.query-text', ...this.selectors.userMessage],
        aiMessage: ['.model-response-container', ...this.selectors.aiMessage],
        responseParagraph: ['.conversation-title', ...this.selectors.responseParagraph],
        newChatButton: ['button[data-test-id="new-chat-button"]', ...this.selectors.newChatButton],
        sessionTitle: ['h1.title', ...this.selectors.sessionTitle]
    };
}

/**
 * ChatGPT页面驱动
 * @constructor
 */
function ChatGPTPageDriver() {
    GenericPageDriver.call(this);
    // ChatGPT-specific selectors that override or extend GenericPageDriver's
    this.selectors = {
        ...this.selectors,
        inputArea: ['#prompt-textarea', ...this.selectors.inputArea],
        sendButton: ['[data-testid="send-button"]', ...this.selectors.sendButton],
        // Add other ChatGPT specific selectors if needed
    };
}

export default {
    ChatGPTPageDriver, 
    KimiPageDriver,
    GeminiPageDriver
};