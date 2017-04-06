let express = require('express');
let router = express.Router();
let fs = require('fs');
let ResUtils = require('../utils/ResUtils');
let DbUtils = require('../utils/DatabaseUtils');
let TextUtils = require('../utils/TextUtils');
let multer = require('multer');
let upload = multer({dest: 'uploads/'});
let DateUtils = require('../utils/DateUtils');
let UUID = require('../utils/UUIDUtils');
let qiniu = require("qiniu");
let config = require('../bin/json/config.json');
let apkinfo = require('apkinfo');

router.post('/upload', upload.single('file'), function (req, res, next) {
    const user = req.header('USER');
    const file = req.file;
    if (!TextUtils.checkLength(user, 6, 50) || !TextUtils.checkEng(user)) {
        userNotDefine(res, file);
    } else if (file) {
        const client = DbUtils.connectServer();
        var sql = "select count(*) from apk_version_user where user_id = ? order by update_at limit 1";
        sql = DbUtils.format(sql, [user]);
        client.query(sql, function (err, result) {
            if (err) {
                userNotDefine(res, file);
            } else {
                if (result[0]['count(*)'] < 1) {
                    userNotDefine(res, file);
                } else {
                    const root = './public/uploads/';
                    const userPath = root + user + '/';
                    fs.exists(userPath, function (exists) {
                        if (exists) {
                            moveFile(file, userPath, res, user);
                        } else {
                            fs.mkdir(userPath, 0o777, function (err) {
                                if (err) {
                                    console.log(err);
                                    fileUploadError(res);
                                } else {
                                    moveFile(file, userPath, res, user);
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        console.log('文件不存在');
        fileUploadError(res);
    }
});
/**上传至七牛*/
function uploadToQiNiu(file, target, user, res) {
    qiniu.conf.ACCESS_KEY = config.qiniu.access_key;
    qiniu.conf.SECRET_KEY = config.qiniu.secret_key;
    const key = user + '_' + new Date().Format('yyyy-MM-dd-HH-mm-ss') + '_' + file.originalname;
    const bucket = config.qiniu.bucket.nodejs_file;
    qiniu.io.putFile(new qiniu.rs.PutPolicy(bucket.name + ":" + key).token(),
        key, target, new qiniu.io.PutExtra(), function (err, ret) {
            if (err) {
                // 上传失败， 处理返回代码
                console.log(err);
                fileUploadError(res);
            } else {
                // 上传成功， 处理返回值
                if (target.lastIndexOf('.apk') >= 0) {
                    apkinfo.get(target, function (err, info) {
                        if (err) {
                            console.log(err);
                            ResUtils.call(res, -1, "文件解析失败");
                        } else {
                            // console.log(info);
                            info.size = file.size;
                            fileUploadSuccess(res, bucket, target, key, user, info);
                        }
                    });
                } else {
                    fileUploadSuccess(res, bucket, target, key, user, {size: file.size});
                }
            }
        });
}
function fileUploadSuccess(res, bucket, target, key, user, extra) {
    ResUtils.call(res, 0, "文件上传成功", {
        filePath: bucket.root + key,
        diskPath: target,
        userId: user,
        fileName: key,
        extra: extra
    });
}
/**移动文件至静态文件夹*/
function moveFile(file, userPath, res, user) {
    const target = userPath + file.originalname;
    fs.rename(file.path, target, function (err) {
        if (err) {
            console.log(err);
            fileUploadError(res);
        } else {
            uploadToQiNiu(file, target, user, res);
        }
    });
}
function fileUploadError(res) {
    ResUtils.call(res, -1, "文件上传失败");
}
function userNotDefine(res, file) {
    fs.unlink(file.path, function (err) {
        console.log(err);
    });
    ResUtils.call(res, -1, "该用户不存在");
}
module.exports = router;
