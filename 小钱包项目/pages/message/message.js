/**
 * Created by Administrator on 2018/5/22 0022.
 */
let { request } = require('../../utils/api.js')
const app = getApp()
Page({
    data:{
        Notice:{}
    },
    onLoad:function () {
        request.apiPost('user/loadUserNewNoticeMessageNum').then(res=>{
            this.setData({
                Notice:res.data
            })
        })
        app.globalData.refreshFlag = true
    },
    onShow:function () {
        request.apiPost('user/loadUserNewNoticeMessageNum').then(res=>{
            this.setData({
                Notice:res.data
            })
        })
    }

})