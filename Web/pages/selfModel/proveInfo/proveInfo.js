// pages/selfModel/proveInfo/proveInfo.js
let {config} = require('../../../config.js');
let { request } = require('../../../utils/api.js');
let { sendMobileCode, showMessage } = require('../../../utils/util.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        expertInfo: {
            expertName: '', // 名字
            expertMobile: '', //手机号
            mobileCode: '', // 手机验证码
            expertEmail: '', // 邮箱
            expertCompany: '', // 公司
            expertPost: '', // 职务
            expertDetail: '', // 简介
            expertCardImg: '', // 上传的名片
        },
        qrObj: {
            qrText: '获取验证码',
            qrDisabled: false
        }
    },
    //上传头像
    uploadExpertPhoto: function(){
        request.uploadFile().then((res) => {
            this.updateDataExpertInfo('expertPhoto', res.url);
        })
    },
    //上传名片
    uploadExpertCardImg: function(){
        request.uploadFile().then((res) => {
            this.updateDataExpertInfo('expertCardImg', res.url);
        })
    },
    //获取名字
    getExpertName: function(e){
        this.updateDataExpertInfo('expertName', e.detail.value);
    },
    //获取手机号
    getExpertMobile: function(e){
        this.updateDataExpertInfo('expertMobile', e.detail.value);
    },
    //发送验证码
    loadMobileCode: function(){
        sendMobileCode(this, this.data.expertInfo.expertMobile);
    },
    //获取验证码
    getMobileCode: function(e){
        this.updateDataExpertInfo('mobileCode', e.detail.value);
    },
    //获取邮箱
    getExpertEmail: function(e){
        this.updateDataExpertInfo('expertEmail', e.detail.value);
    },
    //获取公司
    getExpertCompany: function(e){
        this.updateDataExpertInfo('expertCompany', e.detail.value);
    },
    //获取职务
    getExpertPost: function(e){
        this.updateDataExpertInfo('expertPost', e.detail.value);
    },
    //获取简介
    getExpertDetail: function(e){
        this.updateDataExpertInfo('expertDetail', e.detail.value);
    },
    //提交
    submit: function(){
        let self = this;
        let expertInfo = self.data.expertInfo;
        if (!expertInfo.expertPhoto) {
            showMessage('请上传工作照');
            return;
        }
        if (!expertInfo.expertName) {
            showMessage('请填写姓名');
            return;
        }
        if (!expertInfo.expertMobile) {
            showMessage('请填写手机号');
            return;
        }
        if (!expertInfo.mobileCode) {
            showMessage('请填写手机号验证码');
            return;
        }
        if (!expertInfo.expertCompany) {
            showMessage('请填写公司信息');
            return;
        }
        if (!expertInfo.expertPost) {
            showMessage('请填写职务信息');
            return;
        }
        if (!expertInfo.expertDetail) {
            showMessage('请填写简介');
            return;
        }
        if (expertInfo.expertDetail.length > 140) {
            showMessage('简介长度过长，请重新输入');
            return;
        }
        if (!expertInfo.expertCardImg) {
            showMessage('请上传名片');
            return;
        }
        request.apiPost('expert/applyExpert', expertInfo).then((result) => {
            showMessage('提交成功').then(() => {
                wx.switchTab({url: '/pages/self/self'})
            });
        })
    },
    updateDataExpertInfo (key, value) {
        this.data.expertInfo[key] = value
        this.setData({
            expertInfo: this.data.expertInfo
        })
    },

    /**
     * 关闭提示
     * 请求回调里写入定时任务,调用closeTip函数即可
     * setTimeout(()=>{self.closeTip()}, 3000); //三秒消失
     */
    closeTip: function(){
        this.updateDataExpertInfo('refuseReason', '');
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        request.apiPost('expert/expertInfo', {}).then((result) => {
            if (result.data) {
                this.setData({
                    expertInfo: result.data
                })
            }
        })
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})