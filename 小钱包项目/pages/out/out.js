/**
 * Created by Administrator on 2018/6/15 0015.
 */
Page({
    data:{
        src:''
    },
    onLoad:function (optinos) {
        console.log(optinos.src);
        this.setData({
            src:optinos.src
        })
    }
})