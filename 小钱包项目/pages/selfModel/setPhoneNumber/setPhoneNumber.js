/**
 * Created by Administrator on 2018/5/24 0024.
 */
let {request} = require('../../../utils/api.js');
let {sendMobileCode, getStorage, setStorage} = require('../../../utils/util.js');

Page({
    data: {
        phoneNumber: '',
        token: '',
        verifyCode: '',
        qrObj: {
            qrText: '获取验证码',
            qrDisabled: false
        },
        opacity: 'opacity'

    },
    MobileNumber: function (e) {//拿到输入框手机号码
        if (this.data.phoneNumber && this.data.verifyCode) {
            this.setData({
                opacity: ''
            })
        } else {
            this.setData({
                opacity: 'opacity'
            })
        }
        this.setData({
            phoneNumber: e.detail.value
        })
    },
    VerifyCode: function (e) {//拿到输入框验证码
        if (this.data.phoneNumber && this.data.verifyCode) {
            this.setData({
                opacity: ''
            })
        } else {
            this.setData({
                opacity: 'opacity'
            })
        }
        this.setData({
            verifyCode: e.detail.value
        })
    },
    bindMobile: function () {//绑定手机号码
        let param = {
            mobile: this.data.phoneNumber,
            mobileCode: this.data.verifyCode
        }
        getStorage('token').then(res => {
            request.apiPost('user/checkToken', res.data).then(checkResult => {
                if (checkResult.code == 0) {
                    request.apiPost('user/bindMobile', param).then(result => {
                        if (result.code == 0) {
                            wx.showToast({
                                title: '保存成功',
                                icon: 'none',
                                mask: true,
                                success: function () {
                                    setTimeout(function () {
                                        wx.navigateBack();
                                    }, 1500)
                                }
                            })

                        } else {
                            wx.showToast({
                                title: result.data.msg,
                                icon: 'none',
                                mask: true,
                            })
                        }
                    })
                } else {
                    wx.showToast({
                        title: checkResult.msg,
                        icon: 'none',
                        mask: true,
                    })
                }
            })
        })
    },
    getVerifyCode: function () {//获取手机验证码
        if (this.data.qrObj.qrDisabled) {
            return;
        }
        let self = this;
        getStorage('token').then((res) => {
            this.setData({
                token: res.data
            })
            let param = {
                mobile: this.data.phoneNumber,
                type: 1,
                token: this.data.token
            };
            sendMobileCode(self, this.data.phoneNumber, this.data.token);

        });
    }
})
