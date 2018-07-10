// pages/indexModel/search/search.js
let {request} = require('../../../utils/api.js');
let {getStorage, setStorage, removeOneInList, subReason, formatDateInterval} = require('../../../utils/util.js')
let {invokeListener} = require('../../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchHistory: [],  //搜索历史
        hostSearchList: [],  //猜你想要
        hostQuestionData: {rows: []}, //搜索结果
        showSearchData: true, // 是否显示搜索历史
        loading: false,
        isSearching: false,
        searchParam: {
            page: 1,
            pageSize: 6,
            searchName: '', //搜索关键字
        }
    },
    //获取搜索关键字
    getSearchName: function (e) {
        this.setSearchParam('searchName', e.detail.value)
    },
    getBlur: function () {
        this.setData({
            showSearchHistory: false
        })
    },
    //搜索
    searchSubmit: function (isFreshen) {
        this.setSearchParam('page', isFreshen ? 1 : Number(this.data.searchParam.page) + 1);
        let searchName = this.data.searchParam.searchName;
        this.addSearchHistory(searchName);
        request.apiPost('question/questionList', this.data.searchParam).then((result) => {
            let hostQuestionData = result.data;
            let oldHostQuestionList = this.data.hostQuestionData.rows;
            hostQuestionData.rows = oldHostQuestionList.concat(this.formatDateIntervalList(hostQuestionData.rows));
            this.setData({
                hostQuestionData,
                showSearchData: false,
                loading: hostQuestionData.page < hostQuestionData.total,
                isSearching: false
            })
        })
    },
    // 点击历史或猜你想要搜索
    goSearch: function (e) {
        if (!this.data.isSearching) {
            this.data.isSearching = true;
            let searchName = e.currentTarget.dataset.search_name
            searchName = searchName? searchName: this.data.searchParam.searchName
            if (searchName) {
                this.setSearchParam('searchName', searchName)
                this.data.hostQuestionData.rows = [];
                this.searchSubmit(true);
            }
        }
    }
    ,
    // 获取猜你想要
    loadHostSearchList() {
        request.apiPost('question/hostSearchName').then((result) => {
            this.setData({
                hostSearchList: result.data
            })
        })
    },
    // 关注专家
    collectExpert (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        request.apiPost('expert/cancelOrFollowExpert', {expertId: expertId}).then(() => {
            let questionList = this.data.hostQuestionData.rows;
            for (let oneQuestion of questionList) {
                if (oneQuestion.expertId == expertId) {
                    oneQuestion.isCollectExpert = ~oneQuestion.isCollectExpert + 2
                }
            }
            this.setData({
                hostQuestionData: this.data.hostQuestionData
            });
            invokeListener('collectExpertListener', expertId);
        })
    },
    // 添加搜索历史
    addSearchHistory(searchName) {
        if (searchName) {
            getStorage('searchHistory').then((result) => {
                let searchHistory = result.data
                if (searchHistory.indexOf(searchName) != -1) {
                    searchHistory = removeOneInList(searchHistory, searchHistory.indexOf(searchName))
                }
                let resultArray = [searchName];
                for (let i = 0; i < (searchHistory.length > 4 ? 4 : searchHistory.length); i++) {
                    resultArray.push(searchHistory[i])
                }
                setStorage({
                    key: 'searchHistory',
                    data: resultArray
                })
            })
        }
    },
    // 清空历史
    clearSearchHistory() {
        setStorage({
            key: 'searchHistory',
            data: []
        })
        this.setData({
            searchHistory: []
        })
    },
    // 日期相差
    formatDateIntervalList (list) {
        for (let oneQuestion of list) {
            oneQuestion.questionReasonTimeInterval = formatDateInterval(oneQuestion.questionReasonTime);
            oneQuestion.questionReasonText = subReason(oneQuestion.questionReasonText)
        }
        return list;
    },
    // 设置请求参数
    setSearchParam(key, value) {
        if (value) {
            let searchParam = this.data.searchParam;
            searchParam[key] = value;
            this.setData({
                searchParam
            })
        }
    },
    // 上拉加载更多
    loadMore: function () {
        if (this.data.hostQuestionData.page < this.data.hostQuestionData.total) {
            this.searchSubmit(false);
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 查询历史
        getStorage('searchHistory').then((result) => {
            this.setData({
                searchHistory: result.data
            })
        })
        this.loadHostSearchList(); // 获取猜你想要
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})