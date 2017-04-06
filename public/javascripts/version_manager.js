/**
 * Created by Changeden on 2017/3/19.
 */
var Vue, app;
requirejs(['vue', 'common', 'date'], function (VueJs, common) {
    this.Vue = VueJs;
    this.common = common;
    app = new Vue({
        el: '#wrap',
        data: {
            userId: '',
            account: '',
            password: '',
            isRegMode: false,
            userName: '',
            errorHint: '',
            appList: [],
            appName: '',
            appDescr: '',
            appPackageName: '',
            isShowCreate: false
        },
        created: function () {
            this.userId = this.accountId;
            if (this.userId) {
                const interId = setInterval(function () {
                    if (apis !== 'undefined') {
                        clearInterval(interId);
                        getAppList();
                    }
                }, 100);
            }
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
            appListClass: function () {
                return {
                    'app-list-not-null': this.appList.length > 0 && !app.isShowCreate,
                    'area-black': this.appList.length < 1 || app.isShowCreate
                }
            }
        },
        methods: {
            reg: function () {
                const api = apis.addUser(this.account, this.password, this.userName);
                common.put(this, api, (res) => {
                    const result = common.resParser(res);
                    Loading.hide();
                    switch (result.code) {
                        case 0:
                            app.errorHint = '';
                            login();
                            break;
                        default:
                            app.errorHint = result.message;
                            common.showHint(app.errorHint);
                            break;
                    }
                }, (res) => {
                    reqFail();
                })
            },
            login: function () {
                login()
            },
            modeChange: function () {
                this.errorHint = '';
                this.isRegMode = !this.isRegMode;
            },
            createApp: function () {
                const api = apis.createApp(this.userId, this.appName, this.appDescr, this.appPackageName);
                common.put(this, api, (res) => {
                    const result = common.resParser(res);
                    Loading.hide();
                    switch (result.code) {
                        case 0:
                            app.errorHint = '';
                            var appList = result.result.appList;
                            if (appList && appList.length > 0) {
                                app.appList = appList;
                            } else {
                                getAppList();
                            }
                            break;
                        default:
                            app.errorHint = result.message;
                            common.showHint(app.errorHint);
                            break;
                    }
                }, (res) => {
                    reqFail();
                });
            },
            appItemClick: function (e) {
                location.href = '/version_manager/app/' + e.target.dataset.id;
            },
            cancelCreateApp: function () {
                app.isShowCreate = false;
            },
            showCreateApp: function () {
                app.isShowCreate = true;
                app.appName = '';
                app.appDescr = '';
                app.appPackageName = '';
            },
            toUserInfo: function () {
                location.href = 'users';
            }
        }
    });
});
function login() {
    const api = apis.login(app.account, app.password);
    common.post(app, api, (res) => {
        const result = common.resParser(res);
        console.log(result);
        Loading.hide();
        switch (result.code) {
            case 0:
                app.errorHint = '';
                app.accountId = result.result.id;
                getAppList();
                break;
            default:
                app.errorHint = result.message;
                common.showHint(app.errorHint);
                break;
        }
    }, (res) => {
        reqFail();
    });
}
function getAppList() {
    const api = apis.appList(app.userId);
    common.get(app, api, (res) => {
        const result = common.resParser(res);
        Loading.hide();
        switch (result.code) {
            case 0:
                app.errorHint = '';
                app.appList = result.result.appList;
                break;
            default:
                app.errorHint = result.message;
                common.showHint(app.errorHint);
                break;
        }
    }, (res) => {
        reqFail();
    })
}
function reqFail() {
    app.errorHint = '请求失败';
    Loading.hide();
    common.showHint(app.errorHint);
}