// pages/selfModel/myQuestions/myQuestions.js
let config = require('../../../config.js');
let { request } = require('../../../utils/api.js');
let { navigateTo, formatDateOverplus, formatDateInterval } = require('../../../utils/util.js');


Page({

    /**
     * 页面的初始数据
     */
    data: {
        questionData: { rows: [] },
        loading: false, //加载动画
        intervalId: '', // 定时器Id
        searchParam: {
            page: 0,
            pageSize: 12
        }
    },

    //获取我的提问列表
    loadMyQuestionData (isFreshen) {
        this.setSearchParam('page', isFreshen? 1 : Number(this.data.searchParam.page) + 1);
        request.apiPost('user/myQuestionData', this.data.searchParam).then((result) => {
            let questionData = result.data;
            let questionList = questionData.rows;
            for (let oneResult of questionList) {
                if (oneResult.questionApplyStatus == 2) {
                    oneResult.questionReplyEndTime = new Date(oneResult.questionReplyEndTime.replace(/-/g,"/")).getTime();
                    oneResult.questionReasonOverplusTime = formatDateOverplus(oneResult.questionReplyEndTime)
                }
            }
            questionData.rows = questionList;
            let oldQuestionList = this.data.questionData.rows;
            questionData.rows = oldQuestionList.concat(this.formatDateIntervalList(questionData.rows));
            this.setData({
                questionData,
                loading: questionData.page < questionData.total
            })
        })
    },
    //问答详情
    toQuestionDetail (e) {
        let state = e.currentTarget.dataset.state;
        let questionApplyId = e.currentTarget.dataset.question_apply_id;
        let questionId = e.currentTarget.dataset.question_id;
        if (state == 1 || state == 5) { // 待审核||已超时
            navigateTo('/pages/questionModel/quiz/quiz', {state, questionApplyId})
        } else if (state == 3) { // 审核不通过
            navigateTo('/pages/questionModel/noCheck/noCheck', {questionApplyId})
        } else if (state == 4) { // 已回答
            navigateTo('/pages/questionModel/detail/detail', {questionId})
        }
    },
    // 专家详情
    toExpertDetail (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        navigateTo('/pages/expertModel/expertDetail/expertDetail', {expertId})
    },
    // 提醒答主
    questionPassToExpert (e) {
        let questionApplyId = e.currentTarget.dataset.question_apply_id;
        request.apiPost('user/questionPassToExpert', {questionApplyId}).then(() => {
            let questionList = this.data.questionData.rows;
            debugger;
            for (let oneResult of questionList) {
                if (oneResult.questionApplyId == questionApplyId) {
                    oneResult.questionApplyStatus = 2;
                    oneResult.questionReplyEndTime = new Date().getTime() + 24 * 60 * 60 * 1000;
                    oneResult.questionReasonOverplusTime = formatDateOverplus(oneResult.questionReplyEndTime)
                }
            }
            this.data.questionData.rows = questionList;
            this.setData({
                questionData: this.data.questionData
            })
        })
    },
    // 日期相差
    formatDateIntervalList (list) {
        for (let oneQuestion of list) {
            oneQuestion.questionApplyCreateTimeInterval = formatDateInterval(oneQuestion.questionApplyCreateTime);
        }
        return list;
    },
    // 定时更新倒计时
    timeOutUpdate () {
        let self = this;
        let intervalFunction = function () {
            let questionList = self.data.questionData.rows;
            for (let oneResult of questionList) {
                if (oneResult.questionApplyStatus == 2) {
                    if (oneResult.questionReplyEndTime - new Date().getTime() > 0) {
                        oneResult.questionReasonOverplusTime = formatDateOverplus(oneResult.questionReplyEndTime)
                    } else {
                        oneResult.questionApplyStatus = 5; // 已超时
                    }
                }
            }
            self.data.questionData.rows = questionList;
            self.setData({
                questionData: self.data.questionData
            })
        };
        intervalFunction();
        this.clearInterval();
        this.data.intervalId = setInterval(intervalFunction, 1000)
    },
    // 清除定时器
    clearInterval () {
        if (this.data.intervalId) {
            clearInterval(this.data.intervalId);
        }
    },
    // 2018-03-30 上拉加载更多
    loadMore () {
        if (this.data.loading) {
            this.loadMyQuestionData(false);
        }
    },
    // 设置请求参数
    setSearchParam(key, value) {
        let searchParam = this.data.searchParam;
        searchParam[key] = value;
        this.setData({
            searchParam
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadMyQuestionData();
        this.timeOutUpdate();
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
        this.clearInterval();
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
        this.loadMore();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    returnTime: function(){
        return false;
    }
})