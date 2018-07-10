/**
 * Created by Administrator on 2018/5/25 0025.
 */
let {request} = require('../../../utils/api.js');
Page({
    data: {
        imageList:[],
        content:''
    },
    colseImage: function (e) {
        //移除列表中下标为index的项
        let index = e.target.dataset.index;
        let imageList = this.data.imageList;
        imageList.splice(index,1);
        this.setData({
            imageList:imageList
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
    chooseWxImage: function(sourceType){
        let that = this;
        request.uploadFile(1,sourceType).then((res) => {
            let imageList = that.data.imageList;
            if(imageList.length < 1){
                that.setData({
                    imageList:imageList.concat(res)
                })
            }else{
                wx.showToast({
                    title: '只能上传一张图片',
                    icon: 'none',
                })
                return
            }

        })
    },
    inputContent:function (e) {
        this.setData({
            content: e.detail.value
        })
    },
    issue(){
        let param = {
            content:this.data.content,
            imageList:this.data.imageList.join(','),
        }
        if(param.content){
            request.apiPost('user/feedback',param).then(res=>{
                if(res.code == 0){
                    wx.showToast({
                        title:'反馈成功',
                        icon:"none",
                        success:function () {
                            setTimeout(function () {
                                wx.navigateBack()
                            },1500)
                        }
                    })
                }
            })
        }else{
            wx.showToast({
                title:'反馈内容不能为空',
                icon:'none'
            })
        }

    }
})