// app.js
import config from "./utils/config";

App({
  data: {},
  globalData: {
    settings: {
      env: "prod",
      rpx: 0,
      safeBottomPadding: 0,
      sectionHeight: 180,
    },
    accountInfo: {
      travalers: [],
      userInfo: null,
      orderId: null,
    },
  },

  login(openid) {
    const that = this;
    console.log(openid);

    // 通用请求函数，处理 wx.request 相关逻辑
    const request = (url, method, data) => {
			console.log(url, method, data);
      return new Promise((resolve, reject) => {
        wx.request({
          url,
          method,
          data,
          success: (res) => {
						console.log(res);
            if (res.data.status === 200) {
              console.log(res.data);
              wx.showToast({
                title: res.data.statusText,
                icon: "success",
                duration: 1500,
              });
              resolve(res.data);
            } else {
              // console.error('请求失败');
              reject(res.data.statusText || "请求失败");
            }
          },
          fail: (error) => {
            console.error("请求失败", error);
            reject("请求失败");
          },
        });
      });
    };

    // 获取 OpenID
    const getOpenid = () => {
      return new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            // console.log(res.code);
            if (res.code) {
              request(
                `${config.url}/miniprogram/miniprogram/getOpenId`,
                "GET",
                {
                  code: res.code,
                }
              )
                .then((data) => {
                  const openid = data.data;
                  wx.setStorageSync("openid", openid);
                  resolve(openid);
                })
                .catch((error) => {
                  console.error(error);
                  setTimeout(() => {
                    that.login();
                  }, 5000);
                });
            } else {
              console.log("登录失败！" + res.errMsg);
              reject("登录失败");
            }
          },
          fail: (err) => {
            console.error("wx.login 请求失败:", err);
            reject(err);
          },
        });
      });
    };

    // 主流程逻辑
    const executeLogin = (openid) => {
      request(`${config.url}/miniprogram/login`, "POST", {
        openid,
      })
        .then((data) => {
          console.log(data.data);
          that.globalData.accountInfo.userInfo = data.data;
          console.log("登录成功:", data.data);
        })
        .catch((error) => {
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1]; // 获取当前页面
          const currentPath = currentPage?.route; // 获取当前页面的路径
          console.log(currentPath);
          console.log(error);
          if (error == "请先注册") return;
          // wx.showToast({
          //   title: error,
          //   icon: "error",
          //   duration: 1500,
          // });
          console.error("登录失败:", error);
          setTimeout(() => {
            that.login();
          }, 5000);
        });
    };

    // 判断是否已有 OpenID，若无则获取 OpenID 后再执行登录
    if (openid) {
      executeLogin(openid);
    } else {
      getOpenid()
        .then((newOpenid) => {
          executeLogin(newOpenid);
        })
        .catch((error) => {
          // wx.showToast({
          //   title: error,
          //   icon: 'success',
          //   duration: 1500,
          // });
          setTimeout(() => {
            that.login();
            console.log(3);
          }, 5000);
        });
    }
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
      },
    });
  },

  onLaunch() {
    console.log("当前配置：", config);

    // 展示本地存储能力
    const systemInfo = wx.getSystemInfoSync();
    const rpx = systemInfo.screenWidth / 750;
    const openid = wx.getStorageSync("openid");
    let safeBottomPadding = 0;
    console.log(systemInfo);

    if (
      systemInfo.platform.toLowerCase() == "ios" ||
      systemInfo.platform.toLowerCase() == "devtools"
    ) {
      const str = systemInfo.model.toLowerCase();
      const model = str.includes("unknown")
        ? str.substr(str.indexOf("<") + 1, 8).substring(0, 6) +
          " " +
          str.substr(str.indexOf("<") + 1, 8).substring(6)
        : str;
      console.log(model);
      const version = model.split(" ")[1].includes("/")
        ? model.split(" ")[1].split("/")[0]
        : model.split(" ")[1];
      console.log(systemInfo.model, version);
      if (
        model.includes("iphone x") ||
        (model.includes("iphone") && version > 10) ||
        !model
      ) {
        safeBottomPadding =
          systemInfo.screenHeight - systemInfo.safeArea.bottom;
        console.log(safeBottomPadding);
      }
      if (model.includes("iphone")) {
        safeBottomPadding =
          systemInfo.screenHeight - systemInfo.safeArea.bottom;
      }
    }

    this.login(openid);
    this.globalData.settings.rpx = rpx;
    this.globalData.settings.safeBottomPadding = safeBottomPadding;
  },
});
