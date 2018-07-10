// pages/selfModel/problemCollect/problemCollect.js
let { request } = require('../../../utils/api.js');
let { navigateTo, removeOneInList } = require('../../../utils/util.js');
let {invokeListener, addListener} = require('../../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        questionData: { rows: [] },
        allQuestionList: [],
        loading: false, //加载动画
        searchParam: {
            page: 0,
            pageSize: 6
        }
    },
    //获取问题收藏列表
    loadQuestionData (isFreshen) {
        this.setSearchParam('page', isFreshen? 1 : Number(this.data.searchParam.page) + 1);
        request.apiPost('user/myFollowQuestionData', this.data.searchParam).then((result) => {
            let questionData = result.data;
            let oldQuestionList = this.data.questionData.rows;
            questionData.rows = oldQuestionList.concat(questionData.rows);
            this.data.allQuestionList = questionData.rows;
            this.setData({
                questionData,
                loading: questionData.page < questionData.total
            })
        });
    },
    //问答详情
    toQuestionDetail (e) {
        let questionId = e.currentTarget.dataset.question_id;
        navigateTo('/pages/questionModel/detail/detail', {questionId, whereType: 1})
    },
    // 专家详情
    toExpertDetail (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        navigateTo('/pages/expertModel/expertDetail/expertDetail', {expertId})
    },
    // 专家关注
    expertCollect (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        request.apiPost('expert/cancelOrFollowExpert', {expertId: expertId}).then(() => {
            let questionList = this.data.questionData.rows;
            for (let oneQuestion of questionList) {
                if (oneQuestion.expertId == expertId) {
                    oneQuestion.isCollectExpert = ~oneQuestion.isCollectExpert + 2
                }
            }
            this.data.questionData.rows = questionList;
            this.setData({
                questionData: this.data.questionData
            });
            invokeListener('collectExpertListener', expertId);
        })
    },
    questionCollectCancelListener (param) {
        if (param.isFollowQuestion == 0) {
            for (let i = 0; i < this.data.questionData.rows.length; i ++) {
                let oneQuestion = this.data.questionData.rows[i];
                if (oneQuestion.questionId == param.questionId) {
                    this.data.questionData.rows = removeOneInList(this.data.questionData.rows, i);
                    this.data.questionData.records --;
                    this.loadMore();
                    break;
                }
            }
        } else {
            this.data.questionData.rows = this.data.allQuestionList;
            this.data.questionData.records ++;
        }
        this.setData({
            questionData: this.data.questionData
        });
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
        addListener('questionCollectCancelListener', this.questionCollectCancelListener)
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