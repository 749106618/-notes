// pages/selfModel/applyExpert/applyExpert.js
let { request } = require('../../../utils/api.js');
let { showMessage, showLoading, hideLoading } = require('../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        applyExpertInfo: {
            cardImg: '',
            cardImgOpposite: '',
            labelIds: '',
            labelNames: ''
        },
        expertApplyData: {},
        refuseReason: '', //提示文字
        labelList: [],
    },
    // 获取标签列表
    loadLabelList () {
        request.apiPost('user/labelList').then((result) => {
            let labelList = result.data;
            for (let oneLabel of labelList) {
                oneLabel.isChecked = false;
            }
            this.setData({
                labelList
            })
            this.loadApplyExpertInfo();
        })
    },
    // 获取答主申请信息
    loadApplyExpertInfo () {
        request.apiPost('expert/expertApplyInfo').then((result) => {
            if (result.data) {
                let expertApplyData = result.data;
                let labelList = this.data.labelList;
                for (let oneLabel of labelList) {
                    if (expertApplyData.labelIdList.indexOf(oneLabel.labelId.toString()) != -1) {
                        oneLabel.isChecked = true;
                    }
                }
                this.updateDataApplyExpertInfo('cardImg', expertApplyData.cardImg);
                this.updateDataApplyExpertInfo('cardImgOpposite', expertApplyData.cardImgOpposite);
                this.resetLabel();
                this.setData({
                    labelList,
                    refuseReason: expertApplyData.refuseReason,
                    expertApplyData
                })
            }
        })
    },
    //上传名片
    loadLabelList: function(){
        request.uploadFile().then((res) => {
            this.updateDataApplyExpertInfo('cardImg', res.url);
        })
    },
    //上传名片反面
    uploadCardImgOpposite: function(){
        request.uploadFile().then((res) => {
            this.updateDataApplyExpertInfo('cardImgOpposite', res.url);
        })
    },
    // 标签点击
    checkboxChange (e) {
        let chooseLabelIdList = e.detail.value;
        let labelList = this.data.labelList;
        for (let oneLabel of labelList) {
            oneLabel.isChecked = chooseLabelIdList.indexOf(oneLabel.labelId.toString()) != -1;
        }
        this.resetLabel();
    },
    // 修改
    submitApply () {
        if (!this.checkIsChange()) {
            showMessage("请修改认证信息后提交");
            return;
        }
        let applyExpertInfo = this.data.applyExpertInfo;
        if (!applyExpertInfo.cardImg) {
            showMessage("请上传名片")
            return;
        }
        if (!applyExpertInfo.labelIds) {
            showMessage("请选择标签")
            return;
        }
        showLoading();
        request.apiPost('expert/applyExpertCard', applyExpertInfo).then(() => {
            hideLoading();
            showMessage("申请成功").then(() => {
                wx.navigateBack();
            });
        })
    },
    // 校验认证信息是否修改
    checkIsChange () {
        if (!this.data.expertApplyData) {
            return true;
        }
        return !(this.data.expertApplyData.cardImg == this.data.applyExpertInfo.cardImg
        && this.data.expertApplyData.cardImgOpposite == this.data.applyExpertInfo.cardImgOpposite
        && this.data.expertApplyData.labelIdList.join(',') == this.data.applyExpertInfo.labelIds);
    },
    // 重置标签提交内容
    resetLabel () {
        let labelList = this.data.labelList, labelIds = '', labelNames = '';
        for (let oneLabel of labelList) {
            if (oneLabel.isChecked) {
                labelIds += (',' + oneLabel.labelId);
                labelNames += (',' + oneLabel.labelName);
            }
        }
        this.updateDataApplyExpertInfo('labelIds', labelIds.substring(1, labelIds.length));
        this.updateDataApplyExpertInfo('labelNames', labelNames.substring(1, labelNames.length));
    },
    // 更新答主信息
    updateDataApplyExpertInfo (key, value) {
        this.data.applyExpertInfo[key] = value
        this.setData({
            applyExpertInfo: this.data.applyExpertInfo
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadLabelList();
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