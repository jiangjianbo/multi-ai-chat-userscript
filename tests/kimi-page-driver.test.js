
/**
 * @jest-environment jsdom
 */
import KimiPageDriver from '../src/drivers';
import Utils from '../src/utils';

jest.mock('../src/utils', () => {
    return jest.fn().mockImplementation(() => ({
        $: jest.fn((selectors, context) => {
            const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
            for (const selector of selectorArray) {
                const element = (context || global.document).querySelector(selector);
                if (element) return element;
            }
            return null;
        }),
        $$: jest.fn((selectors, context) => {
            const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
            let allElements = [];
            for (const selector of selectorArray) {
                const elements = (context || global.document).querySelectorAll(selector);
                if (elements.length > 0) {
                    allElements = [...allElements, ...Array.from(elements)];
                }
            }
            return allElements;
        }),
        createElement: jest.fn((tag, attrs) => {
            const el = global.document.createElement(tag);
            if (attrs) { for (const key in attrs) el.setAttribute(key, attrs[key]); }
            return el;
        }),
        getDefaultAiProviders: jest.fn().mockReturnValue([]),
        getLangText: jest.fn(key => key),
        isRTL: jest.fn().mockReturnValue(false),
        debounce: jest.fn(fn => fn),
    }));
});

const mockUtils = new Utils(); // Get the mocked instance    
// Mock the GenericPageDriver class                                                                       
jest.mock('../src/drivers', () => {                                                                       
    const originalModule = jest.requireActual('../src/drivers');                                          
    return jest.fn().mockImplementation(function (...args) {                                              
        originalModule.default.KimiPageDriver.call(this, ...args);                                                       
        this.utils = mockUtils; // Override utils with the mocked instance                                
        return this;                                                                                      
    });                                                                                                   
});


describe('KimiPageDriver', () => {
    let driver;
    let mockUtils;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUtils = new Utils();
        driver = new KimiPageDriver();
        driver.utils = mockUtils; // Inject mock
        document.body.innerHTML = '';
    });

    it("should send a message using Kimi's input selector", async () => {
        document.body.innerHTML = '<div id="prompt-textarea" contenteditable="true"></div><button class="send-button"></button>';
        const input = document.querySelector('#prompt-textarea');
        const sendBtn = document.querySelector('.send-button');
        sendBtn.click = jest.fn();

        await driver.sendMessage('Hello Kimi');

        expect(input.textContent).toBe('Hello Kimi');
        expect(sendBtn.click).toHaveBeenCalled();
    });

    it("should get answer from Kimi's assistant message", async () => {
        document.body.innerHTML = '<div class="chat-messages-container"><div class="chat-content-item-assistant"><div class="paragraph">Kimi response</div></div></div>';
        const answer = await driver.getAnswer();
        expect(answer).toBe('Kimi response');
    });

    it("should create new thread using Kimi's new chat button", async () => {
        document.body.innerHTML = '<a class="new-chat-btn"></a>';
        const newChatBtn = document.querySelector('.new-chat-btn');
        newChatBtn.click = jest.fn();
        await driver.createNewThread();
        expect(newChatBtn.click).toHaveBeenCalled();
    });

    it("should get session title from Kimi's h2", () => {
        document.body.innerHTML = '<h2 class="session-title">Kimi Session</h2>';
        expect(driver.getSessionTitle()).toBe('Kimi Session');
    });

    it("should get chat history from Kimi's history part", () => {
        document.body.innerHTML = `
            <div class="history-part">
                <ul>
                    <li><span class="chat-name">History Item 1</span></li>
                    <li><span class="chat-name">History Item 2</span></li>
                </ul>
            </div>
        `;
        const history = driver.getChatHistory();
        expect(history).toEqual(['History Item 1...', 'History Item 2...']);
    });
});
