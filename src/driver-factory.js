const { KimiPageDriver, GeminiPageDriver, ChatGPTPageDriver, GenericPageDriver } = require('./page-driver');

function DriverFactory() {
    this.urlMap = {
        'kimi.ai': {name:'Kimi', url:'https://www.kimi.com'},
        'www.kimi.com': {name:'Kimi', url:'https://www.kimi.com'},
        'gemini.google.com': {name: 'Gemini', url:'https://gemini.google.com/app'},
        'chat.openai.com': {name:'ChatGPT', url:'https://chat.openai.com'},
    };

    this.driverMap = {
        'Kimi': KimiPageDriver,
        'Gemini': GeminiPageDriver,
        'ChatGPT': ChatGPTPageDriver,
    };

    this.getProviders = function() {
        return Object.keys(this.driverMap);
    }

    this.getProviderUrl = function(providerName) {
        return Object.values(this.urlMap).find(v => v.name === providerName)?.url || '';
    }

    this.createDriver = function(hostname) {
        const nameUrl = this.urlMap[hostname];
        if (nameUrl) {
            const Driver = this.driverMap[nameUrl.name];
            if (Driver) {
                return new Driver();
            }
        }
        console.warn(`No specific driver found for ${hostname}. Using GenericPageDriver.`);
        return new GenericPageDriver();
    }
}

module.exports = DriverFactory;
