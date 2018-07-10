// pages/selfModel/contactUs/contactUs.js
let { request } = require('../../../utils/api.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    //拨打电话
    callUp: function(e){
        let self = this;
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.id,
        })
    },
    //打开地图
    openMap: function(e){
        let self = this;
        let _lat = Number(e.currentTarget.dataset.lat);
        let _lng = Number(e.currentTarget.dataset.lng);
        let _name = e.currentTarget.dataset.name;
        wx.openLocation({
            latitude: _lat,
            longitude: _lng,
            name: _name
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})