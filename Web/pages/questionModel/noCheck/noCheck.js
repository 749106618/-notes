// pages/questionModel/quiz/quiz.js
let {request} = require('../../../utils/api.js');
let {showMessage, showLoading, hideLoading} = require('../../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        questionApplyRefuseReason: '',
        submitParam: {
            expertId: '',
            questionTitle: '',
            questionDetail: ''
        }
    },
    //提交
    submit (e) {
        let questionTitle = e.detail.value.questionTitle;
        if (!questionTitle) {
            showMessage('请输入问题标题')
            return;
        }
        if (questionTitle.length > 50) {
            showMessage('问题标题过长')
            return;
        }
        let questionDetail = e.detail.value.questionDetail;
        if (questionDetail && questionDetail.length > 200) {
            showMessage('问题详情过长')
            return;
        }
        showLoading();
        this.updateDataSubmitParam('questionTitle', questionTitle);
        this.updateDataSubmitParam('questionDetail', questionDetail);
        request.apiPost('question/addQuestion', this.data.submitParam).then(() => {
            hideLoading();
            wx.showModal({
                title: '恭喜您',
                content: '已重新提交审核',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        wx.switchTab({
                            url: '/pages/self/self'
                        })
                    }
                }
            })
        })
    },
    updateDataSubmitParam (key, value) {
        this.data.submitParam[key] = value;
        this.setData({
            submitParam: this.data.submitParam
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        request.apiPost('question/questionApplyDetail', {
            questionApplyId: options.questionApplyId,
            messageId: options.messageId? options.messageId: ''
        }).then((result) => {
            let resultData = result.data;
            this.setData({
                submitParam: {
                    expertId: resultData.expertId? resultData.expertId : '',
                    questionTitle: resultData.questionApplyTitle,
                    questionDetail: resultData.questionApplyDetail,
                },
                questionApplyRefuseReason: resultData.questionApplyRefuseReason
            })
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