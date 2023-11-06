const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: 'production',
    entry: {
        background: path.resolve(
            __dirname,
            '..',
            'src/scripts',
            'background.ts'
        ),
        content: path.resolve(__dirname, '..', 'src/scripts', 'content.ts'),
        popup: path.resolve(__dirname, '..', 'src/scripts', 'popup.ts'),
        dashboard: path.resolve(__dirname, '..', 'src/scripts', 'dashboard.ts'),
        offscreen: path.resolve(__dirname, '..', 'src/scripts', 'offscreen.ts'),
        charts: path.resolve(__dirname, '..', 'src/scripts', 'charts.ts'),
        settings: path.resolve(__dirname, '..', 'src/scripts', 'settings.ts'),
    },
    output: {
        path: path.join(__dirname, '../dist'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        canvg: "canvg",
        html2canvas: "html2canvas",
        dompurify: "dompurify"
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public', to: '.' },
                { from: 'src/dashboard', to: '.' },
                { from: 'src/popup', to: '.' },
                { from: 'src/offscreen', to: '.'}
            ],
        }),
    ],
};
