// pages/return/return.js
import drawQrcode from '../../utils/weapp.qrcode.esm.js';
import config from "../../utils/config"; 
const app = getApp();

Page({
  data: {
    rpx: 0,
    bottomPadding: 0,
    sectionHeight: null,
    inputs: [{
        name: '姓名',
        value: ''
      },
      {
        name: '航班号',
        value: ''
      },
      {
        name: '座位号',
        value: ''
      },
    ],
    items: [{
        value: 'blanket',
        name: '毛毯',
        checked: false,
        num: 0
      },
      {
        value: 'dataCable',
        name: '充电线',
        checked: false,
        num: 0
      },
    ],
    travalers: [],
    showButton: false,
    isEdit: false,
    index: 0,
    minusStatus: [{
      disabled: true
    }, {
      disabled: true
    }, {
      disabled: true
    }],
    plusStatus: [{
      disabled: true
    }, {
      disabled: true
    }, {
      disabled: true
    }],
    userInfo: null,
    prompt: {
      imgSrc: '../../images/complete.png',
      message: '已归还'
    },
    orderId: null
  },

  paintQRcode(orderId) {
    const rpx = app.globalData.settings.rpx;
    drawQrcode({
      width: 260 * rpx, // 必须，二维码宽度，与canvas的width保持一致
      height: 260 * rpx, // 必须，二维码高度，与canvas的height保持一致
      canvasId: 'myQrcode',
      background: '#ffffff', //	非必须，二维码背景颜色，默认值白色
      text: orderId ? `${orderId}` : '', // 必须，二维码内容
      image: {
        dx: 100,
        dy: 100,
        dWidth: 100,
        dHeight: 100
      }
    });
  },

  getReqDetail() {
    const that = this;
    const openid = wx.getStorageSync('openid');
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.url}/miniprogram/getPassengerNoReturnRequestByOpenid`,
        method: 'GET',
        data: {
          openid: openid
        },
        success(res) {
          const data = res.data;
          if (data.status == 500) {
            wx.showToast({
              title: '服务器错误',
              icon: 'error', // 图标，有效值：'success', 'loading', 'none'
              duration: 1500,
            });
            return
          } else {
            console.log(data.data);
            const travalers = data.data ? data.data.travalers : [];
            let items = data.data ? data.data.items : [{
                value: 'blanket',
                name: '毛毯',
                checked: false,
                num: 0
              },
              {
                value: 'dataCable',
                name: '充电线',
                checked: false,
                num: 0
              },
            ];
            const itemsTemp = items;
            itemsTemp.forEach((item, index) => {
              if (item.value == "blanket") {
                items[0].num = item.receiveNum ? item.receiveNum : 0;
                items[0].checked = true;
              } else if (item.value == "dataCable") {
                items[1].num = item.receiveNum ? item.receiveNum : 0;
                items[1].checked = true;
              }
            });
            items.length = 2;
            that.setData({
              travalers,
              items,
              showButton: travalers.length ? false : true
            });
            resolve(data);
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
    });
  },

  deregister() {
    const that = this;
    wx.showModal({
      content: '注销账号会删除该用户所有信息，确定要注销吗?',
      complete: (res) => {
        if (res.cancel) {}
        if (res.confirm) {
          wx.showLoading({
            title: '正在注销',
            mask: true
          });
          const openid = wx.getStorageSync('openid');
          wx.request({
            url: `${config.url}/miniprogram/delete_passenger`,
            method: 'POST',
            data: {
              openid
            },
            success(res) {
              console.log(res.data);
              wx.hideLoading();
              if (res.data.status == 400) {
                wx.showModal({
                  content: res.data.statusText,
                  complete: (res) => {
                    if (res.cancel) {}
                    if (res.confirm) {}
                  }
                });
              } else if (res.data.status == 200) {
                app.globalData.accountInfo.userInfo = null;
                app.globalData.accountInfo.orderId = null;
                const travalers = [];
                const items = [{
                    value: 'blanket',
                    name: '毛毯',
                    checked: false,
                    num: 0
                  },
                  {
                    value: 'dataCable',
                    name: '充电线',
                    checked: false,
                    num: 0
                  },
                ];
                that.setData({
                  travalers,
                  items,
                  userInfo: app.globalData.accountInfo.userInfo,
                  orderId: null
                });
                console.log(that.data.userInfo);
                app.globalData.accountInfo.travalers = travalers;
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
              wx.hideLoading();
              console.log(error);
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

  onLoad(options) {
    const rpx = app.globalData.settings.rpx;
    const bottomPadding = app.globalData.settings.safeBottomPadding + (rpx * 100);
    const sectionHeight = app.globalData.settings.sectionHeight;
    const userInfo = app.globalData.accountInfo.userInfo;
    const travalers = app.globalData.accountInfo.travalers;
    const orderId = app.globalData.accountInfo.orderId;
    this.setData({
      orderId,
      sectionHeight,
      bottomPadding,
      rpx,
      userInfo,
      showButton: travalers.length ? false : true
    });

    if (userInfo) {
      this.getReqDetail().then(res => {
        if (res.data) {
          const orderId = res.data.orderId;
          this.paintQRcode(orderId);
          this.setData({
            orderId
          });
        }
      });
    }
  },

  onShow() {
    const that = this;
    const rpx = app.globalData.settings.rpx;
    const bottomPadding = app.globalData.settings.safeBottomPadding + (rpx * 100);
    const sectionHeight = app.globalData.settings.sectionHeight;
    const userInfo = app.globalData.accountInfo.userInfo;
    const travalers = app.globalData.accountInfo.travalers;
    const orderId = app.globalData.accountInfo.orderId;
    this.setData({
      orderId,
      sectionHeight,
      bottomPadding,
      rpx,
      userInfo,
      showButton: travalers.length ? false : true
    });

    if (userInfo) {
      that.getReqDetail().then(res => {
        if (res.data) {
          const orderId = res.data.orderId;
          that.paintQRcode(orderId);
          that.setData({
            orderId
          });
        } else {
          that.setData({
            orderId: null
          });
        }
      });
    }
  }
});