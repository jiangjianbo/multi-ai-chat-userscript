const MainWindowController = require('../src/main-window-controller');
const ChatArea = require('../src/chat-area');
const Message = require('../src/message');
const MessageClient = require('../src/message-client');
const Config = require('../src/config');
const I18n = require('../src/i18n');
const RECEIVER_ID = 'test-receiver-id';

// Mocks
jest.mock('../src/driver-factory', () => ({
    DriverFactory: jest.fn().mockImplementation(() => ({
        getProviders: jest.fn(() => ['Kimi', 'Gemini', 'ChatGPT']),
        getProviderUrl: jest.fn((name) => `https://example.com/${name.toLowerCase()}`),
    })),
    registerDriver: jest.fn(),
}));

jest.mock('../src/chat-area', () => {
    return jest.fn().mockImplementation((mainController, pageId, url, container, i18n) => ({
        id: `chat-area-${pageId}`,
        pageId: pageId,
        container: container, // Pass container to the mock instance
        init: jest.fn(),
        handleAnswer: jest.fn(),
        destroy: jest.fn(), // Simple mock
        isPinned: jest.fn(() => false),
        setEventHandler: jest.fn(),
        closeDropdowns: jest.fn(),
        updateTitle: jest.fn(),
        updateOption: jest.fn(),
        addQuestion: jest.fn(),
        addAnswer: jest.fn(),
        updateModelVersion: jest.fn(),
        clearAndNewSession: jest.fn(),
        clearAllMessages: jest.fn(),
        setReadyForReUse: jest.fn(),
        getReadyForReUse: jest.fn(() => false),
        newSession: jest.fn(),
        getProvider: jest.fn(() => 'MockProvider'), // 添加 getProvider mock
    }));
});

jest.mock('../src/message', () => {
    return jest.fn().mockImplementation(() => ({
        register: jest.fn(),
        unregister: jest.fn(),
        send: jest.fn(),
    }));
});

jest.mock('../src/message-client');

jest.mock('../src/config', () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn(),
    }));
});

jest.mock('../src/i18n', () => {
    return jest.fn().mockImplementation(() => ({
        getText: jest.fn(key => key), // Just return the key
        getCurrentLang: jest.fn(() => 'en'),
        getAllLangs: jest.fn(() => ['en', 'zh']),
        setCurrentLang: jest.fn(),
    }));
});

