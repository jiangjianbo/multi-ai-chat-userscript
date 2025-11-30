const PageController = require('../src/page-controller');
const DriverFactory = require('../src/driver-factory');
const SyncChatWindow = require('../src/sync-chat-window');
const MessageClient = require('../src/message-client');

// Mocks
jest.mock('../src/driver-factory');
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
            toHtml: jest.fn(json => {
                const el = document.createElement(json.tag);
                if (json['@id']) el.id = json['@id'];
                if (json.text) el.textContent = json.text;
                return el;
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
        const mockElement = { innerHTML: 'Question content' };
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
});
