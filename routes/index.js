var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var srcString = 'Changeden.net的NodeJs开源项目';
    res.render('index', {
        title: '欢迎进入' + srcString,
        line1: srcString,
        line2: '项目被创建于2017年3月16日15:40:44',
        line3: '更多内容请继续关注 nodejs.api.changeden.net'
    });
});

module.exports = router;
