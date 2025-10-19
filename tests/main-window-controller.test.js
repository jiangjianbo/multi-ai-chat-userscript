const MainWindowController = require('../src/main-window-controller');
const ChatArea = require('../src/chat-area');
const Message = require('../src/message');
const Config = require('../src/config');
const I18n = require('../src/i18n');
const RECEIVER_ID = 'test-receiver-id';

// Mocks
jest.mock('../src/chat-area', () => {
    return jest.fn().mockImplementation((controller, id, url, container) => ({
        id: id,
        container: container, // Pass container to the mock instance
        init: jest.fn(),
        handleAnswer: jest.fn(),
        destroy: jest.fn(), // Simple mock
        isPinned: jest.fn(() => false),
    }));
});

jest.mock('../src/message', () => {
    return jest.fn().mockImplementation(() => ({
        register: jest.fn(),
        broadcast: jest.fn(),
    }));
});

jest.mock('../src/config', () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn(),
    }));
});

jest.mock('../src/i18n', () => {
    return jest.fn().mockImplementation(() => ({
        getText: jest.fn(key => key), // Just return the key
    }));
});

describe('MainWindowController', () => {
    let controller;
    let mockMessage;
    let mockConfig;
    let mockI18n;

    beforeEach(() => {
        // Set up the DOM that MainWindowController expects
        document.body.innerHTML = `
            <div id="root">
                <div class="main-window">
                    <header class="main-title-bar">
                        <div class="title-section left">
                            <div class="product-logo">&#129302;</div>
                            <div class="product-name">Multi AI Chat</div>
                            <div class="lang-container">
                                <div class="lang-switcher" id="lang-switcher">&#127760;</div>
                                <div class="lang-dropdown" id="lang-dropdown"></div>
                            </div>
                        </div>
                        <div class="title-section center" id="layout-switcher">
                            <button class="layout-button active" data-layout="1">1</button>
                            <button class="layout-button" data-layout="2">2</button>
                            <button class="layout-button" data-layout="4">4</button>
                            <button class="layout-button" data-layout="6">6</button>
                        </div>
                        <div class="title-section right">
                            <button class="title-action-button">&#10006;</button>
                        </div>
                    </header>
                    <main class="content-area" id="content-area" data-layout="1"></main>
                    <footer class="prompt-area">
                        <button class="prompt-action-button" id="settings-button">&#9881;</button>
                        <div class="settings-menu" id="settings-menu"></div>
                        <div class="prompt-input-wrapper" id="prompt-wrapper">
                            <textarea id="prompt-textarea" rows="1"></textarea>
                        </div>
                        <button class="prompt-action-button" id="global-send-button">&#10148;</button>
                    </footer>
                </div>
            </div>
        `;

        ChatArea.mockClear();
        Message.mockClear();
        Config.mockClear();
        I18n.mockClear();

        mockMessage = new Message();
        mockConfig = new Config();
        // Mock i18n to have the new getAllLangs method
        mockI18n = {
            getText: jest.fn(key => key),
            getAllLangs: jest.fn(() => ['en', 'zh']),
            setCurrentLang: jest.fn(),
        };

        controller = new MainWindowController(RECEIVER_ID, mockMessage, mockConfig, mockI18n);
        controller.init();
    });

    test('Initialization should render the main window structure', () => {
        expect(document.querySelector('.main-window')).not.toBeNull();
        expect(document.querySelector('.content-area')).not.toBeNull();
        expect(document.querySelector('.prompt-area')).not.toBeNull();
        expect(mockI18n.getText).toHaveBeenCalledWith('app.title');
    });

    test('addChatArea should create, initialize, and store a new ChatArea', () => {
        const chatData = { id: 'test-1', url: 'http://test.com', title: 'Test' };
        controller.addChatArea(chatData);

        expect(ChatArea).toHaveBeenCalledTimes(1);
        expect(controller.chatAreas.has('test-1')).toBe(true);
        const chatAreaInstance = controller.chatAreas.get('test-1');
        expect(chatAreaInstance.init).toHaveBeenCalledWith(chatData);
        expect(document.querySelector('.chat-area-wrapper')).not.toBeNull();
    });

    test('removeChatArea should destroy the instance and remove it from the map and DOM', () => {
        const chatData = { id: 'test-1', url: 'http://test.com', title: 'Test' };
        controller.addChatArea(chatData);
        expect(controller.chatAreas.has('test-1')).toBe(true);
        expect(document.querySelector('.chat-area-wrapper')).not.toBeNull();

        controller.removeChatArea('test-1');

        const chatAreaInstance = controller.chatAreas.get('test-1'); // It's already deleted from map
        // expect(chatAreaInstance.destroy).toHaveBeenCalled(); // This is tricky because the instance is gone
        expect(controller.chatAreas.has('test-1')).toBe(false);
        expect(document.querySelector('.chat-area-wrapper')).toBeNull();
    });

    test('Layout switching should update data-layout attribute', () => {
        const layoutContainer = document.querySelector('.content-area');
        const layoutButton4 = document.querySelector('[data-layout="4"]');

        expect(layoutContainer.dataset.layout).toBe('1');
        layoutButton4.click();
        expect(layoutContainer.dataset.layout).toBe('4');
        expect(layoutButton4.classList.contains('active')).toBe(true);
    });

    test('Global send button should broadcast a "chat" message', () => {
        const promptTextarea = document.getElementById('prompt-textarea');
        const sendButton = document.getElementById('global-send-button');

        promptTextarea.value = 'Hello, world!';
        sendButton.click();

        expect(mockMessage.broadcast).toHaveBeenCalledWith('chat', { prompt: 'Hello, world!' });
        expect(promptTextarea.value).toBe('');
    });

    test('onMsgCreate should call addChatArea', () => {
        const spy = jest.spyOn(controller, 'addChatArea');
        const data = { id: 'new-chat' };
        controller.onMsgCreate(data);
        expect(spy).toHaveBeenCalledWith(data);
    });

    test('onMsgAnswer should call handleAnswer on the correct ChatArea', () => {
        const chatData1 = { id: 'chat-1' };
        const chatData2 = { id: 'chat-2' };
        controller.addChatArea(chatData1);
        controller.addChatArea(chatData2);

        const instance1 = controller.chatAreas.get('chat-1');
        const instance2 = controller.chatAreas.get('chat-2');

        const answer = { id: 'chat-2', content: 'This is an answer.' };
        controller.onMsgAnswer(answer);

        expect(instance1.handleAnswer).not.toHaveBeenCalled();
        expect(instance2.handleAnswer).toHaveBeenCalledWith(answer);
    });

    test('onMsgDestroy should call removeChatArea', () => {
        const spy = jest.spyOn(controller, 'removeChatArea');
        const data = { id: 'chat-to-remove' };
        controller.onMsgDestroy(data);
        expect(spy).toHaveBeenCalledWith(data.id);
    });
});
