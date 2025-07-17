// pages/register/register.js
import config from "../../utils/config"; 
const app = getApp();

Page({
  data: {
    inputs: [
      { name: '姓名', value: '', placeholder: '与登机牌一致' },
      { name: '手机号', value: '', placeholder: '请输入手机号' },
      { name: '验证码', value: '', placeholder: '请输入验证码' },
    ],
    captcha: {
      disabled: false,
      message: "获取验证码",
      countdown: 60
    },
    clickable: true,
    params: {},
    checked: false
  },

  onCheckboxChange(e) {
    const checked = this.data.checked;
    this.setData({
      checked: !checked
    });
    // console.log(this.data.checked);
  },

  getCaptcha() {
    const that = this;
    const captcha = this.data.captcha;
    const inputs = this.data.inputs;
    let params = {};
    if (captcha.disabled)
      return
    for (let i = 0; i < 2; i++) {
      if (!inputs[i].value) {
        wx.showModal({
          content: `请输入 ${inputs[i].name}`,
          success(res) {
            if (res.confirm) {
            } else if (res.cancel) { }
          }
        });
        return
      } else {
        if (i == 1) {
          const reg = /^1[3-9]\d{9}$/;
          if (!reg.test(inputs[1].value)) {
            wx.showModal({
              content: `请输入正确手机号`,
              success(res) {
                if (res.confirm) {
                } else if (res.cancel) { }
              }
            });
            return
          }
          params.tel = inputs[i].value;
        } else {
          params.name = inputs[i].value;
        }
      }
    }
    params.openid = wx.getStorageSync('openid');

    let countdown = captcha.countdown;
    let message = countdown + "S后重发";
    this.setData({
      [`captcha.message`]: message,
      [`captcha.disabled`]: true
    });
    let timer = setInterval(() => {
      countdown--;
      if (countdown >= 0) {
        message = countdown + "S后重发";
        this.setData({
          [`captcha.message`]: message,
          [`captcha.countdown`]: countdown
        });
      } else {
        countdown = 60;
        message = "发送验证码";
        this.setData({
          [`captcha.message`]: message,
          [`captcha.countdown`]: countdown,
          [`captcha.disabled`]: false
        });

        clearInterval(timer);
      }
    }, 1000);

    params.openid = wx.getStorageSync('openid');
    wx.request({
      url: `${config.url}/miniprogram/send_code`,
      method: 'POST',
      data: params,
      success(res) {
        console.log(params);
        if (res.data.status == 400) {
          wx.showToast({
            title: res.data.statusText,
            icon: 'error', // 图标，有效值：'success', 'loading', 'none'
            duration: 1500,
          });
          if (res.data.statusText == "该手机号已注册") {
            setTimeout(() => {
              wx.showLoading({
                title: '正在跳转',
                mask: true
              });
            }, 1500);
            setTimeout(() => {
              wx.hideLoading();
              that.setData({
                clickable: true
              });
              wx.switchTab({
                url: '/pages/index/index',
              });
            }, 2000);
          } else {
            wx.removeStorageSync('openid');
            clearInterval(timer);
            const captcha = {
              disabled: false,
              message: "获取验证码",
              countdown: 60
            };
            that.setData({ captcha });
          }
          return
        } else if (res.data.status == 200) {
          console.log(res.data);
          that.setData({ params });
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
  },

  confirm() {
    if (!this.data.clickable)
      return
    const that = this;
    const inputs = this.data.inputs;
    const captcha = this.data.captcha;
    let params = this.data.params;
    for (const element of inputs) {
      if (!element.value) {
        wx.showModal({
          content: `请输入 ${element.name}`,
          success(res) {
            if (res.confirm) {
            } else if (res.cancel) { }
          }
        });
        return
      } else {
        if (element.name == "姓名") {
          params.name = element.value;
        }
        else if (element.name == "手机号") {
          const reg = /^1[3-9]\d{9}$/;
          if (!reg.test(inputs[1].value)) {
            wx.showModal({
              content: `请输入正确手机号`,
              success(res) {
                if (res.confirm) {
                } else if (res.cancel) { }
              }
            });
            return
          }
          params.tel = element.value;

        } else {
          params.code = element.value;
          params.openid = wx.getStorageSync('openid');
        }
      }
    }
    if (!captcha.disabled) {
      wx.showModal({
        content: '请获取验证码',
        success(res) {
          if (res.confirm) {
          } else if (res.cancel) { }
        }
      });
    } else if (!this.data.checked) {
      wx.showModal({
        content: '请阅读并同意《用户协议》和《隐私协议》',
        success(res) {
          if (res.confirm) {
          } else if (res.cancel) { }
        }
      });
      return
    } else {
      that.setData({
        clickable: false
      });
      wx.showLoading({
        title: '正在注册',
        mask: true
      });
      wx.request({
        url: `${config.url}/miniprogram/register`,
        method: 'POST',
        data: params,
        success(res) {
          console.log(params);
          console.log(res.data);
          wx.hideLoading();
          if (res.data.status == 400) {
            wx.showModal({
              content: res.data.statusText,
              success(res) {
                if (res.confirm) {
                } else if (res.cancel) { }
                that.setData({
                  clickable: true
                });
              }
            });
          } else if (res.data.status == 200) {
            app.globalData.accountInfo.userInfo = res.data.data;
            wx.showToast({
              title: '注册成功', // 提示的内容
              icon: 'success', // 图标，有效值：'success', 'loading', 'none'
              duration: 1500, // 提示的延迟时间，单位毫秒
              success(res) {
                setTimeout(() => {
                  wx.showLoading({
                    title: '正在跳转',
                    mask: true
                  });
                }, 1500);
                setTimeout(() => {
                  wx.hideLoading();
                  that.setData({
                    clickable: true
                  });
                  wx.switchTab({
                    url: '/pages/index/index',
                  });
                }, 2000);
              }
            });
          } else {
            wx.showToast({
              title: res.data.statusText,
              icon: 'error', // 图标，有效值：'success', 'loading', 'none'
              duration: 1500,
            });
            that.setData({
              clickable: true
            });
          }
        },
        fail(error) {
          that.setData({
            clickable: true
          });
          wx.showToast({
            title: '网络错误',
            icon: 'error',
            duration: 1500
          });
        }
      });
    }
  },

  handleInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value.replace(/\s+/g, '');
    const inputs = this.data.inputs;
    const lastInputs = inputs;

    if (index == 1) {
      const reg = /^\d{1,11}$/;
      if (!reg.test(value) && value) {
        this.setData({
          inputs: lastInputs
        });
        return
      }
    } else if (index == 2) {
      const reg = /^\d{1,4}$/;
      if (!reg.test(value) && value) {
        this.setData({
          inputs: lastInputs
        });
        return
      }
    }

    inputs[index].value = value;
    this.setData({
      inputs
    });
  },

  onLoad() {
    wx.hideHomeButton();
    const openid = wx.getStorageSync('openid');
    console.log(openid);
    if(!openid){
      app.login();
    }
  }
});
