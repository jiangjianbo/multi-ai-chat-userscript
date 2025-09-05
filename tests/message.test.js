
import MessageNotifier from '../src/message-notifier';

// Mock BroadcastChannel
const mockPostMessage = jest.fn();
global.BroadcastChannel = jest.fn(() => ({
    postMessage: mockPostMessage,
    onmessage: null,
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

    it('should register onMsg* methods as handlers', () => {
        const handlerObject = {
            onMsgTest: jest.fn(),
            onMsgAnother: jest.fn(),
            notAHandler: () => {},
        };

        notifier.register(handlerObject);

        expect(notifier.messageHandlers['test']).toBeDefined();
        expect(notifier.messageHandlers['another']).toBeDefined();
        expect(notifier.messageHandlers['notahandler']).toBeUndefined();
    });

    it('should call the correct handler when a message is received', () => {
        const testHandler = jest.fn();
        notifier.messageHandlers['test'] = testHandler;

        // Simulate receiving a message
        const messageEvent = { data: { type: 'test', data: { payload: 'abc' } } };
        notifier.broadcastChannel.onmessage(messageEvent);

        expect(testHandler).toHaveBeenCalledWith({ payload: 'abc' });
    });

    it('should send a message via BroadcastChannel', () => {
        const messageData = { id: 1, text: 'hello' };
        notifier.send('greeting', messageData);

        expect(mockPostMessage).toHaveBeenCalledWith({
            type: 'greeting',
            data: messageData,
        });
    });

    it('should send a message via postMessage to a target window', () => {
        const mockTargetWindow = {
            postMessage: jest.fn(),
        };
        const messageData = { id: 2, text: 'direct' };
        
        notifier.send('direct_message', messageData, mockTargetWindow);

        expect(mockTargetWindow.postMessage).toHaveBeenCalledWith(
            { type: 'direct_message', data: messageData },
            '*'
        );
        expect(mockPostMessage).not.toHaveBeenCalled();
    });
});
