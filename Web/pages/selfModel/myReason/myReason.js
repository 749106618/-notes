// pages/selfModel/problemCollect/problemCollect.js
let { request } = require('../../../utils/api.js');
let { navigateTo, formatDateInterval, subReason } = require('../../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        questionData: { rows: [] },
        loading: false, //加载动画
        searchParam: {
            page: 0,
            pageSize: 8
        }
    },
    //获取问题收藏列表
    loadQuestionData (isFreshen) {
        this.setSearchParam('page', isFreshen? 1 : Number(this.data.searchParam.page) + 1);
        request.apiPost('expert/myReasonData', this.data.searchParam).then((result) => {
            let questionData = result.data;
            let oldQuestionList = this.data.questionData.rows;
            questionData.rows = oldQuestionList.concat(this.formatDateIntervalList(questionData.rows));
            for(let item of questionData.rows){
                item.questionReasonText = item.questionReasonText.length > 66 ? item.questionReasonText.slice(0, 66) + '...' : item.questionReasonText;
            }
            this.setData({
                questionData,
                loading: questionData.page < questionData.total
            })
        });
    },
    //问答详情
    toQuestionDetail (e) {
        let questionId = e.currentTarget.dataset.question_id;
        navigateTo('/pages/questionModel/detail/detail', {questionId})
    },
    // 日期相差
    formatDateIntervalList (list) {
        for (let oneQuestion of list) {
            oneQuestion.questionReasonTimeInterval = formatDateInterval(oneQuestion.questionReasonTime);
            oneQuestion.questionReasonText = subReason(oneQuestion.questionReasonText);
        }
        return list;
    },
    // 2018-03-30 上拉加载更多
    loadMore: function(){
        if (this.data.loading) {
            this.loadQuestionData(false);
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
        this.loadQuestionData(true);
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
        this.loadMore();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})