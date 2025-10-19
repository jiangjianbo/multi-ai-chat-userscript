const SyncChatWindow = require('../src/sync-chat-window');

describe('SyncChatWindow', () => {
    let syncChatWindow;
    let mockWindow;

    beforeEach(() => {
        syncChatWindow = new SyncChatWindow();
        syncChatWindow.init();

        // Mock window.open and window.focus
        mockWindow = {
            document: {
                title: '',
                body: { innerHTML: '' },
                head: { appendChild: jest.fn() },
                createElement: jest.fn(() => ({})),
            },
            focus: jest.fn(),
            closed: false
        };
        window.open = jest.fn(() => mockWindow);
        window.top.multiAiChatMainWindow = undefined;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('1. exist should return false if window does not exist', () => {
        expect(syncChatWindow.exist()).toBe(false);
    });

    test('1. exist should return false if window is closed', () => {
        window.top.multiAiChatMainWindow = { closed: true };
        expect(syncChatWindow.exist()).toBe(false);
    });

    test('1. exist should return true if window exists and is open', () => {
        window.top.multiAiChatMainWindow = { closed: false };
        expect(syncChatWindow.exist()).toBe(true);
    });

    test('2. createWindow should populate the document', () => {
        const doc = {
            title: '',
            body: { innerHTML: '' },
            head: { appendChild: jest.fn() },
            createElement: jest.fn(() => ({})),
        };
        // Mock require, because it's used inside createWindow
        jest.mock('../src/util', () => 'function Util(){}', { virtual: true });
        jest.mock('../src/i18n', () => 'function I18n(){}', { virtual: true });
        jest.mock('../src/config', () => 'function Config(){}', { virtual: true });
        jest.mock('../src/storage', () => 'function Storage(){}', { virtual: true });
        jest.mock('../src/message', () => 'function Message(){}', { virtual: true });
        jest.mock('../src/chat-area', () => 'function ChatArea(){}', { virtual: true });
        jest.mock('../src/main-window-controller', () => 'function MainWindowController(){}', { virtual: true });
        jest.mock('../src/lang', () => '{}', { virtual: true });

        syncChatWindow.createWindow(doc);
        expect(doc.title).toBe('Multi-AI Sync Chat');
        expect(doc.body.innerHTML).toContain('<div id="root">');
        expect(doc.createElement).toHaveBeenCalledWith('style');
        expect(doc.head.appendChild).toHaveBeenCalled();
    });

    test('checkAndCreateWindow should create a new window if one does not exist', () => {
        const newWin = syncChatWindow.checkAndCreateWindow();
        expect(window.open).toHaveBeenCalledWith('', 'multi-ai-chat-main-window', 'width=1200,height=800');
        expect(newWin).toBe(mockWindow);
        expect(window.top.multiAiChatMainWindow).toBe(mockWindow);
    });

    test('checkAndCreateWindow should focus the existing window if it exists', () => {
        window.top.multiAiChatMainWindow = mockWindow;
        const existingWin = syncChatWindow.checkAndCreateWindow();
        expect(window.open).not.toHaveBeenCalled();
        expect(mockWindow.focus).toHaveBeenCalled();
        expect(existingWin).toBe(mockWindow);
    });
});
