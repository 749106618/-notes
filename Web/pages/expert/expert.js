// pages/expert/expert.js
let {request} = require('../../utils/api.js');
let {navigateTo} = require('../../utils/util.js');
let {addListener, invokeListener} = require('../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {}, // 用户详情数据
        labelList: [], // 标签列表数据
        expertData: { rows: [] }, // 专家列表数据
        searchKey: false, //搜索面板
        scrollHeight: 0, //滚动区域高度
        loading: false, //加载动画
        searchParam: {
            page: 1,
            pageSize: 6,
            labelId: 0,
            searchName: '', //搜索关键字
        }
    },
    // 获取标签列表
    loadLabelList () {
        request.apiPost('user/labelList').then((result) => {
            this.setData({
                labelList: result.data
            })
        })
    },
    //选择不同的类型
    selectLabel: function(e){
        this.setSearchParam('labelId', e.currentTarget.dataset.label_id);
        this.searchSubmit();
    },
    //获取专家列表
    loadExpertList (isFreshen) {
        this.setSearchParam('page', isFreshen? 1 : Number(this.data.searchParam.page) + 1);
        request.apiPost('expert/expertList', this.data.searchParam).then((result) => {
            let expertData = result.data;
            let oldExpertList = this.data.expertData.rows;
            expertData.rows = oldExpertList.concat(expertData.rows);
            console.info(expertData)
            this.setData({
                expertData,
                loading: expertData.page < expertData.total
            })
            wx.stopPullDownRefresh();
        })
    },
    // 搜索显示
    searchOpen: function(){
        this.setData({
            searchKey: true
        })
    },
    // 搜索隐藏
    searchClose: function(){
        this.setSearchParam('searchName', '')
        this.setData({
            searchKey: false
        })
        this.searchSubmit();
    },
    // 设置搜索名称
    getSearchName: function(e){
        this.setSearchParam('searchName', e.detail.value)
        this.searchSubmit();
    },
    // 搜索提交
    searchSubmit (){
        this.data.expertData.rows = [];
        this.loadExpertList(true);
    },
    // 专家关注
    expertCollect (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        request.apiPost('expert/cancelOrFollowExpert', {expertId: expertId}).then(() => {
            invokeListener('collectExpertListener', expertId)
        })
    },
    // 关注监听状态
    collectExpertListener (expertId) {
        let expertList = this.data.expertData.rows;
        for (let oneExpert of expertList) {
            if (oneExpert.expertId == expertId) {
                oneExpert.isCollectExpert = ~oneExpert.isCollectExpert + 2
            }
        }
        this.data.expertData.rows = expertList;
        this.setData({
            expertData: this.data.expertData
        });
    },
    // 专家详情跳转
    goExpertDetail (e) {
        navigateTo('/pages/expertModel/expertDetail/expertDetail', {expertId: e.currentTarget.dataset.expert_id})
    },
    // 设置请求参数
    setSearchParam(key, value) {
        let searchParam = this.data.searchParam;
        searchParam[key] = value;
        this.setData({
            searchParam
        })
    },
    // 2018-03-30 上拉加载更多
    loadMore: function(){
        if (this.data.loading) {
            this.loadExpertList(false);
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        });
        addListener('collectExpertListener', this.collectExpertListener)
        // 初始化数据
        this.loadLabelList();
        this.searchSubmit();
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
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        });
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
        this.searchSubmit();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadMore();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})