/**
 * Created by Administrator on 2018/5/24 0024.
 */
let {getStorage} = require('../../utils/util.js');
let {request} = require('../../utils/api.js')
Page({
    data:{
        userinfo:{}
    },
    onLoad:function () {
        getStorage('userInfo').then(res=>{
            console.log(res.data);
            this.setData({
                userinfo:res.data
            })
        })
    },
    onShow:function () {
        let that = this;
        request.apiPost('user/loadUserDetail', {}).then(detailResult=>{
            console.log(detailResult);
            wx.setStorage({
                key:'userInfo',
                data: detailResult.data
            })
            that.setData({
                userinfo: detailResult.data
            })

        })
    },
    navigate(){
        wx.switchTab({
            url: '../index/index'
        })
    }
})