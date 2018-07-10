Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        /**
         * 权限（是否拥有答主权限）
         * 0 否
         * 1 是
         */
        power: {
            type: Boolean,
            value: false   
        },
        tabBarId: {
            type: Number,
            value: 4
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        //跳转
        navigate: function(e){
            let self = this;
            if(e.currentTarget.dataset.id == self.data.tabBarId)return
            wx.switchTab({
                url: e.currentTarget.dataset.url,
            })
        }
    }
})