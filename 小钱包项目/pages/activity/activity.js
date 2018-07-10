/**
 * Created by Administrator on 2018/5/23 0023.
 */
let { request } = require('../../utils/api.js');
let { formatDateInterval,formatDateOverplus} = require('../../utils/util.js');
Page({
    data:{
        activityDetail:[]
    },
    loadActivityDetail(options){
        request.apiPost('activity/loadActivityDetail',options).then(result=>{
            console.log(result.data)
            let activityDetail = result.data
            activityDetail.attention = JSON.parse(activityDetail.attention)
            activityDetail.detail = activityDetail.detail.split("\n")
            this.setData({
                activityDetail:activityDetail
            })
        })
    },

    onLoad(options){
       this.loadActivityDetail(options);
    }
})