//本地接口
//const baseUrl = 'http://127.0.0.1:47878/xqb-server/api/';
// const baseUrl = 'http://192.168.101.24:47878/server/api/';
// const baseUrl = 'http://192.168.1.19:47878/server/api/';

// 测试地址
 const baseUrl = 'https://dd.wangtiansoft.cn/xqb-server/api/';

//正式接口
// const baseUrl = '';

const config = {
    baseUrl
}

const regExp = {
    mobileRegExp: /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/,
    emailRegExp: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
    cardNoRegExp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    passwordRegExp: /(?!^[0-9]+$)(?!^[A-z]+$)(?!^[^A-z0-9]+$)^.{6,16}$/,
}

module.exports = {
    config,
    regExp
};