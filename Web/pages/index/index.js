// pages/index/index.js
let { request} = require('../../utils/api.js');
let { navigateTo, formatDateInterval, removeOneInList, showMessage, showLoading, hideLoading, subReason} = require('../../utils/util.js');
let {addListener, invokeListener} = require('../../utils/listener.js');

let App = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {}, // 用户详情数据
        messageList: [], //通知

        currentCeiling: 1,  //默认选中推荐
        ceilingType: ['关注', '推荐'],
        labelList: [],

        questionList: [],

        // 推荐数据
        recommendQuestionData: {rows: []},
        recommendQuestionSearchParam: {
            page: 1,
            pageSize: 6,
        },

        // 关注数据
        userFollowExpertQuestionData: {rows: []},
        userFollowExpertQuestionSearchParam: {
            page: 1,
            pageSize: 6,
        },

        // 标签问题数据
        labelQuestionData: {},
        labelQuestionSearchParam: {},

        questionMinHeight: 0, // 问题区域最小高度
        pixelRatio: 2,
        ceiling: false, //吸顶
        loadAnimation: false, //加载动画
        loading: false, // 加载更多
        isLoginTrue: false,

        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isUnauthorized: false,
        loginIntervalId: ''
    },
    //获取通知消息
    getMessageList: function () {
        request.apiPost('user/noticeMessageList').then((result) => {
            let self = this;
            this.setData({
                messageList: result.data
            }, () => {
                self.setScrollHeight();
            })
        })
    },
    // 通知点击跳转
    goNoticeDetail (e) {
        let self = this;
        let correlationId = e.currentTarget.dataset.correlation_id;
        let noticeType = e.currentTarget.dataset.notice_type;
        let messageId = e.currentTarget.dataset.message_id;
        let index = e.currentTarget.dataset.index;
        if (noticeType == 1) {
            navigateTo('/pages/questionModel/detail/detail', {questionId: correlationId, messageId: messageId})
        }else if (noticeType == 2) {
            navigateTo('/pages/questionModel/noCheck/noCheck', {questionApplyId: correlationId, messageId: messageId})
        }
        this.setData({
            messageList: removeOneInList(this.data.messageList, index)
        }, () => {
            self.setScrollHeight();
        })
    },
    // 获取标签列表
    loadLabelList () {
        request.apiPost('user/labelList').then((result) => {
            for (let oneLabel of result.data) {
                this.data.ceilingType.push(oneLabel.labelName);
                this.data.labelQuestionSearchParam[oneLabel.labelName] = {
                    page: 1,
                    pageSize: 6,
                    labelId: oneLabel.labelId
                }
                this.data.labelQuestionData[oneLabel.labelName] = {rows:[]}
            }
            this.setData({
                ceilingType: this.data.ceilingType,
                labelList: result.data
            })
        })
    },
    //获取推荐列表
    loadRecommendQuestionData (isFreshen) {
        this.data.recommendQuestionSearchParam.page = isFreshen? 1: Number(this.data.recommendQuestionSearchParam.page) + 1;
        request.apiPost('question/recommendQuestionList', this.data.recommendQuestionSearchParam).then((result) => {
            let recommendQuestionData = result.data;
            let oldQuestionList = isFreshen? []: this.data.recommendQuestionData.rows;
            recommendQuestionData.rows = oldQuestionList.concat(this.formatDateIntervalList(recommendQuestionData.rows));
            this.data.recommendQuestionData = recommendQuestionData;
            this.setData({
                questionList: recommendQuestionData.rows,
                loadAnimation: false
            })
            this.handelLoading()
        })
    },
    //获取关注专家问题列表
    loadUserFollowExpertQuestionData (isFreshen) {
        this.data.userFollowExpertQuestionSearchParam.page = isFreshen? 1: Number(this.data.userFollowExpertQuestionSearchParam.page) + 1;
        request.apiPost('question/userFollowExpertQuestionList', this.data.userFollowExpertQuestionSearchParam).then((result) => {
            let userFollowExpertQuestionData = result.data;
            let oldQuestionList = isFreshen? []: this.data.userFollowExpertQuestionData.rows;
            userFollowExpertQuestionData.rows = oldQuestionList.concat(this.formatDateIntervalList(userFollowExpertQuestionData.rows));
            this.data.userFollowExpertQuestionData = userFollowExpertQuestionData;
            this.setData({
                questionList: userFollowExpertQuestionData.rows,
                loadAnimation: false
            })
            this.handelLoading()
        })
    },
    // 获取标签问题列表
    loadLabelQuestionData (isFreshen, selectName) {
        this.data.labelQuestionSearchParam[selectName].page = isFreshen? 1: Number(this.data.labelQuestionSearchParam[selectName].page) + 1;
        request.apiPost('question/questionList', this.data.labelQuestionSearchParam[selectName]).then((result) => {
            let labelQuestionData = result.data;
            let oldQuestionList = isFreshen? []: this.data.labelQuestionData[selectName].rows;
            labelQuestionData.rows = oldQuestionList.concat(this.formatDateIntervalList(labelQuestionData.rows));
            this.data.labelQuestionData[selectName] = labelQuestionData;
            this.setData({
                questionList: labelQuestionData.rows,
                loadAnimation: false
            })
            this.handelLoading()
        })
    },
    // 专家关注
    expertCollect (e) {
        let expertId = e.currentTarget.dataset.expert_id;
        request.apiPost('expert/cancelOrFollowExpert', {expertId: expertId}).then(() => {
            invokeListener('collectExpertListener', expertId)
        })
    },
    // 关注监听状态
    collectExpertListener (expertId) {
        handelCollectStatusChange(this.data.userFollowExpertQuestionData.rows);
        handelCollectStatusChange(this.data.recommendQuestionData.rows);
        for (let i = 2; i < this.data.ceilingType.length; i ++) {
            let labelName = this.data.ceilingType[i];
            handelCollectStatusChange(this.data.labelQuestionData[labelName].rows);
        }

        if (this.data.currentCeiling == 0) {
            this.data.questionList = this.data.userFollowExpertQuestionData.rows;
        } else if (this.data.currentCeiling == 1) {
            this.data.questionList = this.data.recommendQuestionData.rows;
        } else {
            let selectName = this.data.ceilingType[this.data.currentCeiling];
            this.data.questionList = this.data.labelQuestionData[selectName].rows;
        }
        this.setData({
            questionList: this.data.questionList
        });

        function handelCollectStatusChange(questionList) {
            for (let oneQuestion of questionList) {
                if (oneQuestion.expertId == expertId) {
                    oneQuestion.isCollectExpert = ~oneQuestion.isCollectExpert + 2
                }
            }
        }
    },
    //选择吸顶分类
    selectType: function (e) {
        let selectType = e.currentTarget.dataset.index;
        if (this.data.currentCeiling == selectType) return
        let scrollTop = this.data.messageList.length == 0 ? (150 - 30) / this.data.pixelRatio : (150 + 60 + 100 * this.data.pixelRatio - 30) / this.data.pixelRatio;
        this.setData({
            currentCeiling: selectType
        })
        if (selectType == 0) {
            if (this.data.userFollowExpertQuestionData.rows.length == 0) {
                this.loadUserFollowExpertQuestionData(true);
            } else {
                this.setData({ questionList: this.data.userFollowExpertQuestionData.rows })
            }
        } else if (selectType == 1) {
            if (this.data.recommendQuestionData.rows.length == 0) {
                this.loadRecommendQuestionData(true);
            } else {
                this.setData({ questionList: this.data.recommendQuestionData.rows })
            }
        } else {
            let selectName = this.data.ceilingType[selectType];
            if (this.data.labelQuestionData[selectName].rows.length == 0) {
                this.loadLabelQuestionData(true, selectName);
            } else {
                this.setData({ questionList: this.data.labelQuestionData[selectName].rows })
            }
        }
    },
    // 日期相差
    formatDateIntervalList (list) {
        for (let oneQuestion of list) {
            if (!oneQuestion.questionReasonTime) {
                debugger;
            }
            oneQuestion.questionReasonTimeInterval = formatDateInterval(oneQuestion.questionReasonTime);
            oneQuestion.questionReasonText = subReason(oneQuestion.questionReasonText)
        }
        return list;
    },
    // 上拉加载
    loadMore () {
        if (this.data.loading) {
            if (this.data.currentCeiling == 0) {
                this.loadUserFollowExpertQuestionData(false);
            } else if (this.data.currentCeiling == 1) {
                this.loadRecommendQuestionData(false);
            } else {
                let selectName = this.data.ceilingType[this.data.currentCeiling];
                this.loadLabelQuestionData(false, selectName);
            }
        }
    },
    handelLoading () {
        if (this.data.currentCeiling == 0) {
            this.setData({
                loading: this.data.userFollowExpertQuestionData.page < this.data.userFollowExpertQuestionData.total
            });
        } else if (this.data.currentCeiling == 1) {
            this.setData({
                loading: this.data.recommendQuestionData.page < this.data.recommendQuestionData.total
            });
        } else {
            let selectName = this.data.ceilingType[this.data.currentCeiling];
            this.setData({
                loading: this.data.labelQuestionData[selectName].page < this.data.labelQuestionData[selectName].total
            });
        }
    },
    // 刷新
    reflash: function () {
        this.setData({
            loadAnimation: true
        })
        wx.pageScrollTo({
            scrollTop: this.data.messageList.length == 0 ? 150 / this.data.pixelRatio : (150 + 60 + 100 * this.data.pixelRatio) / this.data.pixelRatio,
        });
        if (this.data.labelList.length == 0) {
            this.loadLabelList();
        }
        if (this.data.currentCeiling == 0) {
            this.loadUserFollowExpertQuestionData(true);
        } else if (this.data.currentCeiling == 1) {
            this.loadRecommendQuestionData(true);
        } else {
            let selectName = this.data.ceilingType[this.data.currentCeiling];
            this.loadLabelQuestionData(true, selectName);
        }
    },
    setScrollHeight () {
        let self = this;
        //获取滚动区域高度
        wx.getSystemInfo({
            success: function (res) {
                let _wh = res.windowHeight * res.pixelRatio;
                self.setData({
                    pixelRatio: res.pixelRatio,
                    questionMinHeight: (_wh - 60) / res.pixelRatio
                })
            },
        })
    },
    doLogin () {
        if (wx.getStorageSync('token')) {
            request.apiPost('user/checkToken', {}, false).then((result) => {
                if (result.code == 0) {
                    this.doLoad();
                } else {
                    this.loginOrRegister();
                }
            })
        }else {
            this.loginOrRegister();
        }
    },
    loginOrRegister () {
        let self = this;
        wx.getSetting({
            success (res) {
                // 登录 已经授权，可以直接调用 getUserInfo 获取头像昵称
                if (res.authSetting['scope.userInfo']) {
                    wx.login({
                        success: loginResult => {
                            wx.getUserInfo({
                                success: userInfoResult => {
                                    // 可以将 res 发送给后台解码出 unionId
                                    let param = userInfoResult.userInfo
                                    param.wxCode = loginResult.code
                                    request.apiPost('user/loginOrRegister', param).then((result) => {
                                        wx.setStorageSync('token', result.data.token)
                                        self.doLoad();
                                        wx.setStorage({
                                            key: 'userInfo',
                                            data: result.data.userResult
                                        })
                                    })
                                }
                            })
                        }
                    })
                } else {
                    hideLoading();
                    self.setData({
                        isUnauthorized: true
                    })
                }
            }
        });

    },
    bindGetUserInfo () {
        showLoading('登录中...');
        this.setData({
            isUnauthorized: false
        })
        this.doLogin();
    },
    doLoad ()   {
        hideLoading();
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        addListener('collectExpertListener', this.collectExpertListener);
        this.loadLabelList();
        this.onPullDownRefresh();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideTabBar();
        showLoading('登录中...');
        this.doLogin() // 登录
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
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
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
    onPullDownRefresh () {
        //初始化数据
        this.getMessageList();
        this.data.recommendQuestionData = {rows: []};
        this.data.userFollowExpertQuestionData = {rows: []};
        for (let oneLabel of this.data.labelList) {
            this.data.labelQuestionData[oneLabel.labelName] = {rows:[]}
        }
        this.setData({
            recommendQuestionData: this.data.recommendQuestionData,
            userFollowExpertQuestionData: this.data.userFollowExpertQuestionData,
            labelQuestionData: this.data.labelQuestionData
        });
        if (this.data.currentCeiling == 0) {
            this.loadUserFollowExpertQuestionData(true);
        } else if (this.data.currentCeiling == 1) {
            this.loadRecommendQuestionData(true);
        } else {
            this.loadLabelQuestionData(true, this.data.ceilingType[this.data.currentCeiling]);
        }
        //获取用户信息
        request.apiPost('user/detail', {}).then((result) => {
            this.setData({
                userInfo: result.data
            })
            wx.setStorageSync('userInfo', result.data)
            wx.stopPullDownRefresh();
        });
    },
    /**
     * 页面滚动触发事件的处理函数
     */
    onPageScroll: function  (_scrollTop) {
        let _top = this.data.messageList.length == 0 ? (150 - 60) / this.data.pixelRatio : (150 + 60 + 100 * this.data.pixelRatio - 50) / this.data.pixelRatio;
        if (_scrollTop.scrollTop > _top) {
            this.setData({
                ceiling: true
            })
        } else {
            this.setData({
                ceiling: false,
                loadAnimation: false
            })
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadMore()
    },
})