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

    test('7. updateOption should update webAccess checkbox', () => {
        const checkbox = container.querySelector(`#web-access-test-id-1`);
        expect(checkbox.checked).toBe(true); // Initial value from instanceData

        chatArea.updateOption('webAccess', false);
        expect(checkbox.checked).toBe(false);

        chatArea.updateOption('webAccess', true);
        expect(checkbox.checked).toBe(true);
    });

    test('8. updateOption should update longThought checkbox', () => {
        const checkbox = container.querySelector(`#long-thought-test-id-1`);
        expect(checkbox.checked).toBe(false); // Initial value from instanceData

        chatArea.updateOption('longThought', true);
        expect(checkbox.checked).toBe(true);
    });

    test('9. updateModelVersion should update existing option', () => {
        const select = container.querySelector('.params-dropdown select');
        // Initial options are from instanceData.params.models (empty array)
        // Add a test option first
        const option = document.createElement('option');
        option.value = 'v1.0';
        option.textContent = 'v1.0';
        select.appendChild(option);

        chatArea.updateModelVersion('v1.0');
        expect(select.value).toBe('v1.0');
    });

    test('10. updateModelVersion should add new option if not exists', () => {
        const select = container.querySelector('.params-dropdown select');
        const initialOptionCount = select.options.length;

        chatArea.updateModelVersion('v2.0');
        expect(select.options.length).toBe(initialOptionCount + 1);
        expect(select.value).toBe('v2.0');

        // Verify the option was added
        const addedOption = Array.from(select.options).find(opt => opt.value === 'v2.0');
        expect(addedOption).toBeDefined();
        expect(addedOption.textContent).toBe('v2.0');
    });

    test('11. addQuestion should add a question message bubble', () => {
        const initialCount = container.querySelectorAll('.message-bubble.question').length;
        chatArea.addQuestion('What is AI?');
        expect(container.querySelectorAll('.message-bubble.question').length).toBe(initialCount + 1);
        expect(container.querySelector('.chat-area-conversation').lastChild.textContent).toContain('What is AI?');
    });

    test('12. addAnswer should add an answer message bubble and index item', () => {
        const initialAnswerCount = container.querySelectorAll('.message-bubble.answer').length;
        const initialIndexCount = container.querySelectorAll('.chat-area-index .index-item').length;

        chatArea.addAnswer('<p>AI is artificial intelligence.</p>');

        // Check answer bubble was added
        expect(container.querySelectorAll('.message-bubble.answer').length).toBe(initialAnswerCount + 1);

        // Check index item was added
        expect(container.querySelectorAll('.chat-area-index .index-item').length).toBe(initialIndexCount + 1);
    });

    test('13. handleAnswer should call addAnswer with content', () => {
        const spy = jest.spyOn(chatArea, 'addAnswer');
        const data = { content: '<p>Test answer content</p>' };
        chatArea.handleAnswer(data);
        expect(spy).toHaveBeenCalledWith('<p>Test answer content</p>');
        spy.mockRestore();
    });

    test('14. handleAnswer should handle missing content gracefully', () => {
        const spy = jest.spyOn(chatArea, 'addAnswer');
        chatArea.handleAnswer({});
        expect(spy).not.toHaveBeenCalled();
        spy.mockRestore();
    });

    test('15. newSession should clear conversation and index', () => {
        // Add some messages first
        chatArea.addQuestion('Test question');
        chatArea.addAnswer('Test answer');

        expect(container.querySelector('.chat-area-conversation').children.length).toBeGreaterThan(0);
        expect(container.querySelector('.chat-area-index').children.length).toBeGreaterThan(0);

        chatArea.newSession();

        expect(container.querySelector('.chat-area-conversation').innerHTML).toBe('');
        expect(container.querySelector('.chat-area-index').innerHTML).toBe('');
    });

    test('16. getProvider should return current provider name', () => {
        const provider = chatArea.getProvider();
        expect(provider).toBe('TestModel');
    });

    test('17. getUrl should return current URL', () => {
        const url = chatArea.getUrl();
        expect(url).toBe('http://example.com');
    });

    test('18. setWebAccess should update checkbox state', () => {
        const checkbox = container.querySelector(`#web-access-test-id-1`);
        chatArea.setWebAccess(false);
        expect(checkbox.checked).toBe(false);
        chatArea.setWebAccess(true);
        expect(checkbox.checked).toBe(true);
    });

    test('19. setLongThought should update checkbox state', () => {
        const checkbox = container.querySelector(`#long-thought-test-id-1`);
        chatArea.setLongThought(true);
        expect(checkbox.checked).toBe(true);
        chatArea.setLongThought(false);
        expect(checkbox.checked).toBe(false);
    });

    test('20. getModelVersion should return current model version', () => {
        const select = container.querySelector('.params-dropdown select');
        // Add an option first since the select starts empty
        const option = document.createElement('option');
        option.value = 'v1.0';
        option.textContent = 'v1.0';
        select.appendChild(option);
        select.value = 'v1.0';
        expect(chatArea.getModelVersion()).toBe('v1.0');
    });

    test('21. isPinned should return false by default', () => {
        expect(chatArea.isPinned()).toBe(false);
    });

    test('22. setPin should update pin state', () => {
        chatArea.setPin(true);
        expect(chatArea.isPinned()).toBe(true);
        expect(container.querySelector('.pin-button').classList.contains('pinned')).toBe(true);

        chatArea.setPin(false);
        expect(chatArea.isPinned()).toBe(false);
        expect(container.querySelector('.pin-button').classList.contains('pinned')).toBe(false);
    });
});
