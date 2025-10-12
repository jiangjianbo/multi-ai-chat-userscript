// ==UserScript==
// @name         Research: Element Attachment
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlights elements found by the PageDriver.
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- Minimal Bundled Code ---

    const Util = (() => {
        function toHtml(json) {
            if (typeof json === 'string') return document.createTextNode(json);
            let { tag, text, children, child, ...attrs } = json;
            if (!tag) {
                const firstKey = Object.keys(json)[0];
                tag = firstKey;
                text = json[tag];
                delete attrs[tag];
            }
            const element = document.createElement(tag);
            if (text) element.textContent = text;
            for (const key in attrs) {
                if (key.startsWith('@')) {
                    element.setAttribute(key.substring(1), attrs[key]);
                }
            }
            const childNodes = children || child;
            if (childNodes && Array.isArray(childNodes)) {
                childNodes.forEach(childJson => element.appendChild(toHtml(childJson)));
            }
            return element;
        }
        function $(selector, parent = document) { return parent.querySelector(selector); }
        function $$(selector, parent = document) { return parent.querySelectorAll(selector); }
        return { toHtml, $, $$ };
    })();

    function GenericPageDriver() {
        this.selectors = {};
    }

    // A driver with selectors matching the mock HTML we will create
    function TestPageDriver() {
        GenericPageDriver.call(this);
        this.selectors = {
            chatTitle: '#mock-chat-title',
            historyItems: '#mock-history-list .history-item',
            questions: '#mock-conversation .question',
            answers: '#mock-conversation .answer',
            promptInput: '#mock-prompt',
            sendButton: '#mock-send',
            longThinkSwitch: '#mock-long-think-switch'
        };
    }
    TestPageDriver.prototype = Object.create(GenericPageDriver.prototype);

    // --- Main Logic ---

    // 1. Inject a mock HTML structure to test against.
    function injectMockHTML() {
        const mockHTML = Util.toHtml({
            tag: 'div',
            '@id': 'mock-container',
            '@style': 'position:fixed; bottom:10px; left:10px; width:300px; padding:10px; border:1px solid #ccc; background: #f0f0f0; z-index: 9998;',
            children: [
                { tag: 'h1', '@id': 'mock-chat-title', text: 'Mock Chat' },
                { tag: 'div', '@id': 'mock-history-list', children: [
                    { tag: 'a', '@class': 'history-item', text: 'History 1' },
                    { tag: 'a', '@class': 'history-item', text: 'History 2' }
                ]},
                { tag: 'div', '@id': 'mock-conversation', children: [
                    { tag: 'div', '@class': 'question', text: 'Q1' },
                    { tag: 'div', '@class': 'answer', text: 'A1' }
                ]},
                { tag: 'textarea', '@id': 'mock-prompt' },
                { tag: 'button', '@id': 'mock-send', text: 'Send' },
                { tag: 'input', '@id': 'mock-long-think-switch', '@type': 'checkbox' }
            ]
        });
        document.body.appendChild(mockHTML);
    }

    window.addEventListener('load', () => {
        console.log('[Research Script] Page loaded.');
        injectMockHTML();

        const driver = new TestPageDriver();

        const mainButton = Util.toHtml({
            tag: 'button',
            '@id': 'research-element-btn',
            '@style': 'position:fixed; top:15px; right:15px; z-index:9999; padding: 8px 12px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;',
            text: 'Highlight Elements'
        });

        mainButton.addEventListener('click', () => {
            let foundCount = 0;
            for (const key in driver.selectors) {
                const selector = driver.selectors[key];
                const elements = Util.$$(selector);
                if (elements.length > 0) {
                    elements.forEach(el => {
                        el.style.border = '2px solid red';
                        foundCount++;
                    });
                }
            }
            alert(`${foundCount} elements highlighted.`);
        });

        document.body.appendChild(mainButton);
        console.log('[Research Script] Main button injected.');
    });

})();
