const { KimiPageDriver, GeminiPageDriver, ChatGPTPageDriver, GenericPageDriver } = require('./page-driver');

function DriverFactory() {
    const urlMap = {
        'kimi.ai': {name:'Kimi', url:'https://www.kimi.com'},
        'www.kimi.com': {name:'Kimi', url:'https://www.kimi.com'},
        'gemini.google.com': {name: 'Gemini', url:'https://gemini.google.com/app'},
        'chat.openai.com': {name:'ChatGPT', url:'https://chat.openai.com'},
    };

    const driverMap = {
        'Kimi': KimiPageDriver,
        'Gemini': GeminiPageDriver,
        'ChatGPT': ChatGPTPageDriver,
    };

    /**
     * 获取所有支持的AI提供商名称列表。
     * @returns {Array<string>} 支持的AI提供商列表
     */
    this.getProviders = function() {
        return Object.keys(driverMap);
    }

    /**
     * 获取指定AI提供商对应的网址。
     * @param {string} providerName AI提供商名字
     * @returns {string} 对应的网址
     */
    this.getProviderUrl = function(providerName) {
        return Object.values(urlMap).find(v => v.name === providerName)?.url || '';
    }

    /**
     * 创建对应域名的驱动实例。
     * @param {string} hostname 域名
     * @returns {GenericPageDriver} 驱动实例
     */
    this.createDriver = function(hostname) {
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

module.exports = DriverFactory;
