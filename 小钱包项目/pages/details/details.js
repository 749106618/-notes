/**
 * Created by Administrator on 2018/5/21 0021.
 */
let {request} = require('../../utils/api.js');
let {formatDateInterval} = require('../../utils/util.js')
const app = getApp()
Page({
    note_id: '',
    data: {
        swiperHeight: 0,
        isAuto: false,
        detail: [],//笔记详情
        reply: '',//评论回复内容
        isReply: false,//评论框是否显示
        CommentList:[],//评论列表
        userInfo:[],//用户信息
        RelatedNoteList:[],//相关笔记列表
        note_id:'',//笔记id
        isCollectUser:1,//是否关注，默认关注
        isLike:1,//是否点赞，默认点赞
        isFollow:1,//是否收藏，默认收藏
    },
    onLoad (options) {
        this.setData({
              userInfo: wx.getStorageSync('userInfo'),
              note_id:options.noteId
          })
        this.note_id = options.noteId
        this.loadNoteDetail(this.note_id)
        this.loadNoteCommentList(this.note_id)
        this.loadRelatedNoteList(this.note_id)
    },
    onShow(){
        if (app.globalData.refreshFlag) {
            app.globalData.refreshFlag = false
            this.loadNoteCommentList(this.note_id)
        }

    },
    loadNoteCommentList(noteId){
        let commentParam = {
            page:1,
            pageSize:3,
            noteId: noteId
        }
        request.apiPost('note/loadNoteCommentList',commentParam).then(res=>{
            console.log(res);
            if (res.code == 0) {
                let newList =  res.data.data
                newList.forEach(function (v) {
                    v.createTime =  formatDateInterval(v.createTime,'mm-dd')
                })
                console.log(newList);
                this.setData({
                    CommentList: newList
                })
            }
        })
    },
    loadNoteDetail(noteId){
        let param = {
            noteId: noteId
        }
        request.apiPost('note/loadNoteDetail', param).then(res => {
            console.log(res);
            if (res.code == 0) {
                if(res.data.isPublish == 0){
                    wx.showToast({
                        title: '此笔记被下架',
                        icon: "none",
                        success: function () {
                            setTimeout(function () {
                                wx.navigateBack()
                            }, 1000)
                        }
                    })
                }
                console.log(res.data.userName);
                res.data.imageList = res.data.imageList.split(',')
                res.data.noteTitle = res.data.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                res.data.userName = res.data.userName.length > 15 ? res.data.userName.substring(0,15) : res.data.userName
                if(res.data.isFollow  == 0){//收藏
                    this.setData({
                        isFollow:0,
                    })
                }
                if(res.data.isLike == 0){//点赞
                    this.setData({
                        isLike:0,
                    })
                }
                if(res.data.isCollectUser  == 0){//关注
                    this.setData({
                        isCollectUser:0,
                    })
                }
                //isLike:0
                res.data.noteDetail =  res.data.noteDetail.split("\n")

                this.setData({
                    detail: res.data
                })
            }
        })
    },
    inputReply(e){
        this.setData({
            reply: e.detail.value
        })
    },
    sendReply(){
        let that = this;
        let praam = {
            noteId: this.note_id,
            content: this.data.reply
        };
        if(praam.content){
            request.apiPost('note/addNoteComment', praam).then(res => {
                if (res.code == 0) {
                    console.log(res);
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success',
                        success:function () {
                             that.loadNoteCommentList(that.note_id)
                        }
                    })
                }
            })
        }else{
            wx.showToast({
                title:"评论不能为空",
                icon:"none",
                duration:1500
            })
        }

    },
    hideReply(){
        this.setData({
            isReply: false
        })
    },
    showReply(){
        this.setData({
            isReply: true
        })
    },
    /*点赞评论列表*/
    likeComment(e){
        console.log(e.target.dataset.index);
        let param = {
            commentId: e.target.dataset.id
        }
        request.apiPost('note/likeComment',param).then(res=>{
            if(res.code == 0){
                console.log(res);
            }
        })
        let commentList = this.data.CommentList
        commentList.forEach(function (v,i) {
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
        console.log(commentList);
        this.setData({
            CommentList:commentList
        })

    },
    /*点赞笔记、取消点赞*/
    likeNote(){
        let param = {
            noteId:this.data.detail.noteId
        }
        request.apiPost('note/likeNote',param).then(res=>{
            console.log(res);
        })
        if(this.data.isLike == 0){
            let detail = this.data.detail
            detail.likeNum = detail.likeNum + 1
            this.setData({
                isLike:1,
                detail:detail
            })
        }else{
            let detail = this.data.detail
            detail.likeNum = detail.likeNum - 1
            this.setData({
                isLike:0,
                detail:detail
            })
        }
    },
    /*收藏、取消收藏*/
    isFollow(){
        let param = {
            noteId:this.data.detail.noteId
        }
        request.apiPost('note/followNote',param).then(res=>{
            console.log(res);
        })
        if(this.data.isFollow == 0){
            let detail = this.data.detail
            detail.followNum = detail.followNum + 1
            this.setData({
                isFollow:1,
                detail:detail
            })
        }else{
            let detail = this.data.detail
            detail.followNum = detail.followNum - 1
            this.setData({
                isFollow:0,
                detail:detail
            })
        }
    },
    /*点击关注*/
    isfollow(e){
        console.log(e.target);
        let param = {
            followUserId:this.data.detail.userId
        }
        request.apiPost('user/followUser',param).then(res=>{})
        if(this.data.isCollectUser == 0){
           this.setData({
               isCollectUser:1
           })
        }else{
            return
        }
    },
    loadRelatedNoteList(noteId){
        let param = {
            page:1,
            pageSize:4,
            noteId: noteId
        }
        request.apiPost('note/loadRelatedNoteList',param).then(res=>{
            res.data.data.forEach(function (v) {
                v.imageList = v.imageList.split(',')
                v.noteTitle = v.noteTitle.length > 20 ? v.noteTitle.substring(0, 20) : v.noteTitle
                v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                v.userName = v.userName.length > 6 ?  v.userName.substring(0, 6)+ "...":  v.userName
            })
                this.setData({
                    RelatedNoteList:res.data.data
                })
        })
    },
    previewImg(e){
        console.log(e.target.dataset.src);
        wx.previewImage({
            current: e.target.dataset.src, // 当前显示图片的http链接
            urls: this.data.detail.imageList // 需要预览的图片http链接列表
        })
    },
    navgitor(e){
        wx.navigateTo({
            url:'../personalHomePage/personalHomePage?userId='+ e.target.dataset.url
        })
    },
    navgitor2(e){
        wx.navigateTo({
            url:'../detailsModel/replyList/replyList?commentId='+ e.target.dataset.url
        })
    }
})