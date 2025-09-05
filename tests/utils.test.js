
/**
 * @jest-environment jsdom
 */
import Utils from '../src/utils';
import I18n from '../src/i18n';

jest.mock('../src/i18n');

describe('Utils', () => {
    let utils;

    beforeEach(() => {
        I18n.mockClear();
        // Set up the mock implementation for the I18n constructor
        I18n.mockImplementation(() => {
            return {
                getLang: jest.fn(langCode => {
                    const langs = {
                        en: { myKey: 'Hello' },
                        zh: { myKey: '你好' },
                    };
                    return langs[langCode];
                }),
            };
        });
        utils = new Utils();
    });

    describe('Language and I18n', () => {
        it('should get browser language, defaulting to "en"', () => {
            Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
            expect(utils.getBrowserLang()).toBe('en');

            Object.defineProperty(navigator, 'language', { value: 'zh-CN', configurable: true });
            expect(utils.getBrowserLang()).toBe('zh');
        });

        it('should get correct language text using getLangText', () => {
            Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
            expect(utils.getLangText('myKey')).toBe('Hello');

            Object.defineProperty(navigator, 'language', { value: 'zh-CN', configurable: true });
            expect(utils.getLangText('myKey')).toBe('你好');
        });
    });

    describe('DOM Manipulation', () => {
        it('should create an element', () => {
            const el = utils.createElement('div', { id: 'test' });
            expect(el.id).toBe('test');
        });
    });
});
