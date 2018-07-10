/**
 * Created by Administrator on 2018/5/22 0022.
 */
let {request} = require('../../../utils/api.js');
let {formatDateInterval} = require('../../../utils/util.js')
const app = getApp()
Page({
    note_id: "",
    page: 1,
    pageSize: 0,
    data: {
        CommentList: [],
        reply: '',
        isData: false,
        NoteDetail:''
    },
    loadNoteCommentList(noteId, isNext, ispageSize){
        if (isNext) {
            let commentParam = {
                page: this.page,
                pageSize: 10,
                noteId: noteId
            }
            request.apiPost('note/loadNoteCommentList', commentParam).then(res => {
                console.log(res);
                if (res.code == 0) {
                    if (res.data.data) {
                        if (res.data.isNext == 0) {
                            this.setData({
                                isData: false
                            })
                        } else {
                            this.setData({
                                isData: true
                            })
                        }
                        this.pageSize += res.data.data.length
                        let newList = res.data.data
                        newList.forEach(function (v) {
                            v.createTime = formatDateInterval(v.createTime, 'mm-dd')
                        })
                        console.log(newList);
                        this.setData({
                            CommentList: this.data.CommentList.concat(newList)
                        })
                    }
                }
            })

        }
        else if (ispageSize) {
            console.log(this.pageSize);
            let commentParam = {
                page: 1,
                pageSize: this.pageSize,
                noteId: noteId
            }
            request.apiPost('note/loadNoteCommentList', commentParam).then(res => {
                console.log(res);
                if (res.code == 0) {
                    if (res.data.data) {
                        if (res.data.isNext == 0) {
                            this.setData({
                                isData: false
                            })
                        } else {
                            this.setData({
                                isData: true
                            })
                        }
                        let newList = res.data.data
                        newList.forEach(function (v) {
                            v.createTime = formatDateInterval(v.createTime, 'mm-dd')
                        })
                        this.setData({
                            CommentList: newList
                        })
                    }
                }
            })
        }
        else if (!isNext && !ispageSize) {
            let commentParam = {
                page: 1,
                pageSize: 10,
                noteId: noteId
            }
            request.apiPost('note/loadNoteCommentList', commentParam).then(res => {
                console.log(res);
                if (res.code == 0) {
                    if (res.data.isNext == 0) {
                        this.setData({
                            isData: false
                        })
                    } else {
                        this.setData({
                            isData: true
                        })
                    }
                    this.pageSize += res.data.data.length
                    let newList = res.data.data
                    newList.forEach(function (v) {
                        v.createTime = formatDateInterval(v.createTime, 'mm-dd')
                    })
                    console.log(newList);
                    this.setData({
                        CommentList: newList
                    })
                }
            })
        }
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadNoteCommentList(this.note_id, true)
        } else {
            return
        }
    },
    sendReply(){
        this.page = 1
        let that = this;
        let praam = {
            noteId: this.note_id,
            content: this.data.reply
        };
        if (praam.content) {
            request.apiPost('note/addNoteComment', praam).then(res => {
                if (res.code == 0) {
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success',
                        duration: 1500,
                        success: function () {
                            setTimeout(function () {
                                that.loadNoteCommentList(that.note_id)
                                that.loadNoteDetail(that.note_id)
                                that.setData({
                                    reply:''
                                })
                            }, 1500)
                        }
                    })
                }
            })
        } else {
            wx.showToast({
                title: "评论不能为空",
                icon: "none",
                duration: 1500
            })
        }


    },
    loadNoteDetail(noteId){
        let param = {
            noteId: noteId
        }
        request.apiPost('note/loadNoteDetail', param).then(res => {
            console.log(res);
            if (res.code == 0) {
                wx.setNavigationBarTitle({
                    title: res.data.commentNum + '  条评论',
                })
                this.setData({
                    loadNoteDetail:res.data
                })
            }
        })
    },
    inputReply(e){
        this.setData({
            reply: e.detail.value
        })
    },
    likeComment(e){
        console.log(e.target.dataset.index);
        let param = {
            commentId: e.target.dataset.id
        }
        request.apiPost('note/likeComment', param).then(res => {
            if (res.code == 0) {
                console.log(res);
            }
        })
        let commentList = this.data.CommentList
        commentList.forEach(function (v, i) {
            if (i == e.target.dataset.index) {
                if (v.isLike == 1) {
                    v.isLike = 0
                    v.likeNum--
                } else {
                    v.isLike = 1
                    v.likeNum++
                }
            }
        })
        console.log(commentList);
        this.setData({
            CommentList: commentList
        })
    },
    onLoad: function (options) {
        console.log(options);
        this.note_id = options.noteId
        this.loadNoteCommentList(this.note_id)
        this.loadNoteDetail(this.note_id)
        wx.setNavigationBarTitle({
            title: options.commentNum + '  条评论',
        })
        app.globalData.refreshFlag = true
    },
    onShow: function () {
        if(this.pageSize>0){
            this.loadNoteCommentList(this.note_id, false, true)
        }
    }
})