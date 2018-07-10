// pages/selfModel/fans/fans.js
let { request } = require('../../../utils/api.js');
let { getStorage } = require('../../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        fansData: { rows: [] },
        loading: false, //加载动画
        searchParam: {
            page: 0,
            pageSize: 12
        }
    },

    // 获取我的粉丝数据
    loadMyFansData (isFreshen) {
        this.setSearchParam('page', isFreshen? 1 : Number(this.data.searchParam.page) + 1);
        request.apiPost('expert/myFansData', this.data.searchParam).then((result) => {
            let fansData = result.data;
            let oldFansList = this.data.fansData.rows;
            fansData.rows = oldFansList.concat(fansData.rows);
            this.setData({
                fansData,
                loading: fansData.page < fansData.total
            })
        })
    },
    // 2018-03-30 上拉加载更多
    loadMore: function(){
        if (this.data.loading) {
            this.loadMyFansData(false);
        }
    },
    // 设置请求参数
    setSearchParam(key, value) {
        let searchParam = this.data.searchParam;
        searchParam[key] = value;
        this.setData({
            searchParam
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadMyFansData(true)
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})