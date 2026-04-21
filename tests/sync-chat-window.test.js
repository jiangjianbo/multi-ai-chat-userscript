const SyncChatWindow = require('../src/sync-chat-window');
const { toHtml, _addStyles } = require('./test-utils');

// 设置全局函数，用于修复源代码中的调用问题
global.toHtml = toHtml;
global._addStyles = _addStyles;

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
                getElementById: jest.fn(() => null), // 默认无内容（新空白窗口）
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

    test('checkAndCreateWindow should focus the existing window if it exists (cached ref)', async () => {
        window.top.multiAiChatMainWindow = mockWindow;
        const existingWin = await syncChatWindow.checkAndCreateWindow();
        expect(mockWindow.focus).toHaveBeenCalled();
        expect(existingWin).toBe(mockWindow);
    });

    test('checkAndCreateWindow should find existing window across tabs by checking document content', async () => {
        // 模拟跨标签页场景：window.top 没有缓存引用
        window.top.multiAiChatMainWindow = undefined;
        // window.open 返回已有主窗口（document 中有 #root 元素）
        const mockRootElement = {};
        mockWindow.document.getElementById = jest.fn(() => mockRootElement);

        const existingWin = await syncChatWindow.checkAndCreateWindow();

        expect(mockWindow.document.getElementById).toHaveBeenCalledWith('root');
        expect(mockWindow.focus).toHaveBeenCalled();
        expect(existingWin).toBe(mockWindow);
        expect(window.top.multiAiChatMainWindow).toBe(mockWindow);
    });

    test('checkAndCreateWindow should create new window when document has no root element', async () => {
        // 模拟 window.open 创建了空白窗口（无 #root）
        window.top.multiAiChatMainWindow = undefined;
        mockWindow.document.getElementById = jest.fn(() => null);

        const newWin = await syncChatWindow.checkAndCreateWindow();

        expect(mockWindow.document.write).toHaveBeenCalled();
        expect(newWin).toBe(mockWindow);
        expect(window.top.multiAiChatMainWindow).toBe(mockWindow);
    });

    test('checkAndCreateWindow should treat cross-origin error as new window', async () => {
        window.top.multiAiChatMainWindow = undefined;
        mockWindow.document.getElementById = jest.fn(() => {
            throw new DOMException('Blocked a frame with origin', 'SecurityError');
        });

        const newWin = await syncChatWindow.checkAndCreateWindow();

        expect(mockWindow.document.write).toHaveBeenCalled();
        expect(newWin).toBe(mockWindow);
    });
});
