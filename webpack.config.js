const webpack = require('webpack');
const path = require('path');
const srcDir = 'src/';
const isProd = process.env.NODE_ENV === 'production';

const CopyPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'inline-source-map',
    entry: {
        content_script: path.join(__dirname, srcDir + 'content_script.ts'),
        background: path.join(__dirname, srcDir + 'background.ts'),
        popup: path.join(__dirname, srcDir + 'popup.ts'),
        edit: path.join(__dirname, srcDir + 'edit.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'static', to: '.' }],
        }),
        new MonacoWebpackPlugin({
            languages: ['typescript', 'javascript'],
        }),
    ],
};
