// ==UserScript==
// @name         Research: Window Creation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tests the creation and activation of the main window.
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- Minimal Bundled Code ---

    const Util = {
        toHtml: (json) => {
            const el = document.createElement(json.tag);
            if(json.text) el.textContent = json.text;
            if(json['@style']) el.setAttribute('style', json['@style']);
            return el;
        }
    };

    /**
     * A simplified version for this research task.
     */
    function SimpleSyncChatWindow() {
        const WINDOW_NAME = 'multi-ai-sync-chat-window';
        this.window = null;

        this.exist = function() {
            // Check if the window handle exists and if the window itself hasn't been closed
            return this.window && !this.window.closed;
        };

        this.createWindow = function(win) {
            const doc = win.document;
            doc.open();
            doc.write('<html><head><title>Research Window</title></head><body><h1>Hello</h1></body></html>');
            doc.close();
        };

        this.checkAndCreateWindow = function() {
            // Attempt to get a handle on an existing window
            if (!this.exist()) {
                 this.window = window.open('', WINDOW_NAME);
            }

            if (this.exist()) {
                // If the window is new/empty, write content to it.
                // In a real scenario, you might need a more robust check.
                try {
                    if (this.window.document.body.innerHTML.trim() === '') {
                        this.createWindow(this.window);
                    }
                } catch (e) {
                    // Catch cross-origin errors if the window has navigated elsewhere
                    console.warn('Could not access window content. It might have navigated to a different origin.');
                    // Re-open a fresh window in this case
                    this.window = window.open('about:blank', WINDOW_NAME);
                    this.createWindow(this.window);
                }
                this.window.focus();
                alert('Window created/activated.');
            } else {
                alert('Popup was blocked. Please allow popups for this site.');
            }
        };
    }

    // --- Main Logic ---

    window.addEventListener('load', () => {
        console.log('[Research Script] Page loaded.');

        const scw = new SimpleSyncChatWindow();

        const mainButton = Util.toHtml({
            tag: 'button',
            '@id': 'research-window-btn',
            '@style': 'position:fixed; top:15px; right:15px; z-index:9999; padding: 8px 12px; background-color: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer;',
            text: 'Create Window'
        });

        mainButton.addEventListener('click', () => {
            scw.checkAndCreateWindow();
        });

        document.body.appendChild(mainButton);
        console.log('[Research Script] Main button injected.');
    });

})();
