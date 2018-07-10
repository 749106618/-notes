// pages/expertModel/expertDetail/expertDetail.js
let {request} = require('../../../utils/api.js');
let {navigateTo, formatDateInterval, showMessage, subReason} = require('../../../utils/util.js');
let {invokeListener} = require('../../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        expertId: '',
        expertDetail: {},
        hostQuestionList: [], //回答的问题
    },
    // 获取专家详情
    loadExpertDetail () {
        request.apiPost('expert/expertDetail', {expertId: this.data.expertId}).then((result) => {
            this.setData({
                expertDetail: result.data
            })
        })
    },
    //获取回答的问题
    loadExpertHostQuestionList: function () {
        request.apiPost('expert/expertHostQuestion', {expertId: this.data.expertId}).then((result) => {
            let hostQuestionList = result.data;
            for (let oneQuestion of hostQuestionList) {
                oneQuestion.questionReasonTimeInterval = formatDateInterval(oneQuestion.questionReasonTime);
                oneQuestion.questionReasonText = subReason(oneQuestion.questionReasonText);
            }
            this.setData({
                hostQuestionList
            })
        })
    },
    // 关注专家
    collectExpert () {
        request.apiPost('expert/cancelOrFollowExpert', {expertId: this.data.expertId}).then(() => {
            this.data.expertDetail.isCollectExpert = ~this.data.expertDetail.isCollectExpert + 2;
            this.setData({
                expertDetail: this.data.expertDetail
            });
            invokeListener('collectExpertListener', this.data.expertId);
        })
    },
    // 跳转问题详情
    goQuestionDetail (e) {
        navigateTo('/pages/questionModel/detail/detail', {questionId: e.currentTarget.dataset.question_id})
    },
    // 提问
    addQuestion () {
        if (this.data.userInfo.id == this.data.expertId) {
            showMessage("自己不能向自己提问题哦~");
            return;
        }
        navigateTo('/pages/questionModel/quiz/quiz', {expertId: this.data.expertId})
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            expertId: options.expertId
        })
        //初始化数据
        this.loadExpertDetail();
        this.loadExpertHostQuestionList();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        });
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