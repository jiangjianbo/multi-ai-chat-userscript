// Mock Utils globally before any imports that might use it
jest.mock('../src/utils.js', () => {
    return jest.fn().mockImplementation(() => ({
        getDefaultAiProviders: jest.fn().mockReturnValue([{ name: 'MockAI', url: 'mock.com' }]),
        createElement: jest.fn(() => ({
            innerHTML: '',
            querySelector: jest.fn(() => ({ addEventListener: jest.fn(), style: {}, classList: { remove: jest.fn() }, parentNode: { insertBefore: jest.fn() } })),
            addEventListener: jest.fn(),
        })),
        $: jest.fn(() => ({ addEventListener: jest.fn() })),
        isRTL: jest.fn().mockReturnValue(false),
        getLangText: jest.fn(key => key),
    }));
});

import ChatArea from '../src/chat-area.js';
import MainWindowController from '../src/main-window-controller.js';

jest.mock('../src/main-window-controller.js');
jest.mock('../src/message-notifier.js');

// This mock ensures that the constructor runs and methods are attached.
global.BroadcastChannel = jest.fn(() => ({ postMessage: jest.fn(), close: jest.fn() }));
jest.mock('../src/message-notifier.js', () => {
    const original = jest.requireActual('../src/message-notifier.js');
    return jest.fn().mockImplementation(function(...args) {
        original.default.call(this, ...args);
    });
});

describe('ChatArea', () => {
    it('should initialize without errors', () => {
        const mockMainController = new MainWindowController();
        const chatArea = new ChatArea(mockMainController, { id: 'chat1' });
        expect(() => chatArea.init()).not.toThrow();
    });
});