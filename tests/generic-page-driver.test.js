/**
 * @jest-environment jsdom
 */
import GenericPageDriver from '../src/generic-page-driver';
import Utils from '../src/utils';

jest.mock('../src/utils');

describe('GenericPageDriver', () => {
    it('should add toolbars to messages without errors', () => {
        Utils.mockImplementation(() => ({
            // A smarter mock for $ that handles context
            $: (selector, context) => (context || document).querySelector(selector),
            $$: (selector, context) => (context || document).querySelectorAll(selector),
            createElement: (tag, attrs) => {
                const el = document.createElement(tag);
                if (attrs) { for (const key in attrs) el.setAttribute(key, attrs[key]); }
                // Add dummy buttons so the subsequent query selectors find them
                if (tag === 'div' && attrs.class === 'ai-sync-toolbar') {
                    el.innerHTML = '<button class="copy-btn"></button><button class="collapse-btn"></button><button class="hide-btn"></button>';
                }
                return el;
            },
        }));

        document.body.innerHTML = `<div class="message"></div>`;
        const driver = new GenericPageDriver();
        expect(() => driver.addFloatingToolbars()).not.toThrow();
    });
});