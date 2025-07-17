// index.js
import drawQrcode from '../../utils/weapp.qrcode.esm.js';
import config from "../../utils/config"; 
const app = getApp();

Page({
  data: {
    rpx: 0,
    bottomPadding: 0,
    inputs: [{
        name: '姓名',
        value: '',
        tag: 'name'
      },
      {
        name: '航班号',
        value: '',
        tag: 'flightNo'
      },
      {
        name: '座位号',
        value: '',
        tag: 'seatNo'
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
      {
        value: 'towel',
        name: '压缩毛巾',
        checked: false,
        num: 0
      },
      {
        value: 'toothbrush',
        name: '牙刷牙膏套装',
        checked: false,
        num: 0
      },
      {
        value: 'earplugs',
        name: '耳塞',
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
    }, {
      disabled: true
    }, {
      disabled: true
    }],
    userInfo: null,
    clickable: true,
    // editable: true,
    addTravaler: false,
    orderId: null,
    goToFlag: false,
    FLAG: false
  },

  request() {
    console.log(this.data.clickable);
    if (!this.data.clickable)
      return
    const that = this;
    const userInfo = this.data.userInfo;
    const travalers = this.data.travalers;
    const items = this.data.items;
    if (!userInfo) {
      if (this.data.goToFlag)
        return
      wx.showModal({
        content: '请先注册用户信息',
        success(res) {
          if (res.confirm) {
            that.setData({
              goToFlag: true
            });
            wx.redirectTo({
              url: '/pages/register/register',
            });
          } else if (res.cancel) {
            that.setData({
              goToFlag: false
            });
          }
        }
      });
      return
    } else {
      let requestable = false;
      for (const item of items) {
        if (item.checked && item.num <= 0) {
          wx.showModal({
            content: '已勾选的物资，申请数量须大于0',
            complete: (res) => {
              if (res.cancel) {}
              if (res.confirm) {}
            }
          });
          return
        } else if (item.checked && item.num > 0) {
          requestable = true;
        } else {
          continue
        }
      }
      if (!requestable) {
        wx.showModal({
          content: '请至少勾选一种物资',
          complete: (res) => {
            if (res.cancel) {}
            if (res.confirm) {}
          }
        });
        return
      }
    }

    let params = {
      passengerId: userInfo.id,
      flightStartPlan: userInfo.flightStartPlan,
      travalers,
      items
    };
    that.setData({
      clickable: false
    });
    wx.showLoading({
      title: '正在申请', // 这里设置提示文字
      mask: true // 可选，是否显示透明蒙层，防止触摸穿透
    });
    wx.request({
      url: `${config.url}/miniprogram/goodsRequest`,
      method: 'POST',
      data: params,
      success(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 400) {
          that.setData({
            clickable: true
          });
          wx.showToast({
            title: res.data.statusText,
            icon: 'error', // 图标，有效值：'success', 'loading', 'none'
            duration: 1500,
          });
          return
        } else if (res.data.status == 200) {
          wx.showToast({
            title: '申请成功',
          });
          let userinfo = userInfo;
          const orderId = res.data.data.orderId;
          userinfo.orderId = orderId;
          that.setData({
            orderId,
            userInfo: userinfo,
            // editable: false,
            clickable: false,
            minusStatus: [{
              disabled: true
            }, {
              disabled: true
            }, {
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
            }, {
              disabled: true
            }, {
              disabled: true
            }],
          });
          app.globalData.accountInfo.userInfo = userinfo;
          app.globalData.accountInfo.orderId = userinfo.orderId;
          console.log(userinfo);
          that.paintQRcode(orderId);
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
        that.setData({
          clickable: true
        });
      }
    });
  },

  checkboxChange(e) {
    // console.log(e);
    console.log(this.data.travalers.length, /*this.data.editable*/ );
    if (!this.data.travalers.length /*|| !this.data.editable*/ ) {
      const items = this.data.items;
      items.forEach((item, index) => {
        items[index].checked = false;
      });
      this.setData({
        items
      });
      wx.showModal({
        content: '请输入正确的 乘机人信息',
        success(res) {
          if (res.confirm) {} else if (res.cancel) {}
        }
      });
      return
    } else {
      const items = this.data.items;
      const plusStatus = this.data.plusStatus;
      const minusStatus = this.data.minusStatus;
      const travalers = this.data.travalers;
      const values = e.detail.value;
      for (let i = 0, lenI = items.length; i < lenI; ++i) {
        items[i].checked = false;
        console.log(i, plusStatus[i]);
        plusStatus[i].disabled = true;
        minusStatus[i].disabled = true;
        for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
          if (items[i].value === values[j]) {
            items[i].checked = true;
            plusStatus[i].disabled = items[i].num < travalers.length ? false : true;
            minusStatus[i].disabled = items[i].num < 1 ? true : false;
            break
          }
        }
      }
      // console.log(items, plusStatus, minusStatus);
      this.setData({
        items,
        plusStatus,
        minusStatus,
        FLAG: true
      });
    }
  },
  /* 点击减号 */
  bindMinus: function (e) {
    const index = e.currentTarget.dataset.index;
    const minusStatus = this.data.minusStatus;
    if (minusStatus[index].disabled)
      return
    var num = this.data.items[index].num;
    // 如果大于1时，才可以减  
    if (num >= 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var plus_status = num < this.data.travalers.length ? false : true;
    var minus_status = num < 1 ? true : false;
    // 将数值与状态写回  
    this.setData({
      [`items[${index}].num`]: num,
      [`plusStatus[${index}].disabled`]: plus_status,
      [`minusStatus[${index}].disabled`]: minus_status
    });
    console.log('plusStatus', this.data.plusStatus);
  },
  /* 点击加号 */
  bindPlus: function (e) {
    const index = e.currentTarget.dataset.index;
    const plusStatus = this.data.plusStatus;
    if (plusStatus[index].disabled)
      return
    var num = this.data.items[index].num;
    // 不作过多考虑自增1  
    if (num < this.data.travalers.length)
      num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    var minus_status = num < 1 ? true : false;
    var plus_status = num < this.data.travalers.length ? false : true;
    // 将数值与状态写回  
    this.setData({
      [`items[${index}].num`]: num,
      [`plusStatus[${index}].disabled`]: plus_status,
      [`minusStatus[${index}].disabled`]: minus_status
    });
    console.log('minusStatus', this.data.minusStatus);
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    // 将数值与状态写回  
    this.setData({
      num: num
    });
  },

  delete(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const userInfo = app.globalData.accountInfo.userInfo;
    let travalers = this.data.travalers;

    wx.showModal({
      content: `确定要删除 ${travalers[index].name} 的乘机信息吗？`,
      success(res) {
        if (res.confirm) {
          travalers.splice(index, 1);
          if (!travalers.length) {
            const inputs = [{
                name: '姓名',
                value: userInfo.name,
                tag: 'name'
              },
              {
                name: '航班号',
                value: '',
                tag: 'flightNo'
              },
              {
                name: '座位号',
                value: '',
                tag: 'seatNo'
              },
            ];
            that.setData({
              inputs
            });
          }
          that.setData({
            showButton: travalers.length ? false : true,
            travalers
          });
          for (let i = 0; i < that.data.items.length; i++) {
            that.bindMinus({
              currentTarget: {
                dataset: {
                  index: i
                }
              }
            });
          }
          wx.showToast({
            title: '删除成功', // 提示的内容
            icon: 'success', // 图标，有效值：'success', 'loading', 'none'
            duration: 1500 // 提示的延迟时间，单位毫秒
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
    // this.setData({
    //   travalers
    // });
  },

  cancel() {
    const inputs = [{
        name: '姓名',
        value: '',
        tag: 'name'
      },
      {
        name: '航班号',
        value: '',
        tag: 'flightNo'
      },
      {
        name: '座位号',
        value: '',
        tag: 'seatNo'
      },
    ];
    this.setData({
      inputs,
      showButton: false,
      addTravaler: false
    });
  },

  edit(e) {
    const index = e.currentTarget.dataset.index;
    const travaler = this.data.travalers[index];
    const inputs = this.data.inputs;
    inputs.forEach((item, index) => {
      inputs[index].value = travaler[item.tag];
    });
    this.setData({
      inputs,
      showButton: true,
      isEdit: true,
      index
    });
  },

  confirm() {
    const that = this;
    const userInfo = this.data.userInfo;
    const inputs = this.data.inputs;
    const isEdit = this.data.isEdit;
    const index = this.data.index;
    let travalers = this.data.travalers;
    let params = {};
    let travaler = {};
    if (!userInfo) {
      wx.showModal({
        content: '请先注册用户信息',
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/register/register',
            });
          } else if (res.cancel) {}
        }
      });
      return
    } else {
      for (const element of inputs) {
        if (!element.value) {
          wx.showModal({
            content: `请输入 ${element.name}`,
            success(res) {}
          });
          return
        } else {
          travaler[element.tag] = element.value;
        }
      }

      inputs.forEach(item => {
        params[item.tag] = item.value;
      });
      wx.showLoading({
        title: '正在验证',
        mask: true
      });
      wx.request({
        url: `${config.url}/miniprogram/passenger_check`,
        method: 'POST',
        data: params,
        success(res) {
          wx.hideLoading();
          console.log(params);
          console.log(res.data);
          if (res.data.status == 400) {
            wx.showModal({
              title: '旅客信息验证失败,请前往柜台办理',
              content: `姓名：${params.name}\r\n 航班号：${params.flightNo} \r\n 座位号：${params.seatNo}`,
              complete: (res) => {}
            });
            return
          } else if (res.data.status == 200) {
            if (isEdit) {
              travalers[index] = travaler;
              wx.showToast({
                title: '修改成功', // 提示的内容
                icon: 'success', // 图标，有效值：'success', 'loading', 'none'
                duration: 1500 // 提示的延迟时间，单位毫秒
              });
            } else {
              travaler.flightNo = res.data.data.flightNo;
              travalers.push(travaler);
              const plusStatus = that.data.plusStatus;
              const items = that.data.items;
              console.log(plusStatus);
              items.forEach((item, index) => {
                item.checked ? plusStatus[index] = {
                  disabled: false
                } : null;
                items[index].num = travalers.length;
              });
              let userinfo = userInfo;
              userinfo.flightStartPlan = res.data.data.flightStartPlan;
              app.globalData.accountInfo.userInfo = userinfo;
              that.setData({
                plusStatus,
                items,
                userInfo: userinfo
              });
              wx.showToast({
                title: '添加成功', // 提示的内容
                icon: 'success', // 图标，有效值：'success', 'loading', 'none'
                duration: 1500 // 提示的延迟时间，单位毫秒
              });
            }
            that.setData({
              travalers,
              showButton: false,
              addTravaler: false,
              isEdit: false,
              inputs: [{
                  name: '姓名',
                  value: '',
                  tag: 'name'
                },
                {
                  name: '航班号',
                  value: '',
                  tag: 'flightNo'
                },
                {
                  name: '座位号',
                  value: '',
                  tag: 'seatNo'
                },
              ]
            });
          } else {
            wx.showToast({
              title: res.data.statusText,
              icon: 'error', // 图标，有效值：'success', 'loading', 'none'
              duration: 1500,
            });
            return
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
  },

  handleblur(e) {
    console.log(e);
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value.replace(/\s+/g, '').toUpperCase();
    const inputs = this.data.inputs;

    if (!value) {
      inputs[index].value = value;
      this.setData({
        inputs: inputs
      });
      console.log(this.data.inputs);
    }
  },

  handleInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value.replace(/\s+/g, '').toUpperCase();
    const inputs = this.data.inputs;

    inputs[index].value = value;
    this.setData({
      inputs: inputs
    });
  },

  goToRegister() {
    const that = this;
    const userInfo = this.data.userInfo;
    console.log(userInfo);
    if (!userInfo) {
      if (this.data.goToFlag)
        return
      wx.showModal({
        content: '请先注册用户信息',
        success(res) {
          if (res.confirm) {
            that.setData({
              goToFlag: true
            });
            wx.redirectTo({
              url: '/pages/register/register',
            });
          } else if (res.cancel) {
            that.setData({
              goToFlag: false
            });
          }
        }
      });
      return
    }
  },

  plusTravaler() {
    const flightNo = this.data.travalers[0].flightNo;
    let inputs = [{
        name: '姓名',
        value: '',
        tag: 'name'
      },
      {
        name: '航班号',
        value: flightNo,
        tag: 'flightNo'
      },
      {
        name: '座位号',
        value: '',
        tag: 'seatNo'
      },
    ];

    this.setData({
      inputs,
      showButton: true,
      addTravaler: true
    });
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
          console.log(res);
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
            const items = data.data ? data.data.items : [{
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
              {
                value: 'towel',
                name: '压缩毛巾',
                checked: false,
                num: 0
              },
              {
                value: 'toothbrush',
                name: '牙刷牙膏套装',
                checked: false,
                num: 0
              },
              {
                value: 'earplugs',
                name: '耳塞',
                checked: false,
                num: 0
              },
            ];
            that.setData({
              travalers,
              items,
              showButton: travalers.length ? false : true,
              minusStatus: [{
                disabled: true
              }, {
                disabled: true
              }, {
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
              }, {
                disabled: true
              }, {
                disabled: true
              }],
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
          reject("请求失败");
        }
      });
    });
  },

  onHide() {
    // app.globalData.inputs = this.data.inputs;
  },

  onShow() {
    const that = this;
    const userInfo = app.globalData.accountInfo.userInfo;
    const travalers = app.globalData.accountInfo.travalers;
    const inputs = this.data.inputs;
    if (userInfo) {
      if (!travalers.length)
        inputs[0].value = userInfo.name;
      that.getReqDetail().then(res => {
        console.log(res);
        if (res.data) {
          const orderId = res.data.orderId;
          that.paintQRcode(orderId);
          that.setData({
            orderId
          });
        }else{
          that.setData({
            orderId: null
          });
        }
      });
    } else {
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
        {
          value: 'towel',
          name: '压缩毛巾',
          checked: false,
          num: 0
        },
        {
          value: 'toothbrush',
          name: '牙刷牙膏套装',
          checked: false,
          num: 0
        },
        {
          value: 'earplugs',
          name: '耳塞',
          checked: false,
          num: 0
        },
      ];
      this.setData({
        items,
        showButton: true,
        orderId: null
      });
    }
    this.setData({
      userInfo,
      inputs,
      travalers
    });
  },

  onLoad(options) {
    const selector = wx.createSelectorQuery();
    selector.select('#sectionHeight').boundingClientRect((rect) => {
      if (rect) {
        app.globalData.settings.sectionHeight = rect.height;
      }
    }).exec();

    const rpx = app.globalData.settings.rpx;
    const bottomPadding = app.globalData.settings.safeBottomPadding + (rpx * 100);
    const userInfo = app.globalData.accountInfo.userInfo;
    const travalers = app.globalData.accountInfo.travalers;
    const items = this.data.items;
    const inputs = this.data.inputs;
    inputs[0].value = userInfo ? userInfo.name : "";

    console.log(userInfo);
    console.log(travalers);
    this.setData({
      bottomPadding,
      rpx,
      userInfo,
      items,
      inputs,
      showButton: travalers.length ? false : true
    });

    if (userInfo) {
      try {
        this.getReqDetail().then(res => {
          if (res.data) {
            const orderId = res.data.orderId;
            this.paintQRcode(orderId);
            this.setData({
              orderId
            });
          }
        });
      } catch (err) {
        console.log(err);

      }
    } else {
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
        {
          value: 'towel',
          name: '压缩毛巾',
          checked: false,
          num: 0
        },
        {
          value: 'toothbrush',
          name: '牙刷牙膏套装',
          checked: false,
          num: 0
        },
        {
          value: 'earplugs',
          name: '耳塞',
          checked: false,
          num: 0
        },
      ];
      this.setData({
        items,
        orderId: null
      });
    }
  }
});