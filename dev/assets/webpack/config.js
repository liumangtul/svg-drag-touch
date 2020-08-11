/**
 * @author jiabin1
 * @fileoverview  通用配置
 * @date  2018.12.24 03:34:06
 * https://webpack.js.org
 * https://webpack.docschina.org
 */

// var webpack = require('webpack');

// 自动检测目录 得到js文件列表、当前最高版本
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const Utils = require('./utils.js');
require('colors');
const sh = require('shelljs');

// plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
// happypack
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
// argv
const argv = process.argv.slice(2);
let ISBUILD = false;
global.ISTEST = false;
for (let v of argv) {
    if (!v.indexOf('--version=')) {
        // ->utils
        global.version = v.substr(10);
    } else {
        if (v === '-b' || v === '--build') {
            ISBUILD = true;
        }
    }
}
let u = new Utils().init();
// 项目目录
let cwdpath = process.cwd();
// 入口文件
let entry = {};
// 输出目录
let outputpath;
if (global.outputPath) {
    outputpath = path.join(cwdpath.replace(/dev.*/, global.outputPath));
} else {
    outputpath = path.join(cwdpath.replace('dev', ISBUILD ? 'trunk' : 'branches'), 'v' + u.version.split('.')[0]);
}
// 直接拷贝静态文件目录
if (Array.isArray(global.staticPath) && global.staticPath.length) {
    let staticPath = global.staticPath;
    let s = [], t = [];
    for (let index = 0; index < staticPath.length; index++) {
        s.push(path.join(cwdpath, u.version, staticPath[index]) + path.sep);
        // t.push(path.join(outputpath, staticPath[index]));
    }
    // sh.rm('-rf');
    console.log(`mkdir -p ${outputpath}`);
    sh.mkdir('-p', outputpath);
    console.log(`cp -R ${s} ${outputpath}`);
    sh.cp('-R', s, outputpath);
}
// entry
u.entries.forEach((item) => {
    let k = item.substr(0, item.lastIndexOf('.'));
    let v = './' + u.version + '/' + item;
    entry[k] = v;
});

console.log('entry:'.bgGreen);
console.log(JSON.stringify(entry).replace(/,/g, ',\r\n').replace('{', '{\r\n').replace('}', '\r\n}').green);
console.log('output:'.bgCyan);
console.log(outputpath.cyan);
console.log('webpack:'.bgBlue);

