const MainWindowController = require('../src/sync-chat-window');
const ChatArea = require('../src/chat-area');

// Mock the ChatArea module
jest.mock('../src/chat-area', () => {
    return jest.fn().mockImplementation((controller, id, url, container) => ({
        id: id,
        init: jest.fn(),
        addMessage: jest.fn(),
        destroy: jest.fn(() => controller.removeChatArea(id)),
    }));
});

describe('MainWindowController', () => {
    let controller;

    beforeEach(() => {
        // Reset the DOM and the mock before each test
        document.body.innerHTML = '';
        ChatArea.mockClear();

        // Create and initialize a new controller
        controller = new MainWindowController();
        controller.init();
    });

    test('1. Initialization: should render the main window structure', () => {
        expect(document.querySelector('.main-window')).not.toBeNull();
        expect(document.querySelector('.content-area')).not.toBeNull();
        expect(document.querySelector('.prompt-area')).not.toBeNull();
    });

    test('2. addChatArea: should create, initialize, and store a new ChatArea', () => {
        const mockData = { modelName: 'Test', params: {}, conversation: [] };
        controller.addChatArea('id-1', 'http://a.com', mockData);

        // Check if ChatArea constructor was called
        expect(ChatArea).toHaveBeenCalledTimes(1);

        // Check if it's stored in the map
        expect(controller.chatAreas.has('id-1')).toBe(true);

        // Check if the init method of the new instance was called
        const mockChatAreaInstance = controller.chatAreas.get('id-1');
        expect(mockChatAreaInstance.init).toHaveBeenCalledWith(mockData);

        // Check if a wrapper was added to the DOM
        expect(document.querySelector('.chat-area-wrapper')).not.toBeNull();
    });

    test('3. removeChatArea: should remove the instance from the map', () => {
        const mockData = { modelName: 'Test', params: {}, conversation: [] };
        controller.addChatArea('id-1', 'http://a.com', mockData);
        expect(controller.chatAreas.has('id-1')).toBe(true);

        // Simulate ChatArea calling its destroy sequence which calls removeChatArea
        const chatAreaInstance = controller.chatAreas.get('id-1');
        chatAreaInstance.destroy();

        expect(controller.chatAreas.has('id-1')).toBe(false);
    });

    test('4. routeMessage: should call addMessage on the correct instance', () => {
        const mockData = { modelName: 'Test', params: {}, conversation: [] };
        controller.addChatArea('id-1', 'http://a.com', mockData);
        controller.addChatArea('id-2', 'http://b.com', mockData);

        const chatArea1 = controller.chatAreas.get('id-1');
        const chatArea2 = controller.chatAreas.get('id-2');

        const message = { id: 'id-2', type: 'answer', content: 'Hello from B' };
        controller.routeMessage(message);

        expect(chatArea1.addMessage).not.toHaveBeenCalled();
        expect(chatArea2.addMessage).toHaveBeenCalledWith('Hello from B', 'answer');
    });

    test('5. Layout Switching: should update data-layout attribute on click', () => {
        const layoutContainer = document.querySelector('.content-area');
        const layoutButton4 = document.querySelector('[data-layout="4"]');

        expect(layoutContainer.dataset.layout).toBe('1'); // Initial

        layoutButton4.click();

        expect(layoutContainer.dataset.layout).toBe('4');
    });
});