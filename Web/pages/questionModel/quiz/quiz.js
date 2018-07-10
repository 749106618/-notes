// pages/questionModel/quiz/quiz.js
let {request} = require('../../../utils/api.js');
let {showMessage, showLoading, hideLoading} = require('../../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // showTip: false,
        isDisabled: false,
        tipMessage: '24小时内得到回复',
        submitParam: {
            expertId: '',
            questionApplyId: '',
            questionTitle: '',
            questionDetail: ''
        }
    },
    //提交
    submit (e) {
        let questionTitle = e.detail.value.questionTitle;
        if (!questionTitle) {
            showMessage('请输入问题')
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
        if (questionDetail) {
            this.updateDataSubmitParam('questionDetail', questionDetail);
        }
        request.apiPost('question/addQuestion', this.data.submitParam).then(() => {
            hideLoading();
            this.showSuccessModel();
        })
    },
    showSuccessModel () {
        let self = this;
        wx.showModal({
            title: '恭喜您',
            content: '24小时内得到回复',
            showCancel: false,
            success: function () {
                wx.navigateBack();
            }
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
        if (options.expertId) {
            this.updateDataSubmitParam('expertId', options.expertId);
        }

        if (options.questionApplyId) {
            request.apiPost('question/questionApplyDetail', {
                questionApplyId: options.questionApplyId
            }).then((result) => {
                let resultData = result.data;
                this.setData({
                    submitParam: {
                        questionApplyId: options.questionApplyId,
                        questionTitle: resultData.questionApplyTitle,
                        questionDetail: resultData.questionApplyDetail,
                    }
                })
            })
            this.setData({
                isDisabled: true
            })
        }
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