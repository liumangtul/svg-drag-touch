/**
* @fileOverview  项目webpack配置
* @date  2016.03.11 16:08:10
*/

// 指定版本号
global.version = undefined;

// 指定输出目录
global.outputPath = undefined;
// global.outputPath = 'dev/wxapp/';

// 指定静态文件目录 不处理直接copy
// 建议不要使用sprites images目录 可能造成冲突
global.staticPath = undefined; // 例 ['static']

// 项目类别(生成对应的雪碧图css)
global.targetPlatform = undefined; // 默认值 ['original','mobile','wxapp','pc']

// 编译时将css混合到js中
global.mixCss = undefined;

var path = require('path');
// 引用通用配置
var cpath = __dirname.substring(0, __dirname.indexOf('assets'));
cpath = path.join(cpath, 'assets', 'webpack', 'config.js');

var config = require(cpath);
// config 自定义配置

// 例：删除externals jquery
// delete config.externals.jquery;

// 例：将vue模块指向到vue1模块
// config.resolve.alias.vue$ = config.resolve.alias.vue1$;

module.exports = config;
