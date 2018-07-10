// pages/selfModel/feedBack/feedBack.js
let config = require('../../../config.js');
let { request } = require('../../../utils/api.js');
let { showMessage } = require('../../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        feedbackData: {
            concatWay: '',    //邮箱、手机号、微信号
            content: '', //宝贵意见
        }
    },

    //获取邮箱、手机号、微信号
    getConcatWay (e) {
        this.setFeedbackData('concatWay', e.detail.value);
    },
    //获取宝贵意见
    getContent (e) {
        this.setFeedbackData('content', e.detail.value);
    },
    //提交意见
    submit () {
        let feedbackData = this.data.feedbackData;
        if (!feedbackData.concatWay) {
            showMessage("请输入联系方式");
            return;
        }
        if (!feedbackData.content) {
            showMessage("请输入宝贵意见");
            return;
        }
        request.apiPost('user/feedback', feedbackData).then(() => {
            showMessage('提交成功').then(() => {
                wx.navigateBack()
            })
        })
    },
    
    setFeedbackData (key, value) {
        let feedbackData = this.data.feedbackData;
        feedbackData[key] = value;
        this.setData({
            feedbackData: feedbackData
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