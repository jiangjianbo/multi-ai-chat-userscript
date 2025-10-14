/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const WrapperPlugin = require('wrapper-webpack-plugin');

// Find all research scripts
const researchFiles = glob.sync('./research/*.research.js');

// Create a webpack entry for each research script
const entries = researchFiles.reduce((acc, file) => {
    const entryName = path.basename(file, '.research.js');
    acc[entryName] = file;
    return acc;
}, {});

// Read the research userscript header template
const userscriptHeaderTemplate = require('fs')
    .readFileSync(path.resolve(__dirname, 'userscript.research.meta.js'), 'utf8')
    .trim();

module.exports = {
    mode: 'none', // No defaults, more control
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].research.user.js',
        iife: false, // We will add our own IIFE
        library: { type: 'var', name: '___DUMMY___' } // Avoid global scope pollution
    },
    devtool: false, // Disable eval for cleaner output
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' }
            }
        ]
    },
    plugins: [
        // Add a specific header and IIFE wrapper to each research script
        ...Object.keys(entries).map(entryName => {
            const header = userscriptHeaderTemplate.replace(
                '@name         [Research] Multi AI Sync Chat',
                `@name         [Research] ${entryName}`
            );
            return new WrapperPlugin({
                test: new RegExp(`${entryName}\.research\.user\.js$`), // Apply to specific output file
                header: () => header + '\n\n(function() {\n    \'use strict\';\n',
                footer: '\n})();'
            });
        }),
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    ]
};