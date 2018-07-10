let {request} = require('./api.js');
let {regExp} = require('../config.js');
const sendMobileCode = function (self, _tel, token) {
    console.info(_tel)
    if (!_tel || !regExp.mobileRegExp.test(_tel)) {
        showMessage('手机号格式不正确')
        return;
    } else {
        request.apiPost('user/sendMobileCode', {mobile: _tel, token: token, type: 1}).then(() => {
            self.setData({
                qrObj: {
                    qrDisabled: true
                }
            })
            let getCountDown = function (t) {
                if (t == 0) {
                    self.setData({
                        qrObj: {
                            qrText: '重新获取验证码',
                            qrDisabled: false
                        }
                    })
                } else {
                    self.setData({
                        qrObj: {
                            qrText: t + 's',
                            qrDisabled: true
                        }
                    })
                    t--;
                    setTimeout(function () {
                        getCountDown(t);
                    }, 1000);
                }
            }
            getCountDown(60);
        })
    }
}

const showMessage = function (content) {
    return new Promise((resolve, reject) => {
        wx.showToast({
            title: content,
            icon: 'none',
            mask: true,
            success () {
                if (resolve) {
                    setTimeout(function () {
                        resolve()
                    }, 2000)
                }
            }
        })
    })
}

const showLoading = function (title = "提交中...") {
    wx.showLoading({title, mask: true})
}

const hideLoading = function () {
    wx.hideLoading();
}
/**
 * 设置storage
 */
const setStorage = ({key, data}) => {
    return new Promise((resolve, reject) => {
        wx.setStorage({
            key,
            data,
            success: (res) => {
                resolve(res)
            },
            fail: (res) => {
                reject(res)
            }
        })
    })
}

/**
 * 获取storage
 */
const getStorage = (key) => {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key,
            success: (res) => {
                resolve(res)
            },
            fail: (res) => {
                reject(res)
            }
        })
    })
}

/**
 * 获取通知时间间隔
 */
const formatDateInterval = (oldTime, format) => {
    let _nowTime = new Date().getTime();
    let _oldTime = new Date(oldTime.replace(/-/g, "/")).getTime();
    let _formDate = Math.floor((_nowTime - _oldTime) / (1000 * 60));
    if (_formDate < 60) {
        return _formDate <= 0 ? '刚刚' : _formDate + '分钟前'
    } else if (_formDate < 1440) {
        return parseInt(_formDate / 60) + '小时前'
    } else if (_formDate < 2880) {
        return '昨天'
    } else {
        // 日期月份/天的显示，如果是1位数，则在前面加上'0'
        let getFormatDate = (arg) => {
            if (arg == undefined || arg == '') {
                return '';
            }
            var re = arg + '';
            if (re.length < 2) {
                re = '0' + re;
            }
            return re;
        }
        Date.prototype.toLocaleString = function () {
            if (format == 'hh:mm') {
                return getFormatDate(this.getHours()) + ":" + getFormatDate(this.getSeconds())
            } else if (format == 'yy-mm-dd') {
                return this.getFullYear() + "年" + getFormatDate(this.getMonth() + 1) + "月" + getFormatDate(this.getDate()) + "日 "
            } else if (format == 'week') {
                return this.getDay();
            } else if (format == 'mm-dd') {
                return getFormatDate(this.getMonth() + 1) + '-' + getFormatDate(this.getDate())
            }
        };
        let _date = new Date(_oldTime);
        return _date.toLocaleString();
    }
}

const formatDateOverplus = (time) => {
    let nowTime = new Date().getTime();
    let overPlusMin = Math.ceil((time - nowTime) / 1000);
    let hour = pad(parseInt(overPlusMin / (60 * 60)), 2);
    let min = pad(parseInt((overPlusMin - hour * 60 * 60) / 60), 2);
    let sec = pad(overPlusMin - hour * 60 * 60 - min * 60, 2);
    return hour + ":" + min + ":" + sec;
}

function pad(num, n) {
    if ((num + "").length >= n) return num;
    return pad("0" + num, n);
}

const removeOneInList = function (list, index) {
    let result = list.slice(0, index);
    list.slice(parseInt(index) + 1, list.length).forEach((res) => {
        result.push(res)
    })
    return result;
}

const navigateTo = function (url, param = {}) {
    wx.navigateTo({
        url: getUrlWithParam(url, param)
    })
}

const getUrlWithParam = function (url, param = {}) {
    var str = Object.keys(param).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(param[key])
    }).join('&')
    return str ? url + '?' + str : url;
}

const subReason = function (reason) {
    return reason.length > 65 ? reason.substring(0, 65) + "..." : reason;
}

const handelReasonToObject = function (reason) {
    let result = [];
    let reasonArray = reason.split('\n');
    for (let oneReasonText of reasonArray) {
        if (oneReasonText) {
            result.push({
                text: oneReasonText
            })
        }
    }
    return result.length > 0 ? JSON.stringify(result) : "";
}
function getStrLenght(message, MaxLenght) {
    let strlenght = 0; //初始定义长度为0
    let txtval = message;
    for (var i = 0; i < txtval.length; i++) {
        if (isCN(txtval.charAt(i)) == true) {
            strlenght = strlenght + 2; //中文为2个字符
        } else {
            strlenght = strlenght + 1; //英文一个字符
        }
        if (strlenght > MaxLenght) {
            txtval = txtval.slice(0,i);
            return txtval;
        }
    }
}

function isCN(str) { //判断是不是中文
    let regexCh = /[u00-uff]/;
    return !regexCh.test(str);
}

module.exports = {
    isCN,
    getStrLenght,
    sendMobileCode,
    showMessage,
    showLoading,
    hideLoading,
    setStorage,
    getStorage,
    formatDateInterval,
    formatDateOverplus,
    removeOneInList,
    navigateTo,
    getUrlWithParam,
    subReason,
    handelReasonToObject
}