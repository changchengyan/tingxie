// searchlist.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    book:
    {
      count: 0,
      list: []
    },
    grade: "选年级",
    index:1,
    imgHeight: 0,
    font: app.globalData.font,
    nodouble: true,
    // 修改样式的数据
    grade_listBox: "not_show"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    (function () {
      let index = that.data.index,
        grade = "",
        size = 21;
      // console.log(grade);
      app.Dictation.searchBook(grade, index, size, function (res) {
        let data = that.data.book.list.concat(res.data);
        index += 1;
        // console.log(index);
        that.setData({
          book: {
            count: 2,
            list: data
          },
          index: index,
          grade_listBox: "not_show"
        })
      });
    })();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var screenInfo = wx.getSystemInfoSync();
    var screenWidth = screenInfo.windowWidth;
    var itemWidth = ((screenWidth - 20) / 3 - 20) * 1.3
    this.setData({
      imgHeight: itemWidth
      // grade_list: "grade_list"
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  // 选择年级
  chooseGrade: function (e) {
    const that = this;
    switch(e.target.id){
      case "grade1":
        that.setData({
          grade: "一年级", index: 1, 
          book:
            {
              count: 0,
              list: []
            } });
        that.getBook();
        break;
      case "grade2":
        that.setData({
          grade: "二年级", index: 1, 
          book:
            {
              count: 0,
              list: []
            } });
        that.getBook();
        break;
      case "grade3":
        that.setData({
          grade: "三年级", index: 1, 
          book:
            {
              count: 0,
              list: []
            }, });
        that.getBook();
        break;
      case "grade4":
        that.setData({ 
          grade: "四年级", index: 1,
          book:
          {
            count: 0,
            list: []
          } });
        that.getBook();
        break;
      case "grade5":
        that.setData({ 
          grade: "五年级", index: 1,
          book:
          {
            count: 0,
            list: []
          } });
        that.getBook();
        break;
      case "grade6":
        that.setData({ 
          grade: "六年级", index: 1,
          book:
          {
            count: 0,
            list: []
          } });
        that.getBook();
        break;
    }
  },

  //按年级获取课本
  getBook: function () {
    const that = this;
    let index = that.data.index,
        grade = that.data.grade,
        nodouble = that.data.nodouble,
        size = 21;
    if(!nodouble) 
    {
      return false;
    }
    else
    {
      that.setData({nodouble:false});
    }
    (grade === "选年级")?grade="":grade=grade;
    // console.log(grade);
    app.Dictation.searchBook(grade, index, size, function (res) {
      let data = that.data.book.list.concat(res.data);
      index+=1;
      // console.log(index);
      that.setData({
        book: {
          count: 2,
          list: data
        },
        index:index,
        grade_listBox: "not_show",
        nodouble: true
      })
    });
  },

  // 显示或者隐藏年级列表
  showGradeList: function () {
    const that = this;
    if(that.data.grade_listBox === "not_show"){
      this.setData({ grade_listBox: "grade_listBox" });
    }
    else{
      this.setData({ grade_listBox: "not_show" });
    }
  },

  hideGradeList: function () {
    this.setData({grade_listBox: "not_show"});
  },

  //点击书籍后跳转到内容页面
  toBookPage: function (event) {
    //允许跳转时才处理
      if (this.data.nodouble) {
        var book_id = event.currentTarget.dataset.bookId;
        var book_index = event.currentTarget.dataset.bookIndex;
        var that = this;
        console.log(book_id,book_index);
        wx.setStorageSync("bookId", book_id);
        wx.setStorageSync("ReturnBook", "deskBook")

        //console.log("index="+book_index);
        that.data.nodouble = false;
        //禁止1s中内连续打开书籍
        setTimeout(function () { that.data.nodouble = true }, 1000)
        wx.redirectTo({ url: '/pages/book/book?book_id=' + book_id });
        app.Dictation.getBookByShare(book_id);

      }
  }
})