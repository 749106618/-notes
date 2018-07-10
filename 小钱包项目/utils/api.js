/**
 * request 请求
 */
let {config} = require('../config.js');
const request = {
    apiPost: (url, param = {}, isCheckCode = true, getParam = param) => {
        var str = Object.keys(getParam).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(param[key])
        }).join('&')
        return new Promise((resolve, reject) => {
            wx.request({
                url: config.baseUrl + url + '?' + str,
                data: param,
                method: 'POST',
                header: {
                    'x-access-token': wx.getStorageSync('token')
                },
                success: (res) => {
                    wx.hideLoading();
                    let result = res.data
                    if (isCheckCode) {
                        if (result.code == 0 || result.code == 1000) {
                            resolve(result)
                        } else {
                            wx.showToast({
                                title: res.data.msg,
                                icon: 'none',
                                mask: true,
                            })
                            reject(result)
                        }
                    } else {
                        resolve(result)
                    }
                },
                fail: (res) => {
                    console.info(res)
                    wx.showModal({
                        title: '提示',
                        content: '系统异常，请联系管理员',
                        showCancel: false,
                    })
                }
            })
        })
    },
    uploadFile: (count = 1,sourceType) => {
        return new Promise((resolve, reject) => {
            wx.chooseImage({
                count: count,
                sizeType: ['compressed'],
                sourceType: [sourceType],/*'album', 'camera'*/
                success: function(res) {
                    wx.showLoading({title: '上传中...', mask: true})
                    let imglist = [];
                    let a = 0;//这个a表示上传成功的次数
                    for(let i=0;i<res.tempFilePaths.length;i++){//循环上传
                        wx.uploadFile({
                            url: config.baseUrl + '../wtuploader/controller?action=uploads',
                            filePath: res.tempFilePaths[i],
                            name: 'file',
                            success (result) {
                                a++;
                                let data = JSON.parse(result.data);
                                console.log(data);
                                let url = data.url;
                                imglist.push(url);
                                if(a == res.tempFilePaths.length){
                                    wx.hideLoading();
                                    resolve(imglist);
                                }
                            },
                            fail: () => {
                                wx.hideLoading();
                                wx.showModal({
                                    title: '提示',
                                    content: '系统异常，请联系管理员'
                                })
                            }
                        })
                    }
                }
            })
        })
    }
}

/**
 * 设置storage
 */
const setStorage = ({
    key,
    data
}) => {
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
const formatDateInterval = (oldTime) => {
    let _nowTime = new Date().getTime();
    let _oldTime = new Date(oldTime.replace(/-/g,"/")).getTime();
    let _formDate = Math.floor((_nowTime - _oldTime) / (1000 * 60));
    if (_formDate < 60) {
        return _formDate + '分钟前'
    } else if (_formDate < 1440) {
        return parseInt(_formDate / 60) + '小时前'
    } else if (_formDate < 2880){
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
            return this.getFullYear() + "年" + getFormatDate(this.getMonth() + 1) + "月" + getFormatDate(this.getDate()) + "日 "// + this.getHours() + "点" + this.getMinutes() + "分" + this.getSeconds() + "秒";
        };
        let _date = new Date(_oldTime);
        return _date.toLocaleString();
    }
}

module.exports = {
    request,
    setStorage,
    getStorage,
    formatDateInterval
}