// 模块根目录
let rootDir = path.resolve(__dirname, '..');
let resolveroot = [
    path.join(rootDir, 'libs'),
    path.join(rootDir, 'modules'),
    path.join(rootDir, 'app'),
    path.join(rootDir, 'node_modules')
];
let alias = require('./alias.json');
let alias2 = require('./alias.ext.json');
let alias3 = require('./alias.app.json');
console.log('alias.json ...');
for (let k in alias3) {
    if (alias3[k]) {
        alias[k] = alias3[k];
    }
}
for (let k in alias2) {
    if (alias2[k]) {
        alias[k] = alias2[k];
    }
}
for (let k in alias) {
    alias[k] = alias[k].replace(/\//g, path.sep);//.toUpperCase();
}

// spritesmith样式
const generateSpritePX = function (data) {
    let sheet = data.spritesheet;
    // 拼接class名
    let basename = 'sprite-' + path.basename(sheet.escaped_image, '.png');
    let mArr = basename.match(/-(\d+)x$/);
    let x = mArr ? mArr[1] : 1;

    console.log('pc(px)', basename, x + 'x');

    let shared = `@charset "utf-8";
    @function spx($px){
        @return $px+px
    }
    .${basename} {
        background-image: url(${sheet.escaped_image});
        background-repeat: no-repeat;
        background-size:spx(${sheet.width / x}) auto;
    }`;
    let perSprite = data.sprites.map(function (sprite) {
        return `.${basename}-${sprite.name} {
            @extend .${basename};
            width: spx(${sprite.width / x});
            height: spx(${sprite.height / x});
            background-position: spx(${sprite.offset_x / x}) spx(${sprite.offset_y / x});
        }`;
    }).join('\n');
    return (shared + '\n' + perSprite).replace(/ {4}/g, '');
};
// spritesmith样式
const generateSpriteREM = function (data) {
    let sheet = data.spritesheet;
    // 拼接class名
    let basename = 'sprite-' + path.basename(sheet.escaped_image, '.png');

    let mArr = basename.match(/-(\d+)x$/);
    let x = mArr ? mArr[1] : 1;

    console.log('mobile(rem)', basename, x + 'x');

    let shared = `@charset "utf-8";
    @function srem($px){
        @return $px*(1/50)*1rem
    }
    .${basename} {
        background-image: url(${sheet.escaped_image});
        background-repeat: no-repeat;
        background-size:srem(${sheet.width / x}) auto;
    }`;
    let perSprite = data.sprites.map(function (sprite) {
        return `.${basename}-${sprite.name} {
            @extend .${basename};
            width: srem(${sprite.width / x + 8});
            height: srem(${sprite.height / x + 8});
            background-position: srem(${sprite.offset_x / x + 4}) srem(${sprite.offset_y / x + 4});
        }`;
    }).join('\n');
    return (shared + '\n' + perSprite).replace(/ {4}/g, '');
};
// spritesmith样式
const generateSpriteRPX = function (data) {
    let sheet = data.spritesheet;
    // 拼接class名
    let basename = 'sprite-' + path.basename(sheet.escaped_image, '.png');

    let mArr = basename.match(/-(\d+)x$/);
    let x = mArr ? mArr[1] : 1;

    console.log('wxapp(rpx)', basename, x + 'x');

    let shared = `@charset "utf-8";
    @function srpx($px){
        @return $px+rpx
    }
    .${basename} {
        background-image: url(${sheet.escaped_image});
        background-repeat: no-repeat;
        background-size:srpx(${sheet.width / x}) auto;
    }`;
    let perSprite = data.sprites.map(function (sprite) {
        return `.${basename}-${sprite.name} {
            @extend .${basename};
            width: srpx(${sprite.width / x + 8});
            height: srpx(${sprite.height / x + 8});
            background-position: srpx(${sprite.offset_x / x + 4}) srpx(${sprite.offset_y / x + 4});
        }`;
    }).join('\n');
    return (shared + '\n' + perSprite).replace(/ {4}/g, '');
};
// spritesmith样式
const generateSpriteRPX0 = function (data) {
    let sheet = data.spritesheet;
    // 拼接class名
    let basename = 'sprite-' + path.basename(sheet.escaped_image, '.png');

    let mArr = basename.match(/-(\d+)x$/);
    let x = mArr ? mArr[1] : 1;

    console.log('wxapp(rpx)', basename, x + 'x');

    let shared = `@charset "utf-8";
    @function srpx($px){
        @return $px+rpx
    }
    .${basename} {
        background-image: url(${sheet.escaped_image});
        background-repeat: no-repeat;
        background-size:srpx(${sheet.width / x}) auto;
    }`;
    let perSprite = data.sprites.map(function (sprite) {
        return `.${basename}-${sprite.name} {
            @extend .${basename};
            width: srpx(${sprite.width / x});
            height: srpx(${sprite.height / x});
            background-position: srpx(${sprite.offset_x / x}) srpx(${sprite.offset_y / x});
        }`;
    }).join('\n');
    return (shared + '\n' + perSprite).replace(/ {4}/g, '');
};
// spritesmith实例
const generateSpritesmith = function (devPwd) {
    console.log('generate spritesmith ...');
    if (!fs.existsSync(path.join(devPwd, 'sprites'))) {
        return [];
    }
    let list = fs.readdirSync(path.join(devPwd, 'sprites'));

    let plugins = [];
    let targetPlatform = global.targetPlatform || ['original', 'mobile', 'wxapp', 'wxapp0', 'pc', 'uniapp'];
    list.forEach((pwd) => {
        let cwd = path.join(devPwd, 'sprites', pwd);
        let stat = fs.statSync(cwd);
        if (stat && stat.isDirectory()) {
            let notEmpty = fs.readdirSync(cwd).some((dir) => {
                let stat = fs.statSync(path.join(cwd, dir));
                return stat && stat.isFile();
            });
            if (!notEmpty) return;
            let css = [];
            if (targetPlatform.indexOf('original') !== -1) {
                css.push(
                    // 默认生成的文件
                    [path.join(devPwd, 'sprites/' + pwd + '.o.scss')]
                );
            }
            if (targetPlatform.indexOf('mobile') !== -1) {
                css.push(
                    // rem scss
                    [path.join(devPwd, 'sprites/' + pwd + '.rem.scss'), { format: 'generateSpriteREM' }],
                );
            }
            if (targetPlatform.indexOf('wxapp') !== -1) {
                css.push(
                    // rpx wxss
                    [path.join(devPwd, 'sprites/' + pwd + '.rpx.wxss'), { format: 'generateSpriteRPX' }],
                );
            }
            if (targetPlatform.indexOf('wxapp0') !== -1) {
                console.log(333333333)
                css.push(
                    // rpx wxss
                    [path.join(devPwd, 'sprites/' + pwd + '.rpx.wxss'), { format: 'generateSpriteRPX0' }],
                );
            }
            if (targetPlatform.indexOf('uniapp') !== -1) {
                css.push(
                    // rpx wxss
                    [path.join(devPwd, 'sprites/' + pwd + '.rpx.wxss'), { format: 'generateSpriteRPX' }],
                );
            }
            if (targetPlatform.indexOf('pc') !== -1) {
                css.push(
                    // rpx wxss
                    [path.join(devPwd, 'sprites/' + pwd + '.px.scss'), { format: 'generateSpritePX' }],
                );
            }

            let conf = {
                // 目标小图标
                src: {
                    // 图片所在文件夹（无视子文件夹）
                    cwd: cwd,
                    // 匹配 png 文件，可以用glob语法
                    // 但png和jpg拼一起，有时候图片无法正常显示
                    glob: '*.png'
                },
                // 输出雪碧图文件及样式文件
                target: {
                    // 这个是打包前的目录，不要输出到 dist 目录下
                    image: path.join(devPwd, 'sprites/' + pwd + '.png'),
                    // 可以是字符串、或者数组
                    css
                },
                customTemplates: { generateSpritePX, generateSpriteREM, generateSpriteRPX, generateSpriteRPX0 },
                apiOptions: {
                    // generateSpriteName: function () {
                    //     var fileName = arguments[0].match(/[^\\]+$/)[0].replace(/\.[a-zA-Z]+/, '')
                    //     return fileName
                    // },
                    // 简单来说，这个就是雪碧图的 css 文件怎么找到 雪碧图的 png 文件
                    cssImageRef: 'sprites/' + pwd + '.png'
                },
                spritesmithOptions: {
                    // algorithm: 'top-down',
                    // 雪碧图里，图片和图片的距离，单位是px
                    padding: 8
                },
            };
            plugins.push(new SpritesmithPlugin(conf));
        }
    });
    return plugins;
};

let config = {
    // 页面入口文件配置 支持数组形式，将加载数组中的所有模块，但以最后一个模块作为输出
    entry: entry,
    // 入口文件输出配置
    output: {
        pathinfo: !ISBUILD,
        path: outputpath,
        filename: "[name].js",
        chunkFilename: "[id].js"
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c|wx)ss$/,
                use: [
                    global.mixCss ? 'style-loader' : MiniCssExtractPlugin.loader,
                    // options: { importLoaders: 1 // 0 => 无 loader(默认); 1 => postcss-loader; 2 => postcss-loader, sass-loader }
                    'css-loader',
                    // 'postcss-loader',
                    /*{
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer') ({
                                    overrideBrowserslist: ['last 30 version', '>1%', 'ios 4','chrome >= 10','firefox >= 3']
                                })
                            ]
                        }
                    },*/
                    'sass-loader'

                ]
            }, {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'happypack/loader?id=happyJS'
            }, {
                test: /\.(gif|png|jpg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 4096,
                        name: global.ISTEST?'[path][name].[ext]':'[path][name].[hash].[ext]',
                        // name: '[path][name].[ext]',
                        // file-loader
                        // outputPath: (a, b, c) => {
                        //     // 文件名规则:path1-path2...file.ext
                        //     let p = b.substr(c.length).split(path.sep).slice(2).join('-');
                        //     p = ['images', p].join('/');
                        //     return p;
                        // }
                        outputPath: (name) => {
                            let p = name.split('/').slice(1).join('-');
                            p = ['images', p].join('/');
                            return p;
                        }
                    }
                }]
            }, {
                test: /\.svg$/,
                use: [{
                    loader: 'svg-url-loader',
                    options: {
                        limit: 4096,
                        name: '[path][name].[hash].[ext]',
                        outputPath: (name) => {
                            let p = name.split('/').slice(1).join('-');
                            p = ['images', p].join('/');
                            return p;
                        }
                    }
                }]
            }, {
                test: /\.(txt|html|htm|proto)$/,
                loader: 'raw-loader'
            }, {
                test: /\.(ts|tsx)?$/,
                loader: "ts-loader"
            }
        ],
        noParse: /(jquery|zepto|lodash|vue|echarts)$/,
        // noParse: function (content) {
        //     return /(jquery|lodash)$/.test(content)
        // },
    },
    // 不编译在一起,如果需要合并,在页面引用或者在项目config下删除配置
    externals: {
        jquery: 'jQuery', //'jQuery.noConflict()',
        zepto: 'Zepto',
        vue: 'Vue',
        echarts: 'echarts',
        lodash: '_'
    },
    resolve: {
        // 查找module的话从这里开始查找
        modules: resolveroot,
        // 自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['.js', '.json', '.scss'],
        // 模块别名定义，方便后续直接引用别名，无须多写长长的地址
        alias: alias,
        unsafeCache: true
    },
    optimization: {
        // 非pord模式会自动跳过
        minimizer: [
            // js压缩
            // @4.x删除了Uglify
            // 压缩css minimizer被覆盖
            // 重新安装Uglify
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    // mangle: true,
                    output: {
                        beautify: false,
                    },
                },
                sourceMap: true // set to true if you want JS source maps
            }),
            // css压缩
            // 自带压缩-p有效 config无效 @5.x应该会生效
            // 安装plugin代替
            new OptimizeCSSAssetsPlugin({
                // assetNameRegExp: /\.(c|wx)ss$/g,
            })
        ]
    },
    plugins: [new HappyPack({
        id: 'happyJS',
        loaders: [{
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
            }
        }],
        threadPool: happyThreadPool
    }), new MiniCssExtractPlugin({
        filename: (res) => {
            let ext = path.extname(res.chunk.entryModule.resource);
            if (ext === '.wxss')
                return '[name].wxss'
            return '[name].css'
        },
        chunkFilename: "[id].css"
    })].concat(generateSpritesmith(u.dir))
};

if (ISBUILD) {
    config.mode = 'production';
} else {
    // https://webpack.js.org/concepts/mode/
    config.mode = 'development';
    // https://webpack.js.org/configuration/watch/
    config.watch = true;
    config.watchOptions = {
        ignored: /node_modules/
    };
    // https://webpack.js.org/configuration/devtool/
    // config.devtool = 'nosources-source-map';
    config.devtool = 'source-map';
}

// win默认自动打开trunk
if (ISBUILD && process.platform == "win32") {
    let interval = setInterval(() => {
        if (fs.existsSync(outputpath)) {
            clearInterval(interval);
            exec("start " + outputpath);
        }
    }, 1000);
}

module.exports = config;