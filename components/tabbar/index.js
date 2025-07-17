// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    currentPage: "",
    color: "#B9B9B9",
    selectedColor: "#1890FF",
    borderStyle: "black",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "/pages/announce/announce",
        text: "公告",
        iconPath: "/images/logout_announce.png",
        selectedIconPath: "/images/active_announce.png",
      },
      {
        pagePath: "/pages/index/index",
        text: "申领",
        iconPath: "/images/logout_receive.png",
        selectedIconPath: "/images/active_receive.png",
      },
      {
        pagePath: "/pages/return/return",
        text: "归还",
        iconPath: "/images/logout_return.png",
        selectedIconPath: "/images/active_return.png",
      }
    ],
  },
  attached() {
    const data = {
      currentPage: getCurrentPages()[0].route || ''
    }
    this.setData({
      ...data
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      console.log(data);

      wx.switchTab({
        url,
        currentPage: data.path
      });
    },
  },
});
