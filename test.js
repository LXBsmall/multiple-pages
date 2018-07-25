const fs = require('mz/fs')
const path = require('path')

function resolve (dir) {
    return path.join(__dirname, dir)
  }

  /**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    let filesTmp = fs.readdirSync(filePath)
    let files = []
    //遍历读取到的文件列表
    filesTmp.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath,filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        let stats = fs.statSync(filedir) 
        var isFile = stats.isFile();//是文件
        var isDir = stats.isDirectory();//是文件夹
        if(isFile && filedir.endsWith('.js')){
            files.push(filedir)
        }
        if(isDir){
            files.push(fileDisplay(filedir));//递归，如果是文件夹，就继续遍历该文件夹下面的文件
        }
            
    });
    return files;
}

let entryDir = fileDisplay('src/entry');
console.log(entryDir)
let entryFiles = {};
entryDir.filter(file => {
    fs.stat(file).then(stat => console.log(stat))
  if(file.endsWith('.js')) {
    let name = file.slice(0, -3);
    entryFiles[name] = resolve('src/entry/'+file);
    console.log(entryFiles)
    let config = {
      // filename: resolve('dist/'+name+'.html'),
      filename: entryFiles[name].replace('src/entry', 'dist'),
      template: entryFiles[name].replace('src/views', 'dist'),
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
    console.log(config);
    // plugins.push(new HtmlWebpackPlugin(config));
  }
})