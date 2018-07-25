'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const fs = require('mz/fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function readJsFiles(filePath){
  //根据文件路径读取文件，返回文件列表
  let filesTmp = fs.readdirSync(filePath)
  let files = []
  //遍历读取到的文件列表
  filesTmp.forEach(function(filename){
    //获取当前文件的绝对路径
    var filedir = path.join(filePath, filename);
    //根据文件路径获取文件信息，返回一个fs.Stats对象
    let stats = fs.statSync(filedir) 
    var isFile = stats.isFile();//是文件
    var isDir = stats.isDirectory();//是文件夹
    if(isFile && filedir.endsWith('.js')){
        files.push(filedir)
    }
    if(isDir){
        files.push(...readJsFiles(filedir));//递归，如果是文件夹，就继续遍历该文件夹下面的文件
    }
  });
  return files;
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

let entryDir = readJsFiles('src/entry')
let entryFiles = {};
let plugins = [];
entryDir.forEach(file => {
  let i = file.lastIndexOf('src\\entry\\')
  let name = file.slice(i+10)
  name = name.slice(0, -3)

  let outputName = file.replace('src/entry/', '')
  outputName = outputName.replace('src\\entry\\', '')
  outputName = outputName.replace('.js', '.html')

  let tplName = file.replace('src/entry', 'src/views')
  tplName = tplName.replace('src\\entry', 'src\\views')
  tplName = tplName.replace('.js', '.html')

  entryFiles[name] = resolve(file);
  let config = {
    // filename: resolve('dist/'+name+'.html'),
    filename: outputName,
    template: tplName,
    inject: true,
    chunks: [name],
    hash: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    chunksSortMode: 'dependency',
  }
  plugins.push(new HtmlWebpackPlugin(config));
})

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: entryFiles,
  output: {
    path: config.build.assetsRoot,
    filename: 'js/[name][hash:8].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins: plugins,
}
