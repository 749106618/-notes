//app.js
let {request} = require('./utils/api.js');

App({
    onLaunch () {
        wx.hideTabBar(); // 隐藏TabBar
        this.checkSearchHistory(); // 判断搜索历史本地存储
        this.checkQuestionHistoryData(); // 判断搜索问题浏览本地存储
    },
    checkSearchHistory () {
        let searchHistory = wx.getStorageSync('searchHistory')
        if (!searchHistory || JSON.stringify(searchHistory) == '{}') {
            wx.setStorage({
                key: 'searchHistory',
                data: []
            })
        }
    },
    checkQuestionHistoryData () {
        let questionHistoryData = wx.getStorageSync('questionHistoryData')
        if (!questionHistoryData) {
            wx.setStorage({
                key: 'questionHistoryData',
                data: {}
            })
        }
    },
    globalData: {
    }
})