// book.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    book: {
      bookName: "",
      lessonList: []
    },
    lesson_pic: "../../images/book/book.png",
    font: app.globalData.font,
    loadding: false,
    loadMore:true,
    loadingText: '正在加载中',
    curPage: 1,
    totalPage: null,
    key_rest_count: 0,
    fistShow: true,
    sortName: [],
    sortJson: {},
    isLoading: false,
    returnload: false,
    currLessonId: 0,
    star: 0,
    navigation_type: null,
    book_name: null,
    lesson_name: null,
    book_id: null,
    type_p: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    //submit
    that.setData({
      star: options.star,
      currLessonId: options.lessonId,
      navigation_type: options.navigation_type,
      book_name: options.book_name,
      lesson_name: options.lessonName,
      type_p: options.type_p
    })
    //提交后显示得分页面
    if (that.data.type_p == 'type_p') { 
      that.setData({ returnload: true })
    }
    var uid = app.globalData.userInfo.weixinUser.uid;
    this.setData({uid: uid,book_id:options.book_id})
    //如果是分享进入，则要将书籍添加到书架
    if (options.share == "true") {
    	if(that.data.uid==0){//重新登陆
    		app.userLogin(function () { 
    			var uid = app.globalData.userInfo.weixinUser.uid;
          that.setData({uid: uid})
          getShareData();
    		});
    	}else{
    		getShareData();
    	}
    	that.addBrowser();
				function getShareData(){
					app.Dictation.ownKeyNum(uid, function (res) {
			      that.setData({ key_rest_count: res.data.key_rest_count });
			      console.log("钥匙个数为" + that.data.key_rest_count);
			    });
			    app.Dictation.getBookByShare(that.data.book_id, function () {
			    	//添加分享书籍
			    	that.getLessonListData();
			    });
				}			
      return false;
    }   
    console.log("非分享")
    app.Dictation.ownKeyNum(uid, function (res) {
      that.setData({ key_rest_count: res.data.key_rest_count });
      console.log("钥匙个数为" + that.data.key_rest_count);
    });
    //加载课程列表
    that.getLessonListData();
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
getLessonListData:function(){
	var that=this;
	if(that.data.loadMore && !that.data.loadding){
			that.setData({loadding:true});
			 app.Dictation.getLessonList(that.data.uid, that.data.book_id, that.data.curPage, 12, function (res) {
		      console.log(res);
		      var list = res.data.lessonList;
		      that.data.book.bookName=res.data.bookName;
		      that.data.book.lessonList=that.data.book.lessonList.concat(list);
		      for (var i = 0; i < list.length; i++) {
		        if (list[i].lesson_category == null) {
		          var sortName = '课文';
		        } else {
		          var sortName = list[i].lesson_category;
		        }
		
		        var isSame = that.findArr(sortName, that.data.sortName);//有为真 没有为假
		        if (isSame) {
		          that.data.sortJson[sortName].push(list[i]);
		        } else {
		          that.data.sortName.push(sortName);
		          that.data.sortJson[sortName] = [];
		          that.data.sortJson[sortName].push(list[i]);
		        }
		      }
		      //如果不够12条，标记不用再加载更多
          if(that.data.book.lessonList.length==res.totalCount)
          {
              that.setData({loadMore:false});
          }
		      that.setData({
		        book: that.data.book,
		        curPage: res.pageIndex+1,
		        totalPage: res.pageTotal,
		        sortName: that.data.sortName,
		        sortJson: that.data.sortJson,
		        isLoading:true,
		        loadding:false
		      })
		  });
	}

},
addBrowser:function(){
	var that=this;
	//添加应用实例浏览记录
      app.Dictation.addBrowser
      (
        that.data.book_id,
        'dictation',
        function (rbs) {
          //that.data.browserId = rbs.data.browser_id;
        }
      );
    //刷新书籍最后阅读时间
    app.Dictation.updateBookReadTime(that.data.book_id, function () { });
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    console.log("页面显示")
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
    if (!that.data.fistShow) {
      //再次打开页面时刷新数据,先清空
      that.data.sortName = [];
      that.data.sortJson = {};
      that.getLessonListData();
      app.Dictation.ownKeyNum(that.data.uid, function (res) {
        that.setData({ key_rest_count: res.data.key_rest_count });
        console.log("钥匙个数为" + that.data.key_rest_count);
      });

    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ fistShow: false })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
		
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },
  //上拉加载
  loadMore: function () {
  	var that = this;
	that.getLessonListData();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.book.bookName,
      path: "/pages/book/book?book_id=" + this.data.book_id + "&share=true"
    }
  },
  //点击后跳转到单元内听写页面
  toUnitPage: function (event) {
    var lesson_id = event.currentTarget.dataset.lesson_id;
    let lesson_name = event.currentTarget.dataset.name;
    console.log(lesson_name);
    wx.navigateTo({
      url: '/pages/unit/unit?navigation_type=book&lesson_id=' + lesson_id + '&book_id=' + this.data.book_id + "&bookname=" + this.data.book.bookName + '&lesson_name=' + lesson_name
    })
  },
  findArr: function (item, arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (item == arr[i]) {
        return true;
      }
    }
    return false;
  },
  //回到列表
  returnList: function () {
    let that = this;
    that.setData({ returnload: false })
    // let pages = getCurrentPages(),
    //   delta;
    // for (let i = 0; i < pages.length; i++) {
    //   if (pages[i].route == 'pages/book/book' || pages[i].route == 'pages/word/word') {
    //     delta = pages.length - i - 1;
    //     break;
    //   }
    //   if (pages[i].route == 'pages/unit/unit') {
    //     wx.navigateBack({
    //       url: '../word',
    //     })
    //   }
    // }
    // wx.navigateBack({ delta })

  },
  //重新听写
  playAgain: function () {
    //  let pages = getCurrentPages(),
    //    delta;
    //  for (let i = 0; i < pages.length; i++) {
    //    if (pages[i].route == 'pages/play/play') {
    //      delta = pages.length - i - 1;
    //      break;
    //    }
    //  }
    //  wx.navigateBack({ delta })
    let that = this;
    wx.redirectTo({
      url: `/pages/play/play?navigation_type=${that.data.navigation_type}&lessonId=${that.data.currLessonId}&book_id=${that.data.book_id}&bookname=${that.data.book_name}&lessonName=${that.data.lesson_name}`
    })
    console.log(that.data.currLessonId)
  },
  //进入下一听写
  nextPlay: function () {
    let that = this;
    let { currLessonId } = this.data;
    console.log(currLessonId)
    app.Dictation.returnNext(currLessonId, function (res) {
      var lesson_id = res.data;
      console.log(lesson_id);
      if (that.data.navigation_type == 'book' && lesson_id != 0) {
        wx.redirectTo({
          url: `/pages/unit/unit?navigation_type=${that.data.navigation_type}&lesson_id=${lesson_id}&book_id=${that.data.book_id}&bookname=${that.data.book_name}&lesson_name=${that.data.lesson_name}`,
        })
        console.log("book")
      } if (that.data.navigation_type == 'custom' && lesson_id != 0) {
        wx.redirectTo({
          url: `/pages/unit/unit?navigation_type=${that.data.navigation_type}&lesson_id=${lesson_id}`
        })
        //console.log('cc')
      }
      if (lesson_id == 0) {
        wx.showToast({
          title: '已经是最后一课听写',
        })
        return false;
      }
      console.log(currLessonId)

    })
  },
})