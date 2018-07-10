//app.js
let {request} = require('./utils/api.js');
App({
    onLaunch () {
        this.checkSearchHistory(); // 判断搜索历史本地存储
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
    globalData: {
        refreshFlag: false
    },
})
