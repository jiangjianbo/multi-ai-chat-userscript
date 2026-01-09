const Storage = require('./storage');

/**
 * @description 管理应用的配置参数。
 */
class Config {
    /**
     * @param {Storage} storage - Storage 实例.
     * @param {object} [defaultConfig={}] - 默认配置.
     */
    constructor(storage, defaultConfig = {}) {
        if (!storage) {
            throw new Error('Storage instance must be provided to Config.');
        }
        this.storage = storage;

        this.a_defaultConfig = defaultConfig;
        this.runtimeConfig = {};
        this.CONFIG_STORAGE_KEY = 'user-config';

        // 初始化
        this.init();
    }

    /**
     * @description 初始化，加载用户配置。
     */
    init() {
        const userConfig = this.storage.get(this.CONFIG_STORAGE_KEY, {});
        this.runtimeConfig = { ...this.a_defaultConfig, ...userConfig };
    }

    /**
     * @description 获取配置项。
     * @param {string} key - 键名。
     * @param {*} [defaultValue] - 如果未找到，覆盖默认值的默认值。
     * @returns {*} - 配置值。
     */
    get(key, defaultValue = undefined) {
        if (defaultValue !== undefined && this.runtimeConfig[key] === undefined) {
            return defaultValue;
        }
        return this.runtimeConfig[key] === undefined ? null : this.runtimeConfig[key];
    }

    /**
     * @description 设置配置项并持久化。
     * @param {string} key - 键名。
     * @param {*} value - 配置值。
     */
    set(key, value) {
        this.runtimeConfig[key] = value;
        // 只持久化与默认值不同的或新增的配置
        const userConfig = this.storage.get(this.CONFIG_STORAGE_KEY, {});
        userConfig[key] = value;
        this.storage.set(this.CONFIG_STORAGE_KEY, userConfig);
    }

    /**
     * @description 获取所有配置项。
     * @returns {object}
     */
    getAll() {
        return { ...this.runtimeConfig };
    }

    /**
     * @description 恢复默认配置。
     */
    restoreDefaults() {
        this.runtimeConfig = { ...this.a_defaultConfig };
        this.storage.remove(this.CONFIG_STORAGE_KEY);
    }
}

module.exports = Config;
