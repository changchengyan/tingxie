// pages/desktop/desktop.js
var template = require("../../utils/template.js");
var app = getApp();
Page({
  data:
  {
    book:
    {
      total_count: 0,
      list: []
    },
    loadding: false,
    loadLastId: 0,
    loadMore: true,
    toPage: true,
    longTimeOver: false,
    showDeleteBtn: false,
    ifShowBtn: false,
    ifTrueDel: false,
    bookId: "",
    bookIndex: "",
    nodouble: true,
    backFromSearch: false,
    muchDevice:false,//有多个设备
    //修改样式用的data
    isLoading: false,
    font: app.globalData.font,
    userInfo: {},
    now_personNum: 129381,
    isFirstShow: true,
    last_book_id: 0,// 上一次删除的book_id
    appBanner:[],
    currentIndex:0
  },
  //进入我的自定义
  toMyWord: function () {
    wx.navigateTo({
      url: '/pages/word/word'
    });
  },
  //获取在线人数
  setOnlineUserNum: function () {
    var that = this;
    app.Dictation.getOnlineUserNum(
      function (res) {
        that.setData({ now_personNum: res });
        wx.stopPullDownRefresh();
      }
    )
  },
  // 跳转到搜索书籍页面
  toSearchlist: function (e) {
  	var that=this;
    this.setData({ backFromSearch: true });
    if(!that.data.nodouble){
    	return false;
    }
    that.data.nodouble = false;
    if(e.target.dataset.grade){
    	wx.navigateTo({
	      url: '/pages/searchlist/searchlist?grade='+e.target.dataset.grade
	    })
    }else{//搜索全部
    	wx.navigateTo({
	      url: '/pages/searchlist/searchlist'
	    })
    }
    setTimeout(function () { that.data.nodouble = true }, 1000)
  },
  onShow: function () {
    const that = this;     
    var font = app.globalData.font;
    that.setData({font: font});
    if (!that.data.isFirstShow&&that.data.backFromSearch) {
	    	that.setData({ backFromSearch: false });
	      that.refreshPage();
    }
    that.hiddenDeleteBtn();
    that.noDel();
    that.setOnlineUserNum();
    that.adviserIdFun();
    that.addscene();

    //判断网络
    wx.getNetworkType
      ({
        success: function (res) {
          // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
          var networkType = res.networkType;
          if (networkType == "none") {
            wx.showToast({
              title: '网络异常',
              duration: 2000
            });

          }
        }
      });

  },

  onHide: function () {
    this.setData({ isFirstShow: false })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var adviser_id = wx.getStorageSync('adviser_id')
    return {
      title: "听写100",
      path: '/pages/desktop/desktop?adviser_id=' + adviser_id+'&preUid='+that.data.userInfo.weixinUser.uid + '&share=true'
    }
  },
  onLoad: function (options) {
    var that = this;
    //获取用户信息
    that.getUserInfo(options);
    if (options && options.adviser_id) {//通过链接过来的
      wx.setStorageSync('adviser_id', options.adviser_id);
    }
    
    if (options && options.scene) {//options.scene 
      wx.setStorageSync('scene', options.scene);
    }   
    if (options && options.share) {//分享过来的
    	var preUid=options.preUid;
    	app.Dictation.AddUserKeyByShared(preUid,function(){})    	
    }
		//获取banner广告
		app.Dictation.getAppBanner(function(res){
			console.log("广告时间")
			console.log(res)
			if(res.success){
        console.log("getAppBanner",res)
				that.setData({appBanner:res.data})
			}
			
		})
  },
  //广告跳转
  gotoSearchList:function(e){
      var url = e.currentTarget.dataset.urls
      wx.navigateTo({
        url: url,
      })
  },
  refreshPage: function () {
    this.data.book.total_count=0;
    this.data.book.list=[];
    this.data.loadding=false;
    this.data.loadLastId=0;
    this.data.loadMore=true;
    this.data.backFromSearch=true;
    
    //加载
    this.loadBookList();
  },
  onPullDownRefresh: function () {
    var that = this;
      //正文页下拉刷新
      //清空数据
      var book = { total_count: 0, list: [] };
      this.setData({
        book: book,
        loadding: false,
        loadLastId: 0,
        loadMore: true,
      });
      //加载
      this.loadBookList();
  },

  //获取userInfo
  getUserInfo: function (options) {
    let that = this;
    if (!app.globalData.userInfo) {
     setTimeout(that.getUserInfo, 100);
    }else {
      //更新数据
      that.setData({ userInfo: app.globalData.userInfo});     
      that.loadBookList();
    }
  },

  //adviserIdfunction
  adviserIdFun: function () {
    var that = this;
    if (!app.globalData.userInfo) {
      setTimeout(that.adviserIdFun, 100);
    } else {
      var adviser_id = wx.getStorageSync('adviser_id');
      console.log("缓存中adviser_id", adviser_id);

      if (!adviser_id ||  adviser_id == "0") {
        app.Dictation.GetUserSpreadAdviser(function (res) {
          console.log("GetUserSpreadAdviser", res)
          wx.setStorageSync('adviser_id', res.data.data.adviser_id);
          console.log("获得res.data.data.adviser_id成功", res.data.data.adviser_id)
        })
      } else {
        app.Dictation.InsertUserSpreadAdviser(adviser_id, function () {
          console.log("插入res.data.data.adviser_id成功", adviser_id)
        })
      }
    }

  },
  addscene:function(){
    var that = this;
    if (!app.globalData.userInfo) {
      setTimeout(that.addscene, 100);
    } else {
      if (wx.getStorageSync('scene')) {
        var Storagescene = wx.getStorageSync('scene')
        console.log("Storagescene", Storagescene)
        var scene = decodeURIComponent(Storagescene)
        app.Dictation.BindAppDevice(scene,function(){
        	that.setData({muchDevice:true})
        })
      }
    }
  },
  //解除绑定
  toUnbind:function(e){
  	var that=this;
  	var id=e.target.id;
    app.Dictation.GetAppDeviceIdByUid(function (res) {
      if (res.success) {
        var deviceId = res.data.app_device_id ;
        if (id == "unBind") {
          //解绑
          app.Dictation.DeleteBindingDevice(deviceId, function () {
            //
            that.setData({ muchDevice: false })
          })
        } else if (id == "quxiao") {
          //取消
          that.setData({ muchDevice: false })
        }
      }
    })
  
  }, 


  toBookPage: function (event) {
    //允许跳转时才处理
    console.log("11跳转")
    if (this.data.toPage) {
      if (this.data.nodouble) {
        var book_id = event.currentTarget.dataset.bookId;
        var book_index = event.currentTarget.dataset.bookIndex;
        var that = this;
        var app = function () {
          //数组元素移动，把当前点击的书籍排在第一位
          var new_book = that.data.book;
          var list = new_book.list;
          that.swapArray(list, book_index);
          that.setData({ book: new_book });
        }
        setTimeout(app, 500);
        that.data.nodouble = false;
        //禁止1s中内连续打开书籍
        setTimeout(function () { that.data.nodouble = true }, 1000)
        wx.navigateTo({ url: '/pages/book/book?book_id=' + book_id });

      }

    }else if (this.data.longTimeOver) {
      //一般为展示删除按钮后，再点击书籍，则需要隐藏删除按钮，并设置为可以跳转到书籍页的状态
      this.longTapReset();
    }


  },
  formSubmit:function(event){
  	var that=this;
    if (this.data.toPage) {
      console.log("22跳转")
      console.log(event)
      var formData = {};//{"form_id":"0","expire_time":"2017-09-14 18:24:55.000"}
      var form_id = event.detail.formId;
      formData.form_id = form_id;
      var myDate = new Date();
      myDate.setDate(myDate.getDate() + 7);//设置7天后过期
      var cur_year = myDate.getFullYear();//获取年
      var cur_month = myDate.getMonth() + 1;//获取月
      var cur_day = myDate.getDate();//获取日
      var cur_hour = myDate.getHours();//获取小时
      var cur_min = myDate.getMinutes();//获取分钟
      var cur_sec = myDate.getSeconds();//获取秒
      var time = cur_year + '-' + template.toDouble(cur_month) + '-' + template.toDouble(cur_day) + ' ' + template.toDouble(cur_hour) + ':' + template.toDouble(cur_min) + ":" + template.toDouble(cur_sec);
      //expire_time
      formData.expire_time = time;
      app.globalData.formids.push(formData);
    }
   
  },
  longTapReset: function () {
    this.data.toPage = true;
    this.setData({ showDeleteBtn: false });
  },
  longTapBook: function (event) {
    var that = this;
    that.setData({
      longTimeOver: false,
      showDeleteBtn: true
    })
    this.data.toPage = false;
    setTimeout(function () { that.setData({ longTimeOver: true, ifShowBtn: true }) }, 1000);
  },
  hiddenDeleteBtn: function (event) {
    var that = this;
    if (that.data.ifShowBtn) {
      that.setData({ showDeleteBtn: false, ifShowBtn: false, toPage: true });
    }
  },

  deleteBook: function (event) {
    //点击按钮删除图书
    var book_id = event.currentTarget.dataset.bookId;
    if (book_id == this.data.last_book_id) { return }
    this.setData({ last_book_id: book_id })
    console.log(book_id);
    var book_index = event.currentTarget.dataset.bookIndex;
    ;
    this.setData({ ifTrueDel: true, bookId: book_id, bookIndex: book_index });
    this.sureDel();
  },
  noDel: function () {
    this.setData({ ifTrueDel: false });
  },
  sureDel: function () {
    var book_id = this.data.bookId;
    var book_index = this.data.bookIndex;
    var that = this;
    app.Dictation.deleteBook
      (
      book_id,
      function (res) {
        if (res.data.success) {
          var bookdata = that.data.book;
          bookdata.total_count--;
          bookdata.list.splice(book_index, 1);
          that.setData({ book: bookdata });

          var loadLastId = that.data.loadLastId - 1;
          that.setData({ loadLastId: loadLastId });

          //删除到已经没有书籍时
          console.log(bookdata.total_count)
          if (bookdata.total_count == 0) {
            that.longTapReset();
          }
        }
        else {
          wx.showToast
            ({
              title: res.data.message,
              icon: 'success',
              duration: 2000
            })
          that.loadBookList();
        }

      }
      );
    this.setData({ ifTrueDel: false });
  },
  loadBookList: function () {
    //首次加载、下来全部刷新
    var that = this;
    //有必要加载更多，且没在请求加载中
    if (!app.globalData.userInfo) {
      setTimeout(that.loadBookList, 100);
    }
    else {
      if (that.data.loadMore && !that.data.loadding) {
          that.setData({ loadding: true });
          app.Dictation.getDeskBookList
            (
            function (res) {
              var data = res.data;
              for(var i=0;i<data.length;i++) {
                var bookPic = data[i].book_pic;     
                data[i].book_pic = bookPic.substring(0, bookPic.length - 4) + "_c" +  bookPic.substring(bookPic.length - 4)
              }
              var total_count = res.data.length * 1;
              that.setData({
                book: {
                  total_count: total_count,
                  list: data
                },
                loadding: false,
                isLoading: true
              })
              wx.stopPullDownRefresh();
            },
          );
      }
    }

  },
  swapArray: function (arr, index1) {
    if (index1 > 0) {
      var item = arr[index1];
      arr.splice(index1, 1);
      arr.splice(0, 0, item);
    }
  },
  bindChange:function(e){
  	var current=e.detail.current;
  	this.setData({currentIndex:current})
  },
  touchMove:function(){
  	return false;
  }
})