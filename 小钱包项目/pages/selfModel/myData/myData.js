/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {sendMobileCode, getStorage, setStorage,getStrLenght} = require('../../../utils/util.js');
let {request} = require('../../../utils/api.js')
Page({
    data: {
        tempFilePaths: '',
        date: '',
        region: [],
        customItem: '全部',
        detail: '',
        gender: 1,
        userInfo: {}
    },
    chooseimage: function () {
        let that = this;
        wx.showActionSheet({
            itemList: ['相机', '相册'],
            itemColor: "#007AFF",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('camera')
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('album')
                    }
                }
            }
        })
    },
    chooseWxImage(sourceType){
        request.uploadFile(1, sourceType).then(res => {
            this.setData({
                tempFilePaths: res
            })
        })
    },
    chooseGender: function () {
        let that = this;
        wx.showActionSheet({
            itemList: ['男', '女'],
            itemColor: "#007AFF",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.setData({
                            gender: 1
                        })
                    } else if (res.tapIndex == 1) {
                        that.setData({
                            gender: 2
                        })
                    }
                }
            }
        })
    },
    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value
        })
    },
    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
        })

    },
    svae: function () {
        let that = this;
        let param = {
            photo: that.data.tempFilePaths,
            sex: that.data.gender,
            area: that.data.region,
            detail: that.data.detail,
        }
        if (that.data.date) {
            param.birthday = that.data.date
        }
        request.apiPost('user/updateUser', param).then(updateResult => {
            if (updateResult.code == 0) {
                wx.showToast({
                    title: updateResult.msg,
                    icon: 'none',
                    mask: true,
                    success: setTimeout(function () {
                        wx.navigateBack();
                    }, 1500)
                })
            }
        })

    },
    iptDetail: function (e) {
            this.setData({
                detail: e.detail.value
            })
    },
    onLoad: function () {
        getStorage('userInfo').then((res) => {
            this.setData({
                userInfo: res.data,
                region: res.data.area ? res.data.area.split(',') : [],
                date: res.data.birthday ? res.data.birthday : '',
                gender: res.data.sex ? res.data.sex : 1,
                tempFilePaths: res.data.photo ? res.data.photo : '',
                detail: res.data.detail ? res.data.detail : ''
            })
        })
    },
    onShow: function () {
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        request.apiPost('user/loadUserDetail', userInfo.id).then(detailResult => {
            console.log(detailResult);
            if (detailResult.code == 0) {
                wx.setStorage({
                    key: 'userInfo',
                    data: detailResult.data
                })
                that.setData({
                    userInfo: detailResult.data
                })
            }

        })

    }
})