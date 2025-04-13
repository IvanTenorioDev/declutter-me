const path = require('path');

module.exports = {
  entry: {
    main: './src/main/index.js',
    preload: './src/preload.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack/main'),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  target: 'electron-main',
  mode: 'development',
}; 