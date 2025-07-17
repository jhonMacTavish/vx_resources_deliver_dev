// pages/announce/announce.js
import config from "../../utils/config";  // ✅ 自动获取 app.js 中注入的 env 配置
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rpx: 0,
    height: null,
    viewHeight: 0,
    bottomPadding: 0,
    title: '',
    tips: '',
    noticeList: [
      { content: '<b style="color: red; font-size: 38px;">过夜旅客暖心服<br>务用品领取提示</b>' },
      { content: '<p style="font-size: 22px;">天府机场为在隔离区内过夜<br>的旅客提供暖心服务用品：</p>' },
      { content: '<b style="color: white;">领取时间</b>' },
      { content: '<p>当日19:00-次日01:30</p>' },
      { content: '<b style="color: white;">归还时间</b>' },
      { content: '<p>请于所乘航班开始登机前交还至领取处。</p>' },
      { content: '<b style="color: white;">服务用品名称</b>' },
      { content: '<p style="text-align: left; margin: 0 10px;">①毛毯、充电数据线 <span style="font-size: 14px">(用完后,请交还至领取处)</span>。<br>②压缩毛巾、牙刷牙膏套装、耳塞 <span style="font-size: 14px">(一次性使用物品，无需归还)</span>。</p>' },
      { content: '<b style="color: white;">领取条件</b>' },
      { content: '<p style="text-align: left; margin: 0 10px;">请出示在天府机场出发的登机牌或值机信息，扫码完成信息登记后即可申领。</p>' },
      { content: '<b style="color: white;">过夜休息区</b>' },
      { content: '<p style="color: red">216或232登机口附近区域</p>' },
      { content: '<b style="color: white;">过夜物资领取地点</b>' },
      { content: '<p>T2L2中央商业区问询柜台</p>' },
    ]
  },

  goToRegister() {
    wx.navigateTo({
      url: '../index/index'
    });
  },

  confirm() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const that = this;
    const rpx = app.globalData.settings.rpx;
    const bottomPadding = app.globalData.settings.safeBottomPadding + (rpx * 100);
    wx.request({
      url: `${config.url}/miniprogram/getNoticeList`,
      method: 'GET',
      success(res) {
        if (res.data.status == 400) {
          wx.showToast({
            title: res.data.statusText,
            icon: 'error', // 图标，有效值：'success', 'loading', 'none'
            duration: 1500,
          });
          return
        } else if(res.data.status == 200) {
          console.log(res.data.data);
          let noticeList = res.data.data;
          const title = noticeList.shift();
          const tips = noticeList.shift();
          console.log(title,tips)
          that.setData({
            noticeList, title, tips
          });
        } else {
          wx.showToast({
            title: res.data.statusText,
            icon: 'error', // 图标，有效值：'success', 'loading', 'none'
            duration: 1500,
          });
        }
      },
      fail(error) {
        wx.showToast({
          title: '网络错误',
          icon: 'error',
          duration: 1500
        });
      }
    });

    let viewHeight = systemInfo.windowHeight - 100;
    this.setData({
      rpx, bottomPadding, viewHeight
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideHomeButton();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  }
});