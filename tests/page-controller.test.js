const PageController = require('../src/page-controller');
const DriverFactory = require('../src/driver-factory');

// --- Mocks ---
jest.mock('../src/driver-factory', () => {
    return jest.fn().mockImplementation(() => {
        return {
            createDriver: jest.fn(),
        };
    });
});

jest.mock('../src/sync-chat-window', () => {
    return jest.fn().mockImplementation(() => {
        return {
            checkAndCreateWindow: jest.fn(),
        };
    });
});

const SyncChatWindow = require('../src/sync-chat-window');

describe('PageController', () => {
    let pageController;
    let mockMessage, mockUtil, mockDriver;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        SyncChatWindow.mockClear();
        DriverFactory.mockClear(); // Clear mock calls for DriverFactory itself

        // Mock Driver
        mockDriver = {
            getChatTitle: jest.fn(() => 'Mock Title'),
            setPrompt: jest.fn(),
            send: jest.fn(),
            startMonitoring: jest.fn(),
            onAnswer: null, // Callbacks will be assigned by the controller
            onChatTitle: null,
            onOption: null,
        };

        // Other Mocks
        mockMessage = { register: jest.fn(), send: jest.fn() };
        mockUtil = {
            toHtml: jest.fn(json => {
                const el = document.createElement(json.tag);
                if (json['@id']) el.id = json['@id'];
                return el;
            }),
        };

        pageController = new PageController(
            mockMessage,
            {},
            { t: key => key },
            mockUtil
        );

        // After pageController is created, the mocked DriverFactory instance has been created.
        // We need to get a reference to the createDriver method of that instance.
        // DriverFactory.mock.results[0].value is the instance returned by new DriverFactory()
        DriverFactory.mock.results[0].value.createDriver.mockReturnValue(mockDriver);

        // Mock window location
        delete window.location;
        window.location = { hostname: 'test.com', href: 'http://localhost/' };
    });

    test('init should initialize driver, UI, and listeners', () => {
        pageController.init();
        expect(DriverFactory.mock.results[0].value.createDriver).toHaveBeenCalledWith('test.com');
        expect(document.getElementById('multi-ai-sync-btn')).not.toBeNull();
        expect(mockMessage.register).toHaveBeenCalledWith(pageController);
        expect(mockDriver.startMonitoring).toHaveBeenCalled();
    });

    test('1. Sync button click should create window and send "create" message', () => {
        jest.useFakeTimers();
        pageController.init();
        const syncButton = document.getElementById('multi-ai-sync-btn');
        syncButton.click();

        expect(pageController.syncChatWindow.checkAndCreateWindow).toHaveBeenCalled();
        
        // Fast-forward timers to resolve the setTimeout
        jest.runAllTimers();

        expect(mockMessage.send).toHaveBeenCalledWith('create', {
            id: expect.any(String),
            url: 'http://localhost/', // JSDOM default
            title: 'Mock Title',
        });
        jest.useRealTimers();
    });

    test('7. onMsgChat should call driver methods', () => {
        pageController.init();
        pageController.onMsgChat({ content: 'test prompt' });
        expect(mockDriver.setPrompt).toHaveBeenCalledWith('test prompt');
        expect(mockDriver.send).toHaveBeenCalled();
    });

    test('onMsgChat should ignore messages for other pages if id is present', () => {
        pageController.init();
        pageController.onMsgChat({ id: 'other-page-id', content: 'test prompt' });
        expect(mockDriver.setPrompt).not.toHaveBeenCalled();
    });

    test('4. Driver onAnswer callback should send an "answer" message', () => {
        pageController.init();
        expect(mockDriver.onAnswer).toBeInstanceOf(Function);

        const mockAnswerElement = { innerHTML: 'This is an answer.' };
        // Manually trigger the callback that was passed to the driver
        mockDriver.onAnswer(1, mockAnswerElement);

        expect(mockMessage.send).toHaveBeenCalledWith('answer', {
            id: pageController.pageId,
            index: 1,
            content: 'This is an answer.',
        });
    });
});
