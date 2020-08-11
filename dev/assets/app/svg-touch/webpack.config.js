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
global.staticPath = ['static']; // 例 ['static']

// 项目类别(生成对应的雪碧图css)
global.targetPlatform = ['mobile']; // 默认值 ['original','mobile','wxapp','pc']

// 编译时将css混合到js中
global.mixCss = undefined;

var path = require('path');
// 引用通用配置
var cpath = __dirname.substring(0, __dirname.indexOf('assets'));
cpath = path.join(cpath, 'assets', 'webpack', 'config.js');

var config = require(cpath);
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const vConsolePlugin = require('vconsole-webpack-plugin');

// config 自定义配置

// 例：删除externals jquery
// delete config.externals.jquery;

// 例：将vue模块指向到vue1模块
// config.resolve.alias.vue$ = config.resolve.alias.vue1$;


//css文件合并到js中，sass文件不合并
config.module.rules[0] = {
    test: /\.(sa|sc|wx)ss$/,
    use: [
        MiniCssExtractPlugin.loader,
        // options: { importLoaders: 1 // 0 => 无 loader(默认); 1 => postcss-loader; 2 => postcss-loader, sass-loader }
        'css-loader',
        {
            loader: 'postcss-loader',
            options: {
                plugins: () => [
                    require('autoprefixer') ({
                        overrideBrowserslist: ['last 30 version', '>1%', 'ios 4','chrome >= 10','firefox >= 3']
                    })
                ]
            }
        },
        // 'sass-loader'
        {
            loader: "sass-loader",
            options: {
                data: global.ISTEST?'$reshost: "res.bch.leju.com";':'$reshost: "res.leju.com";'
            }
        }
    ]
};
config.module.rules.splice(1, 0, {
    test: /\.css$/,
    use: [
        'style-loader',
        'css-loader',
        {
            loader: 'postcss-loader',
            options: {
                plugins: () => [
                    require('autoprefixer') ({
                        overrideBrowserslist: ['last 30 version', '>1%', 'ios 4','chrome >= 10','firefox >= 3']
                    })
                ]
            }
        },
    ]
});
// config.plugins[1] = new MiniCssExtractPlugin({
//     filename: (res) => {
//         let ext = path.extname(res.chunk.entryModule.resource || '');
//         if (ext === '.wxss')
//             return '[name].wxss'
//         return '[name].css'
//     },
//     chunkFilename: "[id].css"
// });
// config.plugins.push(new vConsolePlugin({
//     filter: [],
//     enable: !!global.ISTEST
// }));
module.exports = config;