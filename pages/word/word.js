import Modal from '../../components/modal/modal.js'
var app = getApp();
Page({
  data: {
    list: [],
    curPage: 1,
    totalPage: null,
    loadText: "正在加载中",
    loadding: false,
    ref: false,
    startTime: null,
    isLoading: false,
    returnload: false,
    currLessonId: 0,
    star: 0,
    navigation_type: null,
    book_name: null,
    lesson_name: null,
    book_id: null,
    type_p: '',
  },
  click: function (e) {
    let that = this
    let { lessonid } = e.currentTarget.dataset
    console.log(lessonid)
    if (Date.now() - this.data.startTime < 200) {
      wx.navigateTo({
        url: `/pages/unit/unit?navigation_type=custom&lesson_id=${lessonid}`,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },
  //上拉加载
  loadMore: function () {
    this.setData({
      loadding: false,
    })
    let { list, curPage, totalPage } = this.data;
    if (curPage > totalPage - 1) return false;
    this.load(++curPage)
    this.setData({
      loadding: true,
      loadText: "正在加载中"
    })
  },
  load: function (index) {
    let that = this;
    let newList = that.data.list;
    app.Dictation.getCustomList(index, 10, function (res) {
      console.log(res);
      that.setData({
        list: newList.concat(res.data),
        curPage: index,
        totalPage: res.pageTotal,
        loadText: "正在加载中"
      })
      let { list } = that.data;

      that.setData({ list })
      if(index==1) {
        that.setData({ isLoading:true})
      }
    })
  },
  //格式化列表
  formatList: function (list) {
    for (var i = 0; i < list.length; i++) {
      list[i].lesson_name = list[i].lesson_name.replace(/-/g, '/');
    }
    return list
  },
  onLoad: function (options) {
    let that = this;
    that.load(1);
    that.modal = new Modal()
    console.log(that.data.list)

//submit
    that.setData({
      star: options.star,
      currLessonId: options.lessonId,
      navigation_type: options.navigation_type,
      book_name: options.book_name,
      book_id: options.book_id,
      lesson_name: options.lessonName,
      type_p: options.type_p
    })

    //提交后显示得分页面
    if (that.data.type_p == 'type_p') {
      that.setData({ returnload: true })
    }

  },
  //判断网络
  onShow: function () {
    let that = this
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
            that.setData({
              loadding: true
            })
          }
        }
      });
    //再次打开页面时刷新数据
    app.Dictation.getCustomList(1, 10, function (res) {
      that.setData({
        list: res.data
      })
    })
  },
  //bindtouchstart时候触发 
  setTapStartTime: function () {
    this.setData({
      startTime: Date.now()
    })
  },
  //长按删除某条自定义
  onDelete: function (e) {
    let that = this
    //console.log(Date.now() - this.data.startTime)
    //console.log(that.data.startTime)
    let { list } = this.data;
    let lessonId = e.currentTarget.dataset.lessonid
    //let  index= e.currentTarget.dataset.index;
    //console.log(lessonId)
    if (Date.now() - this.data.startTime > 200) {
      this.modal.show({
        title: '是否删除该自定义听写',
        cancel: '否',
        submit: '是',
        success: function () {
          app.Dictation.delCustomList(lessonId, function (res) {
            if (res.success) {
              wx.showToast({
                title: "删除成功！",
                icon: 'success',
                duration: 2000
              })
              app.Dictation.getCustomList(1, 10, function (res) {
                that.setData({
                  list: res.data
                })
              })
            } else {
              wx.showToast({
                title: "res.message",
                icon: 'success',
                duration: 2000
              })
            }
          })
        },
        fail: function (e) {

        }
      })
    }
  },
  //进入自定义界面
  selfBook: function () {
    this.setData({ add_book_way: "not_show" });
    wx.navigateTo({
      url: '/pages/unit/unit?navigation_type=custom',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
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

