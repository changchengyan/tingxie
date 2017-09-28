// book.js
var template = require("../../utils/template.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    book: {
      isPay: "",
      bookName: "",
      lessonList: {},
      allList: []
    },
    loadding: false,
    money: 0,
    browser_id: 0,
    font: app.globalData.font,
    loadingText: '正在加载中',
    key_rest_count: 0,
    fistShow: true,
    isLoading: false,
    isSubMit: false,
    currLessonId: 0,
    star: 0,
    navigation_type: null,
    lesson_name: null,
    book_id: null,
    submitData: {},
    uid: 0,
    submitShow: true,
    book_img: "",
    noDouble: true,
    topay: false, //支付弹框
    isClick: true,
    lastTop: 0,//上下滑动
    direction: "up",
    categoryList: [],
    ifLoad: [],
    currentIndex: 0,
    starList:{},
    // 提交之后得到成绩
    isImprove:0,
    rankPercent:0,
    testTime:0,
    wordNum:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options);
    if (app.globalData.userInfo) {
      var uid = app.globalData.userInfo.weixinUser.uid;
      that.setData({ uid: uid })
    }
    that.setData({ book_id: options.book_id })
    console.log(options)
    if (options && options.adviser_id) {
      wx.setStorageSync('adviser_id', options.adviser_id);
    }
    //获取书籍分类
    app.Dictation.getCategoryByBookId(that.data.book_id, function (res) {
      console.log("获取书籍分类")
      console.log(res)
      if (res.success) {
        var categoryList = that.data.categoryList.concat(res.data.categoryList);

        that.setData({ categoryList: categoryList });
        var arr = [];
        for (var i = 0; i < res.data.categoryList.length; i++) {
          arr[i] = {
            loadMore: true,
            loadding: false,
            curPage: 1
          };
          that.data.book.lessonList[res.data.categoryList[i]] = [];
        }
        var lessonList = that.data.book.lessonList;
        that.setData({ ifLoad: arr, "book.lessonList": lessonList })
        that.getUserLessonsAndWords(that.data.currentIndex, function () {
          if (that.data.currentIndex < that.data.categoryList.length - 1) {
            that.getUserLessonsAndWords(that.data.currentIndex + 1, function () {
              if (that.data.currentIndex < that.data.categoryList.length - 2) {
                that.getUserLessonsAndWords(that.data.currentIndex + 2)
              }
            })
          }

        });
      }
    })


//from码书
if (options && options.isbn) {
  console.log("options", options)
  var isbn = options.isbn
  app.Dictation.GetBookByISBN(isbn, function (res) {
    console.log("res.data.success", res.data.success)
    if (res.data.success) {
      console.log('resresres=' + res.data.data[0].id)
      that.setData({ book_id: res.data.data[0].id });
      that.fromCodeBook()
    } else {
      that.setData({ isLoading: true })
      wx.showToast
        (
        {
          title: "课程维护中",
          icon: 'success',
          duration: 2000
        }
        )
    }

  })

  return false
}

//如果是分享进入，则要将书籍添加到书架
if (options.share == "true") {
  if (that.data.uid == 0) {//重新登陆
    app.userLogin(function () {
      var uid = app.globalData.userInfo.weixinUser.uid;
      that.setData({ uid: uid })
      getShareData();
      that.adviserIdFun();
      that.addBrowser();
      var preUid = options.preUid;
      app.Dictation.AddUserKeyByShared(preUid, function () { })
    });
  } else {
    var uid = app.globalData.userInfo.weixinUser.uid;
    that.setData({ uid: uid })
    getShareData();
    that.adviserIdFun();
    that.addBrowser();
    var preUid = options.preUid;
    app.Dictation.AddUserKeyByShared(preUid, function () { })
  }

  function getShareData() {
    app.Dictation.ownKeyNum(that.data.uid, function (res) {
      that.setData({ key_rest_count: res.data.key_rest_count });
      console.log("钥匙个数为" + that.data.key_rest_count);
    });
    app.Dictation.getBookByShare(that.data.book_id, function () {
      //添加分享书籍
      that.getUserLessonsAndWords();
    });
  }
  return false;
}
if (options.isSubMit) {//unit页面分享出去听完后返回book
  that.setData({
    isSubMit: options.isSubMit,
    star: options.star,
    currLessonId: options.currLessonId,
    navigation_type: options.navigation_type,
    book_id: options.book_id,
    lesson_name: options.lesson_name
  })
}


