let express = require('express');
let router = express.Router();
let fs = require('fs');
let ResUtils = require('../utils/ResUtils');

router.get('/', function (req, res) {
    res.render('open_source', {
        title: '开源文件',
    });
});
router.get('/download/:path', function (req, res, next) {
    const file = decodeURIComponent(req.params.path);
    if (file) {
        console.log(file);
        fs.exists(file, function (exist) {
            if (exist) {
                res.download(file, file.substr(file.lastIndexOf('/')));
            } else {
                fileNotDefine(res);
            }
        });
    } else {
        res.render('open_source', {
            title: '开源文件',
        });
    }
});
router.get('/files', function (req, res) {
    let root = decodeURIComponent(req.query.root);
    if (!root) {
        root = '.';
    }
    console.log(root);
    let result = getFiles(root);
    if (result.rootIsDir) {
        ResUtils.call(res, 0, '目标目录打开成功', result.list);
    } else {
        ResUtils.call(res, -1, "该文件不是目录");
    }
});
function getFiles(root) {
    let result = [];
    if (root != '.') {
        result.push({name: '../', path: root.substr(0, root.lastIndexOf('/')), isDir: true});
    }
    let rootIsDir = fs.lstatSync(root).isDirectory();
    if (rootIsDir) {
        let files = fs.readdirSync(root);
        files.forEach(function (fileName) {
            if (!isIG(fileName)) {
                let path = root + '/' + fileName
                let stat = fs.lstatSync(path);
                result.push({
                    name: fileName,
                    path: path,
                    isDir: stat.isDirectory()
                });
            }
        });
    }
    return {
        list: result,
        rootIsDir: rootIsDir
    };
}
function isIG(fileName) {
    switch (fileName) {
        case '.DS_Store':
        case '.idea':
        case 'nodejs.api.changeden.net.iml':
        case 'DatabaseUtils.js':
        case 'node_modules':
        case 'bin':
        case 'uploads':
            return true;
        default:
            return false;
    }
}
function fileNotDefine(res) {
    ResUtils.call(res, -1, "找不到源码");
}
module.exports = router;
