
/**
 * @jest-environment jsdom
 */
import ChatArea from '../src/chat-area';
import MainWindowController from '../src/main-window-controller';
import Utils from '../src/utils';

global.BroadcastChannel = jest.fn(() => ({ postMessage: jest.fn() }));
jest.mock('../src/main-window-controller');
jest.mock('../src/utils');
// Correctly mock MessageNotifier to preserve the `register` method
jest.mock('../src/message-notifier.js', () => {
    return jest.fn().mockImplementation(function() {
        this.register = jest.fn();
        this.send = jest.fn();
    });
});

describe('ChatArea', () => {
    it('should initialize without errors', () => {
        Utils.mockImplementation(() => ({
            getDefaultAiProviders: jest.fn().mockReturnValue([{ name: 'Kimi', url: 'kimi.com' }]),
            isRTL: jest.fn().mockReturnValue(false),
            getLangText: jest.fn(key => key),
            createElement: jest.fn(() => ({ innerHTML: '', appendChild: jest.fn() })),
            $: jest.fn(() => ({ addEventListener: jest.fn(), classList: { toggle: jest.fn(), contains: jest.fn() }, focus: jest.fn() })),
        }));

        const chatArea = new ChatArea(new MainWindowController(), { id: 'chat1', url: 'kimi.com' });
        expect(() => chatArea.init()).not.toThrow();
    });
});
