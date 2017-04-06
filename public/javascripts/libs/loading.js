/**
 * Created by Changeden on 2017/3/21.
 * 加载动画模块
 */
((g, f) => {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = f() : typeof define === 'function' && define.amd ? define(f()) : g.Loading = f();
})(this, function () {
    var html = '<div class="sk-circle">\
    <div class="sk-circle1 sk-child"></div>\
    <div class="sk-circle2 sk-child"></div>\
    <div class="sk-circle3 sk-child"></div>\
    <div class="sk-circle4 sk-child"></div>\
    <div class="sk-circle5 sk-child"></div>\
    <div class="sk-circle6 sk-child"></div>\
    <div class="sk-circle7 sk-child"></div>\
    <div class="sk-circle8 sk-child"></div>\
    <div class="sk-circle9 sk-child"></div>\
    <div class="sk-circle10 sk-child"></div>\
    <div class="sk-circle11 sk-child"></div>\
    <div class="sk-circle12 sk-child"></div>\
    </div>';
    var style = '<style>@import url(/stylesheets/libs/loading.css);</style>';
    var loadingLayout = null;
    getLoadingElement();
    if (!loadingLayout) {
        const htmlEle = document.createElement('div');
        htmlEle.id = 'loading-layout';
        htmlEle.innerHTML = html + style;
        document.body.appendChild(htmlEle);
        getLoadingElement();
        /*计算margin-top*/
        loadingLayout.getElementsByClassName('sk-circle')[0].style.marginTop = (window.innerHeight - 60) / 2 + 'px';
    }
    function getLoadingElement() {
        loadingLayout = document.getElementById('loading-layout');
    }

    return () => {
        return {
            show: () => {
                if (loadingLayout) {
                    loadingLayout.style.display = 'block';
                }
            },
            hide: () => {
                if (loadingLayout) {
                    loadingLayout.style.display = 'none';
                }
            },
            toggle: (isShow) => {
                if (loadingLayout) {
                    loadingLayout.style.display = isShow ? 'block' : 'none';
                }
            }
        }
    }
});