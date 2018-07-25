# <center>Vue多文件应用模版</center>

## 说明:
* 改写vue webpack单文件应用模版配置而来
* 主要有两个文件夹，src/entry为js入口文件，src/views为模版文件
* entry的js文件要和views的html文件一一对应， 比如：entry/index.js对应entry/index.html,<br>
 views/about/about.js对应views/about/about.html
* 编译后文件生成在dist下对应文件夹下，html文件自动连接对应js文件和css文件
