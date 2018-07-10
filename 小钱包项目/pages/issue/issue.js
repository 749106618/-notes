/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {request} = require('../../utils/api.js');
let {getStrLenght, showLoading, hideLoading} = require('../../utils/util.js');
Page({
    twoLevel: 0,
    data: {
        classify: '',
        label: '',
        title: '',
        content: '',
        oneLevel: '',
        imageList: [],
        photoLength:9
    },
    colseImage: function (e) {
        //移除列表中下标为index的项
        let index = e.target.dataset.index;
        let imageList = this.data.imageList;
        imageList.splice(index, 1);
        this.setData({
            imageList: imageList,
            photoLength:this.data.photoLength + 1
        })

    },
    chooseimage: function () {
        let that = this;
        wx.showActionSheet({
            itemList: ['相机', '相册'],
            itemColor: "#007AFF",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('camera')
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('album')
                    }
                }
            }
        })
    },
    chooseWxImage: function (sourceType) {
        let that = this;
        request.uploadFile(that.data.photoLength, sourceType).then((res) => {
            console.log(res);
            let imageList = that.data.imageList;
            if (imageList.length + res.length < 10) {
                that.setData({
                    imageList: imageList.concat(res),
                    photoLength:that.data.photoLength - res.length
                })
            } else {
                wx.showToast({
                    title: '最多上传9张图片',
                    icon: "none"
                })
                return
            }

        })
    },
    inputTitle: function (e) {
        let title = getStrLenght(e.detail.value, 60);
        if(title){
            this.setData({
                title: title
            })
        }else{
            this.setData({
                title: e.detail.value
            })
        }
    },
    inputContent: function (e) {
        this.setData({
            content: e.detail.value
        })
    },
    issue: function () {
        let that = this
        let param = {
            oneLevel: this.data.oneLevel,
            twoLevel: this.twoLevel,
            title: this.data.title,
            imageList: this.data.imageList.join(','),
            oneLevelName: this.data.classify,
            twoLevelName: this.data.label
        };
        if (this.data.content > 10000) {
            wx.showToast({
                title: '内容不能超过1万字',
                icon: 'none',
            })
            return
        }
        if (!param.oneLevel || !param.twoLevel || !param.title || !this.data.content || param.imageList.length == 0) {
            wx.showToast({
                title: '请完善笔记信息后再发布',
                icon: 'none'
            })
            return
        }
        showLoading();
        request.apiPost('note/applyNote', Object.assign({}, param, { detail: this.data.content }), 
          true, param).then(res => {
            console.log(res);
            hideLoading();
            if (res.code == 0) {
                wx.showToast({
                    title: '发布成功',
                    icon: "none",
                    success: function () {
                        setTimeout(function () {
                            wx.navigateBack()
                        }, 1000)
                    }
                })
            }

        })
    },
    select(){
        if (this.data.oneLevel == 0) {
            wx.showToast({
                title: '请先选择分类',
                icon: 'none'
            })
        } else {
            wx.navigateTo({
                url: "../issueModel/selectTag/selectTag?oneLevel=" + this.data.oneLevel
            })
        }

    },
    onReady: function () {
        this.setData({
            label: '请选择',
            classify: '请选择',
            oneLevel: 0
        })
        wx.setStorage({
            key: "twolevel",
            data: ""
        })
        wx.setStorage({
            key: "label",
            data: ""
        })
        wx.setStorage({
            key: "classify",
            data: ""
        })
        wx.setStorage({
            key:"labelList1",
            data:''
        })
        wx.setStorage({
            key:"labelList2",
            data:''
        })
        wx.setStorage({
            key:"labelList3",
            data:''
        })
    },
    onShow: function () {
        let that = this
        /*设置分类*/
        if (wx.getStorageSync('classify') != this.data.classify) {
            that.setData({
                label: '请选择'
            })
            if (wx.getStorageSync('classify')) {
                this.setData({
                    classify: wx.getStorageSync('classify')
                })
            }
        } else {
            if (wx.getStorageSync('label')) {
                that.setData({
                    label: wx.getStorageSync('label')
                })
            }
        }
        switch (this.data.classify) {
            case '太太创业':
                that.setData({
                    oneLevel: 1
                })
                break;
            case '太太小店':
                that.setData({
                    oneLevel: 2
                })
                break;
            case '投资理财':
                that.setData({
                    oneLevel: 3
                })
                break;
        }
        this.twoLevel = wx.getStorageSync('twolevel')

    }
})