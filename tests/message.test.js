const Message = require('../src/message');

// --- Mock BroadcastChannel ---
// This mock simulates the behavior of BroadcastChannel within a single process.
const channels = {};

class MockBroadcastChannel {
    constructor(name) {
        this.name = name;
        this.listeners = new Set();
        if (!channels[name]) {
            channels[name] = [];
        }
        channels[name].push(this);
    }

    addEventListener(event, listener) {
        if (event === 'message') {
            this.listeners.add(listener);
        }
    }

    removeEventListener(event, listener) {
        if (event === 'message') {
            this.listeners.delete(listener);
        }
    }

    postMessage(data) {
        const messageEvent = { data };
        channels[this.name].forEach(channelInstance => {
            // A channel does not send messages to itself
            if (channelInstance !== this) {
                channelInstance.listeners.forEach(listener => listener(messageEvent));
            }
        });
    }

    close() {
        const index = channels[this.name].indexOf(this);
        if (index > -1) {
            channels[this.name].splice(index, 1);
        }
        this.listeners.clear();
    }
}

global.BroadcastChannel = MockBroadcastChannel;
// --- End Mock ---

describe('Message Module', () => {
    const CHANNEL_NAME = 'test-channel';
    let message1, message2, message3;

    beforeEach(() => {
        // Clear any existing channels from previous tests
        if (channels[CHANNEL_NAME]) {
            channels[CHANNEL_NAME] = [];
        }
    });

    afterEach(() => {
        // Clean up instances
        if (message1) message1.close();
        if (message2) message2.close();
        if (message3) message3.close();
    });

    test('1. Sending a message with no subscribers should succeed', () => {
        message1 = new Message(CHANNEL_NAME);
        // No error should be thrown
        expect(() => message1.send('test', { info: 'data' })).not.toThrow();
    });

    test('2. A single subscriber should receive messages', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME);

        const subscriber = { onMsgTest: jest.fn() };
        message2.register('receiver1', subscriber);

        for (let i = 0; i < 10; i++) {
            message1.send('test', { count: i });
        }

        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(10);
        expect(subscriber.onMsgTest).toHaveBeenCalledWith({ count: 9 });
    });

    test('3. Two subscribers should both receive messages', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME);
        message3 = new Message(CHANNEL_NAME);

        const subscriber2 = { onMsgData: jest.fn() };
        const subscriber3 = { onMsgData: jest.fn() };
        message2.register('receiver2', subscriber2);
        message3.register('receiver3', subscriber3);

        message1.send('data', { payload: 'hello' });
        expect(subscriber2.onMsgData).toHaveBeenCalledTimes(1);
        expect(subscriber3.onMsgData).toHaveBeenCalledTimes(1);
        expect(subscriber2.onMsgData).toHaveBeenCalledWith({ payload: 'hello' });
        expect(subscriber3.onMsgData).toHaveBeenCalledWith({ payload: 'hello' });

        for (let i = 0; i < 10; i++) {
            message1.send('data', { count: i });
        }
        expect(subscriber2.onMsgData).toHaveBeenCalledTimes(11);
        expect(subscriber3.onMsgData).toHaveBeenCalledTimes(11);
    });

    test('4. A subscriber with two handlers should receive corresponding messages', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME);

        const subscriber = {
            onMsgInfo: jest.fn(),
            onMsgWarning: jest.fn(),
        };
        message2.register('receiver4', subscriber);

        message1.send('info', { detail: 'Startup complete' });
        message1.send('warning', { code: 502, text: 'Gateway offline' });

        expect(subscriber.onMsgInfo).toHaveBeenCalledTimes(1);
        expect(subscriber.onMsgInfo).toHaveBeenCalledWith({ detail: 'Startup complete' });

        expect(subscriber.onMsgWarning).toHaveBeenCalledTimes(1);
        expect(subscriber.onMsgWarning).toHaveBeenCalledWith({ code: 502, text: 'Gateway offline' });
    });

    test('Unregister should prevent a subscriber from receiving messages', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME);

        const subscriber = { onMsgTest: jest.fn() };
        message2.register('receiver5', subscriber);

        message1.send('test', { step: 1 });
        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(1);

        message2.unregister('receiver5');

        message1.send('test', { step: 2 });
        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(1); // Should not be called again
    });

    test('5. Targeted message should only be received by the intended receiver', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME); // For receiverA
        message3 = new Message(CHANNEL_NAME); // For receiverB

        const subscriberA = { onMsgTarget: jest.fn() };
        const subscriberB = { onMsgTarget: jest.fn() };

        message2.register('receiverA', subscriberA);
        message3.register('receiverB', subscriberB);

        // Send a message specifically to receiverA
        message1.send('target', { receiverId: 'receiverA', content: 'Hello Receiver A' });

        expect(subscriberA.onMsgTarget).toHaveBeenCalledTimes(1);
        expect(subscriberA.onMsgTarget).toHaveBeenCalledWith({ receiverId: 'receiverA', content: 'Hello Receiver A' });
        expect(subscriberB.onMsgTarget).not.toHaveBeenCalled();

        // Send a message specifically to receiverB
        message1.send('target', { receiverId: 'receiverB', content: 'Hello Receiver B' });

        expect(subscriberA.onMsgTarget).toHaveBeenCalledTimes(1); // Should still be 1
        expect(subscriberB.onMsgTarget).toHaveBeenCalledTimes(1);
        expect(subscriberB.onMsgTarget).toHaveBeenCalledWith({ receiverId: 'receiverB', content: 'Hello Receiver B' });
    });

    test('6. Broadcast message should be received by all registered receivers', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME); // For receiverA
        message3 = new Message(CHANNEL_NAME); // For receiverB

        const subscriberA = { onMsgBroadcast: jest.fn() };
        const subscriberB = { onMsgBroadcast: jest.fn() };

        message2.register('receiverA', subscriberA);
        message3.register('receiverB', subscriberB);

        // Send a broadcast message (no receiverId)
        message1.send('broadcast', { content: 'Hello Everyone' });

        expect(subscriberA.onMsgBroadcast).toHaveBeenCalledTimes(1);
        expect(subscriberA.onMsgBroadcast).toHaveBeenCalledWith({ content: 'Hello Everyone' });
        expect(subscriberB.onMsgBroadcast).toHaveBeenCalledTimes(1);
        expect(subscriberB.onMsgBroadcast).toHaveBeenCalledWith({ content: 'Hello Everyone' });
    });

    test('7. Listener should only receive messages for its registered type', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME);

        const subscriber = {
            onMsgTypeA: jest.fn(),
            onMsgTypeB: jest.fn(),
        };

        message2.register('receiverType', subscriber);

        message1.send('typeA', { content: 'Message for Type A' });
        message1.send('typeB', { content: 'Message for Type B' });
        message1.send('typeC', { content: 'Message for Type C' }); // Should not be received

        expect(subscriber.onMsgTypeA).toHaveBeenCalledTimes(1);
        expect(subscriber.onMsgTypeA).toHaveBeenCalledWith({ content: 'Message for Type A' });
        expect(subscriber.onMsgTypeB).toHaveBeenCalledTimes(1);
        expect(subscriber.onMsgTypeB).toHaveBeenCalledWith({ content: 'Message for Type B' });
    });

    test('8. Unregistering a receiverId should stop all its listeners from receiving messages', () => {
        message1 = new Message(CHANNEL_NAME);
        message2 = new Message(CHANNEL_NAME);

        const subscriber = { onMsgTest: jest.fn() };
        message2.register('receiverUnregister', subscriber);

        message1.send('test', { content: 'Before unregister' });
        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(1);

        message2.unregister('receiverUnregister');

        message1.send('test', { content: 'After unregister' });
        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(1); // Should not increase
    });
});