describe('MainWindowController', () => {
    let controller;
    let mockMessage;
    let mockMsgClient;
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
                            <div class="product-name" data-lang-key="productName">Multi AI Chat</div>
                            <div class="lang-container">
                                <div class="lang-switcher" id="lang-switcher">&#127760;</div>
                                <div class="lang-dropdown" id="lang-dropdown"></div>
                            </div>
                            <button id="new-chat-button">New Chat</button>
                        </div>
                        <div class="title-section center" id="layout-switcher">
                            <button class="layout-button active" data-layout="1">1</button>
                            <button class="layout-button" data-layout="2">2</button>
                            <button class="layout-button" data-layout="4">4</button>
                            <button class="layout-button" data-layout="6">6</button>
                        </div>
                        <div class="title-section right">
                            <button id="main-window-close-button" class="title-action-button">&#10006;</button>
                        </div>
                    </header>
                    <main class="content-area" id="content-area" data-layout="1"></main>
                    <footer class="prompt-area">
                        <button class="prompt-action-button" id="settings-button">&#9881;</button>
                        <div class="settings-menu" id="settings-menu">
                            <div class="setting-item"><label for="web-access">Web Access</label><label class="switch"><input type="checkbox" id="web-access"></label></div>
                            <div class="setting-item"><label for="long-thought">Long Thought</label><label class="switch"><input type="checkbox" id="long-thought"></label></div>
                        </div>
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
        MessageClient.mockClear();
        Config.mockClear();
        I18n.mockClear();

        mockMessage = new Message();
        mockMsgClient = new MessageClient();
        mockConfig = new Config();
        mockI18n = new I18n();

        controller = new MainWindowController(RECEIVER_ID, mockMessage, mockConfig, mockI18n);
        controller.msgClient = mockMsgClient; // Replace with mock
        controller.init();
    });

    test('Initialization should render the main window structure', () => {
        expect(document.querySelector('.main-window')).not.toBeNull();
        expect(document.querySelector('.content-area')).not.toBeNull();
        expect(document.querySelector('.prompt-area')).not.toBeNull();
        expect(mockI18n.getText).toHaveBeenCalledWith('productName');
    });

    test('addChatArea should create, initialize, and store a new ChatArea', () => {
        const chatData = { id: 'page-test-1', url: 'http://test.com', title: 'Test', params: {} };
        controller.addChatArea(chatData);

        expect(ChatArea).toHaveBeenCalledTimes(1);
        expect(controller.chatAreas.has('page-test-1')).toBe(true);
        const chatAreaInstance = controller.chatAreas.get('page-test-1');
        expect(chatAreaInstance.init).toHaveBeenCalledWith(chatData);
        expect(document.querySelector('.chat-area-container')).not.toBeNull();
    });

    test('removeChatArea should destroy the instance and remove it from the map and DOM', () => {
        const chatData = { id: 'page-test-1', url: 'http://test.com', title: 'Test', params: {} };
        controller.addChatArea(chatData);
        expect(controller.chatAreas.has('page-test-1')).toBe(true);
        const container = controller.chatAreas.get('page-test-1').container;
        expect(container.parentElement).not.toBeNull();

        controller.removeChatArea('page-test-1');

        expect(controller.chatAreas.has('page-test-1')).toBe(false);
        expect(container.parentElement).toBeNull();
    });

    test('Layout switching should update data-layout attribute', () => {
        const layoutContainer = document.querySelector('.content-area');
        const layoutButton4 = document.querySelector('[data-layout="4"]');

        layoutButton4.click();
        expect(layoutContainer.dataset.layout).toBe('4');
        expect(layoutButton4.classList.contains('active')).toBe(true);
    });

    test('Global send button should call msgClient.chat', () => {
        const promptTextarea = document.getElementById('prompt-textarea');
        const sendButton = document.getElementById('global-send-button');

        promptTextarea.value = 'Hello, world!';
        sendButton.click();

        expect(mockMsgClient.chat).toHaveBeenCalledWith('Hello, world!');
        expect(promptTextarea.value).toBe('');
    });

    test('onMsgCreate should call addChatArea', () => {
        const spy = jest.spyOn(controller, 'addChatArea');
        const data = { id: 'page-new-chat', params: {} };
        controller.onMsgCreate(data);
        expect(spy).toHaveBeenCalledWith(data);
    });

    test('onMsgAnswer should call handleAnswer on the correct ChatArea', () => {
        const chatData1 = { id: 'page-chat-1', params: {} };
        const chatData2 = { id: 'page-chat-2', params: {} };
        controller.addChatArea(chatData1);
        controller.addChatArea(chatData2);

        const instance1 = controller.chatAreas.get('page-chat-1');
        const instance2 = controller.chatAreas.get('page-chat-2');

        const answer = { senderId: 'page-chat-2', content: 'This is an answer.' };
        controller.onMsgAnswer(answer);

        expect(instance1.handleAnswer).not.toHaveBeenCalled();
        expect(instance2.handleAnswer).toHaveBeenCalledWith(answer);
    });

    test('onMsgDestroy should call removeChatArea', () => {
        const spy = jest.spyOn(controller, 'removeChatArea');
        const data = { senderId: 'page-chat-to-remove' };
        controller.onMsgDestroy(data);
        expect(spy).toHaveBeenCalledWith(data.senderId);
    });

    // ... other tests for onMsg... remain the same

    test('_handleNewSession should call msgClient.thread with chatArea.pageId', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1', setReadyForReUse: jest.fn(), clearAllMessages: jest.fn() };
        controller._handleNewSession(mockChatArea, 'provider-x');
        expect(mockMsgClient.thread).toHaveBeenCalledWith('page-chat-1');
    });

    test('_handleShare should open new window with url and pageId as window name', () => {
        const mockWindow = { closed: false, focus: jest.fn() };
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(mockWindow);
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleShare(mockChatArea, 'http://share.url');
        expect(openSpy).toHaveBeenCalledWith('http://share.url', 'page-chat-1');
        expect(controller._shareWindowMap.get('http://share.url')).toBe(mockWindow);
        openSpy.mockRestore();
    });

    test('_handleShare should focus existing window instead of opening new one', () => {
        const mockWindow = { closed: false, focus: jest.fn() };
        controller._shareWindowMap.set('http://existing.url', mockWindow);
        const openSpy = jest.spyOn(window, 'open');
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleShare(mockChatArea, 'http://existing.url');
        expect(mockWindow.focus).toHaveBeenCalled();
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    test('_handleShare should reopen window if previous one is closed', () => {
        const closedWindow = { closed: true, focus: jest.fn() };
        controller._shareWindowMap.set('http://closed.url', closedWindow);
        const newMockWindow = { closed: false, focus: jest.fn() };
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(newMockWindow);
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleShare(mockChatArea, 'http://closed.url');
        expect(openSpy).toHaveBeenCalledWith('http://closed.url', 'page-chat-1');
        expect(controller._shareWindowMap.get('http://closed.url')).toBe(newMockWindow);
        openSpy.mockRestore();
    });

    test('_handleShare should do nothing when url is empty', () => {
        const openSpy = jest.spyOn(window, 'open');
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleShare(mockChatArea, '');
        controller._handleShare(mockChatArea, null);
        controller._handleShare(mockChatArea, undefined);
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    test('_handleParamChanged should call msgClient.sendParamChanged with chatArea.pageId', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleParamChanged(mockChatArea, 'key', 'new', 'old');
        expect(mockMsgClient.sendParamChanged).toHaveBeenCalledWith('page-chat-1', 'key', 'new', 'old');
    });

    test('_handlePromptSend should call msgClient.prompt with chatArea.pageId', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handlePromptSend(mockChatArea, 'Hello AI');
        expect(mockMsgClient.prompt).toHaveBeenCalledWith('page-chat-1', 'Hello AI');
    });

    test('_handleExport should call msgClient.export with chatArea.pageId', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleExport(mockChatArea);
        expect(mockMsgClient.export).toHaveBeenCalledWith('page-chat-1');
    });

    test('onMsgOptionChange should call updateOption on the correct ChatArea', () => {
        const chatData = { id: 'page-chat-1', params: {} };
        controller.addChatArea(chatData);
        const chatAreaInstance = controller.chatAreas.get('page-chat-1');

        const optionData = { senderId: 'page-chat-1', key: 'webAccess', value: true };
        controller.onMsgOptionChange(optionData);

        expect(chatAreaInstance.updateOption).toHaveBeenCalledWith('webAccess', true);
    });

    test('onMsgQuestion should call addQuestion on the correct ChatArea', () => {
        const chatData = { id: 'page-chat-1', params: {} };
        controller.addChatArea(chatData);
        const chatAreaInstance = controller.chatAreas.get('page-chat-1');

        const questionData = { senderId: 'page-chat-1', content: 'What is AI?' };
        controller.onMsgQuestion(questionData);

        expect(chatAreaInstance.addQuestion).toHaveBeenCalledWith('What is AI?');
    });

    test('onMsgModelVersionChange should call updateModelVersion on the correct ChatArea', () => {
        const chatData = { id: 'page-chat-1', params: {} };
        controller.addChatArea(chatData);
        const chatAreaInstance = controller.chatAreas.get('page-chat-1');

        const versionData = { senderId: 'page-chat-1', version: 'v2.0' };
        controller.onMsgModelVersionChange(versionData);

        expect(chatAreaInstance.updateModelVersion).toHaveBeenCalledWith('v2.0');
    });

    test('onMsgThread should call clearAndNewSession on the correct ChatArea', () => {
        const chatData = { id: 'page-chat-1', params: {} };
        controller.addChatArea(chatData);
        const chatAreaInstance = controller.chatAreas.get('page-chat-1');

        const threadData = { senderId: 'page-chat-1' };
        controller.onMsgThread(threadData);

        expect(chatAreaInstance.clearAndNewSession).toHaveBeenCalled();
    });

    test('_handleParamChanged should call msgClient.setModelVersion for modelVersion', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleParamChanged(mockChatArea, 'modelVersion', 'v2.0', 'v1.0');
        expect(mockMsgClient.setModelVersion).toHaveBeenCalledWith('page-chat-1', 'v2.0');
    });

    test('_handleParamChanged should call msgClient.setOption for webAccess', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleParamChanged(mockChatArea, 'webAccess', true, false);
        expect(mockMsgClient.setOption).toHaveBeenCalledWith('page-chat-1', 'webAccess', true);
    });

    test('_handleParamChanged should call msgClient.setOption for longThought', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleParamChanged(mockChatArea, 'longThought', true, false);
        expect(mockMsgClient.setOption).toHaveBeenCalledWith('page-chat-1', 'longThought', true);
    });

    test('_handleParamChanged should call msgClient.sendParamChanged for other parameters', () => {
        const mockChatArea = { id: 'chat-area-1', pageId: 'page-chat-1' };
        controller._handleParamChanged(mockChatArea, 'customParam', 'newValue', 'oldValue');
        expect(mockMsgClient.sendParamChanged).toHaveBeenCalledWith('page-chat-1', 'customParam', 'newValue', 'oldValue');
    });

    test('getUnavailableProviders should return providers used by other ChatAreas', () => {
        // Populate selectedProviders map directly (this is populated by addChatArea in real implementation)
        controller.selectedProviders.set('ProviderA', 'page-chat-1');
        controller.selectedProviders.set('ProviderB', 'page-chat-2');
        controller.selectedProviders.set('ProviderC', 'page-chat-3');

        const unavailable = controller.getUnavailableProviders('page-chat-1');
        expect(unavailable).toEqual(expect.arrayContaining(['ProviderB', 'ProviderC']));
        expect(unavailable).not.toContain('ProviderA');
    });

    test('updateDefaultLayout should set layout based on number of ChatAreas', () => {
        // Initially 0 areas
        controller.updateDefaultLayout();
        expect(document.querySelector('.content-area').dataset.layout).toBe('1');

        // Add 2 areas - should become layout 2
        controller.addChatArea({ id: 'page-chat-1', params: {} });
        controller.addChatArea({ id: 'page-chat-2', params: {} });
        expect(document.querySelector('.content-area').dataset.layout).toBe('2');

        // Add 2 more areas (total 4) - should become layout 4
        controller.addChatArea({ id: 'page-chat-3', params: {} });
        controller.addChatArea({ id: 'page-chat-4', params: {} });
        expect(document.querySelector('.content-area').dataset.layout).toBe('4');

        // Add 2 more areas (total 6) - should become layout 6
        controller.addChatArea({ id: 'page-chat-5', params: {} });
        controller.addChatArea({ id: 'page-chat-6', params: {} });
        expect(document.querySelector('.content-area').dataset.layout).toBe('6');
    });

    test('updateNewChatButtonState should disable button when layout is full', () => {
        const button = document.getElementById('new-chat-button');
        const layoutContainer = document.querySelector('.content-area');

        // Layout 1, 0 areas - button enabled
        layoutContainer.dataset.layout = '1';
        controller.chatAreas.clear();
        controller.updateNewChatButtonState();
        expect(button.disabled).toBe(false);

        // Layout 1, 1 area - button disabled
        controller.chatAreas.set('page-chat-1', {});
        controller.updateNewChatButtonState();
        expect(button.disabled).toBe(true);

        // Layout 2, 1 area - button enabled
        layoutContainer.dataset.layout = '2';
        controller.updateNewChatButtonState();
        expect(button.disabled).toBe(false);
    });

    describe('_handleProviderChanged for new chat flow', () => {
        test('should open new tab with _chatAreaId when ChatArea has no previous provider', () => {
            const openSpy = jest.spyOn(window, 'open').mockReturnValue({});
            const mockChatArea = {
                id: 'chat-area-1',
                pageId: 'page-new-123',
                url: null,
            };

            controller._handleProviderChanged(mockChatArea, 'Kimi', null);

            expect(openSpy).toHaveBeenCalledWith(
                'https://example.com/kimi?_chatAreaId=page-new-123',
                '_blank'
            );
            // URL 不在 _handleProviderChanged 中设置，等 PageController 注册时通过重新关联设置
            expect(mockChatArea.url).toBeNull();
            expect(mockMsgClient.changeProvider).not.toHaveBeenCalled();
            openSpy.mockRestore();
        });

        test('should open new tab with _chatAreaId when old provider is New Chat', () => {
            const openSpy = jest.spyOn(window, 'open').mockReturnValue({});
            const mockChatArea = {
                id: 'chat-area-1',
                pageId: 'page-new-456',
                url: null,
            };

            controller._handleProviderChanged(mockChatArea, 'Gemini', 'New Chat');

            expect(openSpy).toHaveBeenCalledWith(
                'https://example.com/gemini?_chatAreaId=page-new-456',
                '_blank'
            );
            expect(mockMsgClient.changeProvider).not.toHaveBeenCalled();
            openSpy.mockRestore();
        });

        test('should send changeProvider message when switching provider on existing ChatArea', () => {
            const mockChatArea = {
                id: 'chat-area-1',
                pageId: 'page-existing-1',
                url: 'https://example.com/kimi',
            };

            controller._handleProviderChanged(mockChatArea, 'Gemini', 'Kimi');

            expect(mockMsgClient.changeProvider).toHaveBeenCalledWith('page-existing-1', 'https://example.com/gemini');
            expect(mockChatArea.url).toBe('https://example.com/gemini');
        });
    });

    describe('addChatArea ChatArea re-association', () => {
        test('should re-associate existing ChatArea when url is null and real provider data arrives', () => {
            // 首先创建一个新建的 ChatArea（url=null，模拟 newChatButton 创建）
            const newChatArea = {
                id: 'chat-area-page-new-1',
                pageId: 'page-new-1',
                url: null,
                getUrl: jest.fn(() => null),
                init: jest.fn(),
                updateTitle: jest.fn(),
                setReadyForReUse: jest.fn(),
                getReadyForReUse: jest.fn(() => false),
                setEventHandler: jest.fn(),
                connectPage: jest.fn(),
                container: document.createElement('div'),
            };
            controller.chatAreas.set('page-new-1', newChatArea);

            // 模拟原生页面发送 create 消息，关联到同一个 ChatArea
            const providerData = {
                id: 'page-new-1',
                url: 'https://example.com/kimi',
                providerName: 'Kimi',
                title: 'New Chat',
                params: { webAccess: false, longThought: false, models: [], modelVersion: null },
                conversation: []
            };
            controller.addChatArea(providerData);

            expect(newChatArea.url).toBe('https://example.com/kimi');
            expect(newChatArea.init).toHaveBeenCalledWith(providerData);
            expect(newChatArea.updateTitle).toHaveBeenCalledWith('Kimi');
            expect(controller.selectedProviders.get('Kimi')).toBe('page-new-1');
        });
    });
});
