const Storage = require('../src/storage');

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value.toString();
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Storage', () => {
    let storage;
    const PREFIX = 'test-prefix-';

    beforeEach(() => {
        localStorage.clear();
        storage = new Storage(PREFIX);
    });

    test('1. should return null for a non-existent key', () => {
        expect(storage.get('a.b.c')).toBeNull();
    });

    test('2. should return the default value for a non-existent key when provided', () => {
        expect(storage.get('a.b.c', 'abc')).toBe('abc');
    });

    test('3. should set and get a value correctly', () => {
        storage.set('a.b.c', 100);
        expect(storage.get('a.b.c')).toBe(100);
    });

    test('3. continued: should return null for a partial key', () => {
        storage.set('a.b.c', 100);
        expect(storage.get('a.b')).toBeNull();
    });

    test('should handle storing and retrieving an object', () => {
        const obj = { name: 'test', value: { nested: true } };
        storage.set('my-object', obj);
        expect(storage.get('my-object')).toEqual(obj);
    });

    test('should handle storing and retrieving an array', () => {
        const arr = [1, 'two', { three: 3 }];
        storage.set('my-array', arr);
        expect(storage.get('my-array')).toEqual(arr);
    });

    test('should remove a key correctly', () => {
        storage.set('to-be-removed', 'some-value');
        expect(storage.get('to-be-removed')).toBe('some-value');
        storage.remove('to-be-removed');
        expect(storage.get('to-be-removed')).toBeNull();
    });

    test('should use the correct prefix', () => {
        storage.set('mykey', 'myvalue');
        const rawValue = localStorage.getItem(PREFIX + 'mykey');
        expect(rawValue).toBe(JSON.stringify('myvalue'));
    });
});
