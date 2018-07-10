/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {request} = require('../../../utils/api.js');
Page({
    page:1,
    pageSize: 0,
    data:{
        FansList:[],
        userId:'',
        isData:false,
        myId:wx.getStorageSync('userInfo').id
    },
    onLoad:function (optins) {
        console.log(optins);
        this.setData({
            userId:optins.userId
        })
        this.loadUserFansList(this.data.userId)
    },
    loadUserFansList(userId,pageSize){
        let param = {
            userId:userId?userId:'',
            page:this.page,
            pageSize:pageSize ? pageSize : 12
        }
        request.apiPost('user/loadUserFansList',param).then(res=>{
            console.log(res);
            if (res.data.isNext == 0) {
                this.setData({
                    isData: false
                })
            } else {
                this.setData({
                    isData: true
                })
            }
            if(this.page == 1){//如果是页数等于1，重新加载noteList
                this.setData({
                    FansList:res.data.data
                })
            }else{//页数大于1，给noteList添加数据
                this.pageSize += res.data.data.length
                this.setData({
                    FansList:this.data.FansList.concat(res.data.data)
                })
            }
            if(userId == wx.getStorageSync('userInfo').id){
                wx.setNavigationBarTitle({
                    title: '我的粉丝（'+ res.data.total +'）'
                })
            }else{
                wx.setNavigationBarTitle({
                    title: 'Ta的粉丝（'+ res.data.total +'）'
                })
            }

        })
    },
    Follow(e){
        let param={
            followUserId: e.target.dataset.id
        }
        request.apiPost('user/followUser',param).then(res=>{
            console.log(res);
            if(this.pageSize == 0){
                this.loadUserFansList(this.data.userId)
            }else{
                this.loadUserFansList(this.data.userId, this.pageSize)
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
                            that.loadUserFansList(that.data.userId)
                        }else{
                            that.loadUserFansList(that.data.userId, that.pageSize)
                        }
                    })
                }
            }
        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserFansList(this.data.userId)
        } else {
            return
        }
    }
})
