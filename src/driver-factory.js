const { GenericPageDriver } = require('./page-driver');


const urlMap = {
    // 'kimi.ai': { name: 'Kimi', url: 'https://www.kimi.com' },
    // 'www.kimi.com': { name: 'Kimi', url: 'https://www.kimi.com' },
    // 'gemini.google.com': { name: 'Gemini', url: 'https://gemini.google.com/app' },
    // 'chat.openai.com': { name: 'ChatGPT', url: 'https://chat.openai.com' },
};

const driverMap = {
    // 'Kimi': KimiPageDriver,
    // 'Gemini': GeminiPageDriver,
    // 'ChatGPT': ChatGPTPageDriver,
};

/**
 * 注册驱动类
 * @param {GenericPageDriver} driverClass 派生类
 * @param {string} name 驱动的名称代号，例如kimi、gemini等
 * @param {string} url 跳转的真实网站
 * @param {Array<String>} alias 适配的多个域名
 */
function registerDriver(driverClass, name, url, alias = []) {
    if (!(driverClass.prototype instanceof GenericPageDriver)) {
        throw new Error('Driver class must extend GenericPageDriver');
    }

    driverMap[name] = driverClass;
    // url 是 https://xxx.com/xxx 这种形式，需要提取域名部分
    const urlObj = new URL(url);
    urlMap[urlObj.hostname] = { name, url };

    alias.forEach(a => {
        urlMap[a] = { name, url };
    });
}


/**
 * 驱动工厂，用于创建指定域名的页面驱动实例。
 */
class DriverFactory {
    constructor() {
        
    }

    /**
     * 获取所有支持的AI提供商名称列表。
     * @returns {Array<string>} 支持的AI提供商列表
     */
    getProviders() {
        return Object.keys(driverMap);
    }

    /**
     * 获取指定AI提供商对应的网址。
     * @param {string} providerName AI提供商名字
     * @returns {string} 对应的网址
     */
    getProviderUrl(providerName) {
        return Object.values(urlMap).find(v => v.name === providerName)?.url || '';
    }

    /**
     * 创建对应域名的驱动实例。
     * @param {string} hostname 域名
     * @returns {GenericPageDriver} 驱动实例
     */
    createDriver(hostname) {
        const nameUrl = urlMap[hostname];
        if (nameUrl) {
            const Driver = driverMap[nameUrl.name];
            if (Driver) {
                return new Driver();
            }
        }
        console.warn(`No specific driver found for ${hostname}. Using GenericPageDriver.`);
        return new GenericPageDriver();
    }
}

module.exports = {
    DriverFactory,
    registerDriver
}
