const Config = require('./config');

/**
 * @description 管理国际化文本资源。
 * @param {{config: Config}} args - 构造函数参数。
 */
function I18n(args) {
    if (!args || !args.config) {
        throw new Error('Config instance must be provided to I18n.');
    }
    this.config = args.config;
    this.currentLang = 'en'; // 默认语言

    this.resources = {
        'en': {
            'app.title': 'Multi-AI Sync Chat',
            'button.send': 'Send',
            'default.a.b': 'test', // For testing
        },
        'zh': {
            'app.title': '多AI同步聊天',
            'button.send': '发送',
            'default.a.b': '测试', // For testing
        },
        'zh-CN': {
            'default.a.b': '测试cn', // For testing
        },
        'zh-TW': {
            'default.a.b': '测试tw', // For testing
        },
        'ar': {
            'app.title': 'دردشة متزامنة متعددة الذكاء الاصطناعي',
            'button.send': 'إرسال'
        }
    };

    /**
     * @description 初始化，确定当前语言。
     */
    this.init = function() {
        const configLang = this.config.get('current-lang');
        const browserLang = this.getBrowserLang();
        this.currentLang = configLang || browserLang || 'en';
    };

    /**
     * @description 根据键获取当前语言的文本。
     * @param {string} key - 文本的键。
     * @returns {string} - 对应的文本。
     */
    this.getText = function(key) {
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
    };

    /**
     * @description 获取当前正在使用的语言代码。
     * @returns {string}
     */
    this.getCurrentLang = function() {
        return this.currentLang;
    };

    /**
     * @description 设置当前语言。
     * @param {string} lang - 语言代码 (e.g., 'en')。
     */
    this.setCurrentLang = function(lang) {
        this.currentLang = lang;
        this.config.set('current-lang', lang);
    };

    /**
     * @description 获取浏览器的语言设置。
     * @returns {string|null}
     */
    this.getBrowserLang = function() {
        return navigator.language || navigator.userLanguage || null;
    };

    // 初始化
    this.init();
}

module.exports = I18n;
