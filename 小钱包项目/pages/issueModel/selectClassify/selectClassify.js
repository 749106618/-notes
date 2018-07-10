/**
 * Created by Administrator on 2018/5/25 0025.
 */
Page({
    backIssue(e){
        if(e.currentTarget.dataset.content == wx.getStorageSync('classify')){
            console.log(1);
        }
        wx.setStorage({
            key:'classify',
            data:e.currentTarget.dataset.content
        })
        wx.navigateBack()
    }
})