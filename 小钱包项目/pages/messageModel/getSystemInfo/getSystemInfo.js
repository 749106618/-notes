/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {request} = require('../../../utils/api.js')
Page({
    page: 1,
    data: {
        SystemMessage: [],
        isData: false
    },
    onLoad: function () {
        this.loadUserSystemMessageList()
    },
    loadUserSystemMessageList(){
        let param = {
            page: this.page,
            pageSize: 10
        }
        request.apiPost('user/loadUserSystemMessageList', param).then(res => {
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
                    switch (v.type) {
                        case 1:
                            v.type = '审核通知'
                            break;
                        case 2:
                            v.type = '首页推荐'
                            break;
                        case 3:
                            v.type = '评论删除'
                            break;
                        case 4:
                            v.type = '审核通知'
                            break;
                    }
                    let contentArrayTemp = v.content.split('##');
                    let contentArray = [];
                    for (let i = 0; i < contentArrayTemp.length; i++) {
                        if (i % 2 == 0) {
                            contentArray.push({
                                type: 1,
                                content: contentArrayTemp[i]
                            });
                        } else {
                            contentArrayTemp[i] = contentArrayTemp[i].replace(/([，。、！：；？])/g, '$1 ')
                            contentArray.push({
                                type: 2,
                                content: contentArrayTemp[i]
                            });
                        }
                    }
                    v.content = contentArray
                })

                if (this.page == 1) {//如果是页数等于1，重新加载noteList
                    this.setData({
                        SystemMessage: res.data.data
                    })
                } else {//页数大于1，给noteList添加数据
                    this.setData({
                        SystemMessage: this.data.SystemMessage.concat(res.data.data)
                    })
                }
            }
        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserSystemMessageList()
        } else {
            return
        }
    }
})