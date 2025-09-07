
import MessageNotifier from '../src/message-notifier.js';

// Mock BroadcastChannel with the new methods
const mockPostMessage = jest.fn();
const mockClose = jest.fn();
let onmessageerror = null;

global.BroadcastChannel = jest.fn(() => ({
    postMessage: mockPostMessage,
    close: mockClose,
    onmessage: null,
    set onmessageerror(handler) {
        onmessageerror = handler;
    },
    get onmessageerror() {
        return onmessageerror;
    }
}));

describe('MessageNotifier', () => {
    let notifier;
    const channelName = 'test-channel';

    beforeEach(() => {
        jest.clearAllMocks();
        notifier = new MessageNotifier(channelName);
    });

    it('should create a BroadcastChannel with the correct name', () => {
        expect(BroadcastChannel).toHaveBeenCalledWith(channelName);
    });

    it('should register onMsg* methods as normalized handlers', () => {
        const handlerObject = { onMsgTestMessage: jest.fn() };
        notifier.register(handlerObject);
        expect(notifier.messageHandlers['testmessage']).toBeDefined();
    });

    it('should call the correct handler, ignoring case and separators', () => {
        const handlerObject = {
            onMsgShareReturn: jest.fn(),
            onMsgAnotherTest: jest.fn(),
        };
        notifier.register(handlerObject);

        // Test underscore
        const messageEvent1 = { data: { type: 'share_return', data: { link: 'url' } } };
        notifier.broadcastChannel.onmessage(messageEvent1);
        expect(handlerObject.onMsgShareReturn).toHaveBeenCalledWith({ link: 'url' });

        // Test hyphen and case
        const messageEvent2 = { data: { type: 'ANOTHER-TEST', data: { val: 1 } } };
        notifier.broadcastChannel.onmessage(messageEvent2);
        expect(handlerObject.onMsgAnotherTest).toHaveBeenCalledWith({ val: 1 });
    });

    it('should send a message via BroadcastChannel', () => {
        notifier.send('greeting', { id: 1 });
        expect(mockPostMessage).toHaveBeenCalledWith({ type: 'greeting', data: { id: 1 } });
    });

    it('should log an error if sending fails', () => {
        const error = new Error('Failed to post');
        mockPostMessage.mockImplementationOnce(() => { throw error; });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        notifier.send('greeting', { id: 1 });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            `MessageNotifier (${channelName}) failed to send message:`,
            error
        );
        consoleErrorSpy.mockRestore();
    });

    it('should close the broadcast channel', () => {
        notifier.close();
        expect(mockClose).toHaveBeenCalled();
    });

    it('should have an onmessageerror handler', () => {
        expect(notifier.broadcastChannel.onmessageerror).toBeInstanceOf(Function);
    });
});
