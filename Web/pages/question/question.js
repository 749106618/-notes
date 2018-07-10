// pages/question/question.js
let { request} = require('../../utils/api.js');
let {formatDateOverplus, navigateTo, removeOneInList, showMessage} = require('../../utils/util.js');
let {addListener} = require('../../utils/listener.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {}, // 用户详情数据
        expertNum: {}, // 专家消息数量详情
        currentTab: 1,        
        waitTip: true, //待回答提示
        waitReasonData: {rows: []}, //待回答数据
        waitReasonSearchParam: {
            page: 1,
            pageSize: 6
        },

        squareQuestionData: {rows: []},  //问题广场数据
        squareQuestionSearchParam: {
            page: 1,
            pageSize: 5
        },

        reasonMessageData: {rows: []}, //已回答消息数据   
        reasonMessageSearchParam: {
            page: 1,
            pageSize: 16
        },   

        intervalId: '', // 倒计时定时器

        scrollHeight: 0, //滚动区域高度
        loading: false, //加载动画

    },
    //选择tabBar
    selectTab: function(e){
        let currentTab = e.currentTarget.dataset.id;
        if (currentTab != this.data.currentTab) {
            this.setData({
                currentTab
            })
            if (currentTab == 1 && this.data.waitReasonData.rows.length == 0) {
                this.loadWaitReasonData(true); // 加载待回答数据
            } else if (currentTab == 2 && this.data.squareQuestionData.rows.length == 0) {
                this.loadSquareQuestionData(true); // 加载问题广场数据
            } else if (currentTab == 3 && this.data.reasonMessageData.rows.length == 0) {
                this.loadReasonMessageData(true); // 记载已回答消息数据
            }
            this.handelLoading();
        }
        this.intervalUpdate();
    },
    //关闭待回答提示
    closeWaitTip: function () {
        this.setData({
            waitTip: false
        })
    },
    // 加载答主消息数量
    loadExpertNum () {
        request.apiPost('expert/loadExpertNum').then((result) => {
            this.setData({
                expertNum: result.data
            })
        });
    },
    // 加载待回答数据
    loadWaitReasonData (isFreshen) {
        this.setWaitReasonSearchParam('page', isFreshen? 1 : Number(this.data.waitReasonSearchParam.page) + 1);
        request.apiPost('expert/expertWaitReasonQuestionData', this.data.waitReasonSearchParam).then((result) => {
            let waitReasonData = result.data;
            let waitReasonQuestionList = waitReasonData.rows;
            let oldQuestionList = this.data.waitReasonData.rows;
            for (let oneResult of waitReasonQuestionList) {
                oneResult.questionReplyEndTime = new Date(oneResult.questionReplyEndTime.replace(/-/g,"/")).getTime();
            }
            waitReasonData.rows = oldQuestionList.concat(waitReasonQuestionList);
            this.data.waitReasonData = waitReasonData;
            this.intervalUpdate();
            this.handelLoading()
        })
    },
    // (待回答数据)定时更新倒计时
    intervalUpdateWaitReasonData () {
        let self = this;
        let timeOutFunction = function () {
            let questionList = self.data.waitReasonData.rows;
            for (let oneResult of questionList) {
                if (oneResult.questionReplyEndTime - new Date().getTime() > 0) {
                    oneResult.questionReasonOverplusTime = formatDateOverplus(oneResult.questionReplyEndTime)
                }
            }
            self.data.waitReasonData.rows = questionList;
            self.setData({
                waitReasonData: self.data.waitReasonData
            })
        };
        timeOutFunction();
        this.clearInterval();
        this.data.intervalId = setInterval(timeOutFunction, 1000)
    },
    // 加载问题广场数据
    loadSquareQuestionData (isFreshen) {
        this.setSquareQuestionSearchParam('page', isFreshen? 1 : Number(this.data.squareQuestionSearchParam.page) + 1);
        request.apiPost('question/squareQuestionData', this.data.squareQuestionSearchParam).then((result) => {
            let squareQuestionData = result.data;
            let squareQuestionList = squareQuestionData.rows;
            let oldQuestionList = this.data.squareQuestionData.rows;
            for (let oneResult of squareQuestionList) {
                oneResult.questionReplyEndTime = new Date(oneResult.questionReplyEndTime.replace(/-/g,"/")).getTime();
            }
            squareQuestionData.rows = oldQuestionList.concat(squareQuestionList);
            this.data.squareQuestionData = squareQuestionData;
            this.intervalUpdate();
            this.handelLoading()
        })
    },
    // (问题广场数据) 定时更新倒计时
    intervalUpdateSquareQuestionData() {
        let self = this;
        let intervalFunction = function () {
            let questionList = self.data.squareQuestionData.rows;
            for (let oneResult of questionList) {
                if (oneResult.questionReplyEndTime - new Date().getTime() > 0) {
                    oneResult.questionReasonOverplusTime = formatDateOverplus(oneResult.questionReplyEndTime)
                }
            }
            self.data.squareQuestionData.rows = questionList;
            self.setData({
                squareQuestionData: self.data.squareQuestionData
            })
        };
        intervalFunction();
        this.clearInterval();
        this.data.intervalId = setInterval(intervalFunction, 1000)
    },
    // 加载已回答消息数据
    loadReasonMessageData (isFreshen) {
        this.setReasonMessageSearchParam('page', isFreshen? 1 : Number(this.data.reasonMessageSearchParam.page) + 1);
        request.apiPost('expert/expertReasonMessageData', this.data.reasonMessageSearchParam).then((result) => {
            result.data.rows = this.handelBlueMessage(result.data.rows);
            let reasonMessageData = result.data;
            let oldMessageList = this.data.reasonMessageData.rows;
            reasonMessageData.rows = oldMessageList.concat(reasonMessageData.rows);
            this.setData({
                reasonMessageData
            })
            this.intervalUpdate();
            this.handelLoading()
        })
    },
    // 回答
    toAnswerQuestion (e) {
        if (this.data.userInfo.isPublish == 0) {
            showMessage("您被禁言" + this.data.userInfo.forbiddenDayNum + "天~");
            return;
        }
        if (this.data.userInfo.id == e.currentTarget.dataset.user_id) {
            showMessage("自己不能回答自己的问题哦~");
            return;
        }
        let questionId = e.currentTarget.dataset.question_id;
        let questionTitle = e.currentTarget.dataset.question_title;
        let questionDetail = e.currentTarget.dataset.question_detail;
        navigateTo('/pages/questionModel/answer/answer', {
            questionId,
            questionTitle,
            questionDetail,
            type: this.data.currentTab
        })
    },
    // 问题详情
    toMessageQuestionDetail (e) {
        let questionId = e.currentTarget.dataset.question_id;
        let messageId = e.currentTarget.dataset.message_id;
        for (let i = 0; i < this.data.reasonMessageData.rows.length; i ++) {
            if (this.data.reasonMessageData.rows[i].correlationId == questionId) {
                this.data.reasonMessageData.rows = removeOneInList(this.data.reasonMessageData.rows, i)
                this.data.reasonMessageData.records --;
            }
        }
        this.loadMore();
        this.setData({
            reasonMessageData: this.data.reasonMessageData,
        })
        navigateTo('/pages/questionModel/detail/detail', {questionId: questionId, whereType: 2});
    },
    // 问题回答监听器
    expertQuestionReasonListener (param) {
        if (param.type == 1) { // 1：待回答
            for (let i = 0; i < this.data.waitReasonData.rows.length; i ++) {
                if (this.data.waitReasonData.rows[i].questionId == param.questionId) {
                    this.data.waitReasonData.rows = removeOneInList(this.data.waitReasonData.rows, i)
                    this.data.waitReasonData.records --;
                    this.loadMore();
                    break;
                }
            }
            this.data.expertNum.expertWaitReasonNum --;
            this.setData({
                waitReasonData: this.data.waitReasonData,
                expertNum: this.data.expertNum
            })
        } else if (param.type == 2) { // 2：问题广场
            for (let i = 0; i < this.data.squareQuestionData.rows.length; i ++) {
                if (this.data.squareQuestionData.rows[i].questionId == param.questionId) {
                    this.data.squareQuestionData.rows = removeOneInList(this.data.squareQuestionData.rows, i)
                    this.data.waitReasonData.records --;
                    this.loadMore();
                    break;
                }
            }
            this.setData({
                squareQuestionData: this.data.squareQuestionData,
            })
        }
    }
    ,
    // 清除定时器
    clearInterval () {
        if (this.data.intervalId) {
            clearInterval(this.data.intervalId);
        }
    },
    // 2018-03-30 上拉加载更多
    loadMore () {
        if (this.data.loading) {
            if (this.data.currentTab == 1) {
                this.loadWaitReasonData(false);
            } else if (this.data.currentTab == 2) {
                this.loadSquareQuestionData(false);
            } else if (this.data.currentTab == 3) {
                this.loadReasonMessageData(false);
            }
        }
    },
    handelLoading () {
        if (this.data.currentTab == 1) {
            this.setData({
                loading: this.data.waitReasonData.page < this.data.waitReasonData.total
            });
        } else if (this.data.currentTab == 2) {
            this.setData({
                loading: this.data.squareQuestionData.page < this.data.squareQuestionData.total
            });
        } else if (this.data.currentTab == 3) {
            this.setData({
                loading: this.data.reasonMessageData.page < this.data.reasonMessageData.total
            });
        }
        wx.stopPullDownRefresh();
    },
    // 设置请求参数()
    setWaitReasonSearchParam(key, value) {
        this.data.waitReasonSearchParam[key] = value;
    },
    // 设置请求参数(问题广场)
    setSquareQuestionSearchParam(key, value) {
        this.data.squareQuestionSearchParam[key] = value;
    },
    // 设置请求参数(问题广场)
    setReasonMessageSearchParam(key, value) {
        this.data.reasonMessageSearchParam[key] = value;
    },
    // 变蓝
    handelBlueMessage (messageList) {
        for (let oneMessage of messageList) {
            let contentArrayTemp = oneMessage.content.split('###');
            let contentArray = [];
            for (let i = 0; i < contentArrayTemp.length; i++) {
                if (i %2 == 0) {
                    contentArray.push({
                        type: 1,
                        content: contentArrayTemp[i]
                    });
                } else {
                    contentArray.push({
                        type: 2,
                        content: contentArrayTemp[i]
                    });
                }
            }
            oneMessage.contentArray = contentArray;
        }
        return messageList;
    },
    intervalUpdate () {
        if (this.data.currentTab == 1) {
            this.intervalUpdateWaitReasonData();
        } else if (this.data.currentTab == 2) {
            this.intervalUpdateSquareQuestionData();
        } else {
            this.clearInterval();
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        this.loadExpertNum(); // 加载答主消息数量
        this.loadWaitReasonData(true); // 加载待回答数据
        addListener('expertQuestionReasonListener', this.expertQuestionReasonListener);
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
        });
        this.intervalUpdate();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.clearInterval()
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.clearInterval()
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadExpertNum();
        let currentTab = this.data.currentTab;
        if (currentTab == 1) {
            this.data.waitReasonData = {rows: []};
            this.loadWaitReasonData(true); // 加载待回答数据
        } else if (currentTab == 2) {
            this.data.squareQuestionData = {rows: []};
            this.loadSquareQuestionData(true); // 加载问题广场数据
        } else if (currentTab == 3) {
            this.data.reasonMessageData = {rows: []};
            this.loadReasonMessageData(true); // 记载已回答消息数据
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadMore();
    }, 

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
})