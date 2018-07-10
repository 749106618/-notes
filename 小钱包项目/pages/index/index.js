//index.js
let {request} = require('../../utils/api.js');
let {formatDateInterval, showLoading, hideLoading, subReason} = require('../../utils/util.js');
//获取应用实例
const app = getApp()

Page({
    page: 1,
    data: {
        bannerList: [],
        userInfo: {},
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isUnauthorized: false,
        RecommendList: [], //精品列表
        isData: false,
        isMsg: false,
    },
    loginOrRegister() {
        let self = this;
        wx.getSetting({
            success(res) {
                console.log(res);
                // 登录 已经授权，可以直接调用 getUserInfo 获取头像昵称
                if (res.authSetting['scope.userInfo']) {
                    wx.login({
                        success: loginResult => {
                            wx.getUserInfo({
                                success: userInfoResult => {
                                    console.log(userInfoResult);
                                    // 可以将 res 发送给后台解码出 unionId
                                    let param = userInfoResult.userInfo
                                    param.wxCode = loginResult.code
                                    request.apiPost('user/loginOrRegister', param).then((result) => {
                                        wx.setStorageSync('token', result.data.token)
                                        self.doLoad();
                                        wx.setStorage({
                                            key: 'userInfo',
                                            data: result.data.userResult
                                        })
                                    })
                                }
                            })
                        }
                    })
                } else {
                    hideLoading();
                    self.setData({
                        isUnauthorized: true
                    })
                }
            }
        });
    },
    getBannerList() {
        let that = this;
        request.apiPost('note/loadIndexPicture', {}).then(pictureResult => {
            console.log(pictureResult);
            that.setData({
                bannerList: pictureResult.data
            })
        })
    },
    navigator(e){
        let type = e.currentTarget.dataset.type;
        let correlation = e.currentTarget.dataset.correlation;
        switch (type) {
            case 0:
                break;
            case 1:
                wx.navigateTo({
                    url: '../out/out?src=' + correlation
                })
                break;
            case 2:
                wx.navigateTo({
                    url: '../details/details?noteId=' + correlation
                })
                break;
            case 3:
                wx.navigateTo({
                    url: '../activity/activity?activityId=' + correlation
                })
                break;
        }
    },
    doLogin() {
        if (wx.getStorageSync('token')) {
            request.apiPost('user/checkToken', {}, false).then((result) => {
                if (result.code == 0) {
                    this.doLoad();
                } else {
                    this.loginOrRegister();
                }
            })
        } else {
            this.loginOrRegister();
        }
    },
    bindGetUserInfo() {
        showLoading('登录中...');
        this.setData({
            isUnauthorized: false
        })
        this.doLogin();
    },
    doLoad(){
        hideLoading();
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        this.getBannerList()
        this.loadRecommendList()
        this.isMsg()
    },
    onLoad: function () {
        console.log(wx.getStorageSync('userInfo'));
        console.log(wx.getStorageSync('token'));
        showLoading('登录中...');
        this.doLogin() // 登录
    },
    loadRecommendList(){
        let param = {
            page: this.page,
            pageSize: 5
        }
        request.apiPost('note/loadRecommendList', param).then(res => {
            if (res.code == 0) {
                //判断有没有下一页
                if (res.data.isNext == 0) {
                    this.setData({
                        isData: false
                    })
                } else {
                    this.setData({
                        isData: true
                    })
                }
                //更改时间格式
                res.data.data.forEach(function (v) {
                    v.releaseTime = v.releaseTime ? formatDateInterval(v.releaseTime, 'mm-dd') : v.releaseTime
                    v.noteDetail = v.noteDetail.length > 75 ? v.noteDetail.substring(0, 75) : v.noteDetail;
                    v.noteTitle = v.noteTitle.length > 37 ? v.noteTitle.substring(0, 37) : v.noteTitle;
                    v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ');
                })
                if (this.page == 1) {//页码为1，重新加载精品列表
                    this.setData({
                        RecommendList: res.data.data
                    })
                } else {//否则拼接精品列表
                    this.setData({
                        RecommendList: this.data.RecommendList.concat(res.data.data)
                    })
                }
            }

        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadRecommendList()
        } else {
            return
        }
    },
    onShow(){
        this.page = 1
        if (app.globalData.refreshFlag) {
            app.globalData.refreshFlag = false
        }
        this.isMsg()
    },
    navigate(){
        wx.switchTab({
            url: '../self/self',
        })
    },
    isMsg(){
        let that = this
        request.apiPost('user/loadUserNewNoticeMessageNum').then(res => {
            //console.log(res.data.newFansNum);
            if (res.code == 0) {
                if (res.data.newCommentOrReplyNum || res.data.newFansNum || res.data.newFollowOrLikeNum || res.data.newSystemNum) {
                    that.setData({
                        isMsg: true
                    })
                } else {
                    that.setData({
                        isMsg: false
                    })
                }
            }

        })
    },
    onPullDownRefresh: function () {
        this.getBannerList()
        this.loadRecommendList()
        this.isMsg()
        setTimeout(function () {
            wx.stopPullDownRefresh() //停止下拉刷新
        }, 1500)
    },
    onReady(){
        wx.hideTabBar({
            fail: function () {
                setTimeout(function () {  // 做了个延时重试一次，作为保底。
                    wx.hideTabBar()
                }, 500)
            }
        }); // 隐藏TabBar
    }
})
