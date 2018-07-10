/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {request} = require('../../../utils/api.js');
Page({
    page:1,
    data:{
        info:true,
        CommentOrReply:[],
        isData: false
    },
    onLoad:function () {
        this.loadUserCommentOrReplyMessageList()
    },
    loadUserCommentOrReplyMessageList(){
        let param = {
            page: this.page,
            pageSize: 10
        }
        request.apiPost('user/loadUserCommentOrReplyMessageList', param).then(res => {
                console.log(res);
                if (res.code) {
                    if (res.data.isNext == 0) {
                        this.setData({
                            isData: false
                        })
                    } else {
                        this.setData({
                            isData: true
                        })
                    }
                    res.data.data.forEach(function (v) {
                        if(v.rightContent ){
                            v.rightContent =  v.rightContent.length > 15 ?  v.rightContent.substring(0,15):  v.rightContent;
                            v.rightContent = v.rightContent.replace(/([，。、！：；？])/g, '$1 ')
                        }
                        v.doUserName = v.doUserName.length > 16 ?  v.doUserName.substring(0, 16):  v.doUserName;
                    })
                    if(this.page == 1){//如果是页数等于1，重新加载noteList
                        this.setData({
                            CommentOrReply:res.data.data
                        })
                    }else{//页数大于1，给noteList添加数据
                        this.setData({
                            CommentOrReply:this.data.CommentOrReply.concat(res.data.data)
                        })
                    }

                }
            }
        )
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserCommentOrReplyMessageList()
        } else {
            return
        }
    }
})