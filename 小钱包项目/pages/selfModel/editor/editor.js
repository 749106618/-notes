/**
 * Created by Administrator on 2018/5/23 0023.
 */
let {request} = require('../../../utils/api.js');
let {getStrLenght,showLoading, hideLoading} = require('../../../utils/util.js');
Page({
    twoLevel: 0,
    data: {
        classify: '',
        label: '',
        title: '',
        content: '',
        oneLevel: '',
        imageList: [],
        applyId: '',
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
        request.uploadFile(this.data.photoLength, sourceType).then((res) => {
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
    checked(e){
        let that = this
        if (that.isCeiling > 2) {
            wx.showToast({
                title: '最多只能选择3个标签',
                icon: 'none'
            })
            return
        }
        let labelList = that.data.labelList;
        labelList.forEach(function (v, i) {
            if (i == e.target.dataset.index) {
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
    },
    issue: function () {
        let that = this
        let param = {
            oneLevel: this.data.oneLevel,
            twoLevel: this.twoLevel,
            title: this.data.title,
            detail: this.data.content,
            imageList: this.data.imageList.join(','),
            applyId: this.data.applyId,
            oneLevelName:this.data.classify,
            twoLevelName:this.data.label
        }
        console.log(param);
        if (param.detail.length > 10000) {
            wx.showToast({
                title: '内容不能超过1万字',
                icon: 'none'
            })
        }
        if (!param.oneLevel || !param.twoLevel || !param.title || !param.detail || param.imageList.length == 0) {
            wx.showToast({
                title: '请完善笔记信息后再发布',
                icon: 'none'
            })
            return
        }
        showLoading();
        request.apiPost('note/applyNote', param).then(res => {
            console.log(res);
            hideLoading();
            if (res.code == 0) {
                wx.showToast({
                    title: '发布成功',
                    icon: "none",
                    success: function () {
                        that.setData({
                            isIssue: true
                        })
                        setTimeout(function () {
                            wx.switchTab({
                                url: '../../self/self'
                            })
                        }, 1500)
                    }
                })
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: "none"
                })
            }

        })
    },
    onShow: function () {
        let that = this
        if(wx.getStorageSync('classify') != this.data.classify){
            that.setData({
                label: '请选择'
            })
            /*设置一级标签名称*/
            if (wx.getStorageSync('classify')) {
                this.setData({
                    classify: wx.getStorageSync('classify')
                })
            }
        }else{
            /*设置二级标签名称*/
            if (wx.getStorageSync('label')) {
                that.setData({
                    label: wx.getStorageSync('label')
                })
            }
        }
        /*设置一级标签*/
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
        /*设置二级标签*/
        this.twoLevel = wx.getStorageSync('twolevel')
    },
    onLoad: function (options) {
        console.log(options);
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
        let param = {
            noteApplyId: options.noteId
        }
        request.apiPost('note/noteApplyDetail', param).then(res => {
            console.log(res);
            wx.setStorage({
                key:"classify",
                data:res.data.labelName ? res.data.labelName : '请选择'
            })
            this.twoLevel = res.data.labelTwoId.join(',')//二级标签
            this.setData({
                title: res.data.noteTitle,
                content: res.data.noteDetail,
                imageList: res.data.imageList.split(','),
                applyId: res.data.noteApplyId,
                classify: res.data.labelName ? res.data.labelName : '请选择',//一级标签名称
                label: res.data.labelTwoName ? res.data.labelTwoName : '请选择',//二级标签名称
                oneLevel: res.data.labelId,//一级标签id
                photoLength:this.data.photoLength - res.data.imageList.split(',').length
            })
        })
    }
})