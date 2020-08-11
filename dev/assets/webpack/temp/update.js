var path = require('path');
var fs = require('fs');
let pwd = process.argv.slice(2)[0];
if (!pwd) {
    console.log(`请传入项目目录,当前目录变量:
    bash: npm run update $PWD
    pwsh: npm run update $pwd
    cmd: npm run update %cd%`);
    return;
}
copy(path.join(__dirname, 'config.js'), path.join(pwd, 'webpack.config.js'));
console.log('webpack.config.js 已复制');

function copy(from, to) {
    // 创建读取流
    readable = fs.createReadStream(from);
    // 创建写入流
    writable = fs.createWriteStream(to);
    // 通过管道来传输流
    readable.pipe(writable);
}