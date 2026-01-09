const Config = require('./config');

/**
 * @description 管理国际化文本资源。
 */
class I18n {
    /**
     * @param {Config} config - Config 实例.
     * @param {object} langs - 语言资源.
     */
    constructor(config, langs) {
        if (!config) {
            throw new Error('Config instance must be provided to I18n.');
        }
        this.config = config;
        this.resources = langs || {};
        this.currentLang = 'en'; // 默认语言

        // 初始化
        this.init();
    }

    /**
     * @description 初始化，确定当前语言。
     */
    init() {
        const configLang = this.config.get('current-lang');
        const browserLang = this.getBrowserLang();
        this.currentLang = configLang || browserLang || 'en';
    }

    /**
     * @description 根据键获取当前语言的文本。
     * @param {string} key - 文本的键。
     * @returns {string} - 对应的文本。
     */
    getText(key) {
        let lang = this.currentLang;

        // 尝试完整语言代码, e.g., 'zh-CN'
        if (this.resources[lang] && this.resources[lang][key] !== undefined) {
            return this.resources[lang][key];
        }

        // 尝试基础语言代码, e.g., 'zh'
        const baseLang = lang.split('-')[0];
        if (this.resources[baseLang] && this.resources[baseLang][key] !== undefined) {
            return this.resources[baseLang][key];
        }

        // 尝试默认语言 'en'
        if (this.resources['en'] && this.resources['en'][key] !== undefined) {
            return this.resources['en'][key];
        }

        // 如果都找不到，返回 key 本身
        return key;
    }

    /**
     * @description 获取当前正在使用的语言代码。
     * @returns {string}
     */
    getCurrentLang() {
        return this.currentLang;
    }

    /**
     * @description 设置当前语言。
     * @param {string} lang - 语言代码 (e.g., 'en')。
     */
    setCurrentLang(lang) {
        this.currentLang = lang;
        this.config.set('current-lang', lang);
    }

    /**
     * @description 获取浏览器的语言设置。
     * @returns {string|null}
     */
    getBrowserLang() {
        return navigator.language || navigator.userLanguage || null;
    }

    /**
     * @description Gets the list of all supported languages.
     * @returns {string[]} - An array of language codes.
     */
    getAllLangs() {
        return Object.keys(this.resources);
    }
}

module.exports = I18n;
