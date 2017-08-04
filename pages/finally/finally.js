
var app = getApp();
Page({
  data: {
    star: 0,
    currLessonId: 0,
    navigation_type: null,
    book_name: null,
    book_id: 0,
    lesson_name: null
  },


  //回到列表
  returnList: function () {
    let pages = getCurrentPages(),
      delta;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].route == 'pages/book/book' || pages[i].route == 'pages/word/word') {
        delta = pages.length - i - 1;
        break;
      }
      if (pages[i].route == 'pages/unit/unit') {
        wx.navigateBack({
          url: '../word',
        })
      }
    }
    wx.navigateBack({ delta })

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
	let that=this;
	wx.redirectTo({
		url:`/pages/play/play?navigation_type=${that.data.navigation_type}&lessonId=${that.data.currLessonId}&book_id=${that.data.book_id}&bookname=${that.data.book_name}&lessonName=${that.data.lesson_name}`
	})

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      star: options.star,
      currLessonId: options.lessonId,
      navigation_type: options.navigation_type,
      book_name: options.book_name,
      book_id: options.book_id,
      lesson_name: options.lessonName
    })
    console.log(options.navigation_type, options.book_name, options.book_id, options.lessonName)
    //console.log(that.data.star)
    // console.log(that.data.currLessonId)
  }
})