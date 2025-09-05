
/**
 * @jest-environment jsdom
 */
import MainWindowController from '../src/main-window-controller';
import ChatArea from '../src/chat-area';

jest.mock('../src/utils');
// This mock is now safe and doesn't access out-of-scope variables.
jest.mock('../src/chat-area', () => {
    return jest.fn().mockImplementation(() => ({
        init: jest.fn(),
        element: {},
    }));
});
jest.mock('../src/message-notifier.js', () => {
    return jest.fn().mockImplementation(function() { this.register = jest.fn(); this.send = jest.fn(); return this; });
});

describe('MainWindowController', () => {
    it('should add a chat area without error', () => {
        const mainController = new MainWindowController();
        mainController.utils.$ = () => ({ appendChild: jest.fn(), style: {} });
        mainController.utils.$$ = () => [];
        global.localStorage = { setItem: jest.fn() };

        expect(() => {
            mainController.onMsgCreate({ url: 'http://test.com', tabId: 'tab1' });
        }).not.toThrow();
        expect(ChatArea).toHaveBeenCalledTimes(1);
    });
});
