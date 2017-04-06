/**
 * Created by changeden on 2017/3/16
 */
let express = require('express');
let router = express.Router();
let ResUtils = require('../utils/ResUtils');
let DbUtils = require('../utils/DatabaseUtils');
let TextUtils = require('../utils/TextUtils');
let UUID = require('../utils/UUIDUtils');
let DateUtils = require('../utils/DateUtils');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('version_manager', {
        title: 'Apk版本管理系统'
    });
});
router.get('/app/:appId', function (req, res, next) {
    res.render('app_manager', {
        title: '应用详情'
    });
});

/**
 * 注册应用，返回AppId
 * @param id 为用户ID*/
router.put('/:id', function (req, res) {
    const body = req.body;
    const userId = req.params.id;
    if (!TextUtils.checkLength(userId, 6, 50)) {
        userNotExist(res);
    } else if (!TextUtils.checkLength(body.appName, 2, 20)) {
        ResUtils.call(res, -1, "应用名应为2-20位字符串");
    } else if (!TextUtils.checkLength(body.appPackage, 2, 200)) {
        ResUtils.call(res, -1, "应用包名应为2-200位字符串");
    } else {
        var userSql = "select count(*) count from apk_version_user where user_id = ?";
        userSql = DbUtils.format(userSql, [userId]);
        const client = DbUtils.connectServer();
        client.query(userSql, function (err, result) {
            if (err) {
                console.log(err);
                userNotExist(res);
            } else {
                if (result[0].count > 0) {
                    const appId = UUID.formatV4();
                    var insertSql = "insert into apk_version_app(appid,app_name,app_descr,app_package,app_creator,create_at,update_at) values(?,?,?,?,?,?,?)";
                    const time = new Date().getTime();
                    insertSql = DbUtils.format(insertSql, [appId, body.appName, body.appDescr ? body.appDescr : '', body.appPackage, userId, time, time]);
                    client.query(insertSql, function (err, result) {
                        if (err) {
                            console.log(err);
                            ResUtils.call(res, -1, "应用创建失败，请重试");
                        } else {
                            getAppList(req, res, function (appList) {
                                ResUtils.call(res, 0, "应用创建成功", {
                                    appList: appList
                                });
                            }, function () {
                                ResUtils.call(res, 0, "应用创建成功", {});
                            });
                        }
                    });
                } else {
                    userNotExist(res);
                }
            }
        });
    }
});
/**
 * 获取App列表
 * @param id 为用户ID
 * */
router.get('/:id', function (req, res) {
    getAppList(req, res, function (appList) {
        ResUtils.call(res, 0, "App列表获取成功", {
            appList: appList
        });
    }, function () {
        ResUtils.call(res, -1, "App列表获取失败");
    });
});

router.get('/app/:userId/:appId', function (req, res) {
    const userId = req.params.userId;
    const appId = req.params.appId;
    if (userId && appId) {
        const client = DbUtils.connectServer();
        var detailSql = "select t1.appid,t1.app_name,t1.app_descr,t1.app_package,t2.apk_id,t2.apk_build,t2.apk_version,t2.apk_new_message,t2.apk_remote_link,t2.create_at from apk_version_app t1 left join apk_version t2 on t2.appid = t1.appid  where t1.appid = ? and t1.app_creator = ? order by t2.create_at desc";
        detailSql = DbUtils.format(detailSql, [appId, userId]);
        client.query(detailSql, function (err, result) {
            if (err) {
                console.log(err);
                ResUtils.call(res, -1, '数据获取失败');
            } else {
                if (result.length < 1) {
                    ResUtils.call(res, -1, '该应用不存在');
                } else {
                    const firstItem = result[0];
                    const obj = {
                        appInfo: {
                            appid: firstItem.appid,
                            appName: firstItem.app_name,
                            appDescr: firstItem.app_descr,
                            appPackage: firstItem.app_package,
                        }
                    };
                    if (firstItem.create_at) {
                        obj.versionList = result;
                    } else {
                        obj.versionList = [];
                    }
                    ResUtils.call(res, 0, '应用详情获取成功', obj);
                }
            }
        });
    } else {
        userNotExist(res);
    }
});

