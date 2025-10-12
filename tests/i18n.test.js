const I18n = require('../src/i18n');

// Mock Config class
const mockConfig = {
    data: {},
    get: jest.fn(function(key) {
        return this.data[key];
    }),
    set: jest.fn(function(key, value) {
        this.data[key] = value;
    }),
    clear: jest.fn(function() {
        this.data = {};
    })
};

// Mock navigator.language
let browserLanguage = 'en';
Object.defineProperty(navigator, 'language', {
    get: () => browserLanguage,
    configurable: true,
});

describe('I18n', () => {

    beforeEach(() => {
        mockConfig.clear();
        mockConfig.get.mockClear();
        mockConfig.set.mockClear();
        browserLanguage = 'en'; // Reset browser language
    });

    test('1. should use browser language if no config is set', () => {
        browserLanguage = 'en';
        const i18n = new I18n({ config: mockConfig });
        expect(i18n.getCurrentLang()).toBe('en');
    });

    test('2. should use config language over browser language', () => {
        browserLanguage = 'en';
        mockConfig.data['current-lang'] = 'zh-CN';
        const i18n = new I18n({ config: mockConfig });
        expect(i18n.getCurrentLang()).toBe('zh-CN');
    });

    test('3. should return key if text is not found in any language', () => {
        mockConfig.data['current-lang'] = 'zh-CN';
        const i18n = new I18n({ config: mockConfig });
        // 'a.b' does not exist in any resource file
        expect(i18n.getText('a.b')).toBe('a.b');
    });

    describe('4, 5, 6. Language Fallback Logic', () => {
        const key = 'default.a.b';

        test('4. should fall back to default English text', () => {
            const i18n = new I18n({ config: mockConfig });

            i18n.setCurrentLang('en');
            expect(i18n.getText(key)).toBe('test');

            i18n.setCurrentLang('en-US'); // Specific region
            expect(i18n.getText(key)).toBe('test'); // Falls back to 'en'

            i18n.setCurrentLang('fr'); // Language without the key
            expect(i18n.getText(key)).toBe('test'); // Falls back to default 'en'
        });

        test('5. should use base language if specific region is not found', () => {
            const i18n = new I18n({ config: mockConfig });

            i18n.setCurrentLang('en');
            expect(i18n.getText(key)).toBe('test');

            i18n.setCurrentLang('en-US');
            expect(i18n.getText(key)).toBe('test');

            i18n.setCurrentLang('zh-CN');
            expect(i18n.getText(key)).toBe('测试cn'); // Uses specific zh-CN

            i18n.setCurrentLang('zh-TW');
            expect(i18n.getText(key)).toBe('测试tw'); // Uses specific zh-TW

            i18n.setCurrentLang('zh-HK'); // Hong Kong Chinese
            expect(i18n.getText(key)).toBe('测试'); // Falls back to base 'zh'
        });

        test('6. should handle complex fallback correctly', () => {
            const i18n = new I18n({ config: mockConfig });
            // In this setup, 'zh' is not defined for the key, only 'zh-CN' and 'zh-TW'
            i18n.resources.zh[key] = undefined;

            i18n.setCurrentLang('zh-CN');
            expect(i18n.getText(key)).toBe('测试cn');

            i18n.setCurrentLang('zh-TW');
            expect(i18n.getText(key)).toBe('测试tw');

            // Singapore/Hong Kong Chinese should fall back to English default
            i18n.setCurrentLang('zh-SG');
            expect(i18n.getText(key)).toBe('test');

            i18n.setCurrentLang('zh-HK');
            expect(i18n.getText(key)).toBe('test');
            
            // restore for other tests
            i18n.resources.zh[key] = '测试';
        });
    });

    test('setCurrentLang should update currentLang and persist to config', () => {
        const i18n = new I18n({ config: mockConfig });
        i18n.setCurrentLang('ar');
        expect(i18n.getCurrentLang()).toBe('ar');
        expect(mockConfig.set).toHaveBeenCalledWith('current-lang', 'ar');
    });
});
