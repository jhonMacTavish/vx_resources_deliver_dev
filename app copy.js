// app.js
App({
  data: {
  },
  globalData: {
    settings: {
      rpx: 0,
      safeBottomPadding: 0,
      sectionHeight: 180,
    },
    accountInfo: {
      travalers: [],
      userInfo: null,
      orderId: null
    }
  },

  login(openid) {
    const that = this;
    getOpenid: {
      if (openid)
        break getOpenid;

      return new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            if (res.code) {
              wx.request({
                url: 'https://onss.sctfia.com/miniprogram/miniprogram/getOpenId',
                method: 'GET',
                data: {
                  code: res.code
                },
                success(res) {
                  if (res.data.status == 400) {
                    wx.showToast({
                      title: res.data.statusText,
                      icon: 'error', // 图标，有效值：'success', 'loading', 'none'
                      duration: 1500,
                    });
                    setTimeout(() => {
                      that.login();
                    }, 3000);
                    return
                  } else if(res.data.status == 200) {
                    const openid = res.data.data;
                    wx.setStorageSync('openid', openid);
                    that.login(openid);
                    resolve(res.data);
                  }
                },
                fail: function (error) {
                  reject(error);
                  console.error('请求失败', error);
                  wx.showToast({
                    title: '网络错误',
                    icon: 'error', // 图标，有效值：'success', 'loading', 'none'
                    duration: 1500,
                  });
                }
              });
            } else {
              console.log('登录失败！' + res.errMsg);
              wx.showToast({
                title: '登录失败',
                icon: 'error', // 图标，有效值：'success', 'loading', 'none'
                duration: 1500,
              });
            }
          },
          fail: (err) => {
            console.error('请求失败:', err);
            wx.showToast({
              title: '请求失败',
              icon: 'error', // 图标，有效值：'success', 'loading', 'none'
              duration: 1500,
            });
          }
        });
      });
    }

    wx.request({
      url: 'https://onss.sctfia.com/miniprogram/login',
      method: 'POST',
      data: { openid },
      success(res) {
        console.log(res.data);
        if (res.data.status == 400) {
          wx.showToast({
            title: res.data.statusText,
            icon: 'error', // 图标，有效值：'success', 'loading', 'none'
            duration: 1500,
          });
          return
        } else if(res.data.status == 200) {
          const userInfo = res.data.data;
          that.globalData.accountInfo.userInfo = userInfo;
        }
      },
      fail(error) {
      }
    });
  },

  watch(variate, method) {
    var obj = this.globalData;
    let val = obj[variate];
    Object.defineProperty(obj, variate, {
      configurable: false,
      enumerable: true,
      set(value) {
        val = value;
        method(variate, value);
      },
      get() {
        return val;
      }
    })
  },

  onLaunch() {
    // 展示本地存储能力
    const systemInfo = wx.getSystemInfoSync();
    const rpx = systemInfo.screenWidth / 750;
    const openid = wx.getStorageSync('openid')
    let safeBottomPadding = 0;

    console.log(systemInfo);

    if (systemInfo.platform.toLowerCase() == "ios") {
      const str = systemInfo.model.toLowerCase();
      const model = str.includes("unknown") ? str.substr(str.indexOf("<") + 1, 8).substring(0, 6) + " " + str.substr(str.indexOf("<") + 1, 8).substring(6) : str;
      console.log(model)
      const version = model.split(" ")[1].includes("/") ? model.split(" ")[1].split("/")[0] : model.split(" ")[1];
      console.log(systemInfo.model, version)
      // if (model.includes("iphone x") || (model.includes("iphone") && version > 10) || !model) {
      //   safeBottomPadding = systemInfo.screenHeight - systemInfo.safeArea.bottom;
      //   console.log(safeBottomPadding);
      // }
      if (model.includes("iphone")) {
        safeBottomPadding = systemInfo.screenHeight - systemInfo.safeArea.bottom;
        console.log(safeBottomPadding);
      }
    }

    this.login(openid);
    this.globalData.settings.rpx = rpx;
    this.globalData.settings.safeBottomPadding = safeBottomPadding;
  }
})
