import I18n from "./i18n.js";

function Utils() {
    const i18n = new I18n();
    const DEFAULT_AI_PROVIDERS = [
        { name: "Kimi", url: "https://www.kimi.com/chat/" },
        { name: "Gemini", url: "https://gemini.google.com/" },
        { name: "ChatGPT", url: "https://chatgpt.com/" },
        { name: "DeepSeek", url: "https://chat.deepseek.com/" },
        { name: "Grok", url: "https://x.com/i/grok" },
        { name: "Tongyi", url: "https://www.tongyi.com/" }
    ];

    this.getDefaultAiProviders = function () { return DEFAULT_AI_PROVIDERS; };

    this.getBrowserLang = function () {
        const lang = navigator.language || navigator.userLanguage;
        const langCode = lang.split('-')[0];
        return i18n.getLang(langCode) ? langCode : 'en';
    };

    this.getLangText = function (key) {
        const lang = this.getBrowserLang();
        const langPack = i18n.getLang(lang) || i18n.getLang('en');
        return (langPack && langPack[key]) || key;
    };

    this.createElement = function (tag, attrs, children) {
        const elem = document.createElement(tag);
        if (attrs) { for (const key in attrs) { elem.setAttribute(key, attrs[key]); } }
        if (children) { children.forEach(child => { if (typeof child === 'string') { elem.appendChild(document.createTextNode(child)); } else if (child) { elem.appendChild(child); } }); }
        return elem;
    };

    this.$ = function (selector, context) { return (context || document).querySelector(selector); };
    this.$$ = function (selector, context) { return (context || document).querySelectorAll(selector); };

    this.debounce = function (func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    this.isRTL = function () {
        const lang = this.getBrowserLang();
        return lang === 'ar';
    };
}

export default Utils;
