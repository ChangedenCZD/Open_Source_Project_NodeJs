/**
 * Created by Changeden on 2017/3/23.
 */

var app, apis;
require(['vue', 'common', 'date'], function (Vue, common) {
    this.Vue = Vue;
    this.common = common;
    app = new Vue({
        el: '#wrap',
        data: {
            userId: '',
            appId: '',
            appInfo: {},
            versionList: [],
            isShowUpload: false,
            apkFile: null,
            updateMessage: '',
            isShowMessageModify: false,
            currentItem: null,
            isShowEditAppInfo: false,
            appName: '',
            appPackageName: '',
            appDescr: ''
        },
        created: function () {
            this.userId = this.accountId;
            const path = window.location.pathname.toString();
            this.appId = path.substr(path.lastIndexOf('/') + 1);
            if (this.userId && this.appId) {
                var intervalId = setInterval(function () {
                    if (apis !== 'undefined') {
                        clearInterval(intervalId);
                        getAppDetail();
                    }
                }, 100);
            } else {
                location.href = '../../version_manager';
            }
        },
        ready: function () {
        },
        computed: {
            accountId: {
                get: function () {
                    return common.getStorage('version_user', '')
                },
                set: function (userId) {
                    this.userId = userId;
                    common.setStorage('version_user', userId, 86400 * 7);//保存7天
                }
            },
        },
        methods: {
            toUpload: () => {
                app.isShowUpload = true;
            },
            apkFileChange: function (e) {
                let files = e.target.files;
                if (files && files.length > 0) {
                    app.apkFile = files[0];
                }
            },
            uploadApkFile: function () {
                if (this.apkFile) {
                    common.post(app, apis.fileUpload(this.apkFile), function (res) {
                        switch (res.data.code) {
                            case 0:
                                // common.showHint('文件上传成功,准备提交资料');
                                uploadApkFileAndMessage(res.data.result);
                                break;
                            default:
                                Loading.hide();
                                common.showHint(res.data.message);
                                break;
                        }
                    }, function (res) {
                        Loading.hide();
                        console.log(res);
                        common.showHint("文件上传失败");
                    }, function (event) {
                        // console.log(event.loaded, event.total);
                    });
                } else {
                    common.showHint("请选择要更新的Apk文件");
                }
            },
            hideUploadArea: function () {
                app.isShowUpload = false;
                app.apkFile = null;
                app.updateMessage = '';
                app.isShowMessageModify = false;
                Loading.hide();
            },
            editUpdateMessage: function (e) {
                app.isShowMessageModify = true;
                app.currentItem = app.versionList[parseInt(e.target.dataset.idx)];
                app.updateMessage = app.currentItem.apk_new_message;
            },
            hideMsgModifyArea: function () {
                app.hideUploadArea();
            },
            modifyMessage: function () {
                common.put(app, apis.appUpdate(app.userId, app.appId, null, null, null, app.currentItem.apk_id, app.updateMessage),
                    (res) => {
                        Loading.hide();
                        if (0 == res.data.code) {
                            app.hideMsgModifyArea();
                            getAppDetail();
                        }
                        common.showHint(res.data.message);
                    }, (res) => {
                        Loading.hide();
                        common.showHint('更新日志修改失败');
                    });
            },
            downloadApk: function (e) {
                window.open(app.versionList[parseInt(e.target.dataset.idx)].apk_remote_link);
            },
            deleteApk: function (e) {
                let item = app.versionList[parseInt(e.target.dataset.idx)];
                Dialog.confirm('删除版本', '确认删除该版本？[' + item.apk_version + '(' + item.apk_build + ')]',
                    function (sure) {
                        if (sure) {
                            common.delete(app, apis.appDelete(app.userId, app.appId, item.apk_id),
                                (res) => {
                                    console.log(res);
                                    Loading.hide();
                                    if (0 == res.data.code) {
                                        getAppDetail();
                                    }
                                    common.showHint(res.data.message);
                                }, (res) => {
                                    Loading.hide();
                                    common.showHint('删除失败，请稍后重试');
                                });
                        }
                    }).setButtonsText('取消', '确认');
            },
            editAppInfo: function () {
                app.isShowEditAppInfo = true;
                app.appName = app.appInfo.appName;
                app.appPackageName = app.appInfo.appPackage;
                app.appDescr = app.appInfo.appDescr;
            },
            hideEditAppInfo: function () {
                app.isShowEditAppInfo = false;
            },
            updateAppInfo: function () {
                common.put(app, apis.appUpdate(app.userId, app.appId, app.appName, app.appDescr, app.appPackageName),
                    (res) => {
                        Loading.hide();
                        if (0 == res.data.code) {
                            app.hideEditAppInfo();
                            getAppDetail();
                        }
                        common.showHint(res.data.message);
                    }, (res) => {
                        Loading.hide();
                        common.showHint('应用信息修改失败');
                    });
            },
            deleteApp: function () {
                Dialog.confirm('删除应用', '确认删除该应用？',
                    function (sure) {
                        if (sure) {
                            common.delete(app, apis.appDelete(app.userId, app.appId),
                                (res) => {
                                    console.log(res);
                                    Loading.hide();
                                    if (0 == res.data.code) {
                                        location.href = '../../version_manager';
                                    }
                                    common.showHint(res.data.message);
                                }, (res) => {
                                    Loading.hide();
                                    common.showHint('删除失败，请稍后重试');
                                });
                        }
                    }).setButtonsText('取消', '确认');
            },
            getLast: function (e) {
                window.open(this.appInfo.lastPath)
            }
        }
    })
});

function uploadApkFileAndMessage(data) {
    let extra = data.extra;
    common.put(app, apis.apkUpload(
        app.userId, app.appId, extra.versionCode, extra.versionName, app.updateMessage,
        data.diskPath, data.fileName, data.filePath, extra.size
    ), function (res) {
        Loading.hide();
        if (0 == res.data.code) {
            app.hideUploadArea();
            getAppDetail();
        }
        common.showHint(res.data.message);
    }, (res) => {
        console.log(res);
        common.showHint("文件上传失败，请重试");
    });
}

function getAppDetail() {
    const api = apis.appDetail(app.userId, app.appId);
    common.get(app, api, (res) => {
        const result = common.resParser(res);
        Loading.hide();
        switch (result.code) {
            case 0:
                const data = result.result;
                let appInfo = data.appInfo;
                appInfo.lastPath = '../../version_manager/latest/' + appInfo.appid;
                app.appInfo = data.appInfo;
                app.versionList = data.versionList;
                break;
            default:
                common.showHint(result.message);
                break;
        }
    }, () => {
        Loading.hide();
        common.showHint('请求失败');
    })
}