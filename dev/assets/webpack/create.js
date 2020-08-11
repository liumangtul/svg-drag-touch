/**
 * @fileOverview  创建项目
 * @date  2016.03.11 13:58:06
 */

var path = require('path');
var fs = require('fs');
require('colors');

var dir = path.resolve(__dirname, '..')
read('项目类型(根目录) 1:app  2:module  3:lib', function (c) {
    var t = ['app', 'modules', 'libs'];
    switch (+c) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            return;
    }
    dir = path.join(dir, t[c - 1]);
    read('项目名称(子目录)', function (c) {
        if (!c) return;
        dir = path.join(dir, c);
        read('版本号(1.0.0)', function (c) {
            c = c || '1.0.0';
            dir = path.join(dir, c);
            init(dir);
        });
    });
});

function init(dir) {
    mkdirsSync(dir);
    console.log(dir.bgCyan);
    console.log('目录创建成功。'.cyan);

    dir = path.resolve(dir, '..');
    console.log(dir.bgGreen);
    copy(path.join(__dirname, 'temp/config.js'), path.join(dir, 'webpack.config.js'));
    // writeSync(txtConfig, path.join(dir, 'webpack.config.js'));
    // writeSync(txtBuild, path.join(dir, 'webpack.build.js'));
    // writeSync(txtBuildBat, path.join(dir, 'webpack.build.bat'));
    console.log('脚本写入成功。'.green);
}

function copy(from, to) {
    // 创建读取流
    readable = fs.createReadStream(from);
    // 创建写入流
    writable = fs.createWriteStream(to);
    // 通过管道来传输流
    readable.pipe(writable);
}

function mkdirsSync(dirpath) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function (dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            } else {
                pathtmp = dirname;
            }
            pathtmp = pathtmp || path.sep;//兼容*nux环境
            if (!fs.existsSync(pathtmp)) fs.mkdirSync(pathtmp);
        });
    }
    return true;
}

function read(prompt, callback) {
    process.stdout.write(prompt + '    -');
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.once('data', function (chunk) {
        process.stdin.pause();
        callback(chunk.trim());
    });
}

function writeSync(txt, path) {
    fs.writeFileSync(path, txt);
}