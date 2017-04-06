/**
 * Created by Changeden on 2017/3/20.
 */
const domain = 'http://' + location.hostname + ':4401/';
(function (g, f) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f()) : g.apis = f();
})(this, function () {
    return {
        addUser: (account, password, userName) => {/**创建用户*/
            return new Req('users', {
                account: account,
                password: password,
                name: userName
            }, 'PUT');
        },
        login: (account, password) => {/**登录*/
            return new Req('users/login', {
                account: account,
                password: password
            }, 'POST');
        },
        userInfo: () => {
            return new Req('users/info', null, 'GET');
        },
        userInfoUpdate: (password, name, company) => {
            return new Req('users/update', {
                password: password,
                name: name,
                company: company
            }, 'PUT');
        },
        userModifyPassword: (originalPwd, newPwd, confirmPwd) => {
            return new Req('users/update/password', {
                originalPwd: originalPwd,
                newPwd: newPwd,
                confirmPwd: confirmPwd
            }, 'PUT');
        },
        createApp: (userId, appName, appDescr, appPackage) => {/**创建应用*/
            return new Req('version_manager/' + userId, {
                appName: appName,
                appDescr: appDescr,
                appPackage: appPackage
            }, 'PUT');
        },
        appList: (userId) => {/**获取App列表*/
            return new Req('version_manager/' + userId, null, 'GET');
        },
        appDetail: (userId, appId) => {/**获取App详情*/
            return new Req('version_manager/app/' + userId + '/' + appId, null, 'GET');
        },
        fileUpload: (file) => {
            /**上传文件*/
            const formData = new FormData();
            formData.append('file', file);
            return new Req('files/upload', formData, 'POST');
        },
        apkUpload: (userId, appId, build, version, updateMessage, diskLink, fileName, remoteLink, size) => {/**提交Apk信息*/
            return new Req(
                'version_manager/app/' + userId + '/' + appId + '/upload',
                {
                    build: build,
                    version: version,
                    updateMessage: updateMessage,
                    diskLink: diskLink,
                    fileName: fileName,
                    remoteLink: remoteLink,
                    size: size
                },
                'PUT'
            );
        },
        appUpdate: (userId, appId, app_name, app_descr, app_package, apkId, updateMessage) => {/**更新应用信息或某个版本的更新日志*/
            return new Req(
                'version_manager/app/' + userId + '/' + appId + '/update',
                {
                    app_name: app_name,
                    app_descr: app_descr,
                    app_package: app_package,
                    apkId: apkId,
                    updateMessage: updateMessage,
                },
                'PUT'
            );
        },
        appDelete: (userId, appId, apkId) => {/**删除某个应用或某个版本*/
            return new Req(
                'version_manager/app/' + userId + '/' + appId + '/' + (apkId ? apkId : 'thisApp'), {}, 'DELETE'
            );
        },
        openSourceFileList: (root) => {
            return new Req('open_source/files?root=' + encodeURIComponent(root ? root : '.'), null, 'GET');
        }
    }
});

function getUrl(path) {
    return domain + path;
}
function Req(path, data, method) {
    return {
        url: getUrl(path),
        data: data,
        method: method
    }
}