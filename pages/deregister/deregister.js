// pages/deregister/deregister.js
import config from "../../utils/config"; 
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rpx: 0,
    height: null,
    bottomPadding: 0,
  },

  deregister() {
    const that = this;
    wx.showModal({
      content: '注销账号会删除该用户所有信息，确定要注销吗?',
      complete: (res) => {
        if (res.cancel) {
        }
        if (res.confirm) {
          wx.showLoading({
            title: '正在注销',
            mask: true
          });
          const openid = wx.getStorageSync('openid');
          wx.request({
            url: `${config.url}/miniprogram/delete_passenger`,
            method: 'POST',
            data: { openid },
            success(res) {
              console.log(res.data);
              wx.hideLoading();
              if (res.data.status == 400) {
                wx.showModal({
                  content: res.data.statusText,
                  complete: (res) => {
                    if (res.cancel) {
                    }
                    if (res.confirm) {
                    }
                  }
                });
              } else if (res.data.status == 200) {
                app.globalData.accountInfo.userInfo = null;
                app.globalData.accountInfo.orderId = null;
                console.log(that.data.userInfo);
                wx.removeStorageSync('openid');
                wx.showToast({
                  title: '注销成功', // 提示的内容
                  icon: 'success', // 图标，有效值：'success', 'loading', 'none'
                  duration: 1500 // 提示的延迟时间，单位毫秒
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
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const rpx = app.globalData.settings.rpx;
    const bottomPadding = app.globalData.settings.safeBottomPadding + (rpx * 100);

    this.setData({
      rpx, bottomPadding
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