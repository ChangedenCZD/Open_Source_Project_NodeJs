(function (g, f) {
    f();
})(this, function () {
    let html = '<span><a href="../../">首页</a> </span>\
                <span><a href="../../donate">捐赠/施舍</a> </span>\
                <span><a href="../../open_source">开源代码</a></span>\
                <span>电子邮箱：changeden520@gmail.com</span>';
    let style = '<style>#footer-layout span{margin-right:20px;}</style>';
    if (!document.getElementById('footer-layout')) {
        const htmlEle = document.createElement('div');
        htmlEle.id = 'footer-layout';
        htmlEle.className = 'footer flex-r fs-min';
        htmlEle.innerHTML = html + style;
        htmlEle.style = 'justify-content: unset;';
        document.body.appendChild(htmlEle);
    }
})