/**
 * Created by Administrator on 2018/5/25 0025.
 */
let {request} = require('../../utils/api.js');
Page({
    page: 1,
    data: {
        currentTab: 1,
        userInfo: {},//当前用户id
        noteList: [],
        userId: {},//当前用户id
        url: 'user/loadUserNoteList',
        loading: false,
        isData: true,
        total1:0,
        total2:0
    },
    bindNavTab: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
        if (e.target.dataset.current == '1') {
            this.page = 1
            that.setData({
                url: 'user/loadUserNoteList'
            })
            that.loadUserNoteOrUserFollow('user/loadUserNoteList')
        } else {
            this.page = 1
            that.setData({
                url: 'user/loadUserFollowNoteList'
            })
            that.loadUserNoteOrUserFollow('user/loadUserFollowNoteList')
        }

    },
    followUser(){
        let param = {
            followUserId: this.data.userInfo.id
        }
        let that = this
        request.apiPost('user/followUser', param).then(res => {
            if (res.code == 0) {
                let param1 = {
                    userId:this.data.userId
                }
                request.apiPost('user/loadUserDetail', param1).then(result => {
                    that.setData({
                        userInfo: result.data
                    })
                })
            }
        })
    },
    loadUserNoteOrUserFollow(url, page){
        let param = {
            userId:this.data.userId,
            page: page ? page : 1,
            pageSize: 10
        }
        request.apiPost(url, param).then(res => {
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
                    v.imageList = v.imageList.split(',')
                    v.noteTitle = v.noteTitle.length > 20 ? v.noteTitle.substring(0, 20) : v.noteTitle
                    v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                    v.userName = v.userName.length > 6 ?  v.userName.substring(0, 6)+ "...":  v.userName
                })
                if (this.page == 1) {//如果是页数等于1，重新加载noteList
                    this.setData({
                        noteList: res.data.data
                    })
                } else {//页数大于1，给noteList添加数据
                    this.setData({
                        noteList: this.data.noteList.concat(res.data.data)
                    })
                }
                //判断是否显示loading
                this.setData({
                    loading: res.data.isNext
                })
            }
        })

    },
    loadTotal(param){
        request.apiPost('user/loadUserNoteList', param).then(res => {
            this.setData({
                total1: res.data.total
            })
        })
        request.apiPost('user/loadUserFollowNoteList', param).then(res => {
            this.setData({
                total2: res.data.total
            })
        })
    },
    onLoad: function (options) {
        let that = this
        let param = {
            userId: options.userId
        }
        that.setData({
            userId: options.userId
        })
        request.apiPost('user/loadUserDetail', param).then(res => {
            console.log(res);
            that.setData({
                userInfo: res.data
            })
            that.loadUserNoteOrUserFollow(this.data.url)
        })

        let param1 = {
            userId: options.userId,
            page:1,
            pageSize:10
        }
        that.loadTotal(param1)
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserNoteOrUserFollow(this.data.url,this.page)
        } else {
            return
        }
    },
    unfollow(e){
        let param = {
            followUserId: e.target.dataset.id
        }
        let param1 = {
            userId:e.target.dataset.id
        }
        let that = this;
        wx.showModal({
            title: '提示',
            content: '是否取消关注',
            success: function (res) {
                if (res.confirm) {
                    request.apiPost('user/followUser', param).then(res => {
                            request.apiPost('user/loadUserDetail', param1).then(res => {
                                that.setData({
                                    userInfo: res.data
                                })
                            })
                    })
                }
            }
        })
    },
})