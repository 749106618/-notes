// pages/questionModel/answerDetail/answerDetail.js
let { request} = require('../../../utils/api.js');
let { showMessage, formatDateInterval} = require('../../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        commentId: '',
        commentDetail: {}, //回复详情
        commentData: {rows: []}, //评论列表
        commentValue: '', //评论
        commentFocus: false,
        loading: false, //加载动画
        searchParam: {
            page: 0,
            pageSize: 6,
            questionId: '', // 问题Id
            questionCommentId: 0, // 评论或回复Id
            newCommentIds: ''
        },
    },
    // 获取评论详情
    loadCommentDetail () {
        request.apiPost('question/questionCommentDetail', {questionCommentId: this.data.searchParam.questionCommentId}).then((result) => {
            result.data.commentTimeCompute = formatDateInterval(result.data.commentTime)
            this.setData({
                commentDetail: result.data
            })
        })
    },
    // 获取评论列表
    loadCommentData () {
        this.setSearchParam('page', Number(this.data.searchParam.page) + 1);
        request.apiPost('question/questionCommentList', this.data.searchParam).then((result) => {
            result.data.rows = this.handelBlueUserName(result.data.rows);
            let commentData = result.data;
            let oldCommentList = this.data.commentData.rows;
            commentData.rows = oldCommentList.concat(this.computeCommentTime(commentData.rows));
            this.setData({
                commentData,
                loading: commentData.page < commentData.total
            })
        })
    },
    //获取评论
    getCommentVal: function(e){
        this.setData({
            praiseVal: e.detail.value
        });
    },
    // 评论点赞
    handelLikeComment (e) {
        let commentId = e.currentTarget.dataset.comment_id;
        let type = e.currentTarget.dataset.type;
        request.apiPost('question/likeComment', {commentId}).then(() => {
            if (type == 1) {
                let commentDetail = this.data.commentDetail;
                commentDetail.isLike = ~commentDetail.isLike + 2;
                commentDetail.likeNum = (commentDetail.isLike == 1? Number(commentDetail.likeNum) + 1: Number(commentDetail.likeNum) - 1);
                this.setData({
                    commentDetail
                })
            } else {
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
            }
        })
    },
    // 评论
    sendComment (e) {
        let content = e.detail.value;
        if(content) {
            request.apiPost('question/commentApply', {
                questionCommentId: this.data.searchParam.questionCommentId,
                commentId: this.data.commentId, 
                content: content
            }).then((result) => {
                this.setSearchParam('newCommentIds', result.data.questionCommentId);
                this.data.commentData.rows = this.handelBlueUserName(this.computeCommentTime([result.data])).concat(this.data.commentData.rows);
                this.data.commentData.records++;
                this.data.commentDetail.replyNum++;
                if (this.data.commentId != this.data.searchParam.questionCommentId) {
                    for (let oneComment of this.data.commentData.rows) {
                        if (oneComment.questionCommentId == this.data.commentId) {
                            oneComment.replyNum++;
                        }
                    }
                }
                this.setData({
                    commentDetail: this.data.commentDetail,
                    commentData: this.data.commentData,
                    commentId: this.data.searchParam.questionCommentId,
                    commentValue: '',
                    commentFocus: false
                })
                showMessage('回复成功');
            })
        }
    },
    // 回复点击
     focusComment (e) {
         let commentId = e.currentTarget.dataset.comment_id;
         this.setData({
             commentId,
             commentFocus: true
         })
     },
    // 设置请求参数
    setSearchParam(key, value) {
        if (key == 'newCommentIds') {
            let oldNewCommentIds = this.data.searchParam.newCommentIds;
            value = oldNewCommentIds? oldNewCommentIds + "," + value: value;
        }
        this.data.searchParam[key] = value;
    },
    // 2018-03-30 上拉加载更多
    loadMore () {
        if (this.data.loading) {
            this.loadCommentData();
        }
    },
    // 计算评论时间
    computeCommentTime (commentList) {
        for (let oneComment of commentList) {
            oneComment.commentTimeCompute = formatDateInterval(oneComment.commentTime);
        }
        return commentList;
    },
    // @变蓝
    handelBlueUserName (commentList) {
        for (let oneComment of commentList) {
            let contentArrayTemp = oneComment.content.split('###');
            let contentArray = [];
            for (let i = 0; i < contentArrayTemp.length; i++) {
                if (i %2 == 0) {
                    contentArray.push({
                        type: 1,
                        content: contentArrayTemp[i]
                    });
                } else {
                    contentArray.push({
                        type: 2,
                        content: contentArrayTemp[i]
                    });
                }
            }
            oneComment.contentArray = contentArray;
        }
        return commentList;
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            commentId: options.commentId
        })
        this.setSearchParam('questionCommentId', options.commentId);
        this.setSearchParam('questionId', options.questionId);
        this.loadCommentDetail();
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
    onShareAppMessage: function () {

    }
})