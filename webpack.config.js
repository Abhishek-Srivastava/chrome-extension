const path = require('path');

module.exports = {
    entry: './node_modules/docx/build/index.js', // Entry point for docx
    output: {
        filename: 'docx.min.js',
        path: path.resolve(__dirname, 'dist'), // Outputs to a dist folder
        libraryTarget: 'var',
        library: 'Docx'
    },
    mode: 'production'
};
