var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('donate', {
        title: '捐赠/施舍',
        line1:'求捐赠点资金升带宽'
    });
});

module.exports = router;
