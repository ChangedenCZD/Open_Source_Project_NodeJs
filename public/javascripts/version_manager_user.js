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
            userInfo: null,
            isShowInfoUpdate: false,
            updateMode: 0,
            updateContent: '',
            originalPwd: '',
            newPwd: '',
            confirmPwd: ''
        },
        created: function () {
            this.userId = this.accountId;
            if (this.userId) {
                var intervalId = setInterval(function () {
                    if (apis !== 'undefined') {
                        clearInterval(intervalId);
                        getUserInfo();
                    }
                }, 100);
            } else {
                location.href = './version_manager';
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
            updateUserName: function () {
                app.updateMode = 0;
                app.updateContent = app.userInfo.user_name;
                app.isShowInfoUpdate = true;
            },
            updateUserCompany: function () {
                app.updateMode = 1;
                app.updateContent = app.userInfo.company;
                app.isShowInfoUpdate = true;

            },
            updateUserPassword: function () {
                app.updateMode = 2;
                app.isShowInfoUpdate = true;

            },
            hideInfoUpdate: function () {
                app.isShowInfoUpdate = false;
                app.updateContent = '';
                app.originalPwd = '';
                app.newPwd = '';
                app.confirmPwd = '';
            },
            updateInfo: function () {
                if (app.updateMode != 2) {
                    updateUserInfo();
                } else {
                    updatePassword();
                }
            },
            logout: function () {
                Dialog.confirm('登出', '确认登出当前账号？', function (sure) {
                    if (sure) {
                        common.removeStorage('version_user');
                        location.href = './version_manager';
                    }
                }).setButtonsText('取消', '确认');
            }
        }
    })
});
function updatePassword() {
    let password = app.originalPwd;
    if (password && password.length >= 6) {
        common.put(app, apis.userModifyPassword(app.originalPwd, app.newPwd, app.confirmPwd), (res) => {
            Loading.hide();
            if (0 == res.data.code) {
                getUserInfo();
                app.hideInfoUpdate();
            }
            common.showHint(res.data.message);
        }, (res) => {
            Loading.hide();
            common.showHint('请求失败');
        });
    } else {
        common.showHint('请输入正确的登录密码');
    }
}
function updateUserInfo() {
    let password = app.originalPwd;
    if (password && password.length >= 6) {
        var userName;
        var userCompany;
        let updateContent = app.updateContent;
        switch (app.updateMode) {
            case 0:
                userName = updateContent;
                userCompany = app.userInfo.company;
                break;
            case 1:
                userName = app.userInfo.user_name;
                userCompany = updateContent;
                break;
        }
        common.put(app, apis.userInfoUpdate(password, userName, userCompany), (res) => {
            Loading.hide();
            if (0 == res.data.code) {
                getUserInfo();
                app.hideInfoUpdate();
            }
            common.showHint(res.data.message);
        }, (res) => {
            Loading.hide();
            common.showHint('请求失败');
        });
    } else {
        common.showHint('请输入正确的登录密码');
    }
}
function getUserInfo() {
    common.get(app, apis.userInfo(), (res) => {
        Loading.hide();
        if (0 == res.data.code) {
            console.log(res.data.result);
            app.userInfo = res.data.result.userInfo;
        } else {
            common.showHint(res.data.message);
        }
    }, (res) => {
        Loading.hide();
        common.showHint('请求失败');
    });
}