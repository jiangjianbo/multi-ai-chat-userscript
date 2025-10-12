// ==UserScript==
// @name         Research: Toolbar Injection
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Injects toolbars on AI chat pages.
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
                    const attrName = key.substring(1);
                    let attrValue = attrs[key];
                    if (typeof attrValue === 'object' && attrValue !== null) {
                        attrValue = Object.entries(attrValue).map(([k, v]) => `${k}:${v}`).join(';');
                    }
                    element.setAttribute(attrName, attrValue);
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
        this.selectors = { answers: '.answer' }; // Generic selector
    }
    GenericPageDriver.prototype.getAnswers = function() {
        return Util.$$(this.selectors.answers);
    }

    const driverFactory = (hostname) => new GenericPageDriver(); // Keep it simple for this test

    // --- Main Logic ---

    window.addEventListener('load', () => {
        console.log('[Research Script] Page loaded.');

        const driver = driverFactory(window.location.hostname);

        const mainButton = Util.toHtml({
            tag: 'button',
            '@id': 'research-toolbar-btn',
            '@style': 'position:fixed; top:15px; right:15px; z-index:9999; padding: 8px 12px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;',
            text: 'Inject Toolbars'
        });

        mainButton.addEventListener('click', () => {
            console.log('[Research Script] Injecting toolbars...');
            const answers = driver.getAnswers();
            if (answers.length === 0) {
                alert('No answer elements found with selector: ' + driver.selectors.answers);
                return;
            }

            answers.forEach((answerEl, index) => {
                // Ensure the answer element can contain a positioned toolbar
                if (getComputedStyle(answerEl).position === 'static') {
                    answerEl.style.position = 'relative';
                }

                const toolbar = Util.toHtml({
                    tag: 'div',
                    '@style': 'position:absolute; top:0; left:0; background:rgba(0,0,0,0.7); color:white; padding:2px 5px; font-size:12px; border-radius:3px;',
                    text: `Toolbar #${index + 1}`
                });

                answerEl.appendChild(toolbar);
            });
            alert(`${answers.length} toolbars injected.`);
        });

        document.body.appendChild(mainButton);
        console.log('[Research Script] Main button injected.');
    });

})();
