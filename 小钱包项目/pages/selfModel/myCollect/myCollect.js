/**
 * Created by Administrator on 2018/5/24 0024.
 */
let {request} = require('../../../utils/api.js')
Page({
    page:1,
    data: {
        info: true,
        followList: [],
        isData:false
    },
    onLoad: function () {
        this.loadUserFollowNoteList()
    },
    loadUserFollowNoteList(){
        let param = {
            userId: wx.getStorageSync('userInfo').id,
            page: this.page,
            pageSize: 10
        }
        request.apiPost('user/loadUserFollowNoteList', param).then(res => {
            if(res.code == 0){
                console.log(res.data);
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
                    v.imageList = v.imageList.split(',')
                    v.noteTitle = v.noteTitle.length > 20 ?  v.noteTitle.substring(0, 20):  v.noteTitle
                    v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                    v.userName = v.userName.length > 6 ?  v.userName.substring(0, 6)+ "...":  v.userName
                })
                wx.setNavigationBarTitle({
                    title: '我的收藏（' + res.data.total +  '）',
                })
                if(this.page == 1){//如果是页数等于1，重新加载noteList
                    this.setData({
                        followList:res.data.data
                    })
                }else{//页数大于1，给noteList添加数据
                    this.setData({
                        followList:this.data.followList.concat(res.data.data)
                    })
                }
            }

        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserFollowNoteList(this.data.userId)
        } else {
            return
        }
    }
})