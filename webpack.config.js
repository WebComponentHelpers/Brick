const path = require('path');

module.exports = {
  entry: './src/brick.ts',

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  	
  output: {
    filename: 'brick.js',
    path: path.resolve(__dirname, 'build/')
  }
};
