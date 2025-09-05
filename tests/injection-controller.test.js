
/**
 * @jest-environment jsdom
 */
import InjectionController from '../src/injection-controller';
import GenericPageDriver from '../src/generic-page-driver';

jest.mock('../src/generic-page-driver');
jest.mock('../src/drivers.js', () => ({ KimiPageDriver: jest.fn(), GeminiPageDriver: jest.fn(), ChatGPTPageDriver: jest.fn() }));
jest.mock('../src/message-notifier.js', () => {
    return jest.fn().mockImplementation(function() { this.send = jest.fn(); this.register = jest.fn(); return this; });
});

describe('InjectionController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        GenericPageDriver.mockImplementation(() => ({
            addFloatingToolbars: jest.fn(), // Added the missing mock
            getUsername: jest.fn().mockResolvedValue('TestUser'),
            getTabId: jest.fn().mockReturnValue('tab-123'),
        }));
    });

    it('should initialize without errors', () => {
        const controller = new InjectionController();
        expect(() => controller.init()).not.toThrow();
    });
});
