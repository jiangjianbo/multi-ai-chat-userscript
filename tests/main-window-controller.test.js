import MainWindowController from '../src/main-window-controller.js';

jest.mock('../src/utils.js');
jest.mock('../src/chat-area.js');
global.BroadcastChannel = jest.fn(() => ({ postMessage: jest.fn(), close: jest.fn() }));
jest.mock('../src/message-notifier.js', () => {
    const original = jest.requireActual('../src/message-notifier.js');
    return jest.fn().mockImplementation((...args) => new original.default(...args));
});

describe('MainWindowController', () => {
    it('should disable layout buttons correctly', () => {
        document.body.innerHTML = `
            <div id="chat-areas-container"></div>
            <div class="layout-buttons">
                <button data-layout="1"></button>
                <button data-layout="2"></button>
            </div>
        `;
        const mainController = new MainWindowController();
        mainController.chatAreas = { area1: {}, area2: {} };
        mainController.utils.$$ = document.querySelectorAll.bind(document);
        // This mock now correctly returns an element with a style property
        mainController.utils.$ = () => { 
            const el = document.createElement('div');
            el.style.gridTemplateColumns = '';
            return el;
        };
        
        mainController.updateLayout();

        expect(document.querySelector('button[data-layout="1"]').disabled).toBe(true);
    });
});