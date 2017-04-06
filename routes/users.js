var express = require('express');
var router = express.Router();
var ResUtils = require('../utils/ResUtils');
var DbUtils = require('../utils/DatabaseUtils');
var TextUtils = require('../utils/TextUtils');

router.get('/', function (req, res, next) {
    res.render('version_manager_user', {
        title: '用户信息',
    });
});
/**创建用户*/
router.put('/', function (req, res, next) {
    var body = req.body;
    var account = body.account;
    var password = body.password;
    var name = body.name;
    if (!TextUtils.checkLength(account, 6, 50) || !TextUtils.checkEng(account)) {
        ResUtils.call(res, -1, '账号应为6-50位字符(字母或数字组合)字符串');
    } else if (!TextUtils.checkLength(password, 6, 32) || !TextUtils.checkEng(password)) {
        ResUtils.call(res, -1, '登录密码应为6-32位(字母或数字组合)字符串');
    } else if (!TextUtils.checkLength(name, 2, 20)) {
        ResUtils.call(res, -1, '用户名应为2-20位字符');
    } else {
        var client = DbUtils.connectServer();
        var sql = 'insert into apk_version_user(user_id,user_name,user_account,user_password,create_at,update_at,company) values(?,?,?,?,?,?,?);';
        var time = new Date().getTime();
        sql = DbUtils.format(sql, [account, name, account, password, time, time, '']);
        client.query(sql, function (err, result, fields) {
            if (err) {
                if (err.message.toString().match("for key 'PRIMARY'") != null) {
                    ResUtils.call(res, -1, '注册失败，该账户已被注册');
                } else {
                    ResUtils.call(res, -1, '注册失败，请稍后重试');
                }
            } else {
                ResUtils.call(res, 0, '注册成功，赶紧登录吧');
            }
        })
    }
});

/**登录*/
router.post("/login", function (req, res, next) {
    var body = req.body;
    var account = body.account;
    var password = body.password;
    if (!TextUtils.checkLength(account, 6, 50) || !TextUtils.checkEng(account)) {
        ResUtils.call(res, -1, '账号应为6-50位字符(字母或数字组合)字符串');
    } else if (!TextUtils.checkLength(password, 6, 32) || !TextUtils.checkEng(password)) {
        ResUtils.call(res, -1, '登录密码应为6-32位(字母或数字组合)字符串');
    } else {
        var client = DbUtils.connectServer();
        var sql = "select * from apk_version_user where user_account = ? and user_password = ? order by update_at limit 1";
        sql = DbUtils.format(sql, [account, password]);
        client.query(sql, function (err, result, fields) {
            if (err) {
                ResUtils.call(res, -1, '登录失败，请稍后重试');
            } else {
                if (result.length == 0) {
                    ResUtils.call(res, -1, '登录失败，账号不存在或密码错误');
                } else {
                    var user = result[0];
                    var obj = {
                        id: user.user_id,
                        name: user.user_name,
                        account: user.user_account,
                        company: user.company
                    };
                    ResUtils.call(res, 0, '登录成功', obj);
                }
            }
        });
    }
});

/**更新资料*/
router.put('/update', function (req, res, next) {
    let userId = req.header('USER');
    if (userId) {
        let body = req.body;
        let password = body.password;
        let name = body.name;
        let company = body.company;
        console.log(body)
        if (!TextUtils.checkLength(password, 6, 32) || !TextUtils.checkEng(password)) {
            ResUtils.call(res, -1, '登录密码应为6-32位(字母或数字组合)字符串');
        } else if (!TextUtils.checkLength(name, 2, 20)) {
            ResUtils.call(res, -1, '用户名应为2-20位字符');
        } else {
            let client = DbUtils.connectServer();
            var sql = "UPDATE apk_version_user SET user_name = ?,update_at = ?" + (company == null ? "" : ",company = ?") + " WHERE user_account = ? and user_password = ?";
            console.log(sql)
            if (company == null) {
                sql = DbUtils.format(sql, [name, new Date().getTime(), userId, password]);
            } else {
                sql = DbUtils.format(sql, [name, new Date().getTime(), company, userId, password]);
            }
            client.query(sql, function (err, result, fields) {
                if (err) {
                    updateError(res);
                } else {
                    console.log(result)
                    if (result.changedRows > 0) {
                        ResUtils.call(res, 0, '信息更新成功');
                    } else {
                        accountAndPasswordNoMatch(res);
                    }
                }
            });
        }
    } else {
        updateError(res);
    }
});
router.put('/update/password', function (req, res) {
    var userId = req.header('USER');
    if (userId) {
        let body = req.body;
        let originalPwd = body.originalPwd;
        let newPwd = body.newPwd;
        let confirmPwd = body.confirmPwd;
        if (!TextUtils.checkLength(originalPwd, 6, 32) || !TextUtils.checkEng(originalPwd)) {
            ResUtils.call(res, -1, '登录密码错误');
        } else if (!TextUtils.checkLength(newPwd, 6, 32) || !TextUtils.checkEng(newPwd)) {
            ResUtils.call(res, -1, '新密码应为6-32位(字母或数字组合)字符串');
        } else if (confirmPwd != newPwd) {
            ResUtils.call(res, -1, '请确保新密码与确认密码完全一致');
        } else {
            let client = DbUtils.connectServer();
            var sql = 'UPDATE apk_version_user SET user_password = ? WHERE user_id = ? and user_password = ?';
            sql = DbUtils.format(sql, [confirmPwd, userId, originalPwd]);
            client.query(sql, function (err, result, fields) {
                if (err) {
                    updateError(res);
                } else {
                    if (result.changedRows > 0) {
                        ResUtils.call(res, 0, '密码修改成功');
                    } else {
                        accountAndPasswordNoMatch(res);
                    }
                }
            });
        }
    } else {
        updateError(res);
    }
});
/**获取用户信息*/
router.get('/info', function (req, res) {
    let userId = req.header('USER');
    if (!TextUtils.checkLength(userId, 6, 50) || !TextUtils.checkEng(userId)) {
        ResUtils.call(res, -1, '该用户不存在');
    } else {
        let client = DbUtils.connectServer();
        var selectSql = "select * from apk_version_user where user_id = ?";
        selectSql = DbUtils.format(selectSql, [userId]);
        client.query(selectSql, function (err, result) {
            if (err) {
                console.log(err);
                ResUtils.call(res, -1, '该用户不存在');
            } else {
                if (result.length > 0) {
                    var userInfo = result[0];
                    userInfo.user_password = '';
                    ResUtils.call(res, 0, '用户信息获取成功', {
                        userInfo: userInfo
                    });
                } else {
                    ResUtils.call(res, -1, '该用户不存在');
                }
            }
        });
    }
});
module.exports = router;
function updateError(res) {
    ResUtils.call(res, -1, '信息更新失败');
}
function accountAndPasswordNoMatch(res) {
    ResUtils.call(res, -1, '账号与登录密码不符');
}