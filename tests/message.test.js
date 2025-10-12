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
        message2.register(subscriber);

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
        message2.register(subscriber2);
        message3.register(subscriber3);

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
        message2.register(subscriber);

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
        message2.register(subscriber);

        message1.send('test', { step: 1 });
        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(1);

        message2.unregister(subscriber);

        message1.send('test', { step: 2 });
        expect(subscriber.onMsgTest).toHaveBeenCalledTimes(1); // Should not be called again
    });
});
