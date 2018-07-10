// pages/selfModel/expertAttention/expertAttention.js
let { request } = require('../../../utils/api.js');
let { removeOneInList } = require('../../../utils/util.js');
let {invokeListener} = require('../../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        followExpertData: { rows: [] },
        loading: false, //加载动画
        searchParam: {
            page: 0,
            pageSize: 7
        },

        //开始坐标
        startX: 0, 
        startY: 0
    },

    //获取专家关注
    loadFollowExpertData (isFreshen) {
        this.setSearchParam('page', isFreshen? 1 : Number(this.data.searchParam.page) + 1);
        request.apiPost('user/myFollowExpertData', this.data.searchParam).then((result) => {
            let followExpertData = result.data;
            let oldExpertList = this.data.followExpertData.rows;
            followExpertData.rows = oldExpertList.concat(followExpertData.rows);
            this.setData({
                followExpertData,
                loading: followExpertData.page < followExpertData.total
            })
        })
    },
    //删除事件
    consoleFollowExpert: function (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        request.apiPost('expert/cancelOrFollowExpert', {expertId: expertId}).then(() => {
            this.data.followExpertData.rows = removeOneInList(this.data.followExpertData.rows, e.currentTarget.dataset.index)
            this.data.followExpertData.records --;
            this.setData({
                followExpertData: this.data.followExpertData
            })
            invokeListener('collectExpertListener', expertId);
        })
    },
    // 2018-03-30 上拉加载更多
    loadMore: function(){
        if (this.data.loading) {
            this.loadFollowExpertData(false);
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

    //左滑删除
    touchstart: function(e){
        //开始触摸时 重置所有删除
        this.data.followExpertData.rows.forEach(function (v, i) {
            if (v.isTouchMove)//只操作为true的
                v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            followExpertData: this.data.followExpertData
        })
    },
    touchmove: function(e){
        let self = this,
            index = e.currentTarget.dataset.index,//当前索引
            startX = self.data.startX,//开始X坐标
            startY = self.data.startY,//开始Y坐标
            touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
            //获取滑动角度
            angle = self.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
        self.data.followExpertData.rows.forEach(function (v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })
        //更新数据
        self.setData({
            followExpertData: self.data.followExpertData
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        let _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化数据
        this.loadFollowExpertData(true);
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
        this.loadMore();
    },

})