const ChatArea = require('../src/chat-area');
const Util = require('../src/util'); // Use the real Util for rendering

// JSDOM doesn't implement scrollIntoView, so we mock it.
Element.prototype.scrollIntoView = jest.fn();

// Helper to dispatch events
function fireEvent(element, eventName) {
    const event = new MouseEvent(eventName, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
}


describe('ChatArea', () => {
    let chatArea;
    let mockMainController;
    let container;

    beforeEach(() => {
        // Setup a container in the JSDOM
        container = document.createElement('div');
        document.body.appendChild(container);

        const util = new Util();

        // Mock the main controller
        mockMainController = {
            removeChatArea: jest.fn(),
            message: {
                send: jest.fn(),
            },
            util: util, // Provide an instance of Util
        };

        chatArea = new ChatArea(mockMainController, 'test-id', 'http://test.com', container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('1. Initialization should render the full UI structure', () => {
        chatArea.init();
        expect(container.querySelector('.chat-area')).not.toBeNull();
        expect(container.querySelector('.chat-area-header .model-name').textContent).toBe('test-id');
        expect(container.querySelector('.input-wrapper.collapsed')).not.toBeNull();
    });

    test('2. Content display should add message bubbles', () => {
        chatArea.init();
        chatArea.addMessage('A question', 'question');
        const questionBubble = container.querySelector('.message-bubble.question');
        expect(questionBubble).not.toBeNull();
        expect(questionBubble.textContent).toBe('A question');

        chatArea.handleAnswer({ content: 'An answer' });
        const answerBubble = container.querySelector('.message-bubble.answer');
        expect(answerBubble).not.toBeNull();
        expect(answerBubble.textContent).toBe('An answer');
    });

    test('3. Close button should call removeChatArea on the controller', () => {
        chatArea.init();
        const closeButton = container.querySelector('.close-btn');
        fireEvent(closeButton, 'click');
        expect(mockMainController.removeChatArea).toHaveBeenCalledWith('test-id');
    });

    test('6. Sending a message should call message.send on the controller', () => {
        chatArea.init();
        const promptInput = container.querySelector('.prompt-input');
        const sendButton = container.querySelector('.send-btn');

        promptInput.value = 'Hello there';
        fireEvent(sendButton, 'click');

        expect(mockMainController.message.send).toHaveBeenCalledWith('chat', {
            id: 'test-id',
            content: 'Hello there',
        });
        // It should also add the question to its own view
        expect(container.querySelector('.message-bubble.question').textContent).toBe('Hello there');
    });

    test('7. Conversation index should be created and clickable', () => {
        chatArea.init();
        chatArea.handleAnswer({ content: 'First answer' });
        chatArea.handleAnswer({ content: 'Second answer' });

        const indexItems = container.querySelectorAll('.index-item');
        expect(indexItems.length).toBe(2);
        expect(indexItems[1].textContent).toBe('2');

        const answerBubbles = container.querySelectorAll('.message-bubble.answer');
        const scrollIntoViewSpy = jest.spyOn(answerBubbles[1], 'scrollIntoView');
        
        fireEvent(indexItems[1], 'click');
        expect(scrollIntoViewSpy).toHaveBeenCalled();
    });

    test('9. Destroy should clear the container', () => {
        chatArea.init();
        expect(container.innerHTML).not.toBe('');
        chatArea.destroy();
        expect(container.innerHTML).toBe('');
    });

    // Note: Testing the complex hover/focus/blur logic of the input area is tricky
    // in JSDOM as it doesn't fully support layout-related properties and events.
    // These are better suited for E2E tests, but we can test the class changes.
    test('5. Input area should change classes on interaction', () => {
        chatArea.init();
        const inputWrapper = container.querySelector('.input-wrapper');
        const placeholder = container.querySelector('.input-placeholder');
        const promptInput = container.querySelector('.prompt-input');

        // Initial state
        expect(inputWrapper.classList.contains('collapsed')).toBe(true);

        // Hover placeholder to show floating
        fireEvent(placeholder, 'mouseover');
        expect(inputWrapper.classList.contains('collapsed')).toBe(false);
        expect(inputWrapper.classList.contains('floating')).toBe(true);

        // Focus input to embed
        promptInput.focus();
        expect(inputWrapper.classList.contains('floating')).toBe(false);
        expect(inputWrapper.classList.contains('embedded')).toBe(true);
    });
});
