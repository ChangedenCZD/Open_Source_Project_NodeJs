/**用于接口请求数据封装*/
function call(res, code, message, result) {
    var obj = {
        code: code,
        message: message
    }
    if (result) {
        obj.result = result;
    }
    res.send(obj);
}
module.exports.call = call;