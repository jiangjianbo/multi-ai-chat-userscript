const PageController = require('../src/page-controller');
const { DriverFactory } = require('../src/driver-factory');
const SyncChatWindow = require('../src/sync-chat-window');
const MessageClient = require('../src/message-client');

// Mocks
jest.mock('../src/driver-factory', () => ({
    DriverFactory: jest.fn().mockImplementation(() => ({
        createDriver: jest.fn(),
    })),
    registerDriver: jest.fn(),
}));
jest.mock('../src/sync-chat-window');
jest.mock('../src/message-client');

describe('PageController', () => {
    let pageController;
    let mockMessage, mockUtil, mockDriver, mockMsgClient;

    beforeEach(async () => {
        document.body.innerHTML = '';

        // Create a consistent mock driver instance for the factory to return
        mockDriver = {
            getChatTitle: jest.fn(() => 'Mock Title'),
            getProviderName: jest.fn(() => 'MockProvider'),
            getOptions: jest.fn(() => ({ webAccess: true })),
            getModelVersionList: jest.fn(() => ['v1', 'v2']),
            getCurrentModelVersion: jest.fn(() => 'v1'),
            getConversations: jest.fn(() => []),
            setPrompt: jest.fn(),
            send: jest.fn(),
            startMonitoring: jest.fn(),
            onAnswer: null,
            onChatTitle: null,
            onOption: null,
            onQuestion: null,
            onModelVersionChange: null,
            onNewSession: null,
            setOption: jest.fn(),
            setModelVersion: jest.fn(),
            newSession: jest.fn(),
            setAnswerStatus: jest.fn(),
            init: jest.fn().mockResolvedValue(undefined),
            // UI enhancement related methods
            elementConversationArea: jest.fn(() => null), // Return null during init to prevent UI injection in basic tests
            elementAnswers: jest.fn(() => []),
            elementQuestion: jest.fn(() => null),
            getAnswerStatus: jest.fn(() => false),
            elementAnswer: jest.fn(() => null),
        };

        // Configure the factory mock to return our driver
        DriverFactory.mockImplementation(() => ({
            createDriver: () => mockDriver,
        }));

        SyncChatWindow.mockImplementation(() => ({
            checkAndCreateWindow: jest.fn().mockResolvedValue(undefined),
        }));
        
        mockMessage = { register: jest.fn(), send: jest.fn() };
        mockMsgClient = new MessageClient();
        mockUtil = {
            toHtml: jest.fn((json) => {
                if (typeof json === 'string') {
                    return document.createTextNode(json);
                }

                const el = document.createElement(json.tag);

                // Handle attributes
                for (const key in json) {
                    if (key.startsWith('@')) {
                        const attrName = key.substring(1);
                        let attrValue = json[key];
                        if (typeof attrValue === 'object' && attrValue !== null) {
                            attrValue = Object.entries(attrValue)
                                .map(([k, v]) => `${k}:${v}`)
                                .join(';');
                        }
                        el.setAttribute(attrName, attrValue);
                    }
                }

                // Handle text content
                if (json.text) {
                    el.textContent = json.text;
                }

                // Handle children (child or children)
                const childNodes = json.children || json.child;
                if (childNodes) {
                    if (Array.isArray(childNodes)) {
                        childNodes.forEach(childJson => {
                            if (typeof childJson === 'string') {
                                el.appendChild(document.createTextNode(childJson));
                            } else {
                                el.appendChild(mockUtil.toHtml(childJson));
                            }
                        });
                    } else {
                        if (typeof childNodes === 'string') {
                            el.appendChild(document.createTextNode(childNodes));
                        } else {
                            el.appendChild(mockUtil.toHtml(childNodes));
                        }
                    }
                }

                return el;
            }),
            getText: jest.fn((element) => {
                if (!element) return '';
                if (element.value !== undefined) return element.value;
                return element.textContent || '';
            }),
        };

        pageController = new PageController(
            mockMessage,
            {},
            { getText: key => key },
            mockUtil
        );
        
        // Inject the mock message client
        pageController.msgClient = mockMsgClient;

        delete window.location;
        window.location = { hostname: 'test.com', href: 'http://localhost/' };

        await pageController.init();
    });

    test('init should initialize driver, UI, and listeners', () => {
        expect(pageController.driver).toBe(mockDriver);
        expect(document.getElementById('multi-ai-sync-btn')).not.toBeNull();
        expect(mockMessage.register).toHaveBeenCalledWith(pageController.pageId, pageController);
        expect(mockDriver.startMonitoring).toHaveBeenCalled();
        expect(mockDriver.onAnswer).toBeInstanceOf(Function);
    });

    test('Sync button click should create window and call msgClient.create', async () => {
        jest.useFakeTimers();
        const syncButton = document.getElementById('multi-ai-sync-btn');
        await syncButton.click();

        expect(pageController.syncChatWindow.checkAndCreateWindow).toHaveBeenCalled();
        
        jest.runAllTimers();

        expect(mockMsgClient.create).toHaveBeenCalledWith(expect.objectContaining({
            providerName: 'MockProvider',
            title: 'Mock Title',
        }));
        jest.useRealTimers();
    });

    test('onMsgChat should call driver methods', () => {
        pageController.onMsgChat({ content: 'test prompt' });
        expect(mockDriver.setPrompt).toHaveBeenCalledWith('test prompt');
        expect(mockDriver.send).toHaveBeenCalled();
    });

    test('Driver onAnswer callback should call msgClient.answer', () => {
        const mockElement = { innerHTML: 'Answer content' };
        mockDriver.onAnswer(1, mockElement);
        expect(mockMsgClient.answer).toHaveBeenCalledWith(pageController.pageId, 1, 'Answer content');
    });

    test('Driver onQuestion callback should call msgClient.question', () => {
        const mockElement = { textContent: 'Question content' };
        mockDriver.onQuestion(0, mockElement);
        expect(mockMsgClient.question).toHaveBeenCalledWith(pageController.pageId, 0, 'Question content');
    });

    test('Driver onModelVersionChange callback should call msgClient.modelVersionChange', () => {
        mockDriver.onModelVersionChange('v2');
        expect(mockMsgClient.modelVersionChange).toHaveBeenCalledWith(pageController.pageId, 'v2');
    });

    test('Driver onNewSession callback should call msgClient.newSession', () => {
        mockDriver.onNewSession();
        expect(mockMsgClient.newSession).toHaveBeenCalledWith(pageController.pageId);
    });

    test('onMsgNewSession should call driver.newSession', () => {
        pageController.onMsgNewSession({ id: pageController.pageId });
        expect(mockDriver.newSession).toHaveBeenCalled();
    });

    test('onMsgSetOption should call driver.setOption when id matches', () => {
        pageController.onMsgSetOption({ id: pageController.pageId, key: 'webAccess', value: true });
        expect(mockDriver.setOption).toHaveBeenCalledWith('webAccess', true);
    });

    test('onMsgSetOption should not call driver.setOption when id does not match', () => {
        pageController.onMsgSetOption({ id: 'other-page-id', key: 'webAccess', value: true });
        expect(mockDriver.setOption).not.toHaveBeenCalled();
    });

    test('onMsgSetModelVersion should call driver.setModelVersion when id matches', () => {
        pageController.onMsgSetModelVersion({ id: pageController.pageId, version: 'v2.0' });
        expect(mockDriver.setModelVersion).toHaveBeenCalledWith('v2.0');
    });

    test('onMsgSetModelVersion should not call driver.setModelVersion when id does not match', () => {
        pageController.onMsgSetModelVersion({ id: 'other-page-id', version: 'v2.0' });
        expect(mockDriver.setModelVersion).not.toHaveBeenCalled();
    });

    test('onMsgSetAnswerStatus should call driver.setAnswerStatus when id matches', () => {
        pageController.onMsgSetAnswerStatus({ id: pageController.pageId, index: 0, collapsed: true });
        expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(0, true);
    });

    test('onMsgSetAnswerStatus should not call driver.setAnswerStatus when id does not match', () => {
        pageController.onMsgSetAnswerStatus({ id: 'other-page-id', index: 0, collapsed: true });
        expect(mockDriver.setAnswerStatus).not.toHaveBeenCalled();
    });

    test('Driver onChatTitle callback should call msgClient.titleChange', () => {
        mockDriver.onChatTitle('New Title');
        expect(mockMsgClient.titleChange).toHaveBeenCalledWith(pageController.pageId, 'New Title');
    });

    test('Driver onOption callback should call msgClient.optionChange', () => {
        mockDriver.onOption('webAccess', false);
        expect(mockMsgClient.optionChange).toHaveBeenCalledWith(pageController.pageId, 'webAccess', false);
    });

    // UI Enhancement Tests
    describe('UI Enhancement Features', () => {
        let mockConversationArea;

        beforeEach(() => {
            // Clear document body
            document.body.innerHTML = '';

            // Create mock conversation area
            mockConversationArea = document.createElement('div');
            mockConversationArea.id = 'mock-conversation-area';
            document.body.appendChild(mockConversationArea);

            // Reset and mock driver to return the conversation area
            mockDriver.elementConversationArea = jest.fn(() => mockConversationArea);
            mockDriver.elementAnswers = jest.fn(() => []);
            mockDriver.elementQuestion = jest.fn((index) => null);
            mockDriver.getAnswerStatus = jest.fn(() => false);
            mockDriver.elementAnswer = jest.fn((index) => index === 0 ? document.createElement('div') : null);
        });

        afterEach(() => {
            if (mockConversationArea && mockConversationArea.parentNode) {
                mockConversationArea.parentNode.removeChild(mockConversationArea);
            }
            document.getElementById('multi-ai-enhancement-styles')?.remove();
        });

        test('injectStyles should add CSS styles to document head', () => {
            pageController.injectStyles();

            const styleElement = document.getElementById('multi-ai-enhancement-styles');
            expect(styleElement).not.toBeNull();
            expect(styleElement.tagName).toBe('STYLE');
            expect(styleElement.textContent).toContain('.multi-ai-answer-collapsed');
        });

        test('injectStyles should only inject styles once', () => {
            pageController.injectStyles();
            pageController.injectStyles();

            const styleElements = document.querySelectorAll('#multi-ai-enhancement-styles');
            expect(styleElements.length).toBe(1);
        });

        test('injectToolbar should add expand/collapse buttons to conversation area', () => {
            pageController.injectToolbar();

            const toolbar = mockConversationArea.querySelector('.multi-ai-toolbar');
            expect(toolbar).not.toBeNull();

            const expandBtn = toolbar.querySelector('.multi-ai-expand-all');
            const collapseBtn = toolbar.querySelector('.multi-ai-collapse-all');
            expect(expandBtn).not.toBeNull();
            expect(collapseBtn).not.toBeNull();
        });

        test('injectToolbar should not add toolbar if already exists', () => {
            pageController.injectToolbar();
            const toolbarCount = mockConversationArea.querySelectorAll('.multi-ai-toolbar').length;
            pageController.injectToolbar();
            const newToolbarCount = mockConversationArea.querySelectorAll('.multi-ai-toolbar').length;

            expect(toolbarCount).toBe(newToolbarCount);
        });

        test('expandAllAnswers should call driver.setAnswerStatus for all answers', () => {
            const mockAnswer1 = document.createElement('div');
            const mockAnswer2 = document.createElement('div');
            mockConversationArea.appendChild(mockAnswer1);
            mockConversationArea.appendChild(mockAnswer2);

            mockDriver.elementAnswers = jest.fn(() => [mockAnswer1, mockAnswer2]);
            mockDriver.elementAnswer = jest.fn((index) => index === 0 ? mockAnswer1 : mockAnswer2);

            pageController.expandAllAnswers();

            expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(0, false);
            expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(1, false);
        });

        test('collapseAllAnswers should call driver.setAnswerStatus for all answers', () => {
            const mockAnswer1 = document.createElement('div');
            const mockAnswer2 = document.createElement('div');
            mockConversationArea.appendChild(mockAnswer1);
            mockConversationArea.appendChild(mockAnswer2);

            mockDriver.elementAnswers = jest.fn(() => [mockAnswer1, mockAnswer2]);
            mockDriver.elementAnswer = jest.fn((index) => index === 0 ? mockAnswer1 : mockAnswer2);

            pageController.collapseAllAnswers();

            expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(0, true);
            expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(1, true);
        });

        test('expandAnswer should remove collapsed class and call driver.setAnswerStatus', () => {
            const mockAnswer = document.createElement('div');
            mockAnswer.classList.add('multi-ai-answer-collapsed');
            mockConversationArea.appendChild(mockAnswer);

            mockDriver.elementAnswer = jest.fn((index) => index === 0 ? mockAnswer : null);

            pageController.expandAnswer(0);

            expect(mockAnswer.classList.contains('multi-ai-answer-collapsed')).toBe(false);
            expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(0, false);
        });

        test('collapseAnswer should add collapsed class and call driver.setAnswerStatus', () => {
            const mockAnswer = document.createElement('div');
            mockConversationArea.appendChild(mockAnswer);

            mockDriver.elementAnswer = jest.fn((index) => index === 0 ? mockAnswer : null);

            pageController.collapseAnswer(0);

            expect(mockAnswer.classList.contains('multi-ai-answer-collapsed')).toBe(true);
            expect(mockDriver.setAnswerStatus).toHaveBeenCalledWith(0, true);
        });

        test('scrollToAnswer should expand answer and scroll into view', () => {
            const mockAnswer = document.createElement('div');
            mockAnswer.classList.add('multi-ai-answer-collapsed');
            mockConversationArea.appendChild(mockAnswer);

            mockDriver.elementAnswer = jest.fn((index) => index === 0 ? mockAnswer : null);
            mockAnswer.scrollIntoView = jest.fn();

            pageController.scrollToAnswer(0);

            expect(mockAnswer.classList.contains('multi-ai-answer-collapsed')).toBe(false);
            expect(mockAnswer.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
        });

        test('injectConversationIndex should add index container to conversation area', () => {
            pageController.injectConversationIndex();

            const indexContainer = mockConversationArea.querySelector('.multi-ai-conversation-index');
            expect(indexContainer).not.toBeNull();
        });

        test('injectConversationIndex should not add index container if already exists', () => {
            pageController.injectConversationIndex();
            const indexCount = mockConversationArea.querySelectorAll('.multi-ai-conversation-index').length;
            pageController.injectConversationIndex();
            const newIndexCount = mockConversationArea.querySelectorAll('.multi-ai-conversation-index').length;

            expect(indexCount).toBe(newIndexCount);
        });

        test('updateConversationIndex should add index items for answers', () => {
            const mockAnswer1 = document.createElement('div');
            const mockAnswer2 = document.createElement('div');
            mockConversationArea.appendChild(mockAnswer1);
            mockConversationArea.appendChild(mockAnswer2);

            mockDriver.elementAnswers = jest.fn(() => [mockAnswer1, mockAnswer2]);
            mockDriver.elementQuestion = jest.fn(() => null);

            pageController.injectConversationIndex();

            const indexItems = document.querySelectorAll('.multi-ai-conversation-index .index-item');
            expect(indexItems.length).toBe(2);
        });

        test('updateConversationIndex should add ID to answer elements', () => {
            const mockAnswer = document.createElement('div');
            mockConversationArea.appendChild(mockAnswer);

            mockDriver.elementAnswers = jest.fn(() => [mockAnswer]);
            mockDriver.elementQuestion = jest.fn(() => null);

            pageController.injectConversationIndex();

            expect(mockAnswer.id).toBe('multi-ai-answer-0');
        });

        test('injectAnswerToolbars should add toolbar to answers', () => {
            const mockAnswer = document.createElement('div');
            mockConversationArea.appendChild(mockAnswer);

            mockDriver.elementAnswers = jest.fn(() => [mockAnswer]);
            mockDriver.getAnswerStatus = jest.fn(() => false);

            pageController.injectAnswerToolbars();

            const toolbar = mockAnswer.querySelector('.multi-ai-answer-toolbar');
            expect(toolbar).not.toBeNull();
            expect(mockAnswer.style.position).toBe('relative');
        });

        test('injectAnswerToolbars should not add toolbar if already exists', () => {
            const mockAnswer = document.createElement('div');
            const existingToolbar = document.createElement('div');
            existingToolbar.className = 'multi-ai-answer-toolbar';
            mockAnswer.appendChild(existingToolbar);
            mockConversationArea.appendChild(mockAnswer);

            mockDriver.elementAnswers = jest.fn(() => [mockAnswer]);

            pageController.injectAnswerToolbars();

            const toolbars = mockAnswer.querySelectorAll('.multi-ai-answer-toolbar');
            expect(toolbars.length).toBe(1);
        });
    });
});
