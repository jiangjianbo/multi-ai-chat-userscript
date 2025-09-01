module.exports = {
    testEnvironment: 'jsdom', // 前端代码常见环境
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // 统一注入 mock
    collectCoverageFrom: ['src/**/*.js'],
    moduleFileExtensions: ['js', 'mjs'],
    transform: { '^.+\\.m?js$': 'babel-jest' }
};
