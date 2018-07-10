// pages/questionModel/detail/detail.js
let { request } = require('../../../utils/api.js');
let { navigateTo, getUrlWithParam, formatDateInterval, showMessage } = require('../../../utils/util.js');
let {invokeListener} = require('../../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        messageId: '',
        commentValue: '',
        questionDetail: {}, // 问题信息
        commentData: {rows: []}, //评论列表
        loading: true, //加载动画
        whereType: '', // 来自那里---1.收藏;2:已回答消息
        searchParam: {
            page: 0,
            pageSize: 6,
            questionId: '', // 问题Id
            questionCommentId: 0, // 评论或回复Id
            newCommentIds: ""
        }
    },
    // 获取问题详情
    loadQuestionDetail () {
        let param = {
            questionId: this.data.searchParam.questionId,
            messageId: this.data.messageId
        };
        if (this.data.whereType == 2) {
            param.whereType = this.data.whereType;
        }
        request.apiPost('question/questionDetail', param).then((result) => {
            let questionDetail = result.data;
            questionDetail.questionReasonArray = JSON.parse(questionDetail.questionReason)
            this.setData({
                questionDetail: result.data
            })
        })
    },
    // 问题收藏
    handelFollowQuestion () {
        request.apiPost('question/questionFollow', {questionId: this.data.questionDetail.questionId}).then(() => {
            this.data.questionDetail.isFollowQuestion = ~this.data.questionDetail.isFollowQuestion + 2;
            this.setData({
                questionDetail: this.data.questionDetail
            })
            invokeListener('questionCollectCancelListener', {
                questionId: this.data.questionDetail.questionId,
                isFollowQuestion: this.data.questionDetail.isFollowQuestion
            })
        })
    },
    // 问题点赞
    handelLikeQuestion () {
        request.apiPost('question/questionLike', {questionId: this.data.questionDetail.questionId}).then(() => {
            let isLikeQuestion = this.data.questionDetail.isLikeQuestion;
            this.data.questionDetail.isLikeQuestion = ~isLikeQuestion + 2;
            if (this.data.questionDetail.questionLikeNum.toString().indexOf('+') == -1) {
                let questionLikeNum = Number(this.data.questionDetail.questionLikeNum);
                this.data.questionDetail.questionLikeNum = this.data.questionDetail.isLikeQuestion == 1? questionLikeNum + 1: questionLikeNum - 1;
            }
            this.setData({
                questionDetail: this.data.questionDetail
            })
        })
    },
    // 评论回复
    goCommentDetail (e) {
        let commentId = e.currentTarget.dataset.comment_id;
        navigateTo('/pages/questionModel/commentDetail/commentDetail', {questionId: this.data.searchParam.questionId, commentId: commentId});
    },
    // 获取评论列表
    loadCommentData () {
        this.setSearchParam('page', Number(this.data.searchParam.page) + 1);
        request.apiPost('question/questionCommentList', this.data.searchParam).then((result) => {
            let commentData = result.data;
            let oldCommentList = this.data.commentData.rows;
            commentData.rows = oldCommentList.concat(this.computeCommentTime(commentData.rows));
            this.setData({
                commentData,
                loading: commentData.page < commentData.total
            })
        })
    },
    // 评论点赞
    handelLikeComment (e) {
        let commentId = e.currentTarget.dataset.comment_id
        request.apiPost('question/likeComment', {commentId: commentId}).then(() => {
            let oldCommentList = this.data.commentData.rows;
            for (let oneComment of oldCommentList) {
                if (oneComment.questionCommentId == commentId) {
                    oneComment.isLike = ~oneComment.isLike + 2;
                    oneComment.likeNum = (oneComment.isLike == 1? Number(oneComment.likeNum) + 1: Number(oneComment.likeNum) - 1);
                }
            }
            this.data.commentData.rows = oldCommentList;
            this.setData({
                commentData: this.data.commentData
            })
        })
    },
    // 专家关注
    expertCollect (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        request.apiPost('expert/cancelOrFollowExpert', {expertId: expertId}).then(() => {
            this.data.questionDetail.isCollectExpert = 1;
            this.setData({
                questionDetail: this.data.questionDetail
            })
            if (this.data.whereType == 1) {
                invokeListener('collectExpertListener', expertId);
            }
        })
    },
    // 提问
    addQuestion () {
        if (this.data.userInfo.id == this.data.questionDetail.expertId) {
            showMessage("自己不能向自己提问题哦~");
            return;
        }
        navigateTo('/pages/questionModel/quiz/quiz', {expertId: this.data.questionDetail.expertId})
    },
    // 评论
    sendComment (e) {
        if (this.data.userInfo.isPublish == 0) {
            showMessage("您被禁言" + this.data.userInfo.forbiddenDayNum + "天~");
            return;
        }
        let content = e.detail.value;
        if(content) {
            request.apiPost('question/questionComment', {questionId: this.data.searchParam.questionId, content: content}).then((result) => {
                this.setSearchParam('newCommentIds', result.data.questionCommentId);
                this.data.commentData.rows = this.computeCommentTime([result.data]).concat(this.data.commentData.rows);
                this.data.commentData.records++;
                this.setData({
                    commentData: this.data.commentData,
                    commentValue: ''
                })
                showMessage('评论成功');
            })
        }
    },
    // 预览图片
    previewImage (e) {
        let imageUrl = e.currentTarget.dataset.image_url;
        wx.previewImage({
            urls: [imageUrl]
        });
    },
    // 设置请求参数
    setSearchParam(key, value) {
        if (key == 'newCommentIds') {
            let oldNewCommentIds = this.data.searchParam.newCommentIds;
            value = oldNewCommentIds? oldNewCommentIds + "," + value: value;
        }
        this.data.searchParam[key] = value;
    },
    // 计算评论时间
    computeCommentTime (commentList) {
        for (let oneComment of commentList) {
            oneComment.commentTimeCompute = formatDateInterval(oneComment.commentTime);
        }
        return commentList;
    },
    // 2018-03-30 上拉加载更多
    loadMore: function(){
        if (this.data.loading) {
            this.loadCommentData();
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
        });
        if (options.whereType) {
            this.setData({
                whereType: options.whereType
            })
        }
        this.setSearchParam('questionId', options.questionId)
        if (options.messageId) {
            this.data.messageId = options.messageId;
        }
        //初始化数据
        this.loadQuestionDetail();
        this.loadCommentData();
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
    onShareAppMessage () {

    }
})