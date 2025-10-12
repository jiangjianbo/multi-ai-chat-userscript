const Storage = require('./storage');

/**
 * @description 管理应用的配置参数。
 * @param {{storage: Storage, defaultConfig: object}} args - 构造函数参数。
 */
function Config(args) {
    if (!args || !args.storage) {
        throw new Error('Storage instance must be provided to Config.');
    }
    this.storage = args.storage;

    const a_defaultConfig = args.defaultConfig || {};
    let runtimeConfig = {};

    const CONFIG_STORAGE_KEY = 'user-config';

    /**
     * @description 初始化，加载用户配置。
     */
    this.init = function() {
        const userConfig = this.storage.get(CONFIG_STORAGE_KEY, {});
        runtimeConfig = { ...a_defaultConfig, ...userConfig };
    };

    /**
     * @description 获取配置项。
     * @param {string} key - 键名。
     * @param {*} [defaultValue] - 如果未找到，覆盖默认值的默认值。
     * @returns {*} - 配置值。
     */
    this.get = function(key, defaultValue = undefined) {
        if (defaultValue !== undefined && runtimeConfig[key] === undefined) {
            return defaultValue;
        }
        return runtimeConfig[key] === undefined ? null : runtimeConfig[key];
    };

    /**
     * @description 设置配置项并持久化。
     * @param {string} key - 键名。
     * @param {*} value - 配置值。
     */
    this.set = function(key, value) {
        runtimeConfig[key] = value;
        // 只持久化与默认值不同的或新增的配置
        const userConfig = this.storage.get(CONFIG_STORAGE_KEY, {});
        userConfig[key] = value;
        this.storage.set(CONFIG_STORAGE_KEY, userConfig);
    };

    /**
     * @description 获取所有配置项。
     * @returns {object}
     */
    this.getAll = function() {
        return { ...runtimeConfig };
    };

    /**
     * @description 恢复默认配置。
     */
    this.restoreDefaults = function() {
        runtimeConfig = { ...a_defaultConfig };
        this.storage.remove(CONFIG_STORAGE_KEY);
    };

    // 初始化
    this.init();
}

module.exports = Config;
