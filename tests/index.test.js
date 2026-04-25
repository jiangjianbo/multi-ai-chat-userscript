// Define mock instances FIRST
const mockMainWindow = {
  init: jest.fn(),
};
const mockPageController = {
  init: jest.fn(),
};

// Mock the modules to return the mock instances
jest.mock('../src/main-window-controller', () => jest.fn().mockImplementation(() => mockMainWindow));
jest.mock('../src/page-controller', () => jest.fn().mockImplementation(() => mockPageController));
jest.mock('../src/tampermonkey-adaptor', () => {
    return jest.fn().mockImplementation(() => ({
        getCurrentWindowName: jest.fn(() => ''),
        onDocumentReady: jest.fn((callback, delay) => {
            // 立即执行回调，模拟 document ready
            setTimeout(callback, 0);
        }),
        createChannel: jest.fn(() => ({
            addEventListener: jest.fn(),
            postMessage: jest.fn(),
            close: jest.fn(),
        })),
    }));
});
jest.mock('../src/storage');
jest.mock('../src/config', () => {
    return jest.fn().mockImplementation(() => {
        return { get: jest.fn(() => 'multi-ai-chat') }; // Ensure config.get('channelName') returns a value
    });
});
jest.mock('../src/i18n');
jest.mock('../src/message');


describe('Application Entry Point (index.js)', () => {

    beforeEach(() => {
        // Reset modules to re-run index.js and clear all mock call history
        jest.resetModules();
        jest.clearAllMocks();
        document.body.innerHTML = ''; // Clear DOM
    });

    test('should do nothing if window.name is the main window name', () => {
        const MainWindowController = require('../src/main-window-controller');
        const PageController = require('../src/page-controller');

        // Mock adaptor to return main window name
        const TampermonkeyAdaptor = require('../src/tampermonkey-adaptor');
        TampermonkeyAdaptor.mockImplementation(() => ({
            getCurrentWindowName: jest.fn(() => 'multi-ai-chat-main-window'),
            onDocumentReady: jest.fn(),
        }));

        require('../src/index.js');

        expect(MainWindowController).not.toHaveBeenCalled();
        expect(PageController).not.toHaveBeenCalled();
    });

    test('should initialize PageController if window.name is not correct', () => {
        jest.useFakeTimers();
        const MainWindowController = require('../src/main-window-controller');
        const PageController = require('../src/page-controller');

        // Mock adaptor to return non-main window name
        const TampermonkeyAdaptor = require('../src/tampermonkey-adaptor');
        TampermonkeyAdaptor.mockImplementation(() => ({
            getCurrentWindowName: jest.fn(() => 'some-other-window'),
            onDocumentReady: jest.fn((callback) => {
                // 模拟 documentReady：直接执行回调
                callback();
            }),
            createChannel: jest.fn(() => ({
                addEventListener: jest.fn(),
                postMessage: jest.fn(),
                close: jest.fn(),
            })),
        }));

        require('../src/index.js');

        expect(PageController).toHaveBeenCalledTimes(1);
        expect(mockPageController.init).toHaveBeenCalledTimes(1);
        expect(MainWindowController).not.toHaveBeenCalled();
        jest.useRealTimers();
    });

    test('should initialize PageController if window.name is empty', () => {
        jest.useFakeTimers();
        const MainWindowController = require('../src/main-window-controller');
        const PageController = require('../src/page-controller');

        // Mock adaptor to return empty window name
        const TampermonkeyAdaptor = require('../src/tampermonkey-adaptor');
        TampermonkeyAdaptor.mockImplementation(() => ({
            getCurrentWindowName: jest.fn(() => ''),
            onDocumentReady: jest.fn((callback) => {
                callback();
            }),
            createChannel: jest.fn(() => ({
                addEventListener: jest.fn(),
                postMessage: jest.fn(),
                close: jest.fn(),
            })),
        }));

        require('../src/index.js');

        expect(PageController).toHaveBeenCalledTimes(1);
        expect(mockPageController.init).toHaveBeenCalledTimes(1);
        expect(MainWindowController).not.toHaveBeenCalled();
        jest.useRealTimers();
    });

});
