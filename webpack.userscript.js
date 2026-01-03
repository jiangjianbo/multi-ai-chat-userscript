/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const WrapperPlugin = require('wrapper-webpack-plugin');
const fs = require('fs');

// 读取油猴文件头
const userscriptHeader = fs
    .readFileSync(path.resolve(__dirname, 'userscript.meta.js'), 'utf8')
    .trim();

// Promisify compiler.run
const runCompiler = (compiler) => {
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            if (stats.hasErrors()) {
                console.error(stats.toString());
                return reject(new Error(stats.toString()));
            }
            resolve(stats);
        });
    });
};


module.exports = async () => {
    const initializerEntry = path.resolve(__dirname, 'src/main-window-initializer.js');
    const initializerOutputDir = path.resolve(__dirname, 'dist', 'tmp');
    const initializerOutputFile = 'main-window-initializer.bundle.js';
    const initializerBundlePath = path.join(initializerOutputDir, initializerOutputFile);

    // Config for bundling the initializer
    const initializerConfig = {
        mode: 'production',
        entry: initializerEntry,
        output: {
            path: initializerOutputDir,
            filename: initializerOutputFile,
            library: {
                name: 'MainWindowInitializer',
                type: 'var',
                export: 'default'
            },
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: { loader: 'babel-loader' }
                },
                {
                    test: /\.css$/,
                    use: ['raw-loader']
                }
            ]
        },
        optimization: {
            minimize: false,
            minimizer: [new TerserPlugin({
                terserOptions: {
                    compress: { drop_console: false },
                    format: { comments: false }
                }
            })]
        },
        plugins: [
            new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
        ]
    };

    // Create and run the initializer compiler
    const initializerCompiler = webpack(initializerConfig);
    console.log('Bundling main window initializer...');
    await runCompiler(initializerCompiler);
    console.log('Initializer bundled successfully.');

    // Read the bundled content
    const initializerScriptContent = fs.readFileSync(initializerBundlePath, 'utf8');
    // Clean up the temp dir
    fs.rmSync(initializerOutputDir, { recursive: true, force: true });


    // Main userscript config
    const mainConfig = {
        mode: 'production',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'multi-ai-sync-chat.userscript.js',
            iife: false,
            library: { type: 'var', name: '___DUMMY___' }
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
                        compress: { drop_console: false },
                        format: {
                            comments: /^\s*\/\/\s*(@|==UserScript==|==\/UserScript==)/
                        }
                    },
                    extractComments: false
                })
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                '__MAIN_WINDOW_INITIALIZER_SCRIPT__': JSON.stringify(initializerScriptContent)
            }),
            new WrapperPlugin({
                header: userscriptHeader + '\n\n(function() {\n    \'use strict\';\n',
                footer: '\n})();'
            }),
            new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
        ]
    };

    return mainConfig;
};
