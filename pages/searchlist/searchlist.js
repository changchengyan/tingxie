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
    grade: "",
    index:1,
    font: app.globalData.font,
    nodouble: true,
    // 修改样式的数据
    grade_listBox: "not_show",
    loadding:false,
    size:12,
    loadMore:true,
    gradeArr:['一年级','二年级','三年级','四年级','五年级','六年级'],
    bookJson:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // that.setData({grade:'',index:1,size:12,bookJson:{}})
    that.loadBookList();
  },
  loadBookList:function(){
      //首次加载
      //上拉加载更多
      //下来全部刷新
      var that = this;
       //有必要加载更多，且没在请求加载中
      if(that.data.loadMore && !that.data.loadding)
      {        
          //if(getApp().globalData.weixinUserInfo.uid>0)
          //{       	
              that.setData({loadding:true});
              app.Dictation.searchBook
              (
              	that.data.grade,
              	that.data.index,
              	that.data.size,
                  function(res)
                  {                  
                      if(res.data.length>0)
                      {
                          //追加数据
                          that.data.book.count = res.data.length*1 + that.data.book.count*1;
                        that.data.book.list = that.data.book.list.concat(res.data);
                          //填充数据                         
                          for(var i=0;i<res.data.length;i++) {
                            
                            if(res.data[i].book_pic == "") {
                                //res.data[i].book_pic = "../images/no_image.png"
                            }
                          }
                          
                          that.setData({
                            book:that.data.book,
                            index: res.pageIndex + 1
                          });
                          for(var i=0;i<res.data.length;i++){
                          	for(var j=0;j<that.data.gradeArr.length;j++){
                          		if(res.data[i].book_grade==that.data.gradeArr[j]){
                          			if(that.data.bookJson[that.data.gradeArr[j]]){
                          				that.data.bookJson[that.data.gradeArr[j]].push(res.data[i]);
                          			}else{
                          				that.data.bookJson[that.data.gradeArr[j]]=[];
                          				that.data.bookJson[that.data.gradeArr[j]].push(res.data[i]);
                          			}
                          			
                          		}
                          	}
                          }
                          that.setData({bookJson:that.data.bookJson})
                      }
                      //如果不够12条，标记不用再加载更多
                      if(that.data.book.count==res.totalCount)
                      {
                          that.setData({loadMore:false});
                      }
                      that.setData({loadding:false});
                      wx.stopPullDownRefresh();
                  }
              );

          //}
          //else
          //{
            //setTimeout(that.loadBookList,100);
          //}
      }  	
  	
  },
  onPullDownRefresh: function(){
    
    if(this.data.loadding){
    	return;
    }else{
    	//先清空数据再加载
    	var book = {count:0,list:[]};
	    this.setData({
        book:book,
        loadding: false,
        size: 12,
        loadMore: true,
        bookJson: {}
      });
	    //加载
	    this.loadBookList();
    }
    
    
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
        that.setData({grade: "一年级"});
        break;
      case "grade2":
        that.setData({grade: "二年级"});
        break;
      case "grade3":
        that.setData({grade: "三年级"});
        break;
      case "grade4":
        that.setData({grade: "四年级"});
        break;
      case "grade5":
        that.setData({grade: "五年级"});
        break;
      case "grade6":
        that.setData({grade: "六年级"});
        break;
    }
    if(!that.data.nodouble){
    	return false;
    }else{
    	that.setData({
    		index:1,
    		loadding:false,
    		size:12,
    		loadMore:true,
    		book:{count:0,list:[]},
    		grade_listBox:'not_show',
    		nodouble:false,
    		bookJson:{}
    	});
    	setTimeout(function () { 
    		that.setData({nodouble:true})
    	}, 500)
    	that.loadBookList();   	
    }
    
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
  },

  //扫码添加书籍
  bindStartScan: function (event) {
    var that = this;
    that.setData({ add_book_way: "not_show" });
    wx.scanCode
      ({
        success: (res) => {
          app.Dictation.addBookByISBN
            (
            res.result,
            function (resbook) {
              if (resbook.data.success) {
                console.log(resbook.data.data);
                //把返回的数据插入到数组，放在第一个
                var resdata = resbook.data;
                var bookdata = that.data.book;
                var booklist = bookdata.list;
                var push = true;
                for (var i = 0; i < bookdata.list.length; i++) {
                  if (bookdata.list[i].id * 1 == resdata.data.id * 1) {
                    push = false;
                    that.swapArray(booklist, i);
                    that.setData({ book: bookdata });

                    break
                  }

                }

                if (push) {
                  var node =
                    [
                      {
                        book_name: resdata.data.book_name,
                        book_pic: resdata.data.book_pic,
                        id: resdata.data.id
                      }
                    ];

                  var loadLastId = that.data.loadLastId + 1;
                  bookdata.count++;
                  bookdata.total_count++;
                  bookdata.list = node.concat(booklist);

                  that.setData({
                    book: bookdata,
                    loadMore: true,
                    loadLastId: loadLastId
                  });
                }


                //that.loadBookList();

                wx.navigateTo({ url: '../book/book?book_id=' + resdata.data.id });

              }
              // 数据库中没有该书记提示用户自定义听写
              else {
                wx.navigateTo({ url: '../nobook/nobook' });
              }
            }
            );
        }
      });
  }
})