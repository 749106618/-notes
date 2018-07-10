/**
 * Created by Administrator on 2018/5/24 0024.
 */
let {request} = require('../../../utils/api.js')
let {isCN} = require('../../../utils/util.js')
    Page({
    page: 1,
    data: {
        info: true,
        NoteList: [],
        isData: false
    },
    onLoad: function () {
        this.loadUserNoteList()
    },
    loadUserNoteList(){
        let param = {
            page: this.page,
            pageSize: 5
        }
        request.apiPost('user/loadUserNoteList', param).then(res => {
            console.log(res);
            if (res.code) {
                if (res.data.isNext == 0) {
                    this.setData({
                        isData: false
                    })
                } else {
                    this.setData({
                        isData: true
                    })
                }
                res.data.data.forEach(function (v) {
                    if (v.imageList) {
                        v.imageList = v.imageList.split(',')
                    }
                    if(v.noteTitle){
                        v.noteTitle = v.noteTitle.length > 20 ? v.noteTitle.substring(0, 20):  v.noteTitle
                        v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                    }
                    if(v.userName){
                        v.userName = v.userName.length > 6 ?  v.userName.substring(0, 6)+ "...":  v.userName
                    }
                })
                wx.setNavigationBarTitle({
                    title: '我的笔记（' + res.data.total + '）',
                })
                if (this.page == 1) {//如果是页数等于1，重新加载noteList
                    this.setData({
                        NoteList: res.data.data
                    })
                } else {//页数大于1，给noteList添加数据
                    this.setData({
                        NoteList: this.data.NoteList.concat(res.data.data)
                    })
                }
            }
        })
    },
    onReachBottom: function () {
        if (this.data.isData) {
            this.page++
            this.loadUserNoteList()
        } else {
            return
        }
    }
})