const { SyncChatWindow, MainWindowController } = require('../src/sync-chat-window');

// --- Mocks for SyncChatWindow tests ---
const mockUtil = { toString: () => 'function Util(){}' };
const mockChatArea = { toString: () => 'function ChatArea(){}' };
const mockMessage = { toString: () => 'function Message(){}' };
const mockConfig = { toString: () => 'function Config(){}' };
const mockI18n = { toString: () => 'function I18n(){}' };
const mockStorage = { toString: () => 'function Storage(){}' };

// Replace requires in the module scope for SyncChatWindow to use mocks
jest.mock('./util', () => mockUtil, { virtual: true });
jest.mock('./chat-area', () => mockChatArea, { virtual: true });
jest.mock('./message', () => mockMessage, { virtual: true });
jest.mock('./config', () => mockConfig, { virtual: true });
jest.mock('./i18n', () => mockI18n, { virtual: true });
jest.mock('./storage', () => mockStorage, { virtual: true });


describe('SyncChatWindow', () => {
    let mockWindow;

    beforeEach(() => {
        mockWindow = {
            document: {
                body: { innerHTML: '' },
                write: jest.fn(),
                open: jest.fn(),
                close: jest.fn(),
            },
            focus: jest.fn(),
            closed: false,
        };
        global.window.open = jest.fn(() => mockWindow);
        global.alert = jest.fn();
    });

    test('1. exist() should return false initially and true after creation', () => {
        const scw = new SyncChatWindow();
        expect(scw.exist()).toBe(false);
        scw.checkAndCreateWindow();
        expect(scw.exist()).toBe(true);
    });

    test('2. createWindow() should write a full HTML structure to the doc', () => {
        const scw = new SyncChatWindow();
        scw.createWindow(mockWindow);
        expect(mockWindow.document.write).toHaveBeenCalledTimes(1);
        const writtenHtml = mockWindow.document.write.mock.calls[0][0];
        expect(writtenHtml).toContain('<html');
        expect(writtenHtml).toContain('id="app-container"');
        expect(writtenHtml).toContain('const MainWindowController');
    });
});


describe('MainWindowController', () => {
    let controller;
    let mockDeps;

    // --- Mocks for MainWindowController tests ---
    const MockChatArea = jest.fn().mockImplementation((controller, id, url, container) => ({
        id,
        init: jest.fn(() => {
            container.innerHTML = `Chat Area ${id}`;
        }),
        destroy: jest.fn(() => {
            container.remove();
        }),
        handleAnswer: jest.fn(),
    }));

    beforeEach(() => {
        document.body.innerHTML = '<div id="app-root"></div>';

        mockDeps = {
            message: { register: jest.fn(), send: jest.fn() },
            config: { get: jest.fn(), set: jest.fn() },
            i18n: { getText: jest.fn(key => key) },
            util: { $: (sel) => document.querySelector(sel) },
            ChatArea: MockChatArea,
        };

        // Mock return values
        mockDeps.config.get.mockReturnValue(2); // Default layout

        controller = new MainWindowController(mockDeps);
        // Manually set the container, as the full layout isn't rendered in tests
        document.body.innerHTML = '<div id="app-container"><main id="chat-area-container"></main></div>';
    });

    test('3. should create a ChatArea on "create" message', () => {
        controller.init();
        controller.onMsgCreate({ id: 'test1', url: 'http://a.com' });

        expect(MockChatArea).toHaveBeenCalledTimes(1);
        expect(controller.chatAreas.has('test1')).toBe(true);
        expect(document.querySelector('.chat-area-wrapper').textContent).toBe('Chat Area test1');
    });

    test('should call handleAnswer on the correct ChatArea for "answer" message', () => {
        controller.init();
        controller.onMsgCreate({ id: 'test1' });
        controller.onMsgCreate({ id: 'test2' });

        const chatArea1 = controller.chatAreas.get('test1');
        const chatArea2 = controller.chatAreas.get('test2');

        controller.onMsgAnswer({ id: 'test2', content: 'Hello' });

        expect(chatArea1.handleAnswer).not.toHaveBeenCalled();
        expect(chatArea2.handleAnswer).toHaveBeenCalledWith({ id: 'test2', content: 'Hello' });
    });

    test('4. should update layout when number of areas exceeds current layout', () => {
        mockDeps.config.get.mockReturnValue(2); // Start with layout 2
        controller.init();

        controller.onMsgCreate({ id: 'test1' });
        controller.onMsgCreate({ id: 'test2' });
        // Should not change layout yet
        expect(mockDeps.config.set).not.toHaveBeenCalled();

        controller.onMsgCreate({ id: 'test3' });
        // Now it should update to layout 4
        expect(mockDeps.config.set).toHaveBeenCalledWith('layout', 4);
    });
});
