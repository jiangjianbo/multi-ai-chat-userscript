
/**
 * @description 封装 localStorage 提供持久化存储。
 * @param {string} prefix - 存入 localStorage 的 key 的前缀。
 */
class Storage {
    /**
     * @param {string} [prefix='multi-ai-chat-'] - 存入 localStorage 的 key 的前缀。
     */
    constructor(prefix = 'multi-ai-chat-') {
        this.PREFIX = prefix;
    }

    /**
     * @description 将键值对存入 localStorage。
     * @param {string} key - 键名。
     * @param {*} value - 要存储的值。
     */
    set(key, value) {
        const fullKey = this.PREFIX + key;
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(fullKey, serializedValue);
        } catch (e) {
            console.error(`Error saving to localStorage: ${e}`);
        }
    }

    /**
     * @description 从 localStorage 读取键对应的值。
     * @param {string} key - 键名。
     * @param {*} [defaultValue=null] - 如果未找到，返回的默认值。
     * @returns {*} - 存储的值或默认值。
     */
    get(key, defaultValue = null) {
        const fullKey = this.PREFIX + key;
        try {
            const serializedValue = localStorage.getItem(fullKey);
            if (serializedValue === null) {
                return defaultValue;
            }
            return JSON.parse(serializedValue);
        } catch (e) {
            console.error(`Error reading from localStorage: ${e}`);
            return defaultValue;
        }
    }

    /**
     * @description 从 localStorage 中移除一个键。
     * @param {string} key - 键名。
     */
    remove(key) {
        const fullKey = this.PREFIX + key;
        try {
            localStorage.removeItem(fullKey);
        } catch (e) {
            console.error(`Error removing from localStorage: ${e}`);
        }
    }
}

module.exports = Storage;
