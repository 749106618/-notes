/**
 * Created by Administrator on 2018/5/24 0024.
 */
let {request} = require('../../../utils/api.js')
let {getStrLenght, silceLentgh} = require('../../../utils/util.js');
Page({
    data: {
        nickName: '',
        maxlength: 10
    },
    setNickName: function (e) {
        let isMathLength = getStrLenght(e.detail.value,20)
        let silce_lentgh = silceLentgh(e.detail.value, 10,isMathLength)
        this.setData({
            maxlength: silce_lentgh,
            nickName: e.detail.value
        })
    },
    save: function () {
        let param = {
            nickName: this.data.nickName,
            token: this.data.token
        }
        request.apiPost('user/updateUserNickName', param).then(result => {
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
            }
        })
    }
})