router.put('/app/:userId/:appId/upload', function (req, res) {
    let params = req.params;
    let body = req.body;
    let userId = params.userId;
    let appId = params.appId;
    if (userId && appId) {
        let build = parseInt(body.build);
        let version = body.version;
        let updateMessage = body.updateMessage;
        let diskLink = body.diskLink;
        let fileName = body.fileName;
        let remoteLink = body.remoteLink;
        let size = body.size;
        if (!build || build < 0) {
            ResUtils.call(res, -1, 'Apk 的 build(versionCode) 不正确');
        } else if (!TextUtils.checkLength(version, 1, 100)) {
            ResUtils.call(res, -1, 'Apk 的 version(versionName) 不正确');
        } else if (!TextUtils.checkLength(diskLink, 10, 1000)
            || !TextUtils.checkLength(fileName, 5, 1000)
            || !TextUtils.checkLength(remoteLink, 10, 1000)) {
            ResUtils.call(res, -1, '发布异常，应该是上传时出现错误导致的');
        } else {
            const client = DbUtils.connectServer();
            let apkId = UUID.formatV4();
            var insertSql = "insert into apk_version(apk_id,appid,apk_build,apk_version,apk_new_message,apk_disk_link,apk_file_name,apk_remote_link,user_id,create_at,apk_size) values(?,?,?,?,?,?,?,?,?,?,?)";
            insertSql = DbUtils.format(insertSql, [
                apkId, appId, build, version, updateMessage, diskLink, fileName, remoteLink, userId, new Date().getTime(), size
            ]);
            client.query(insertSql, function (err, result) {
                if (err) {
                    console.log(err);
                    ResUtils.call(res, -1, '发布失败，请稍后重试');
                } else {
                    ResUtils.call(res, 0, "发布成功", {
                        apkId: apkId
                    });
                }
            });
        }
    } else {
        userNotExist(res);
    }
});
router.put('/app/:userId/:appId/update', function (req, res) {
    let params = req.params;
    let body = req.body;
    let userId = params.userId;
    let appId = params.appId;
    if (userId && appId) {
        const client = DbUtils.connectServer();
        console.log(body)
        var updateSql;
        let apkId = body.apkId;
        if (apkId && apkId != 'undefined') {//如果有"apkId"，则是更新某一个版本的"更新日志"
            let updateMessage = body.updateMessage;
            if (updateMessage == null) {
                ResUtils.call(res, -1, "更新日志修改失败");
            } else {
                updateSql = "update apk_version set apk_new_message = ? where apk_id = ?";
                updateSql = DbUtils.format(updateSql, [updateMessage, apkId]);
            }
        } else {//否则是更新App某些信息
            let app_name = body.app_name;
            let app_descr = body.app_descr;
            let app_package = body.app_package;
            if (app_name != null && !TextUtils.checkLength(app_name, 2, 20)) {
                ResUtils.call(res, -1, "应用名应为2-20位字符串");
            } else if (app_package != null && !TextUtils.checkLength(app_package, 2, 200)) {
                ResUtils.call(res, -1, "应用包名应为2-200位字符串");
            } else if (app_name == null && app_package == null && app_descr == null) {
                ResUtils.call(res, -1, "应用信息更新失败");
            } else {
                let defaultUpdateSql = "update apk_version_app set ";
                updateSql = defaultUpdateSql;
                if (app_name != null) {
                    updateSql += " app_name = '" + app_name + "' ";
                }
                if (app_package != null) {
                    if (updateSql.length > defaultUpdateSql.length) {
                        updateSql += " , ";
                    }
                    updateSql += " app_package = '" + app_package + "' ";
                }
                if (app_descr != null) {
                    if (updateSql.length > defaultUpdateSql.length) {
                        updateSql += " , ";
                    }
                    updateSql += " app_descr = '" + app_descr + "' ";
                }
                updateSql += ", update_at = ? where appid = ?";
                updateSql = DbUtils.format(updateSql, [DateUtils.getTime(), appId]);
            }
        }
        if (updateSql) {
            client.query(updateSql, function (err, result) {
                if (err) {
                    console.log(err);
                    ResUtils.call(res, -1, '信息更新失败');
                } else {
                    ResUtils.call(res, 0, '信息更新成功');
                }
            });
        }
    } else {
        userNotExist(res);
    }
});
/**删除某个应用或者删除某个版本*/
router.delete('/app/:userId/:appId/:apkId', function (req, res) {
    let params = req.params;
    let userId = params.userId;
    let appId = params.appId;
    let apkId = params.apkId;
    if (userId && appId) {
        if (apkId) {
            const client = DbUtils.connectServer();
            var deleteSql;
            var formatParams = [];
            if (apkId == 'thisApp') {
                deleteSql = 'delete from apk_version_app where appid = ?;';
                formatParams = [appId];
            } else {
                deleteSql = 'delete from apk_version where apk_id = ?;';
                formatParams = [apkId];
            }
            deleteSql = DbUtils.format(deleteSql, formatParams);
            client.query(deleteSql, function (err, result) {
                if (err) {
                    console.log(err);
                    ResUtils.call(res, -1, '删除失败');
                } else {
                    console.log(result);
                    if (apkId == 'thisApp') {
                        deleteSql = 'delete from apk_version where appid = ?';
                        deleteSql = DbUtils.format(deleteSql, [appId]);
                        client.query(deleteSql, function (err, result) {
                            if (err) {
                                console.log(err);
                                ResUtils.call(res, -1, '删除失败');
                            } else {
                                ResUtils.call(res, 0, '删除成功');
                            }
                        });
                    } else {
                        ResUtils.call(res, 0, '删除成功');
                    }
                }
            });
        } else {
            ResUtils.call(res, -1, '非法操作');
        }
    } else {
        userNotExist(res);
    }
});
router.get('/latest/:appId', function (req, res) {
    let appId = req.params.appId;
    if (appId) {
        const client = DbUtils.connectServer();
        var sql = 'select * from apk_version where appid = ? order by create_at desc limit 1;';
        sql = DbUtils.format(sql, [appId]);
        client.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                ResUtils.call(res, -1, '找不到应用');
            } else {
                if (result.length > 0) {
                    let lastItem = result[0];
                    let obj = {
                        appId: lastItem.appid,
                        build: lastItem.apk_build,
                        version: lastItem.apk_version,
                        updateLog: lastItem.apk_new_message,
                        fileName: lastItem.apk_file_name,
                        downloadPath: lastItem.apk_remote_link,
                        fileSize: lastItem.apk_size,
                        updateAt: lastItem.create_at
                    };
                    ResUtils.call(res, 0, '最新版本获取成功', obj);
                } else {
                    ResUtils.call(res, -1, '该应用没有最新版本');
                }
            }
        });
    } else {
        ResUtils.call(res, -1, '非法操作');
    }
});
module.exports = router;

function userNotExist(res) {
    ResUtils.call(res, -1, '用户或应用不存在');
}
function getAppList(req, res, success, fail) {
    const userId = req.params.id;
    if (!TextUtils.checkLength(userId, 6, 50)) {
        userNotExist(res);
    } else {
        const client = DbUtils.connectServer();
        var listSql = "select appId id,app_name name,app_descr descr,update_at updateAt from apk_version_app where app_creator = ? order by update_at desc";
        listSql = DbUtils.format(listSql, [userId]);
        client.query(listSql, function (err, result) {
            if (err) {
                fail();
            } else {
                success(result);
            }
        });
    }
}