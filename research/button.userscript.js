// ==UserScript==
// @name         Research: Button Injection
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Injects a simple button on AI chat pages.
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
            if (childNodes) {
                if (Array.isArray(childNodes)) {
                    childNodes.forEach(childJson => element.appendChild(toHtml(childJson)));
                }
            }
            return element;
        }
        function $(selector, parent = document) { return parent.querySelector(selector); }
        return { toHtml, $ };
    })();

    function GenericPageDriver() {
        this.selectors = { /* Base selectors */ };
    }

    function KimiPageDriver() {
        GenericPageDriver.call(this);
        this.selectors.syncButtonContainer = '#app'; // Example selector
    }
    KimiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

    function ChatGPTPageDriver() {
        GenericPageDriver.call(this);
        this.selectors.syncButtonContainer = '#__next'; // Example selector
    }
    ChatGPTPageDriver.prototype = Object.create(GenericPageDriver.prototype);

    const driverFactory = (hostname) => {
        if (hostname.includes('kimi.ai')) return new KimiPageDriver();
        if (hostname.includes('chat.openai.com')) return new ChatGPTPageDriver();
        return new GenericPageDriver();
    };

    // --- Main Logic ---

    window.addEventListener('load', () => {
        console.log('[Research Script] Page loaded.');

        const driver = driverFactory(window.location.hostname);

        const syncButton = Util.toHtml({
            tag: 'button',
            '@id': 'research-sync-btn',
            '@style': 'position:fixed; top:15px; right:15px; z-index:9999; padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;',
            text: '同步对比 (Research)'
        });

        syncButton.addEventListener('click', () => {
            alert('Hello');
        });

        // Try to append to a driver-specific container, or fall back to body
        const container = driver.selectors.syncButtonContainer ? Util.$(driver.selectors.syncButtonContainer) : null;
        (container || document.body).appendChild(syncButton);

        console.log('[Research Script] Button injected.');
    });

})();
