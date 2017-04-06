/**
 * Created by Changeden on 2017/3/19.
 */
(function (g, f) {
    require(['vueResource', 'apis', 'loading', 'dialog'], function (vr, apis, Loading, Dialog) {
        if (Loading !== 'undefined') {
            g.Loading = Loading;
        }
        if (Dialog !== 'undefined') {
            g.Dialog = Dialog;
        }
        if (apis !== 'undefined') {
            g.apis = apis;
        }
        Vue.http.options.emulateJSON = true;
    });
    if (!localStorage) {
        alert("抱歉，我们网站的所有页面只支持Htlm5及更新版本的特性。");
    }
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f()) : g.common = f();
})(this, function () {
    const g = this;

    function f() {
        return {
            put: (ctx, api, success, fail, progress) => {
                preReq();
                /**需传入上下文 ctx(this)*/
                ctx.$http.put(api.url, api.data, {
                    emulateJSON: true,
                    progress: progress,
                    headers: {USER: ctx.userId}
                }).then(success, fail);
            },
            get: (ctx, api, success, fail, progress) => {
                preReq();
                /**需传入上下文 ctx(this)*/
                ctx.$http.get(api.url, {
                    emulateJSON: true,
                    progress: progress,
                    headers: {USER: ctx.userId}
                }).then(success, fail);
            },
            post: (ctx, api, success, fail, progress) => {
                preReq();
                /**需传入上下文 ctx(this)*/
                ctx.$http.post(api.url, api.data, {
                    emulateJSON: true,
                    progress: progress,
                    headers: {USER: ctx.userId}
                }).then(success, fail);
            },
            delete: (ctx, api, success, fail, progress) => {
                preReq();
                /**需传入上下文 ctx(this)*/
                ctx.$http.delete(api.url, api.data, {
                    emulateJSON: true,
                    progress: progress,
                    headers: {USER: ctx.userId}
                }).then(success, fail);
            },
            resParser: (metaData) => {
                preReq();
                if (metaData) {
                    switch (metaData.status) {
                        case 200:
                            return metaData.data;
                        case 401:
                            return {code: 401, message: '尚未登录'};
                    }
                } else {
                    return {code: -1, message: '数据请求失败'}
                }
            },
            /**操作localStorage*/
            setStorage: (key, value, deadLine = 86400) => {//默认为1天时限
                var pack = {
                    dead: parseInt(new Date().getTime() / 1000) + deadLine,
                    value: value,//默认1天时限
                };
                localStorage.setItem(key, JSON.stringify(pack));
            },
            getStorage: (key, defaultValue) => {//超出时限则被删除
                var value = localStorage.getItem(key);
                if (value) {
                    value = JSON.parse(localStorage.getItem(key));
                    var dead = value.dead;
                    if (dead > 0 && dead * 1000 < new Date().getTime()) {
                        g.common.removeStorage(key);
                        value = null;
                    } else {
                        value = value.value;
                    }
                }
                return value ? value : defaultValue;
            },
            clearStorage: () => {
                localStorage.clear();
            },
            removeStorage: (key) => {
                localStorage.removeItem(key);
            },
            /**操作Url*/
            queryUrl: (key, url = window.document.location.href) => {/***/
                const rs = new RegExp("(^|)" + key + "=([^&]*)(&|$)", "gi").exec(url);
                if (rs) {
                    return decodeURIComponent(rs[2]);
                }
                return "";
            },
            showHint: (hint) => {
                Dialog.alert('提醒', hint).setButtonsText('', '知道了');
            }
        };
    }

    function preReq() {
        Loading.show();
    }

    return f;
});