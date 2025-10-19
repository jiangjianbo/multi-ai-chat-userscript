const ChatArea = require('../src/chat-area');
const Utils = require('../src/util');

// Mock the main controller
const mockMainController = {
    removeChatArea: jest.fn(),
};

// Mock data for a chat area instance
const instanceData = {
    id: 'test-id-1',
    providerName: 'TestModel',
    params: { webAccess: true, longThought: false },
    conversation: [
        { type: 'question', content: 'Hello?' },
        { type: 'answer', content: 'Hi there!' },
    ]
};

describe('ChatArea Module', () => {
    let container, chatArea;

    beforeEach(() => {
        // Set up a DOM environment for each test that mimics the real structure
        document.body.innerHTML = `
            <div id="main-content-area">
                <div class="chat-area-wrapper">
                    <div id="test-container"></div>
                </div>
            </div>
        `;
        container = document.getElementById('test-container');
        
        // Clear mocks
        mockMainController.removeChatArea.mockClear();

        // Create a new ChatArea instance
        chatArea = new ChatArea(mockMainController, 'test-id-1', 'http://example.com', container);
        chatArea.init(instanceData);
    });

    test('1. Initialization: should render the full UI structure', () => {
        expect(container.querySelector('.chat-area-instance')).not.toBeNull();
        expect(container.querySelector('.chat-area-title')).not.toBeNull();
        expect(container.querySelector('.model-name').textContent).toContain('TestModel');
        expect(container.querySelectorAll('.message-bubble').length).toBe(2);
        expect(container.querySelector('.input-placeholder')).not.toBeNull();
    });

    test('2. Content Display: addMessage should add a new bubble', () => {
        chatArea.addMessage('A new question', 'question');
        expect(container.querySelectorAll('.message-bubble').length).toBe(3);
        expect(container.querySelector('.chat-area-conversation').lastChild.textContent).toBe('A new question');
    });

    test('3. Close Function: clicking close button should call controller method', () => {
        const closeButton = container.querySelector('.close-button');
        closeButton.click();
        expect(mockMainController.removeChatArea).toHaveBeenCalledWith('test-id-1');
    });

    test('4. Input Area Logic: should show and dock on focus', () => {
        const placeholder = container.querySelector('.input-placeholder');
        const inputArea = container.querySelector('.chat-area-input');
        const textarea = container.querySelector('textarea');

        // Simulate hover to show
        const mouseEnterEvent = new MouseEvent('mouseenter');
        placeholder.dispatchEvent(mouseEnterEvent);
        expect(inputArea.classList.contains('visible')).toBe(true);

        // Simulate focus to dock
        textarea.focus();
        expect(inputArea.classList.contains('docked')).toBe(true);
    });

    test('5. Collapse/Expand: should toggle .collapsed class on all answers', () => {
        const collapseAllBtn = container.querySelector('.collapse-all');
        const expandAllBtn = container.querySelector('.expand-all');
        const answerBubble = container.querySelector('.message-bubble.answer');

        // Collapse
        collapseAllBtn.click();
        expect(answerBubble.classList.contains('collapsed')).toBe(true);

        // Expand
        expandAllBtn.click();
        expect(answerBubble.classList.contains('collapsed')).toBe(false);
    });
    
    test('6. Indexing: should generate correct number of index items', () => {
        const indexItems = container.querySelectorAll('.chat-area-index .index-item');
        const answerCount = instanceData.conversation.filter(m => m.type === 'answer').length;
        expect(indexItems.length).toBe(answerCount);
        expect(indexItems[0].textContent).toBe('1');
    });
});
