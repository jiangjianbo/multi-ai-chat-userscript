module.exports = {
    rootDir: '..',
    testEnvironment: 'jsdom', // 前端代码常见环境
    setupFilesAfterEnv: ['<rootDir>/scripts/jest.setup.js'], // 统一注入 mock
    collectCoverageFrom: ['<rootDir>/src/**/*.js'],
    moduleFileExtensions: ['js', 'mjs'],
    transform: { '^.+\.m?js$': 'babel-jest' }
};