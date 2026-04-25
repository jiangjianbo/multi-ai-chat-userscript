
/**
 * @description 封装存储 API 提供持久化存储。
 * @param {BrowserAdaptor} [adaptor] - 浏览器适配器实例，如果不提供则使用 localStorage
 * @param {string} prefix - 存储 key 的前缀。
 */
class Storage {
    /**
     * @param {BrowserAdaptor} [adaptor] - 浏览器适配器实例
     * @param {string} [prefix='multi-ai-chat-'] - 存储的 key 的前缀。
     */
    constructor(adaptor, prefix = 'multi-ai-chat-') {
        this.adaptor = adaptor;
        this.PREFIX = prefix;
    }

    /**
     * @description 将键值对存入存储。
     * @param {string} key - 键名。
     * @param {*} value - 要存储的值。
     */
    set(key, value) {
        const fullKey = this.PREFIX + key;
        try {
            const serializedValue = JSON.stringify(value);
            if (this.adaptor) {
                this.adaptor.storageSet(fullKey, serializedValue);
            } else {
                localStorage.setItem(fullKey, serializedValue);
            }
        } catch (e) {
            console.error(`Error saving to storage: ${e}`);
        }
    }

    /**
     * @description 从存储读取键对应的值。
     * @param {string} key - 键名。
     * @param {*} [defaultValue=null] - 如果未找到，返回的默认值。
     * @returns {*} - 存储的值或默认值。
     */
    get(key, defaultValue = null) {
        const fullKey = this.PREFIX + key;
        try {
            const serializedValue = this.adaptor
                ? this.adaptor.storageGet(fullKey)
                : localStorage.getItem(fullKey);
            if (serializedValue === null) {
                return defaultValue;
            }
            return JSON.parse(serializedValue);
        } catch (e) {
            console.error(`Error reading from storage: ${e}`);
            return defaultValue;
        }
    }

    /**
     * @description 从存储中移除一个键。
     * @param {string} key - 键名。
     */
    remove(key) {
        const fullKey = this.PREFIX + key;
        try {
            if (this.adaptor) {
                this.adaptor.storageRemove(fullKey);
            } else {
                localStorage.removeItem(fullKey);
            }
        } catch (e) {
            console.error(`Error removing from storage: ${e}`);
        }
    }
}

module.exports = Storage;
