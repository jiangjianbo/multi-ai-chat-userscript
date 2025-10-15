// Define mock instances FIRST
const mockMainWindow = {
  init: jest.fn(),
};
const mockPageController = {
  init: jest.fn(),
};

// Mock the modules to return the mock instances
jest.mock('../src/sync-chat-window', () => jest.fn().mockImplementation(() => mockMainWindow));
jest.mock('../src/page-controller', () => jest.fn().mockImplementation(() => mockPageController));

describe('Application Entry Point (index.js)', () => {

    beforeEach(() => {
        // Reset modules to re-run index.js and clear all mock call history
        jest.resetModules();
        jest.clearAllMocks();
    });

    test('should initialize MainWindowController if window.name is correct', () => {
        const MainWindowController = require('../src/sync-chat-window');
        const PageController = require('../src/page-controller');

        Object.defineProperty(window, 'name', { value: 'multi-ai-chat-main-window', writable: true });

        require('../src/index.js');

        expect(MainWindowController).toHaveBeenCalledTimes(1);
        expect(mockMainWindow.init).toHaveBeenCalledTimes(1);
        expect(PageController).not.toHaveBeenCalled();
    });

    test('should initialize PageController if window.name is not correct', () => {
        const MainWindowController = require('../src/sync-chat-window');
        const PageController = require('../src/page-controller');

        Object.defineProperty(window, 'name', { value: 'some-other-window', writable: true });

        require('../src/index.js');

        expect(PageController).toHaveBeenCalledTimes(1);
        expect(mockPageController.init).toHaveBeenCalledTimes(1);
        expect(MainWindowController).not.toHaveBeenCalled();
    });

    test('should initialize PageController if window.name is empty', () => {
        const MainWindowController = require('../src/sync-chat-window');
        const PageController = require('../src/page-controller');

        Object.defineProperty(window, 'name', { value: '', writable: true });

        require('../src/index.js');

        expect(PageController).toHaveBeenCalledTimes(1);
        expect(mockPageController.init).toHaveBeenCalledTimes(1);
        expect(MainWindowController).not.toHaveBeenCalled();
    });

});