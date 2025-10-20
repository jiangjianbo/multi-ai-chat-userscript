// This is a research script for the PageDriver.
// Its purpose is to test and validate different CSS selectors
// for interacting with various AI chat websites.

const DriverFactory = require('../src/driver-factory');
const Util = require('../src/util');

(function() {
    'use strict';

    console.log('[Research] PageDriver script loaded.');

    const util = new Util();

    /**
     * Highlights a single element or a list of elements with a red border.
     * @param {HTMLElement|NodeList|Array<HTMLElement>} elements - The element(s) to highlight.
     * @param {string} label - A label to display on the highlighted element.
     */
    function highlightElements(elements, label) {
        if (!elements) {
            console.warn(`[Research] Element not found for label: ${label}`);
            return;
        }

        const applyStyle = (el, index) => {
            if (el) {
                el.style.border = '2px solid red';
                el.style.position = 'relative';

                const labelDiv = document.createElement('div');
                labelDiv.innerText = `${label} ${index > 0 ? index + 1 : ''}`;
                labelDiv.style.position = 'absolute';
                labelDiv.style.top = '0';
                labelDiv.style.left = '0';
                labelDiv.style.backgroundColor = 'red';
                labelDiv.style.color = 'white';
                labelDiv.style.padding = '2px 5px';
                labelDiv.style.fontSize = '12px';
                labelDiv.style.zIndex = '9999';
                el.appendChild(labelDiv);
            }
        };

        if (elements instanceof NodeList || Array.isArray(elements)) {
            const validElements = Array.from(elements).filter(Boolean);
            validElements.forEach((el, i) => applyStyle(el, i));
        } else {
            applyStyle(elements, 0);
        }
    }

    function main() {
        console.log('[Research] Window loaded. Initializing driver...');
        const driverFactory = new DriverFactory();
        const driver = driverFactory.createDriver(window.location.hostname);

        if (driver) {
            console.log(`[Research] Driver created for ${window.location.hostname}:`, driver);

            // Highlight various elements
            highlightElements(driver.elementChatTitle(), 'Chat Title');
            highlightElements(driver.elementPromptInput(), 'Prompt Input');
            highlightElements(driver.elementSendButton(), 'Send Button');
            highlightElements(driver.elementConversationArea(), 'Conversation Area');
            highlightElements(driver.elementHistoryArea(), 'History Area');

            const historyItems = driver.elementHistoryItems();
            console.log(`[Research] Found ${historyItems.length} history items.`);
            highlightElements(historyItems, 'History Item');

            const questions = driver.elementQuestions();
            console.log(`[Research] Found ${questions.length} questions.`);
            highlightElements(questions, 'Question');

            const answers = driver.elementAnswers();
            console.log(`[Research] Found ${answers.length} answers.`);
            highlightElements(answers, 'Answer');

            // Highlight new elements
            highlightElements(driver.elementNewSessionButton(), 'New Session Button');
            highlightElements(driver.elementWebAccessOption(), 'Web Access Option');
            highlightElements(driver.elementLongThoughtOption(), 'Long Thought Option');
            highlightElements(driver.elementModelVersionList(), 'Model Version List');
            highlightElements(driver.elementCurrentModelVersion(), 'Current Model Version');

        } else {
            console.error('[Research] Could not create a driver for this page.');
        }
    }

    util.documentReady(main, 5000);
})();
