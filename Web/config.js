//本地接口
// const baseUrl = 'http://wiki.wangtiansoft.com:47878/server/api/';

// 测试地址
const baseUrl = 'https://dd.wangtiansoft.cn/server/api/';


//正式接口
// const host = '';

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