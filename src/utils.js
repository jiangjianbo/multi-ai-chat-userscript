import I18n from "./i18n";

/**
 * 工具类，提供常用DOM操作和工具方法
 * @constructor
 */
function Utils() {
    const i18n = new I18n();

    /**
     * 默认AI供应商列表
     * @type {Array}
     */
    const DEFAULT_AI_PROVIDERS = [
        { name: "Kimi", url: "https://www.kimi.com/chat/" },
        { name: "Gemini", url: "https://gemini.google.com/" },
        { name: "ChatGPT", url: "https://chatgpt.com/" },
        { name: "DeepSeek", url: "https://chat.deepseek.com/" },
        { name: "Grok", url: "https://x.com/i/grok" },
        { name: "Tongyi", url: "https://www.tongyi.com/" }
    ];

    this.getDefaultAiProviders = function () { return DEFAULT_AI_PROVIDERS; }

    /**
     * 获取浏览器当前语言
     * @return {string} 语言代码
     */
    this.getBrowserLang = function () {
        const lang = navigator.language || navigator.userLanguage;
        const langCode = lang.split('-')[0];
        return i18n.getLang(langCode) ? langCode : 'en';
    };

    /**
     * 获取多语言文本
     * @param {string} key 文本键名
     * @return {string} 对应语言的文本
     */
    this.getLangText = function (key) {
        const lang = this.getBrowserLang();
        return i18n.getLang(lang)[key] || i18n.getLang('en')[key];
    };

    /**
     * 创建DOM元素
     * @param {string} tag 标签名
     * @param {Object} attrs 属性键值对
     * @param {Array} children 子元素数组
     * @return {HTMLElement} 创建的元素
     */
    this.createElement = function (tag, attrs, children) {
        const elem = document.createElement(tag);
        if (attrs) {
            for (const key in attrs) {
                elem.setAttribute(key, attrs[key]);
            }
        }
        if (children) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    elem.appendChild(document.createTextNode(child));
                } else if (child) {
                    elem.appendChild(child);
                }
            });
        }
        return elem;
    };

    /**
     * jQuery风格选择器
     * @param {string} selector 选择器字符串
     * @param {HTMLElement} context 上下文元素
     * @return {HTMLElement|null} 找到的元素
     */
    this.$ = function (selector, context) {
        return (context || document).querySelector(selector);
    };

    /**
     * jQuery风格多元素选择器
     * @param {string} selector 选择器字符串
     * @param {HTMLElement} context 上下文元素
     * @return {NodeList} 找到的元素列表
     */
    this.$$ = function (selector, context) {
        return (context || document).querySelectorAll(selector);
    };

    /**
     * 防抖函数
     * @param {Function} func 执行函数
     * @param {number} wait 等待时间(ms)
     * @return {Function} 防抖后的函数
     */
    this.debounce = function (func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    /**
     * 检查是否为RTL语言
     * @return {boolean} 是否为RTL语言
     */
    this.isRTL = function () {
        const lang = this.getBrowserLang();
        return lang === 'ar';
    };
}

export default Utils;
