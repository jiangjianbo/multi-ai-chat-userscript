
/**
 * @jest-environment jsdom
 */
import GenericPageDriver from '../src/generic-page-driver';
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
jest.mock('../src/generic-page-driver', () => {                                                                  
    const originalModule = jest.requireActual('../src/generic-page-driver');                                     
    return jest.fn().mockImplementation(function (...args) {                                                     
        originalModule.default.call(this, ...args);                                                              
        this.utils = mockUtils; // Override utils with the mocked instance                                       
        return this;                                                                                             
    });                                                                                                          
});

describe('GenericPageDriver', () => {
    let driver;

    beforeEach(() => {
        jest.clearAllMocks();
        
        driver = new GenericPageDriver();
        document.body.innerHTML = '';
    });

    it('should send a message using a generic input selector', async () => {
        document.body.innerHTML = '<textarea></textarea><button type="submit"></button>';
        const input = document.querySelector('textarea');
        const sendBtn = document.querySelector('button[type="submit"]');
        sendBtn.click = jest.fn();

        await driver.sendMessage('Hello Generic');

        expect(input.value).toBe('Hello Generic');
        expect(sendBtn.click).toHaveBeenCalled();
    });

    it('should get answer from a generic assistant message', async () => {
        document.body.innerHTML = '<div class="ai-message"><div class="paragraph">Generic response</div></div>';
        const answer = await driver.getAnswer();
        expect(answer).toBe('Generic response');
    });

    it('should create new thread using a generic new chat button', async () => {
        document.body.innerHTML = '<button class="new-conversation"></button>';
        const newChatBtn = document.querySelector('.new-conversation');
        newChatBtn.click = jest.fn();
        await driver.createNewThread();
        expect(newChatBtn.click).toHaveBeenCalled();
    });

    it('should get session title from a generic title element', () => {
        document.body.innerHTML = '<h1 class="title">Generic Session</h1>';
        expect(driver.getSessionTitle()).toBe('Generic Session');
    });

    it('should get chat history from a generic chat history container', () => {
        document.body.innerHTML = `
            <div class="chat-messages">
                <div class="chat-message"><div class="message-content">Generic Chat 1</div></div>
                <div class="chat-message"><div class="message-content">Generic Chat 2</div></div>
            </div>
        `;
        const history = driver.getChatHistory();
        expect(history).toEqual(['Generic Chat 1...', 'Generic Chat 2...']);
    });
});
