/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {request} = require('../../../utils/api.js');
let {formatDateInterval} = require('../../../utils/util.js');
Page({
    page: 1,
    pageSize: 0,
    data: {
        FansList: [],
        isData: false
    },
    onLoad: function () {
        this.loadUserFansList()
    },
    loadUserFansList(pageSize){
        let param = {
            page: this.page,
            pageSize:pageSize ? pageSize : 12
        }
        request.apiPost('user/loadUserFansList', param).then(res => {
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
                    v.createTime = formatDateInterval(v.createTime, 'mm-dd')
                    v.nickName = v.nickName.length > 15 ? v.nickName.substring(0, 15) : v.nickName
                    v.nickName = v.nickName.replace(/([，。、！：；？])/g, '$1 ')
                })
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
                wx.setNavigationBarTitle({
                    title: '新增关注（' + res.data.data.length + '）'
                })
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
                            that.loadUserFansList()
                        }else{
                            that.loadUserFansList(that.pageSize)
                        }
                    })
                }
            }
        })
    },
    Follow(e){
        let param = {
            followUserId: e.target.dataset.id
        }
        request.apiPost('user/followUser', param).then(res => {
            console.log(res);
            if(this.pageSize == 0){
                this.loadUserFansList()
            }else{
                this.loadUserFansList(that.pageSize)
            }
        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserFansList()
        } else {
            return
        }
    }
})
