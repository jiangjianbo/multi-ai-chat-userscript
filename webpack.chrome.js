const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        'background': './chrome-extension/background.js',
        'content-script': './chrome-extension/content-script.js',
        'ChromeBroadcastChannel': './chrome-extension/ChromeBroadcastChannel.js',
        'popup/popup': './chrome-extension/popup/popup.js',
        'options/options': './chrome-extension/options/options.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist/chrome-extension'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'chrome-extension/manifest.json', to: 'manifest.json' },
                { from: 'chrome-extension/popup/popup.html', to: 'popup/popup.html' },
                { from: 'chrome-extension/popup/popup.css', to: 'popup/popup.css' },
                { from: 'chrome-extension/options/options.html', to: 'options/options.html' },
                { from: 'chrome-extension/options/options.css', to: 'options/options.css' },
                { from: 'chrome-extension/icons', to: 'icons' },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
        extensions: ['.js'],
    },
};
