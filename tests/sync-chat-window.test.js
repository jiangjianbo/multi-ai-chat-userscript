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
                write: jest.fn(),
                close: jest.fn(),
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

    test('exist should return false if window does not exist', () => {
        expect(syncChatWindow.exist()).toBe(false);
    });

    test('exist should return false if window is closed', () => {
        window.top.multiAiChatMainWindow = { closed: true };
        expect(syncChatWindow.exist()).toBe(false);
    });

    test('exist should return true if window exists and is open', () => {
        window.top.multiAiChatMainWindow = { closed: false };
        expect(syncChatWindow.exist()).toBe(true);
    });

    test('createWindow should populate the document by calling write', () => {
        const doc = {
            title: '',
            write: jest.fn(),
            close: jest.fn(),
        };

        syncChatWindow.createWindow(doc, true); // ignoreScriptForTesting = true
        expect(doc.title).toBe('Multi-AI Sync Chat');
        expect(doc.write).toHaveBeenCalledTimes(1);
        expect(doc.write).toHaveBeenCalledWith(expect.stringContaining('<div id="root">'));
        expect(doc.close).toHaveBeenCalledTimes(1);
    });

    test('checkAndCreateWindow should create a new window if one does not exist', async () => {
        const newWin = await syncChatWindow.checkAndCreateWindow();
        expect(window.open).toHaveBeenCalledWith('', 'multi-ai-chat-main-window', 'width=1200,height=800');
        expect(newWin).toBe(mockWindow);
        expect(window.top.multiAiChatMainWindow).toBe(mockWindow);
    });

    test('checkAndCreateWindow should focus the existing window if it exists', async () => {
        window.top.multiAiChatMainWindow = mockWindow;
        const existingWin = await syncChatWindow.checkAndCreateWindow();
        expect(window.open).not.toHaveBeenCalled();
        expect(mockWindow.focus).toHaveBeenCalled();
        expect(existingWin).toBe(mockWindow);
    });
});
