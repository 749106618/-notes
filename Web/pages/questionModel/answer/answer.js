// pages/questionModel/answer/answer.js
let {request} = require('../../../utils/api.js');
let {showMessage, showLoading, hideLoading, handelReasonToObject} = require('../../../utils/util.js');
let {invokeListener} = require('../../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        questionDetail: {
            questionId: ''
        },
        reason: '', // 答案
        type: 1 // 问题类型1:指定专家2：问题广场
    },

    //提交
    submit (e) {
        let reason = e.detail.value.reason;
        let reasonTrim = reason.replace(/\n/g, "");
        let reasonObject = handelReasonToObject(reason);
        if (!reasonTrim) {
            showMessage('请输入答案~');
            return;
        }
        if (reasonTrim > 10000) {
            showMessage('答案过长~');
            return;
        }
        showLoading();
        request.apiPost('question/reasonQuestion', {
            questionId: this.data.questionDetail.questionId,
            reason: reasonObject
        }, true, {
            questionId: this.data.questionDetail.questionId
        }).then(() => {
            hideLoading();
            showMessage('回答成功').then(() => {
                wx.switchTab({url: '/pages/question/question'});
                invokeListener('expertQuestionReasonListener', {questionId: this.data.questionDetail.questionId, type: this.data.type})
            });
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let questionDetail = {
            questionId: options.questionId,
            questionTitle: decodeURI(options.questionTitle),
            questionDetail: decodeURI(options.questionDetail != "null"? options.questionDetail: ""),
        }
        this.setData({
            questionDetail,
            type: options.type
        })
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