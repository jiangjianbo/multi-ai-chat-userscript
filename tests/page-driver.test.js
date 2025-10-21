const { GenericPageDriver, KimiPageDriver } = require('../src/page-driver');
const DriverFactory = require('../src/driver-factory');

const driverFactory = new DriverFactory();

// Mock a chat page DOM
const setupDOM = () => {
    document.body.innerHTML = `
        <h1 id="chat-title">Test Chat</h1>
        <div id="history-list">
            <a href="/chat/1">History 1</a>
            <a href="/chat/2">History 2</a>
        </div>
        <div id="conversation">
            <div class="question">Question 1</div>
            <div class="answer">Answer 1</div>
            <div class="question">Question 2</div>
            <div class="answer collapsed">Answer 2</div>
        </div>
        <div id="options">
            <select id="model-selector">
                <option value="model-a" selected>Model A</option>
                <option value="model-b">Model B</option>
            </select>
            <input type="checkbox" id="long-think-switch" checked>
        </div>
        <textarea id="prompt"></textarea>
        <button id="send">Send</button>
    `;
};

// A concrete driver for our mock DOM
function TestPageDriver() {
    GenericPageDriver.call(this);
    this.selectors = Object.assign({}, this.selectors, {
        chatTitle: '#chat-title',
        historyItems: '#history-list a',
        conversationArea: '#conversation',
        questions: '#conversation .question',
        answers: '#conversation .answer',
        promptInput: '#prompt',
        sendButton: '#send',
        modelSelector: '#model-selector',
        longThinkSwitch: '#long-think-switch',
        answerCollapsedClass: 'collapsed',
    });

    // Override methods
    this.getOptions = function() {
        const model = document.querySelector(this.selectors.modelSelector);
        const longThink = document.querySelector(this.selectors.longThinkSwitch);
        return {
            'current-model': model ? model.value : null,
            'long-think': longThink ? longThink.checked : null,
        };
    };

    this.setOption = function(key, value) {
        if (key === 'current-model') {
            const model = document.querySelector(this.selectors.modelSelector);
            if (model) model.value = value;
        } else if (key === 'long-think') {
            const longThink = document.querySelector(this.selectors.longThinkSwitch);
            if (longThink) longThink.checked = value;
        }
    };
}


describe('PageDriver Module', () => {
    let driver;

    beforeEach(() => {
        setupDOM();
        driver = new TestPageDriver();
    });

    describe('Data Reading', () => {
        test('1. should get chat title and history items', () => {
            expect(driver.getChatTitle()).toBe('Test Chat');
            expect(driver.getHistoryCount()).toBe(2);
            expect(driver.getHistory(0).title).toBe('History 1');
            expect(driver.getHistory(1).url).toContain('/chat/2');
        });

        test('5. should get questions and answers', () => {
            expect(driver.getConversationCount()).toBe(2);

            expect(driver.elementQuestion(0).textContent).toBe('Question 1');
            expect(driver.elementAnswer(1).textContent).toBe('Answer 2');

            expect(driver.getQuestion(0)).toBe('Question 1');
            expect(driver.getAnswer(1)).toBe('Answer 2');
        });

        test('4. should get options', () => {
            const options = driver.getOptions();
            expect(options['current-model']).toBe('model-a');
            expect(options['long-think']).toBe(true);
        });

        test('should get answer collapsed status', () => {
            expect(driver.getAnswerStatus(0)).toBe(false);
            expect(driver.getAnswerStatus(1)).toBe(true);
        });
    });

    describe('Actions', () => {
        test('2. should set prompt and click send', () => {
            const sendButton = document.querySelector(driver.selectors.sendButton);
            const clickSpy = jest.spyOn(sendButton, 'click');

            driver.setPrompt('Hello World');
            const promptInput = document.querySelector(driver.selectors.promptInput);
            expect(promptInput.value).toBe('Hello World');

            driver.send();
            expect(clickSpy).toHaveBeenCalled();
        });

        test('4. should set options', () => {
            driver.setOption('current-model', 'model-b');
            driver.setOption('long-think', false);

            const options = driver.getOptions();
            expect(options['current-model']).toBe('model-b');
            expect(options['long-think']).toBe(false);
        });

        test('should set answer collapsed status', () => {
            driver.setAnswerStatus(0, true); // collapse it
            driver.setAnswerStatus(1, false); // expand it

            expect(driver.getAnswerStatus(0)).toBe(true);
            expect(driver.getAnswerStatus(1)).toBe(false);
        });
    });

    describe('Event Monitoring', () => {
        // JSDOM's MutationObserver is tricky. We'll test the callback directly.
        // A full E2E test would be better for real observer testing.
        test('6. onAnswer callback should be triggered on new answer', (done) => {
            const onAnswerMock = jest.fn();
            driver.onAnswer = onAnswerMock;
            driver.startMonitoring();

            // Simulate a new answer appearing
            const conversation = document.querySelector('#conversation');
            const newAnswer = document.createElement('div');
            newAnswer.className = 'answer';
            newAnswer.textContent = 'Answer 3';
            conversation.appendChild(newAnswer);

            // MutationObserver is asynchronous
            setTimeout(() => {
                expect(onAnswerMock).toHaveBeenCalledTimes(1);
                expect(onAnswerMock).toHaveBeenCalledWith(2, newAnswer);
                driver.stopMonitoring();
                done();
            }, 0);
        });
    });

    describe('driverFactory', () => {
        test('should return a specific driver for a known hostname', () => {
            const kimiDriver = driverFactory.createDriver('kimi.ai');
            expect(kimiDriver instanceof KimiPageDriver).toBe(true);
        });

        test('should return GenericPageDriver for an unknown hostname', () => {
            const genericDriver = driverFactory.createDriver('unknown.com');
            expect(genericDriver.constructor.name).toBe('GenericPageDriver');
        });
    });
});
