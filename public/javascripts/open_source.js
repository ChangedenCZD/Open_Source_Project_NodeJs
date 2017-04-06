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
            root: '.',
            fileList: null
        },
        created: function () {
            let intervalId = setInterval(function () {
                try {
                    if (apis && common) {
                        clearInterval(intervalId);
                        getFileList();
                    }
                } catch (e) {
                }
            }, 100);
        },
        ready: function () {
        },
        computed: {},
        methods: {
            openOrDownload:function (e) {
                let file=app.fileList[parseInt(e.target.dataset.idx)];
                if(file.isDir){
                    app.root=file.path;
                    getFileList();
                }else{
                    window.open('open_source/download/'+encodeURIComponent(file.path));
                }
                console.log(file)
            }
        }
    })
});

function getFileList() {
    common.get(app, apis.openSourceFileList(app.root), (res) => {
        Loading.hide();
        if (0 == res.data.code) {
            app.fileList = res.data.result;
        }
    }, (res) => {
        Loading.hide();
    });
}