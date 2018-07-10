/**
 * Created by Administrator on 2018/5/23 0023.
 * 关注页面
 */

let {request} = require('../../../utils/api.js')
Page({
    page: 1,
    pageSize: 0,
    data: {
        followList: [],
        userId: '',
        isData: false,
        myId:wx.getStorageSync('userInfo').id
    },
    onLoad: function (options) {
        this.setData({
            userId: options.userId
        })
        this.loadFansList(this.data.userId)
    },
    loadFansList(userId, pageSize){
        let param = {
            userId: userId ? userId : '',
            page: this.page,
            pageSize: pageSize ? pageSize : 13
        }
        request.apiPost('user/loadUserFollowList', param).then(res => {
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
                if (this.page == 1) {//如果是页数等于1，重新加载noteList
                    this.setData({
                        followList: res.data.data
                    })
                } else {//页数大于1，给noteList添加数据
                    this.pageSize += res.data.data.length
                    this.setData({
                        followList: this.data.followList.concat(res.data.data)
                    })
                }
                if (userId == wx.getStorageSync('userInfo').id) {
                    wx.setNavigationBarTitle({
                        title: '我的关注（' + res.data.total + '）'
                    })
                } else {
                    wx.setNavigationBarTitle({
                        title: 'Ta的关注（' + res.data.total + '）'
                    })
                }
            }
        })
    },
    Follow(e){
        let param = {
            followUserId: e.target.dataset.id
        }
        let that = this;
        request.apiPost('user/followUser', param).then(res => {
            console.log(res);
            if(that.pageSize == 0){
                that.loadFansList(that.data.userId)
            }else{
                that.loadFansList(that.data.userId, that.pageSize)
            }
        })
    },
    unfollow(e){
        let param = {
            followUserId: e.target.dataset.id
        }
        let that = this;
        wx.showModal({
            title: '提示',
            content: '是否取消关注',
            success: function (res) {
                if (res.confirm) {
                    request.apiPost('user/followUser', param).then(res => {
                        if(that.pageSize == 0){
                            that.loadFansList(that.data.userId)
                        }else{
                            that.loadFansList(that.data.userId, that.pageSize)
                        }

                    })
                }
            }
        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadFansList(this.data.userId)
        } else {
            return
        }
    }

})
