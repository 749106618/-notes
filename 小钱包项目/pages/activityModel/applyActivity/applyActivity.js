/**
 * Created by Administrator on 2018/5/24 0024.
 */
let { request } = require('../../../utils/api.js');
Page({
    data:{
        UserName:'',
        MoblieNumber:'',
        activityId:'',
        activityDtail:[]
    },
    inputUserName(e){
        console.log(e.detail.value);
        this.setData({
            UserName:e.detail.value
        })
    },
    inputMoblieNumber(e){
        console.log(e.detail.value);
        this.setData({
            MoblieNumber:e.detail.value
        })
    },
    // ../applyPass/applyPass
    submit(){
        if(this.data.UserName && this.data.MoblieNumber ){
            if(!/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(this.data.MoblieNumber)){
                wx.showToast({
                    title: '请输入正确的手机号码',
                    icon: 'none',
                })
                return;
            }
            if(this.data.UserName.length > 25){
                wx.showToast({
                    title: '名字过长',
                    icon: 'none',
                })
                return;
            }
            let param = {
                activityId:this.data.activityId,
                username:this.data.UserName,
                mobile:this.data.MoblieNumber
            }
            request.apiPost('order/createActivityOrder',param).then(res=>{
                console.log(res);
                    wx.requestPayment({
                        timeStamp : res.data.timeStamp,
                        nonceStr : res.data.nonceStr,
                        package : res.data.packageStr,
                        signType : res.data.signType,
                        paySign : res.data.paySign,
                        success : function (res) {
                            console.log(res);
                            wx.navigateTo({
                                url:'../applyPass/applyPass'
                            })
                        },
                        fail : function () {
                            console.log(1);
                        }
                    })
            })
        }else{
            wx.showToast({
                title: '请输入姓名或手机号码',
                icon: 'none',
                duration: 2000
            })
        }

    },
    onLoad(options){
        console.log(options);
        this.setData({
            activityId:options.activityId,
            activityDtail:options
        })
    }
})