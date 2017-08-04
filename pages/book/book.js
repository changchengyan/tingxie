// book.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    book:{
      bookName: "",
      lessonList:[]
    },
    lesson_pic: "../../images/book/book.png",
    font: app.globalData.font,
    loadding: false,
    loadingText: '正在加载中',
    curPage: 1,
    totalPage: null,
    key_rest_count: 0,
    fistShow:true,
    sortName:[],
    sortJson:{},
    isLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	var that = this;
    console.log("页面加载完成")
  	
  	//如果是分享进入，则要将书籍添加到书架
  	that.bookId = options.book_id;
    console.log(options);
    that.setData({bookId:options.book_id,book:{bookName:options.book_name}});
    app.Dictation.ownKeyNum(uid, function (res) {
      that.setData({ key_rest_count: res.data.key_rest_count });
      console.log("钥匙个数为" + that.data.key_rest_count);
    });   
    if(options.share=="true")
    {
        app.userLogin(function(){
        	app.Dictation.getBookByShare(that.data.bookId,function(){
        		//加载课程列表
				    var uid = app.globalData.userInfo.weixinUser.uid;
            that.setData({
              uid: uid,
              bookId: options.book_id
            })
				    that.uid = uid;
            app.Dictation.getLessonList(uid, options.book_id, 1, 12,function(res){  
            	if(list[i].lesson_category==null){
			      		var sortName='课文';
			      	}else{
			      		var sortName=list[i].lesson_category;
			      	}
			      	
							var isSame=that.findArr(sortName,that.data.sortName);//有为真 没有为假
							if(isSame){
								that.data.sortJson[sortName].push(list[i]);
							}else{
								that.data.sortName.push(sortName);
								that.data.sortJson[sortName]=[];
								that.data.sortJson[sortName].push(list[i]);														
							}				
				      that.setData({
				        book: res.data,
                curPage: res.pageIndex,
                totalPage: res.pageTotal
				      })				      				      
				    });
				    //刷新书籍最后阅读时间
				    app.Dictation.updateBookReadTime(options.book_id,function(){});			
				    //添加应用实例浏览记录
				    var book_id=options.book_id;				    
            app.Dictation.addBrowser
            (
                book_id,
                'dictation',
                function(rbs)
                {
                  that.data.browserId = rbs.data.browser_id;
                }
            );
				    return false;
        	});
        });
    }
  	
    //加载课程列表
    var uid = app.globalData.userInfo.weixinUser.uid;
    this.setData({
      uid: uid,
      bookId: options.book_id
    })
    app.Dictation.getLessonList(uid, options.book_id, 1, 12,function(res){
      console.log(res);
      var list=res.data.lessonList;
      for(var i=0;i<list.length;i++){
      	if(list[i].lesson_category==null){
      		var sortName='课文';
      	}else{
      		var sortName=list[i].lesson_category;
      	}
      	
				var isSame=that.findArr(sortName,that.data.sortName);//有为真 没有为假
				if(isSame){
					that.data.sortJson[sortName].push(list[i]);
				}else{
					that.data.sortName.push(sortName);
					that.data.sortJson[sortName]=[];
					that.data.sortJson[sortName].push(list[i]);														
				}				
			}		
      that.setData({
        book: res.data,
        curPage: res.pageIndex,
        totalPage: res.pageTotal,
        sortName:that.data.sortName,
        sortJson:that.data.sortJson
      })
      //添加应用实例浏览记录
		    var book_id=options.book_id;
		    var book_name=that.data.book.bookName;
				app.Dictation.addBrowser
				(
				    book_id,
				    'dictation',
				    function(rbs)
				    {
				      //that.data.browserId = rbs.data.browser_id;
				    }
				);
    });
    //刷新书籍最后阅读时间
    app.Dictation.updateBookReadTime(options.book_id,function(){});
    that.setData({
      isLoading: true
    })
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
      if(!that.data.fistShow){
      	//再次打开页面时刷新数据,先清空
      	that.data.sortName=[];
      	that.data.sortJson={};
		    app.Dictation.getLessonList(that.data.uid, that.data.bookId,1,12, function (res) {
		    	
		    	var list=res.data.lessonList;
      for(var i=0;i<list.length;i++){
      		if(list[i].lesson_category==null){
      		var sortName='课文';
      	}else{
      		var sortName=list[i].lesson_category;
      	}
      	
				var isSame=that.findArr(sortName,that.data.sortName);//有为真 没有为假
				if(isSame){
					that.data.sortJson[sortName].push(list[i]);
				}else{
					that.data.sortName.push(sortName);
					that.data.sortJson[sortName]=[];
					that.data.sortJson[sortName].push(list[i]);														
				}				
      	
      }
      that.setData({
        book: res.data,
        curPage: res.pageIndex,
        totalPage: res.pageTotal,
        sortName:that.data.sortName,
        sortJson:that.data.sortJson
      })
		    });
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
  this.setData({fistShow:false})
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
    this.setData({
      loadding: false,
    });
    let { curPage, totalPage } = this.data;
    if (curPage > totalPage - 1) return false;
    this.load(++curPage)
    this.setData({
      loadding: true,
      loadText: "正在加载中"
    })
  },
  load: function (index) {
    let that = this;
    let newList = that.data.book.lessonList;
    app.Dictation.getLessonList(that.data.uid,that.data.bookId,index, 12, function (res) {
    	var list=res.data.lessonList;
      for(var i=0;i<list.length;i++){
      		if(list[i].lesson_category==null){
      		var sortName='课文';
      	}else{
      		var sortName=list[i].lesson_category;
      	}
      	
				var isSame=that.findArr(sortName,that.data.sortName);//有为真 没有为假
				if(isSame){
					that.data.sortJson[sortName].push(list[i]);
				}else{
					that.data.sortName.push(sortName);
					that.data.sortJson[sortName]=[];
					that.data.sortJson[sortName].push(list[i]);														
				}				
      }
      that.setData({
        book: res.data,
        curPage: res.pageIndex,
        totalPage: res.pageTotal,
        sortName:that.data.sortName,
        sortJson:that.data.sortJson
      })
      let newBook = {
        bookName: that.data.book.bookName,
        lessonList: newList.concat(res.data.lessonList)
      }  
      that.setData({
        book: newBook,
        curPage: index,
        totalPage: res.pageTotal,
        loadText: "正在加载中",
        sortName:that.data.sortName,
        sortJson:that.data.sortJson
      })
      // let { list } = that.data;
      // that.setData({ list: that.formatList(list) })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title: this.data.book.bookName,
      path: "/pages/book/book?book_id=" + this.bookId+"&share=true"
    }
  },
  //点击后跳转到单元内听写页面
  toUnitPage: function (event) {
    var lesson_id = event.currentTarget.dataset.lesson_id;
    let lesson_name = event.currentTarget.dataset.name;
    console.log(lesson_name);
    wx.navigateTo({
      url: '/pages/unit/unit?navigation_type=book&lesson_id=' + lesson_id + '&book_id=' + this.bookId + "&bookname="+this.data.book.bookName+'&lesson_name=' + lesson_name
    })
  },
  findArr:function(item,arr){
  	for(var i=arr.length-1;i>=0;i--){
  		if(item==arr[i]){
  			return true;
  		}
  	}
  	return false;
  }
})