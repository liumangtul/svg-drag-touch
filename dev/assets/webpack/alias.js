/**
 * @fileOverview  检测并输出模块list --Semantic Version
 * @date  2016.03.14 11:24:47
 */

var fs = require('fs');
var path = require('path');
require('colors');

var aliasLibs = each('libs');
each2(aliasLibs);
var aliasModules = each('modules');
each2(aliasModules);

var alias = { ...aliasLibs, ...aliasModules };
console.log('____________________________________________________'.bold);
console.log('alias:'.bgCyan, alias);
var txt = JSON.stringify(alias).replace(/,/g, ',\r\n').replace('{', '{\r\n').replace('}', '\r\n}');
fs.writeFile(path.join(__dirname, 'alias.json'), txt, function (err) {
    if (!err) {
        console.log('已重新生成模块别名映射，请查看webpack/alias.json。'.green.bold);
        return;
    }
    console.log('错误'.red.bold);
});

// 同步到typescript
var tsConf = {
    "compileOnSave": true,
    "compilerOptions": {
        "baseUrl": "../",
        "paths": {}
    }
};
tsPaths(aliasLibs, "./libs/");
tsPaths(aliasModules, "./modules/");
var tsTxt = JSON.stringify(tsConf).replace(/,/g, ',\r\n').replace(/\{/g, '{\r\n').replace(/\}/g, '\r\n}');
fs.writeFile(path.join(__dirname, '../typescript/paths.json'), tsTxt, function (err) {
    if (!err) {
        console.log('已同步typescript配置，请查看typescript/paths.json。'.green.bold);
        return;
    }
    console.log('错误'.red.bold);
});

//筛选目录
function each(cate) {
    var root = path.join(path.resolve(__dirname, '..'), cate);
    var arr1 = walk(root);
    console.log(cate.bgCyan, JSON.stringify(arr1).cyan.bold);

    var alias = {};
    arr1.forEach(function (dir) {
        var apdir = path.join(root, dir);
        console.log(apdir.green, dir.cyan.bold);
        var arr2 = walk(apdir); //版本目录list
        arr2 = arr2.filter(filter).sort(sort);
        console.log(arr2);

        var v1, v2;
        arr2.forEach(function (item, i) {
            v2 = parseInt(item);
            if (v1 === undefined) v1 = v2;
            if (v1 < v2) { //v1当前主版本号最后一位 v2下一个版本
                alias[dir + v1 + '$'] = path.join(cate, dir, arr2[i - 1]);
                v1 = v2;
            }
            if (i === arr2.length - 1) {
                alias[dir + '$'] = alias[dir + v2 + '$'] = path.join(cate, dir, arr2[i]);
            }
        });
    });
    return alias;
}

//筛选主文件
function each2(alias) {
    for (var key in alias) {
        var value = alias[key];
        var files = walk2(value);
        if (files.length === 1) {
            alias[key] = value.substring(value.indexOf(path.sep) + 1).replace(/\\/g, '/') + '/' + files[0];
            continue;
        }
        let jsFiles = files.filter((f) => {
            return f.endsWith('.js');
        });
        if (jsFiles.length === 1) {
            alias[key] = value.substring(value.indexOf(path.sep) + 1).replace(/\\/g, '/') + '/' + jsFiles[0];
            continue;
        }
        var fname = key.replace('$', '').replace(/(\d*$)/g, "");
        var index = files.indexOf(fname + '.min.js');
        if (index === -1) {
            index = files.indexOf(fname + '.js');
        }
        if (index === -1) {
            index = files.indexOf(fname + '.scss');
        }
        if (index === -1) {
            index = files.indexOf(fname + '.css');
        }
        if (index !== -1) {
            alias[key] = value.substring(value.indexOf(path.sep) + 1).replace(/\\/g, '/') + '/' + files[index];
            continue;
        }
        alias[key] = value.substring(value.indexOf(path.sep) + 1).replace(/\\/g, '/') + '/';
        // delete alias[key]; //删除没有检测到文件的版本
    }
}

//检查文件夹
function walk(dir) {
    var arr = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = file.toLowerCase();
        var stat = fs.statSync(path.join(dir, file));
        if (stat && stat.isDirectory()) {
            arr.push(file);
        }
    });
    return arr;
}

//检查js文件
function walk2(dir) {
    var arr = [];
    dir = path.join(path.resolve(__dirname, '..'), dir);
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = file.toLowerCase();
        var stat = fs.statSync(path.join(dir, file));
        if (stat && stat.isFile() && !file.startsWith('_')) { // && file.endsWith('.js')
            arr.push(file);
        }
    });
    return arr;
}

//过滤目录
function filter(i) {
    return /^\d+\.\d+\.\d+$/.test(i);
}

//从小到大
function sort(ver1, ver2) {
    if (ver1 == ver2) return;
    var verArr1 = ver1.split(".");
    var verArr2 = ver2.split(".");
    for (var i = 0; i < 3; i++) {
        var v1 = +verArr1[i],
            v2 = +verArr2[i];
        if (v2 !== v1) {
            return v1 - v2;
        }
    }
}

function tsPaths(alias, prefix) {
    var paths = {};
    for (var key in alias) {
        var k = key.replace('$', '');
        paths[k] = [prefix + alias[key]];
    }
    Object.assign(tsConf.compilerOptions.paths, paths);
}