that.addBrowser();
app.Dictation.ownKeyNum(that.data.uid, function (res) {
  that.setData({ key_rest_count: res.data.key_rest_count });
  console.log("钥匙个数为" + that.data.key_rest_count);
});
    //加载课程列表
    //that.getLessonListData();
  },

/**
 * 生命周期函数--监听页面初次渲染完成
 */
onReady: function () {

},

adviserIdFun: function () {
  var that = this;
  var adviser_id = wx.getStorageSync('adviser_id');
  console.log("缓存中adviser_id", adviser_id)
  if (!adviser_id) {
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

},

//上滑加载更多数据
listMore: function() {
  var that = this;
  that.getUserLessonsAndWords();
  console.log("下拉加载")
},
//加载数据
getUserLessonsAndWords(idx, cb) {
  var that = this;
    if (idx) {
      var category = that.data.categoryList[idx];
      var index = idx;
      var loadMore = that.data.ifLoad[idx].loadMore;
      //var loadding=that.data.ifLoad[that.data.currentIndex].loadding;
      var curPage = that.data.ifLoad[idx].curPage;
    } else {
      var category = that.data.categoryList[that.data.currentIndex];
      var index = that.data.currentIndex;
      var loadMore = that.data.ifLoad[that.data.currentIndex].loadMore;
      //var loadding=that.data.ifLoad[that.data.currentIndex].loadding;
      var curPage = that.data.ifLoad[that.data.currentIndex].curPage;
    }
    console.log("执行取数据",that.data.loadding)
    if (loadMore && !that.data.loadding) {
      console.log("可以取数据")
    
      that.setData({loadding:true})
      app.Dictation.getUserLessonsAndWords(that.data.book_id, category, curPage, 10, function (res) {
        var list = res.data.lessonList;
        var bookName = res.data.bookName;
        console.log("list",list)
        if (bookName !== "") {
          if (bookName.length > 20) {
            let BookNameArr = bookName.split(" ");
            console.log(BookNameArr);
            var simplificationName = BookNameArr[0] + " " + BookNameArr[BookNameArr.length - 2] + " " + BookNameArr[BookNameArr.length - 1];
            if (simplificationName.length > 20) {
              let refSimplificationName = simplificationName.split(" ");
              simplificationName = refSimplificationName[0] + " " + refSimplificationName[refSimplificationName.length - 1]
            }
            that.setData({ "book.bookName": simplificationName })
          } else {
            that.setData({ "book.bookName": bookName });
          }
        }
        wx.setNavigationBarTitle({
          title: bookName
        })
        that.data.book.isPay = res.data.isPay;
        that.data.book.allList = that.data.book.allList.concat(list);
        that.data.book.lessonList[category] = that.data.book.lessonList[category].concat(list);
        //如果不够12条，标记不用再加载更多
        if (that.data.book.lessonList[category].length == res.totalCount) {
          that.data.ifLoad[index].loadMore = false;
        }
      
          that.data.starList[category]=[];
          for (var n = 0; n < that.data.book.lessonList[category].length; n++) {
            that.data.starList[category].push(that.data.book.lessonList[category][n].star)
          }
      

        // console.log("that.data.book.lessonList[category].length", that.data.book.lessonList[category].length)
        that.data.ifLoad[index].curPage = res.pageIndex + 1;
        that.setData({
          book: that.data.book,
          ifLoad: that.data.ifLoad,
          isLoading: true,
          loadding: false,
          starList: that.data.starList
        })
        if (cb) {
          cb();
        }

      });
    }
},

//滑动切换
changeCurrent: function(e) {
  var that = this;
  that.data.currentIndex = e.detail.current;
  var nowcategory = that.data.categoryList[e.detail.current];
  var nowbookList = that.data.book.lessonList[nowcategory];
  console.log("currentIndex", that.data.currentIndex)
  if (nowbookList) {
    that.getUserLessonsAndWords(that.data.currentIndex)
  }
  that.setData({ currentIndex: e.detail.current })

},
//点击切换
changeIndex: function(e) {
  var that = this;
  var currentIndex = e.currentTarget.dataset.index;
  that.setData({ current: currentIndex });

},

addBrowser: function () {
  var that = this;
  //添加应用实例浏览记录
  app.Dictation.addBrowser
    (
    that.data.book_id,
    'dictation_book',
    0,
    function (rbs) {
      that.data.browser_id = rbs.data.browser_id;
    }
    );
  //刷新书籍最后阅读时间
  if (that.data.navigation_type == 'book') {
    app.Dictation.updateBookReadTime(that.data.book_id, function () { });
  } else if (that.data.navigation_type == 'custom') {
    app.Dictation.updateBookReadTime(0, function () { });
  }

},
/**
 * 生命周期函数--监听页面显示
 */
onShow: function (options) {
  var that = this;
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
  console.log("show", that.data.fistShow, that.data.isSubMit)
  if (!that.data.fistShow) {
    app.Dictation.ownKeyNum(that.data.uid, function (res) {
      that.setData({ key_rest_count: res.data.key_rest_count });
      console.log("钥匙个数为" + that.data.key_rest_count);
    });
  }
  //用户点击分享过
  app.Dictation.GetUserBookIsClick(that.data.book_id, function (res) {
    that.setData({ isClick: res.data.isClick })
  })
  //回来后判断是否购买
  app.Dictation.GetUserBookIsPay(that.data.book_id, function (res) {
    that.setData({ "book.isPay": res.data.isPay });
    //  console.log("book.isPay",res.data.isPay);
  })
  if (that.data.isSubMit && that.data.submitShow) {
    var currLessonId = that.data.currLessonId;
    var list = that.data.book.lessonList;
    var currLessonName = '';
    for (var i = 0; i < list.length; i++) {
      if (currLessonId == list[i].id) {
        if (list[i].lesson_category == null || list[i].lesson_category == "undefined" || list[i].lesson_category == " ") {
          currLessonName = "课文";
        } else {
          currLessonName = list[i].lesson_category;
        }
        break;
      }
    }
    //听写完毕后的返回
    var dataUrl = "";
    switch (this.data.star) {
      case 0:
        dataUrl = "http://image.chubanyun.net/sound/Dictation/WinStar1.mp3"
        break;
      case 1:
        dataUrl = "http://image.chubanyun.net/sound/Dictation/good.mp3"
        break;
      case 2:
        dataUrl = "http://image.chubanyun.net/sound/Dictation/great.mp3"
        break;
      case 3:
        dataUrl = "http://image.chubanyun.net/sound/Dictation/perfect.mp3"
        break;
      default: break;
    }
    wx.playBackgroundAudio({
      dataUrl: dataUrl,
      title: '',
    })
    if (that.data.testTime) {
      var categoryList = that.data.categoryList
      for (var i = 0; i < categoryList.length;i++){
        for (var j = 0; j < that.data.book.lessonList[categoryList[i]].length;j++) {
          if (that.data.currLessonId == that.data.book.lessonList[categoryList[i]][j].dictation_user_lesson_id) {
            if (that.data.starList[categoryList[i]][j] < that.data.star){
              that.data.starList[categoryList[i]][j] = that.data.star
            }
          
          }
        }
        
      }
    }
   
    that.setData({ submitShow: false, starList: that.data.starList})
  }
},

/**
 * 生命周期函数--监听页面隐藏
 */
onHide: function () {
  this.setData({ fistShow: false })
},
catchTouchstart: function () {
  return false;
},
/**
 * 生命周期函数--监听页面卸载
 */
onUnload: function () {
  var that = this
  app.Dictation.UpdateBrowserTime(that.data.browser_id, function () {

  })
},


/**
 * 用户点击右上角分享
 */
onShareAppMessage: function () {
  var that = this;
  var adviser_id = wx.getStorageSync('adviser_id');
  this.setData({ isClick: true })
  app.Dictation.SetUserBookIsClick(this.data.book_id, function () {

  })
  return {
    title: that.data.book.bookName,
    path: '/pages/book/book?book_id=' + that.data.book_id + '&adviser_id=' + adviser_id + '&share=true' + '&preUid=' + that.data.uid
  }
  console.log('/pages/book / book ? book_id = ' + that.data.book_id + ' & adviser_id=' + adviser_id + '&share=true')
},
//点击后跳转到单元内听写页面
toUnitPage: function (event) {
  var that = this;

  let ifShowFirst;
  if (that.data.noDouble) {
    that.setData({
      noDouble: false
    })
    var lesson_id = event.currentTarget.dataset.lesson_id;
    let lesson_name = event.currentTarget.dataset.name;
    console.log(lesson_name);
    wx.navigateTo({
      url: '/pages/unit/unit?navigation_type=book&lesson_id=' + lesson_id + '&book_id=' + that.data.book_id + '&lesson_name=' + lesson_name
    })

    setTimeout(function () {
      that.setData({
        noDouble: true
      })
    }, 500)
  } else {
    return false
  }

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
  that.setData({ isSubMit: false })
  that.setData({ submitShow: true })
},
//重新听写
playAgain: function () {
  let that = this;
  wx.navigateTo({
    url: `/pages/play/play?navigation_type=${that.data.navigation_type}&lessonId=${that.data.currLessonId}&book_id=${that.data.book_id}&lessonName=${that.data.lesson_name}`
  })
  that.setData({ isSubMit: false })
  that.setData({ submitShow: true })
  // console.log(that.data.currLessonId)
},
//进入下一听写
nextPlay: function () {
  let that = this;
  let { currLessonId } = this.data;
  // console.log(currLessonId)
  app.Dictation.returnNext(currLessonId, function (res) {
    var lesson_id = res.data.lastId;
    if (lesson_id != 0) {
      var lessonName = res.data.lessonName;
    }

    if (that.data.navigation_type == 'book' && lesson_id != 0) {
      wx.navigateTo({
        url: `/pages/unit/unit?navigation_type=${that.data.navigation_type}&lesson_id=${lesson_id}&book_id=${that.data.book_id}&lesson_name=${lessonName}`,
      })
      // console.log("book")
    } if (that.data.navigation_type == 'custom' && lesson_id != 0) {
      wx.navigateTo({
        url: `/pages/unit/unit?navigation_type=${that.data.navigation_type}&lesson_id=${lesson_id}&lesson_name=${lessonName}`
      })
      //console.log('cc')
    }
    if (lesson_id == 0) {
      wx.showToast({
        title: '已经是最后一课听写',
      })
      return false;
    }
    that.setData({ isSubMit: false })
    that.setData({ submitShow: true })
    console.log(currLessonId)

  })
},
//去码书资源列表页
bindToCodeBook: function () {
  //获取码书对应的bookId 
  var book_id = this.data.book_id;
  app.Dictation.GetPlatformBookId(book_id, function (res) {
    // console.log("res.data.book_id", res.data.platformbook_Id)
    var path = `pages/book/book?book_id=${res.data.platformbook_Id}&fromDictation=${true}`
    wx.navigateToMiniProgram({
      appId: 'wx21293b1ab5fac316',
      path: path,
      envVersion: 'trial',
      success: function () {
        console.log("成功")
      }
    })
  })


},

//支付
topay: function () {
  var that = this;
  app.Dictation.GetBookInfoById(that.data.book_id, function (res) {
    var price = res.data.price;
    var pic = res.data.book_pic;
    res.data.book_pic = pic.substring(0, pic.length - 4) + "_c" + pic.substring(pic.length - 4)
    // console.log(res.data,"GetBookInfoById")
    if (!that.data.topay) {
      that.setData({ "topay": !that.data.topay, money: price, book_img: res.data.book_pic })
    }
  })
},
returnToUnit: function () {
  var that = this;
  that.setData({
    "topay": !that.data.topay,
  })
},
//立即购买
openAllBook: function () {
  var that = this;
  // that.setData({ goPayDetail: true,  });
  var adviser_id = wx.getStorageSync('adviser_id');
  console.log("openAllBook", adviser_id)
  if (adviser_id == 0) {
    app.Dictation.GetUserSpreadAdviser(function (res) {

      if (res.data.success) {

        that.setData({ adviser_id: res.data.data.adviser_id });
        console.log(adviser_id, "调取adviser_id成功");
        fastBuySeed()
      }

    })
  } else {
    fastBuySeed()
  }

  function fastBuySeed() {
    console.log(that.data.uid, adviser_id)
    app.Dictation.fastBuySeed(that.data.uid, that.data.book_id, adviser_id, function (rts) {
      // console.log("当前书的课程回调成功");
      // console.log(rts);
      wx.requestPayment
        (
        {
          'timeStamp': rts.data.timeStamp,
          'nonceStr': rts.data.nonceStr,
          'package': rts.data.package,
          'signType': rts.data.signType,
          'paySign': rts.data.paySign,
          'success': function (res) {
            that.setData({ "book.isPay": true, topay: false });
          },
          'fail': function (res) {
            //支付失败
            // console.log("支付失败");
            // that.setData({ goTap: false });
            that.setData({ "book.isPay": false });
          }
        }
        );
      // console.log(rts);
    });
  }

},
//toContinue
toContinue: function () {
  var that = this;
  var lesson_id = "";
  var lessonName = "";
  var newBook = true
  var value = wx.getStorageSync('lastLesson')
  if (value) {
    for (var i = 0; i < value.length; i++) {
      if (value[i].book_id == that.data.book_id) {
        var lastLessonId = value[i].lesson_id;
        console.log("lastLessonId", lastLessonId)
        newBook = false
      }
    }
    if (!newBook) {
      for (var i = 0; i < that.data.book.allList.length; i++) {
        if (that.data.book.allList[i].dictation_user_lesson_id == lastLessonId) {
          lessonName = that.data.book.allList[i].lesson_name;
          wx.navigateTo({
            url: '/pages/unit/unit?navigation_type=book&lesson_id=' + lastLessonId + '&book_id=' + that.data.book_id + '&lesson_name=' + lessonName
          })
        }
      }
    } else {
      console.log("console.log(that.data.book.allList)", that.data.book.allList)
      lesson_id = that.data.book.allList[0].dictation_user_lesson_id;
      lessonName = that.data.book.allList[0].lesson_name;
      wx.navigateTo({
        url: '/pages/unit/unit?navigation_type=book&lesson_id=' + lesson_id + '&book_id=' + that.data.book_id + '&lesson_name=' + lessonName
      })
    }



  } else {
    console.log("console.log(that.data.book.allList)", that.data.book.allList)
    lesson_id = that.data.book.allList[0].dictation_user_lesson_id;
    lessonName = that.data.book.allList[0].lesson_name;
    wx.navigateTo({
      url: '/pages/unit/unit?navigation_type=book&lesson_id=' + lesson_id + '&book_id=' + that.data.book_id + '&lesson_name=' + lessonName
    })
  }



},
scroll: function (e) {
  console.log("scroll")
  console.log(e.detail.scrollTop, this.data.lastTop, e.detail.scrollTop - this.data.lastTop)
  var direction;
  if (e.detail.scrollTop <= 0) {
    direction = "up";
    if (this.data.direction != direction) {
      this.setData({ direction: direction })
    }
    return;
  }
  if (e.detail.scrollTop - this.data.lastTop < -10 && !this.data.loadding) {//向下
    direction = "up"
  } else if (e.detail.scrollTop - this.data.lastTop >= 0 && !this.data.loadding) {
    direction = "down"
  }
  this.data.lastTop = e.detail.scrollTop
  if (this.data.direction != direction) {
    this.setData({ direction: direction })
  }
},
fromCodeBook: function () {
  let that = this
  if (that.data.uid == 0) {//重新登陆
    app.userLogin(function () {
      console.log("that.data.uid1", that.data.uid)
      var uid = app.globalData.userInfo.weixinUser.uid;
      that.setData({ uid: uid })
      console.log('res', that.data.uid)
      console.log('000')
      app.Dictation.getBookByShare(that.data.book_id, function () {
        //添加分享书籍
        that.getUserLessonsAndWords();
        that.addBrowser();
        app.Dictation.ownKeyNum(that.data.uid, function (res) {
          that.setData({ key_rest_count: res.data.key_rest_count });
          console.log("钥匙个数为" + that.data.key_rest_count);
        });
      });
    })
  } else {
    console.log("that.data.uid2", that.data.uid)
    var uid = app.globalData.userInfo.weixinUser.uid;
    that.setData({ uid: uid })
    app.Dictation.getBookByShare(that.data.book_id, function () {
      //添加分享书籍
      that.getUserLessonsAndWords();
      that.addBrowser();
      app.Dictation.ownKeyNum(that.data.uid, function (res) {
        that.setData({ key_rest_count: res.data.key_rest_count });
        console.log("钥匙个数为" + that.data.key_rest_count);
      });
    });

  }
},
//模板消息
formSubmit: function(event) {
  var that = this;
  console.log("课文跳转")
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
  console.log(app.globalData.formids)

}
})