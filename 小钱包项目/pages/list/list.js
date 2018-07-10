/**
 * Created by Administrator on 2018/5/18 0018.
 */
let { request } = require('../../utils/api.js');
Page({
    level_one:'',
    level_two:'',
    page:1,
    data:{
        list:[{  "id": "", "name": "全部"}],
        currentTab: 0,
        noteList:[],
        isData:true,
        loading:0
    },
    bindNavTab: function( e ) {
        let that = this;
        if( this.data.currentTab === e.target.dataset.current ) {
            return false;
        } else {
            that.setData( {
                currentTab: e.target.dataset.current
            })
        }
        this.level_two = e.target.dataset.twolevel;
        this.page = 1
        this.loadNoteList(this.level_one,this.level_two)

    },
    loadTwoLevelLabel:function () {
        let param = {
            oneLevel: this.level_one
        }
        request.apiPost('note/loadTwoLevelLabel',param).then(res=>{
            console.log(res);
            let newarray = res.data;
            let that = this;
            this.setData({
                 list:that.data.list.concat(newarray)
             })
        })
    },
    loadNoteList(oneLevel,twoLevel,searchName,param = {}){
            param = {
                oneLevel:oneLevel,
                page:this.page,
                pageSize:10,
                twoLevel:twoLevel?twoLevel:'',
                searchName:searchName?searchName:''
            }
            request.apiPost('note/loadNoteList',param).then(res=>{
                if(res.code == 0){
                    //判断有没有下一页
                    if(res.data.isNext == 0){
                        this.setData({
                            isData:false
                        })
                    }else{
                        this.setData({
                            isData:true
                        })
                    }
                    //图片字符转数组
                    res.data.data.forEach(function (v) {
                        v.imageList = v.imageList.split(',')
                        if(v.noteTitle){
                            v.noteTitle = v.noteTitle.length > 20 ?  v.noteTitle.substring(0, 20):  v.noteTitle
                            v.noteTitle = v.noteTitle.replace(/([，。、！：；？])/g, '$1 ')
                            v.userName = v.userName.length > 6 ?  v.userName.substring(0, 6)+ "...":  v.userName
                        }
                    })
                    if(this.page == 1){//如果是页数等于1，重新加载noteList
                        this.setData({
                            noteList:res.data.data
                        })
                    }else{//页数大于1，给noteList添加数据
                        this.setData({
                            noteList:this.data.noteList.concat(res.data.data)
                        })
                    }
                    this.setData({
                        loading: res.data.isNext
                    })
                }
            })

    },
    onLoad:function (options) {
        this.level_one = options.oneLevel
        this.loadNoteList(this.level_one)
        this.loadTwoLevelLabel()
        wx.setNavigationBarTitle({
            title: options.title,
        })
    },
    onReachBottom:function () {
        if(this.data.isData) {
            this.page++
            this.loadNoteList(this.level_one, this.level_two)
        }else{
            return
        }
    }
})