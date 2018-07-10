/**
 * Created by Administrator on 2018/5/22 0022.
 */
let {request} = require('../../../utils/api.js');
let {formatDateInterval} = require('../../../utils/util.js')
Page({
    comment_id: '',
    reply_id: '',
    data: {
        commentDetail: [],
        focus: false,
        reply: '',
        currentUser:''
    },
    loadCommentDetail(noteId){
        let param = {
            commentId: noteId
        }
        request.apiPost('note/loadCommentDetail', param).then(res => {
            if (res.code == 0) {
                console.log(res);
                let newList = res.data
                newList.createTime = formatDateInterval(newList.createTime, 'mm-dd')
                newList.replyList.forEach(function (v) {
                    v.createTime = formatDateInterval(v.createTime, 'mm-dd')
                })
                this.setData({
                    commentDetail: newList,
                    currentUser: res.data.userName
                })
                wx.setNavigationBarTitle({
                    title: newList.replyNum + '  条回复',
                })
            }
        })
    },
    sendReply(){
        let that = this;
        let praam = {
            commentId: this.reply_id ? this.reply_id : this.comment_id,
            content: this.data.reply
        };
        if(praam.content){
            request.apiPost('note/addCommentApply', praam).then(res => {
                if (res.code == 0) {
                    console.log(res);
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success',
                        duration: 1500,
                        success: function () {
                            setTimeout(function () {
                                that.loadCommentDetail(that.comment_id)
                            }, 1500)
                            that.setData({
                                reply:''
                            })
                        }
                    })
                }
            })
        }else{
            wx.showToast({
                title:"回复不能为空",
                icon:"none",
                duration:1500
            })
        }

    },
    bindFocus(e){
        this.setData({
            focus: true,
            currentUser:e.target.dataset.name
        })
        this.reply_id = e.target.dataset.commentid
    },
    bindFocus1(){
        this.setData({
            focus: true,
            currentUser:this.data.commentDetail.userName
        })
        this.reply_id = this.note_id
    },
    inputReply(e){
        this.setData({
            reply: e.detail.value
        })
    },
    likeComment(e){
        //isLike
        let that = this
        let commentid = e.target.dataset.commentid
        let param = {
            commentId: commentid ? commentid : this.comment_id
        }
        request.apiPost('note/likeComment', param).then(res => {
            console.log(res);
            //that.loadCommentDetail(that.comment_id)
        })
        if(e.target.dataset.commentid){
            let commentDetail = this.data.commentDetail
            commentDetail.replyList.forEach(function (v,i) {
                if(i == e.target.dataset.index){
                    if(v.isLike == 1){
                        v.isLike = 0
                        v.likeNum--
                    }else{
                        v.isLike = 1
                        v.likeNum++
                    }
                }
            })
            this.setData({
                commentDetail:commentDetail
            })
        }else{
            let commentDetail = this.data.commentDetail
            if(commentDetail.isLike == 1){
                commentDetail.isLike = 0
                commentDetail.likeNum--
            }else{
                commentDetail.isLike = 1
                commentDetail.likeNum++
            }
            this.setData({
                commentDetail:commentDetail
            })
        }

    },
    onLoad: function (options) {
        console.log(options);
        wx.setNavigationBarTitle({
            title: options.replyNum + '  条回复',
        })
        this.comment_id = options.commentId;
        this.loadCommentDetail(this.comment_id);
    },
})