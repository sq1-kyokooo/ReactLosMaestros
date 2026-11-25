// Webpack is only used by Karma to bundle the tests; the app itself is built with Vite.
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: { loader: 'ts-loader', options: { configFile: 'tsconfig.karma.json', transpileOnly: true } },
      },
      {
        test: /\.tsx?$/,
        include: /src/,
        exclude: /\.spec\.tsx?$/,
        enforce: 'post',
        use: { loader: 'babel-loader', options: { plugins: ['istanbul'] } },
      },
      { test: /\.(png|jpe?g|jfif|webp|avif|svg)$/, type: 'asset/resource' },
      { test: /\.css$/, type: 'asset/source' },
    ],
  },
};
