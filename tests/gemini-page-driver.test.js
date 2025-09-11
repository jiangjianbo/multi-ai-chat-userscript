
/**
 * @jest-environment jsdom
 */
import GeminiPageDriver from '../src/drivers';
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
        originalModule.default.GeminiPageDriver.call(this, ...args);                                                      
        this.utils = mockUtils; // Override utils with the mocked instance                               
        return this;                                                                                     
    });                                                                                                  
});

describe('GeminiPageDriver', () => {
    let driver;
    let mockUtils;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUtils = new Utils();
        driver = new GeminiPageDriver();
        driver.utils = mockUtils; // Inject mock
        document.body.innerHTML = ''; // Clear DOM before each test
    });

    it("should send a message using Gemini's input selector", async () => {
        document.body.innerHTML = '<div class="ql-editor" contenteditable="true" data-placeholder="问问 Gemini"></div><button aria-label="发送"></button>';
        const input = document.querySelector('.ql-editor');
        const sendBtn = document.querySelector('button[aria-label="发送"]');
        sendBtn.click = jest.fn();

        await driver.sendMessage('Hello Gemini');

        expect(input.textContent).toBe('Hello Gemini');
        expect(sendBtn.click).toHaveBeenCalled();
    });

    it("should get answer from Gemini's model response", async () => {
        document.body.innerHTML = '<div class="chat-history-scroll-container"><div class="conversation-container"><div class="model-response-container"><div class="paragraph">Gemini response</div></div></div></div>';
        const answer = await driver.getAnswer();
        expect(answer).toBe('Gemini response');
    });

    it("should create new thread using Gemini's new chat button", async () => {
        document.body.innerHTML = '<button data-test-id="new-chat-button"></button>';
        const newChatBtn = document.querySelector('button[data-test-id="new-chat-button"]');
        newChatBtn.click = jest.fn();
        await driver.createNewThread();
        expect(newChatBtn.click).toHaveBeenCalled();
    });

    it("should get session title from Gemini's h1", () => {
        document.body.innerHTML = '<h1 class="title">Gemini Session</h1>';
        expect(driver.getSessionTitle()).toBe('Gemini Session');
    });

    it("should get chat history from Gemini's conversations container", () => {
        document.body.innerHTML = `
            <div class="conversations-container">
                <div class="conversation"><div class="conversation-title">Gemini Chat 1</div></div>
                <div class="conversation"><div class="conversation-title">Gemini Chat 2</div></div>
            </div>
        `;
        const history = driver.getChatHistory();
        expect(history).toEqual(['Gemini Chat 1...', 'Gemini Chat 2...']);
    });
});
