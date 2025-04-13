const path = require('path');

module.exports = {
  entry: './src/preload.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, '.webpack/main'),
  },
  target: 'electron-preload',
  mode: 'development',
}; 