/**
 * Created by Administrator on 2018/5/25 0025.
 */
let {request} = require('../../../utils/api.js');
Page({
    isCeiling: 0,
    data: {
        labelList: [],
        twolevel: [],
        label: [],
        oneLevel:0
    },
    backIssue(){
        let that = this
        let labelList = this.data.labelList
        labelList.forEach(function (v) {
            if (v.isChecked == 1) {
                that.setData({
                    twolevel: that.data.twolevel.concat(v.id),
                    label: that.data.label.concat(v.name)
                })
            }
        })
        wx.setStorage({
            key: 'label',
            data: that.data.label.join(',')
        })
        wx.setStorage({
            key: 'twolevel',
            data: that.data.twolevel.join(',')
        })
        wx.navigateBack()
    },
    onLoad: function (options) {
        console.log(options);
        switch (options.oneLevel) {
            case '1':
                wx.setNavigationBarTitle({
                    title: '太太创业'
                })
                this.setData({
                    labelList: wx.getStorageSync('labelList1')
                })
                break;
            case '2':
                wx.setNavigationBarTitle({
                    title: '太太小店'
                })
                this.setData({
                    labelList: wx.getStorageSync('labelList2')
                })
                break;
            case '3':
                wx.setNavigationBarTitle({
                    title: '投资理财'
                })
                this.setData({
                    labelList: wx.getStorageSync('labelList3')
                })
                break;
        }
        if(this.data.labelList == ""){
            let that = this
            let param = {
                oneLevel: options.oneLevel
            }
            request.apiPost('note/loadTwoLevelLabel', param).then(res => {
                res.data.forEach(function (v) {
                    v.isChecked = 0
                })
                that.setData({
                    labelList: res.data,
                    oneLevel: options.oneLevel
                })
            })
        }
    },
    checked(e){
        let that = this
        let labelList = that.data.labelList;
        labelList.forEach(function (v, i) {
            if (i == e.target.dataset.index) {
                if(v.isChecked == 0 && that.isCeiling > 2){
                    wx.showToast({
                        title: '最多只能选择3个标签',
                        icon: 'none',
                        duration:500
                    })
                    return
                }
                if (v.isChecked == 0) {
                    v.isChecked = 1
                    that.isCeiling++
                } else {
                    that.isCeiling--
                    v.isChecked = 0
                }
            }
        })
        that.setData({
            labelList: labelList
        })
        switch (that.data.oneLevel) {
            case '1':
                wx.setStorage({
                    key:"labelList1",
                    data:labelList
                })
                break;
            case '2':
                wx.setStorage({
                    key:"labelList2",
                    data:labelList
                })
                break;
            case '3':
                wx.setStorage({
                    key:"labelList3",
                    data:labelList
                })
                break;
        }
    }
})