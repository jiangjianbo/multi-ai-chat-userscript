const Config = require('../src/config');

// Mock Storage class
const mockStorage = {
    data: {},
    get: jest.fn(function(key, defaultValue) {
        return this.data[key] === undefined ? defaultValue : this.data[key];
    }),
    set: jest.fn(function(key, value) {
        this.data[key] = value;
    }),
    remove: jest.fn(function(key) {
        delete this.data[key];
    }),
    clear: jest.fn(function() {
        this.data = {};
    })
};

describe('Config', () => {
    const defaultConfig = {
        theme: 'dark',
        layout: 2,
    };

    beforeEach(() => {
        // 重置 mock storage 在每次测试前
        mockStorage.clear();
        mockStorage.get.mockClear();
        mockStorage.set.mockClear();
        mockStorage.remove.mockClear();
    });

    test('should load default config when no user config exists', () => {
        mockStorage.data = {}; // 确保 storage 为空
        const config = new Config(mockStorage, defaultConfig);
        expect(config.get('theme')).toBe('dark');
        expect(config.get('layout')).toBe(2);
    });

    test('should merge user config over default config', () => {
        mockStorage.data = {
            'user-config': { theme: 'light', newKey: 'newValue' }
        };
        const config = new Config(mockStorage, defaultConfig);

        expect(config.get('theme')).toBe('light'); // 用户设置覆盖默认
        expect(config.get('layout')).toBe(2); // 保留未被覆盖的默认值
        expect(config.get('newKey')).toBe('newValue'); // 加载新 key
    });

    test('1. should return null for a non-existent key', () => {
        mockStorage.data = {};
        const config = new Config(mockStorage, defaultConfig);
        expect(config.get('a.b')).toBeNull();
    });

    test('2. should return provided default value for a non-existent key', () => {
        mockStorage.data = {};
        const config = new Config(mockStorage, defaultConfig);
        expect(config.get('a.b', 1)).toBe(1);
    });

    test('3. set should update the value and persist it', () => {
        mockStorage.data = {};
        const config = new Config(mockStorage, defaultConfig);

        // 初始时，使用提供的默认值
        expect(config.get('a.b', 1)).toBe(1);

        // 设置值为 100
        config.set('a.b', 100);
        expect(config.get('a.b', 1)).toBe(100);
        // 验证它是否被持久化
        expect(mockStorage.set).toHaveBeenCalledWith('user-config', { 'a.b': 100 });

        // 设置值为 'test'
        config.set('a.b', 'test');
        expect(config.get('a.b')).toBe('test');
        // 验证持久化是否更新
        expect(mockStorage.set).toHaveBeenCalledWith('user-config', { 'a.b': 'test' });
    });

    test('getAll should return a copy of the current runtime config', () => {
        mockStorage.data = {
            'user-config': { theme: 'light' }
        };
        const config = new Config(mockStorage, defaultConfig);
        const allConfig = config.getAll();

        expect(allConfig).toEqual({ theme: 'light', layout: 2 });

        // 确保返回的是一个副本
        allConfig.theme = 'blue';
        expect(config.get('theme')).toBe('light');
    });

    test('restoreDefaults should reset config and clear storage', () => {
        mockStorage.data = {
            'user-config': { theme: 'light' }
        };
        const config = new Config(mockStorage, defaultConfig);
        expect(config.get('theme')).toBe('light');

        config.restoreDefaults();

        expect(config.get('theme')).toBe('dark'); // 恢复为默认值
        expect(mockStorage.remove).toHaveBeenCalledWith('user-config');
    });
});
