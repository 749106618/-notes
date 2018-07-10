/**
 * Created by Administrator on 2018/5/18 0018.
 */
let {request} = require('../../../utils/api.js');
let {getStorage, setStorage, removeOneInList} = require('../../../utils/util.js')
Page({
    data: {
        content: '',
        noteList: [],
        showSearchBox: false,
        searchHistory: [],
        hotSearchHistory: [],
        page:1,
        isData:false,
        notData:false
    },
    content(e){
        console.log(e.detail.value);
        this.setData({
            content: e.detail.value
        })
    },
    search(){
        let param = {
            page: 1,
            pageSize: 10,
            searchName: this.data.content,
        }
        request.apiPost('note/loadNoteList', param).then(res => {
            if(res.data.data.length == 0){
                this.setData({
                    notData:true,
                    showSearchBox:false
                })
            }else{
                this.setData({
                    notData:false,
                    showSearchBox: true
                })
            }
            if(res.data.isNext){
                this.setData({
                    isData:true
                })
            }else{
                this.setData({
                    isData:false
                })
            }
            console.log(res);
            let that = this;
            res.data.data.forEach(function (v) {
                v.imageList = v.imageList.split(',')
                v.noteTitle = v.noteTitle.length > 20 ? v.noteTitle.substring(0, 20) : v.noteTitle
                v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
            })
            this.setData({
                noteList: res.data.data,
            })
            if (that.data.content) {
                getStorage('searchHistory').then(res => {
                    if (res.data) {//添加searchHistoryOrhotSearchHistory
                            if(res.data.indexOf(that.data.content)<0){
                                let searchHistory = res.data;
                                searchHistory.unshift(that.data.content)
                                setStorage({
                                    key: 'searchHistory',
                                    data: searchHistory
                                })
                            }else{
                                let location =  res.data.findIndex(function (item) {
                                    return  item == that.data.content
                                })
                                let searchHistory = res.data;
                                searchHistory.splice(location,1)
                                searchHistory.unshift(that.data.content)
                                setStorage({
                                    key: 'searchHistory',
                                    data: searchHistory
                                })
                            }

                    }
                })
            }

        })
    },
    onLoad: function () {
        getStorage('searchHistory').then(res => {
            let searchHistory = []
            for (let i = 0; i < 8; i++) {
                searchHistory.push(res.data[i])
            }
            this.setData({
                searchHistory: searchHistory
            })
        })
        request.apiPost('note/hostSearchName').then(res => {
            this.setData({
                hotSearchHistory: res.data
            })
        })
    },
    deleteSearchHistor(){
        setStorage({
            key: 'searchHistory',
            data: []
        })
        this.setData({
            searchHistory: []
        })
    },
    clickSearch(e){
        this.setData({
            content: e.target.dataset.content
        })
        this.search()
    },
    onReachBottom(){
        if(this.data.isData){
            let param = {
                page: ++this.data.page,
                pageSize: 10,
                searchName: this.data.content
            }
            request.apiPost('note/loadNoteList', param).then(res => {
                if(res.code == 0){
                    if(res.data.isNext){
                        this.setData({
                            isData:true
                        })
                    }else{
                        this.setData({
                            isData:false
                        })
                    }
                    res.data.data.forEach(function (v) {
                        v.imageList = v.imageList.split(',')
                        v.noteTitle = v.noteTitle.length > 20 ? v.noteTitle.substring(0, 20) : v.noteTitle
                        v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                    })
                    this.setData({
                        noteList:this.data.noteList.concat(res.data.data)
                    })
                }

            })
        }else{
            return
        }

    }
})