import Modal from '../../components/modal/modal.js'
var app = getApp();
Page({
  data: {
    list: [],
    curPage: 1,
    loadText: "正在加载中",
    startTime: null,
    isLoading: false,
    currLessonId: 0,
    star: 0,
    navigation_type: null,
    book_name: null,
    lesson_name: null,
    book_id: null,
    loadMore: true,
    loadding: false,
    isFirstShow: true,
    pageSize:12,
    isSubMit:false,
    // 提交之后得到成绩
    isImprove: 0,
    rankPercent: 0,
    testTime: 0,
    wordNum: 0

  },
  click: function (e) {
    let that = this
    let { lessonid, index, title } = e.currentTarget.dataset
    if(that.data.loadding){
    	return;
    }
    if (Date.now() - this.data.startTime < 200) {
      wx.navigateTo({
        url: `/pages/unit/unit?navigation_type=custom&lesson_id=${lessonid}&lesson_name=${that.data.list[index].lesson_name}`
      })
    }
  },
  //上拉加载
  onReachBottom: function () {
    this.loadMore();
  },
  loadMore: function () {
    var curPage = this.data.curPage;
    this.load(curPage)
  },
  load: function (index) {
    var that = this;
    if (that.data.loadMore && !that.data.loadding) {
      that.setData({ loadding: true });
      app.Dictation.getCustomList(index, that.data.pageSize, function (res) {
        var lists = res.data;
        that.data.list = that.data.list.concat(lists);
        //如果不够12条，标记不用再加载更多
        if (that.data.list.length == res.totalCount) {
          that.setData({ loadMore: false });
        }
        that.setData({
          list: that.data.list,
          curPage: res.pageIndex + 1,
          loadding: false,
          isLoading: true
        })
      });
    }
  },
  onLoad: function (options) {
    let that = this;
    that.load(1);
    that.modal = new Modal();
    console.log(options)
    if(options.isSubMit){//unit页面分享出去听完后返回word
    	that.setData({
    		isSubMit:options.isSubMit,
    		star: options.star, 
    		currLessonId: options.currLessonId,
    		navigation_type: options.navigation_type, 
    		book_id: options.book_id, 
    		lesson_name: options.lesson_name,
        disOrder: options.disOrder
    	})
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
              loadding: false
            })
          }
        }
      });
    //再次打开页面时刷新数据
    if (!that.data.isFirstShow) {
    	that.data.curPage=1;
    	that.data.loadMore=true;
    	that.data.loadding=false;    	
    	that.data.pageSize=that.data.list.length;
    	that.data.list=[];
      that.load(that.data.curPage);
    }

    if (that.data.isSubMit) {
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
    }
  },
  onHide: function () {
    this.setData({ isFirstShow: false })
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
    let { list } = this.data;
    let lessonId = e.currentTarget.dataset.lessonid
    if (Date.now() - this.data.startTime > 200) {
      this.modal.show({
        title: '确认要删除该自定义听写吗？',
        cancel: '再想想',
        submit: '确认删除',
        success: function () {
          app.Dictation.delCustomList(lessonId, function (res) {
            if (res.success) {
              var list = that.data.list;
              for (var i = 0; i < list.length; i++) {
                if (lessonId == list[i].id) {
                  list.splice(i, 1);
                  break;
                }
              }
              that.setData({ list: list })
              wx.showToast({
                title: "删除成功！",
                icon: 'success',
                duration: 700
              })
            } else {
              wx.showToast({
                title: "res.message",
                icon: 'success',
                duration: 1000
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
    this.setData({ add_book_way: " " });
    wx.navigateTo({
      url: '/pages/unit/unit?navigation_type=custom'
    })
  },

  //回到列表
  returnList: function () {
    let that = this;
    that.setData({ isSubMit: false })
  },
  //重新听写
  playAgain: function () {
    let that = this;
		wx.navigateTo({
      url: `/pages/play/play?navigation_type=${that.data.navigation_type}&lessonId=${that.data.currLessonId}&book_id=${that.data.book_id}&lessonName=${that.data.lesson_name}&disOrder=${that.data.disOrder}`
    })
    that.setData({ isSubMit: false })
  },
  //进入下一听写
  nextPlay: function () {
    let that = this;
    let { currLessonId } = this.data;
    app.Dictation.returnNext(currLessonId, function (res) {
      var lesson_id = res.data.lastId;
      if (lesson_id != 0) {
        var lessonName = res.data.lessonName;
        if (that.data.navigation_type == 'book'){
        	wx.navigateTo({
	          url: `/pages/unit/unit?navigation_type=${that.data.navigation_type}&lesson_id=${lesson_id}&book_id=${that.data.book_id}&lesson_name=${lessonName}`,
	        })
        }else if(that.data.navigation_type == 'custom'){
        	wx.navigateTo({
	          url: `/pages/unit/unit?navigation_type=${that.data.navigation_type}&lesson_id=${lesson_id}&&lesson_name=${lessonName}`
	        })
        }
      }else{
      	wx.showToast({
          title: '已经是最后一课听写',
        })
      }
      that.setData({ isSubMit: false })  
    })
  },
  catchTouchMove: function () {
    return false;
  }

})

