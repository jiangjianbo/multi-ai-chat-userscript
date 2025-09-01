/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const WrapperPlugin = require('wrapper-webpack-plugin');

// 读取油猴文件头
const userscriptHeader = require('fs')
    .readFileSync(path.resolve(__dirname, 'userscript.meta.js'), 'utf8')
    .trim();

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'multi-ai-sync-chat.userscript.js',
        // 让 webpack 不自动包一层 IIFE，方便 Tampermonkey 作用域
        iife: false,
        library: { type: 'var', name: '___DUMMY___' } // 避免全局泄漏
    },
    resolve: { extensions: ['.js', '.mjs'] },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' }
            }
        ]
    },
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: { drop_console: false }, // 需要 console 就关掉
                    // 关键：保留所有含 @ 或 ==UserScript== 的注释
                    format: {
                        comments: /^\s*\/\/\s*(@|==UserScript==|==\/UserScript==)/
                    }    // 保留油猴头注释
                },
                extractComments: false
            })
        ]
    },
    plugins: [
        // 把油猴头拼在最前面
        new WrapperPlugin({
            header: userscriptHeader + '\n\n',
            footer: '' // 不需要尾部
        }),
        // 禁止 webpack 生成运行时
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    ]
};