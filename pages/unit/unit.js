// pages/word/word.js
var templateJs = require("../../utils/template.js");

var util = require("../../utils/util.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    book_id: null,
    lesson_id: null,
    browser_id:0,
    dictation_lesson_id: 0,
    words: [],
    words_show: [],//显示的词（标准词删除后再添加要放到标准词汇后面）
    standard_words: [],//标准词
    del_words: [],//删除的词（标准和非标准）
    del_words_show: [],//删除的词（标准）
    share_words: [],
    share_words_show: [],
    words_number: 0,
    user_input: "",
    input_area_display: false,
    button_display: "show",
    navigation_type: "book",
    focus: false,
    font: app.globalData.font,
    nodouble: true,
    isEdit: false,
    longTimeOver: false,
    isRepeat: false,
    showKey: false,
    lesson_name: null,
    book_name:null,
    canPlay: true,
    key_rest_count: 0,
    uid: 0,
    unlock: "loading",
    isFirstShow: true,
    money: '0.00',
    isLoading: false,
    input_count: 0,
    input_disabled: false,
    title_input: null,
    placeholder: '',
    caseShow: false,
    isShare: false,
    goOther: false,
    noDouble: true,
    book_img:"",
    ifSort:true,
    originalWord:[],
    toView: 'bottom',
    highFrequency_ifShow: '',
    hotWords: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, "options")
    var that = this;
    that.setData({options:options})
    //uid是否存在
    if (app.globalData.userInfo) {
      var uid = app.globalData.userInfo.weixinUser.uid;
      that.setData({ uid: uid })

    } else {
      app.userLogin(function () {
        var uid = app.globalData.userInfo.weixinUser.uid;
        that.setData({ uid: uid })

      });
    }
    if (options && options.adviser_id) {
      wx.setStorageSync('adviser_id', options.adviser_id);
    }
    //是否是第一次显示高频词
    wx.getStorage({
	    key: 'highFrequency_ifShow',
	    success: function (res) {
	      console.log("已经进去过了");          
	      if(res.data=="show"){
	        that.setData({ highFrequency_ifShow: "hidden" })
	      }else{
	        that.setData({ highFrequency_ifShow: "hidden" })
	      }          
	    },
	    fail: function (res) {
	      that.setData({ highFrequency_ifShow: "show" })
	      wx.setStorageSync("highFrequency_ifShow", "show")          
	    }
    })
    that.setData({
      navigation_type: options.navigation_type,
      money: 0,
      uid: uid,
      lesson_name: options.lesson_name,
      title_input: options.lesson_name
      
    });
    
    if (options.navigation_type == "book") {//课本
    	//课本设置标题名字
      wx.setNavigationBarTitle({
        title: that.data.lesson_name + " "
      });
      that.setData({
        input_disabled: true
      })
    }
    if (options.navigation_type == "custom") {//自定义
    	//自定义设置标题名字
    	if(options.lesson_name){
    		wx.setNavigationBarTitle({
	        title:options.lesson_name
	      });
    	}else{
    		wx.setNavigationBarTitle({
	        title: "自定义听写"
	      });
    	}
      
    }


    if (options.book_id || options.book_id == 0) {
      this.setData({
        book_id: options.book_id
      })
    }
    if (options.lesson_id || options.lesson_id == 0) {
      this.setData({
        lesson_id: options.lesson_id
      })
    };

    if (options.share == 'true') {
      //分享页面过来的
      that.setData({ isShare: true })
      if (that.data.uid == 0) {//重新登陆
        app.userLogin(function () {
          var uid = app.globalData.userInfo.weixinUser.uid;
          that.setData({ uid: uid })
          that.adviserIdFun()
          var preUid=options.preUid;
    	  app.Dictation.AddUserKeyByShared(preUid,function(){})    	

        });
      } else {
        that.adviserIdFun();
        var preUid=options.preUid;
    	  app.Dictation.AddUserKeyByShared(preUid,function(){})    	
      }
      if (this.data.book_id || this.data.book_id == 0) {
        //课本 --已跳首页 

        if (that.data.uid) {
          var uid = app.globalData.userInfo.weixinUser.uid;
          that.setData({ uid: uid })
          that.getBookLessonByShare();

        } else {
          app.userLogin(function () {
            var uid = app.globalData.userInfo.weixinUser.uid;
            that.setData({ uid: uid })
            that.getBookLessonByShare();

          })
        }

      } else {
        //我的自定义
        if (that.data.uid) {
          that.getLessonByShare();
        } else {
          app.userLogin(function () {
            var uid = app.globalData.userInfo.weixinUser.uid;
            that.setData({ uid: uid })
            that.getLessonByShare();
          })
        }
      }
    } else {  	
      getLessonWord();
    }

    function getLessonWord() {
      console.log("tianjia")
      if (that.data.navigation_type === "book") {
        app.Dictation.getBookLessonWord(options.lesson_id, function (res) {

          that.setData({
            lesson_id: res.data.id,
            dictation_lesson_id: res.data.lesson_id,
            lesson_name: res.data.lesson_name,
            words: res.data.wordlist,
            originalWord:res.data.wordlist,
            standard_words: res.data.orignalwordlist,
            del_words: res.data.delwordlist,
            navigation_type: options.navigation_type
          })
          that.getShowWords(that.data.words);
          that.getDelShowWords(that.data.del_words);
          that.wordsCount(that.data.words);
          that.KeyInfo();
          that.addBrowser();
          //添加高频词汇--标准课程  分享进入的没有高频词汇
			    that.getHotWords()
          that.setData({
            isLoading: true
          })
        })
      }
      else if ((that.data.navigation_type === "custom") && (options.lesson_id)) {//已存在的自定义
        app.Dictation.getLessonWord(options.lesson_id, function (res) {
          //console.log(res)
          that.setData({
            lesson_id: res.data.id,
            dictation_lesson_id: res.data.lesson_id,
            lesson_name: res.data.lesson_name,
            title_input: res.data.lesson_name,
            words: res.data.wordlist,
            originalWord:res.data.wordlist,
            navigation_type: options.navigation_type,

          })
          that.getShowWords(that.data.words);
          that.wordsCount(that.data.words);
          that.addBrowser();
          that.setData({
            isLoading: true
          })
        })
      } else {//新建的自定义
        that.setData({
          //lesson_name: util.formatTime(new Date()),
          title_input: util.formatTime(new Date())
        })
        that.editShow();
        that.setData({
          isLoading: true
        })
      }
    }
   

  },
  getBookLessonByShare: function () {
    var that = this;
    app.Dictation.getBookLessonByShare(that.data.options.lesson_id, function (res) {
      console.log("getBookLessonByShare", res)
      that.setData({
        lesson_id: res.data.id,
        lesson_name: res.data.lesson_name,        
        originalWord:res.data.wordlist,
        standard_words: res.data.orignalwordlist,
        del_words: res.data.delwordlist,
        share_words: res.data.sharewordlist        
      })
      console.log("分享词汇")
      console.log(that.data.share_words)
      that.getDelShowWords(that.data.del_words);
      that.getShareShowWords(that.data.share_words);     
      that.KeyInfo()
      if(!that.data.ifSort){
      	var arr1=res.data.wordlist;
	      var arr2=that.data.words;
	      var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的
	      that.setData({words: newArr})
      	that.getShowWords(that.data.words);
      	
      }else{//乱序 实际为顺序
      	that.setData({words: res.data.wordlist})
      	that.getShowWords(that.data.words);
      }
      that.wordsCount(that.data.words);
      that.setData({
        isLoading: true
      })
    });
  },
  getLessonByShare: function () {
    var that = this;
    app.Dictation.getLessonByShare(that.data.options.lesson_id, function (res) {
      that.setData({
        lesson_id: res.data.id,
        lesson_name: res.data.lesson_name,
        words: res.data.wordlist,
      })
      that.getShowWords(that.data.words);
      that.wordsCount(that.data.words);
      that.setData({
        isLoading: true
      })
      return false;
    });
  },
  KeyInfo: function () {
    var that = this;
    if (that.data.navigation_type === "book") {
      app.Dictation.ifAssess(that.data.uid, that.data.lesson_id, function (res) {
        that.setData({ unlock: res.data.unlock });
      })
      app.Dictation.ownKeyNum(that.data.uid, function (res) {
        that.setData({ key_rest_count: res.data.key_rest_count });
      });
      app.Dictation.GetBookInfoById(that.data.book_id, function (res) {
        var price = res.data.price;
        var pic = res.data.book_pic;
        res.data.book_pic = pic.substring(0, pic.length - 4) + "_c" + pic.substring(pic.length - 4)
        that.setData({ money: price, book_img: res.data.book_pic,book_name:res.data.book_name })
      })
    }
  },
  addBrowser: function () {
    var that = this;
    //添加应用实例浏览记录
    app.Dictation.addBrowser
      (
      	that.data.lesson_id,      
      'dictation_lesson',
      that.data.dictation_lesson_id,
      function (rbs) {
        that.data.browser_id = rbs.data.browser_id;
      }
      );
    //刷新书籍最后阅读时间
    if(that.data.navigation_type=='book'){
    	app.Dictation.updateBookReadTime(that.data.book_id, function () { });
    }else if(that.data.navigation_type=='custom'){
    	app.Dictation.updateBookReadTime(0, function () { });
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
    //判断是iphone还是android
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search(/iPhone/) == -1) {
          //不是iPhone
          that.setData({ 'systemInfo.model': "Android" });
        } else {
          //是iPhone
          that.setData({ 'systemInfo.model': "iPhone" });
        }
      }
    })
    if (!that.data.isFirstShow && that.data.navigation_type === "book") {
      app.Dictation.ifAssess(that.data.uid, that.data.lesson_id, function (res) {
        console.log(res);
        if (res.success) {
          console.log(res.data.unlock)
          that.setData({ unlock: res.data.unlock });
        }
      })
      app.Dictation.ownKeyNum(that.data.uid, function (res) {
        that.setData({ key_rest_count: res.data.key_rest_count });
        console.log("钥匙个数为" + that.data.key_rest_count);
      });
      app.Dictation.GetBookInfoById(that.data.book_id, function (res) {
        var price = res.data.price;
        var pic = res.data.book_pic;
        res.data.book_pic = pic.substring(0, pic.length - 4) + "_c" + pic.substring(pic.length - 4)
        that.setData({ money: price, book_img: res.data.book_pic })
      })
      if (that.data.systemInfo.model == 'iPhone') {
        return false;
      }
      if (that.data.isShare && !that.data.goOther) {//分享的
        if (this.data.book_id || this.data.book_id == 0) {
          var uid = app.globalData.userInfo.weixinUser.uid;
          that.setData({ uid: uid })
          that.getBookLessonByShare();
        } else {
          //我的自定义
          that.getLessonByShare();
        }
      }


    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log(this.data.focus)
    this.setData({
      focus: false,
      isFirstShow: false
    })

  },

  /**
   * 返回的时候如果单词有修改，提交更新
   */
  onUnload: function () {
    //回退不播放
    wx.stopBackgroundAudio();
    wx.pauseBackgroundAudio();
    var that = this
    app.Dictation.UpdateBrowserTime(that.data.browser_id, function () {

    })
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    var adviser_id = wx.getStorageSync('adviser_id')
    if (that.data.navigation_type === "custom") {
      if (this.data.lesson_id === 0 || this.data.lesson_id === null) {
        //自定义编辑页--跳首页
        return {
          title: 'Rays听写',
          path: '/pages/desktop/desktop=' + '&adviser_id=' + adviser_id+'&preUid='+that.data.uid
        }
      } else {
        //我的自定义列表的单元页
        return {
          title: this.data.lesson_name,
          path: '/pages/unit/unit?navigation_type=' + this.data.navigation_type + '&lesson_id=' + this.data.lesson_id +'&lesson_name='+this.data.lesson_name + '&adviser_id=' + adviser_id + '&share=true'+'&preUid='+that.data.uid
        }
      }

    } else if (that.data.navigation_type === "book") {
      return {
        title: that.data.lesson_name,
        path: '/pages/unit/unit?navigation_type=' + that.data.navigation_type + '&lesson_id=' + that.data.lesson_id + '&share=true' + '&book_id=' + that.data.book_id + '&lesson_name=' + that.data.lesson_name + '&adviser_id=' + adviser_id+'&preUid='+that.data.uid
      }
    }
  },
  //计算单词总数
  wordsCount: function (words) {
  	console.log("词数")
  	console.log(words)
    var length = words.length;
    this.setData({
      words_number: length
    })
  },
  titleInput: function (e) {
    this.setData({
      title_input: e.detail.value,
    })
  },
  inputWord: function (e) {
    this.inputWordsCount();
    this.data.user_input = e.detail.value;
  },
  inputWordsCount: function () {
    var that = this;
    var count;
    setTimeout(function () {
      if ((that.data.user_input.replace(/(^\s*)/g, "") === "") || (that.data.user_input.length === 0)) {
        count = 0;
      }
      else {
        count = that.data.user_input.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "")
          .replace(/[；]+/g, "")
          .replace(/[;]+/g, "")
          .replace(/(^\n*)|(\n*$)/g, "")
          .replace(/\n+/g, "\n")
          .split("\n").length;
      }
      that.setData({
        input_count: count
      });
    }, 100)
  },
  sendWords: function (e) {
    var that = this;
    console.log(that.data.user_input);
    let regexp = /^[\u4e00-\u9fa5A - Za-z]+$/gi;
    console.log(regexp.test(that.data.user_input.charAt(0)))
//  if (regexp.test(that.data.user_input.charAt(0)==false)) {
//    wx.showToast({
//      title: '首字不合法',
//      duration: 1000
//    })
//    return false
//  }
    var input = that.emojiToSpace(that.data.user_input).replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "")
      .replace(/^[,，]+/g,'')
      .replace(/^[, ]+/g,'')
      .replace(/[；]+/g, "")
      .replace(/[;]+/g, "")
      .replace(/(^\s*)|(\s*$)/g, "")
      .replace(/(^\n*)|(\n*$)/g, "")
      .replace(/([，]+)/g, ",")
      .replace(/\n+/g, "\n")
      
    input = input.split("\n");
      
    //过滤敏感词汇
    //console.log("input", input)

    var checkTextTitle = that.data.title_input.replace(/\s/g,"")
    var checkText = input.join("，").replace(/\s/g, "") + "，" + checkTextTitle;
    if(checkText.length!=0){
    	check();
    }else{
    	judge();
    }
    function check(){
    	app.Dictation.checkText(checkText,function(res){
	    	//没有敏感词汇	 
	    	if(!judge()){
	    		return false;
	    	}
		    var input_norepeat = [];
		    input.forEach(function (value, index, input) {
		      if (input.indexOf(value) === index ) {
		        input_norepeat.push(value);
		      }
		      else {
		        that.setData({
		          isRepeat: true
		        })
		      }
		    })
		    var inputs = [];
		    for (var i = 0; i < input_norepeat.length; i++) {
		      var o = {
		        dictation_word: input_norepeat[i]
		      };
		      inputs.push(o);
		    }
		    for (var i = 0; i < inputs.length; i++) {
		      for (var j = 0; j < that.data.words.length; j++) {
		        if (inputs[i]) {
		          if (inputs[i].dictation_word === that.data.words[j].dictation_word) {
		            inputs[i].dictation_word = null;
		            that.setData({
		              isRepeat: true
		            })
		          }
		        }
		      }
		    }
		    var finalInput = [];
		    inputs.forEach(function (value, index, inputs) {
		      if (value.dictation_word !== null) {
		        var o = {
		          dictation_word: value.dictation_word,
		          is_standard: 0
		        }
		        finalInput.push(o);
		      }
		    })
		
		    var newWords = that.data.words.concat(finalInput);
		    that.setData({
		      words: newWords,
		      originalWord:newWords
		    })
		    that.wordsCount(that.data.words);
		    if (that.data.isRepeat) {
		      wx.showToast({
		        title: '重复单词已去除',
		        duration: 1000
		      })
		      that.setData({
		        isRepeat: false,
		        input_area_display: false,
		        button_display: "show",
		        user_input: "",
		        input_count: 0
		      })
		    }    
		    //点击添加后，更新单词表，获取mp3Url
		    if (that.data.lesson_id !== null) {
		      let wordlist = [];
		      finalInput.forEach(function (value, index) {
		        wordlist.push(value.dictation_word);
		      })
		      that.updataTitle();
		      wordlist = wordlist.join(";");
		      if (wordlist === "") {
		        return false;
		      }
		      app.Dictation.AddUserLessonWord(that.data.lesson_id, wordlist, function (res) {
		      	if(res.data.success){
		      		app.Dictation.getLessonWord(that.data.lesson_id, function (res) {
			          var arr1=res.data.wordlist;
			      		var arr2=that.data.words;
			      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
			        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
			          that.getShowWords(that.data.words);
			        })
		      	}
		      });
		    }
		    else {
		      var wordList = [];
		      that.data.words.forEach(function (value, index, array) {
		        wordList[index] = value.dictation_word;
		      })
		      wordList = wordList.join(";");
		      app.Dictation.addLesson(wordList, that.data.title_input, function (res) {
		        that.setData({
		          lesson_id: res.data.userLessonId,
		        })
		        app.Dictation.getLessonWord(that.data.lesson_id, function (res) {
		          var arr1=res.data.wordlist;
		      		var arr2=that.data.words;
		      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
		        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
		          that.getShowWords(that.data.words);		          
		        })
		        that.updataTitle();
		      })
		      
		    }
		    //that.getShowWords(that.data.words);
		    //清空输入
		    that.setData({
		      user_input: "",
		      isRepeat: false,
		      input_area_display: false,
		      button_display: "show",
		      focus: false,
		      input_count: 0,
		    });
	    },function(res){    	
	    	if(!res.success){//检测未通过
	    		wx.showToast({
		        title: '有敏感词输入',
		        duration: 1000
		      })
	    		return false;
	    	}    	
	    });
    	
    } 
    
    function judge(){//输入为空的判断
    	//that.data.lesson_id ==null&&that.data.words.length == 0 && that.data.user_input.length == 0 && that.data.title_input !== that.data.lesson_name
    	if((that.data.navigation_type === "custom") && (!that.data.lesson_id)&& that.data.user_input.length == 0){//新建的自定义
    		wx.showToast({
	        title: '不能新建为空',
	        duration: 1000
	      })
	      return false;
    	}else if((that.data.navigation_type === "custom") &&that.data.lesson_id&& that.data.user_input.length == 0&&that.data.title_input !== that.data.lesson_name){
    		  wx.showToast({
    		  title: '修改标题成功',
		        duration: 1000
		      })
    		  that.updataTitle();
		      return false;
    	}else if(that.data.user_input.length == 0){
    		wx.showToast({
			  title: '内容不能为空',
		        duration: 1000
		      })
		      return false;
    	}else{
    		that.setData({ input_area_display: false })
    		return true;
    	}
    }
  },
  //二次过滤imoji图标
  emojiToSpace: function ($text) {
    return $text.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, '');
  },
  updataTitle: function () {
    var that = this;
    if (!that.data.input_disabled) {
      if (that.data.title_input !== that.data.lesson_name) {
        app.Dictation.UpdateCustomLessonTitle(that.data.title_input, that.data.lesson_id, function (res) {
          wx.setNavigationBarTitle({
            title: that.data.title_input,
          })
          that.setData({
            lesson_name: that.data.title_input
          })
          that.editHide();
        })
      }
    }
  },
  //输入框的隐藏和显示
  editShow: function () {
    var that = this;
    this.setData({
      input_area_display: true,
      button_display: "hide",
      focus: true,
      caseShow: false
    });
    setTimeout(function () {
      that.setData({
        placeholder: `
          词汇用换行隔开，逗号用于解释或翻译。
          例：
          花,花朵的花
          果,果实的果
          apple,苹果
          pencil,铅笔
           ` })
    }, 500)
  },
  editHide: function (e) {
    var that = this;
    this.setData({
      input_area_display: false,
      button_display: "show",
      focus: false,
    });
  },
  gotoNext: function () {
    let that = this;
    if (that.data.nodouble) {
      that.data.nodouble = false;
      //禁止1s中内连续点击
      setTimeout(function () { that.data.nodouble = true }, 1000);
      //判断是否为空
      if (that.data.words_number === 0) {
        wx.showToast({
          title: '单词不能为空',
          icon: '',
          image: '',
          duration: 2000,
          mask: true,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
        return false;
      }
      //如果从书籍跳转过来
      if (that.data.navigation_type === "book") {
        wx.stopBackgroundAudio();
        that.setData({ goOther: true })
        templateJs.goPlay(that.data.lesson_id, that.data.lesson_name, that.data.navigation_type, that.data.book_id);
        return true;
      }
      //从自定义跳转过来
      if (that.data.navigation_type === "custom") {
        if (that.data.lesson_id === null) {
          app.Dictation.addLesson(wordList, function (res) {
            that.setData({
              lesson_id: res.data.userLessonId
            })
            console.log("custom success");
            wx.stopBackgroundAudio();
            that.setData({ goOther: true })
            templateJs.goPlay(res.data.userLessonId);
          })
        }
        else {
          wx.stopBackgroundAudio();
          that.setData({ goOther: true })
          templateJs.goPlay(that.data.lesson_id, that.data.lesson_name, that.data.navigation_type, that.data.book_id);
          return true;
        }
      }
    }
  },
  getShowWords: function (words) {
  	var that=this;
  	var showWords=[];
  	var standard = [];
    var custom = [];
    var wordStandard = [];
    var wordCustom = [];
    words.forEach(function (value, index, array) {
      var o = {
        dictation_word: words[index].dictation_word.replace(/[，]+/g, ",").split(",")[0],
        is_standard: words[index].is_standard,
        word_pinyin: words[index].word_pinyin
      }
      if(!that.data.ifSort){
      	showWords.push(o);
      }else{//要随机 实际为顺序
      	if (words[index].is_standard == 1) {//标准词
	        standard.push(o);
	        wordStandard.push(words[index])
	      } else {//非标准词
	        custom.push(o);
	        wordCustom.push(words[index])
	      }
      }				
    })
			if(!that.data.ifSort){
				this.setData({
		      words_show: showWords,
		      words: words
		    })
			}else{//要随机 实际为顺序
				var showWords = standard.concat(custom);
		    var words = wordStandard.concat(wordCustom);
		    this.setData({
		      words_show: showWords,
		      words: words
		    })
			}

  },
  getDelShowWords: function (words) {
    var showWords = [];
    words.forEach(function (value, index, array) {
      var o = {
        dictation_word: words[index].dictation_word.replace(/[，]+/g, ",").split(",")[0],
        is_standard: words[index].is_standard,
        word_pinyin: words[index].word_pinyin
      }
      showWords.push(o);
    })
    this.setData({
      del_words_show: showWords
    })
  },
  getShareShowWords: function (words) {
    var showWords = [];
    words.forEach(function (value, index, array) {
      var o = {
        dictation_word: words[index].dictation_word.replace(/[，]+/g, ",").split(",")[0],
        is_standard: words[index].is_standard,
        word_pinyin: words[index].word_pinyin
      }
      showWords.push(o);
    })
    this.setData({
      share_words_show: showWords
    })
    if (this.data.share_words_show.length != 0) {
      this.setData({ caseShow: true })
    } else {
      this.setData({ caseShow: false })
    }
  },
  //标准词的恢复或者添加分享的词语 都需要 重新获取 getLessonWord 单词列表，因为添加词之后id都会变
  //点击删除的词语恢复
  recover: function (e) {
    var that = this;
    let wordLength = that.data.words.length;
    let index = e.currentTarget.dataset.index;
    if (!that.data.noDouble || !that.data.del_words[index]) {
      return
    }
    that.setData({ noDouble: false })
    var deleteWord=that.data.del_words[index];
    //发出请求添加词语
    app.Dictation.AddUserLessonWord(that.data.lesson_id, that.data.del_words[index].dictation_word, function (res) {
    	if(res.data.success){
    		console.log("恢复");
	      //del_words_show
	      that.data.del_words_show.splice(index, 1);
	      that.setData({ del_words_show: that.data.del_words_show })
	      //del_words
	      that.data.del_words.splice(index, 1);
	      that.setData({ del_words: that.data.del_words })
	      //words
	      if(!that.data.ifSort){
	      	that.data.words.push(deleteWord)
	      }else{//要乱序 实际为顺序
	      	var idx=that.forIndex();
	      	if(idx==-1){//没有标准词汇
	      		that.data.words.push(deleteWord)
	      	}else{
	      		//第i项增加一项
	      		that.data.words.splice(idx,0,deleteWord);
	      	}	      	
	      }
	      app.Dictation.getLessonWord(that.data.lesson_id, function (res) {
	      	var arr1=res.data.wordlist;
	      	var arr2=that.data.words;
	      	var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的
	      	
	        that.setData({ words: newArr,originalWord:res.data.wordlist, })
	        //words_show
	        if (that.data.words.length !== 0) {
	          that.getShowWords(that.data.words);
	        }
	        setTimeout(function () {
            that.setData({ toView: 'bottom' })
          }, 200)
	        that.wordsCount(that.data.words);
	        console.log("恢复");
	        console.log(res.data.wordlist);
	        that.setData({ noDouble: true })
	      })
	      if (that.data.del_words.length == 0 && that.data.share_words.length == 0&&that.data.hotWords.length == 0) {
	        that.setData({ caseShow: false })
	      }
    	}
      
    });
  },
  //点击添加分享的词语
  addShare: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    var shareWordShow = that.data.share_words_show[index];
    if (!that.data.noDouble || !that.data.share_words_show[index]) {
      return false;
    }
    that.setData({ noDouble: false })
    var shareWord=that.data.share_words[index];
    app.Dictation.AddUserLessonWord(that.data.lesson_id, that.data.share_words[index].dictation_word, function(res) {
    	if(res.data.success){
    		//share_words_show
				that.data.share_words_show.splice(index, 1);
				that.setData({
					share_words_show: that.data.share_words_show
				});
				//share_words
				that.data.share_words.splice(index, 1);
				that.setData({
					share_words: that.data.share_words
				});
        //words
	      that.data.words.push(shareWord)						
				app.Dictation.getLessonWord(that.data.lesson_id, function(res) {
					//words
					var arr1=res.data.wordlist;
      		var arr2=that.data.words;
      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
					//words_show 
					that.getShowWords(that.data.words);
          that.wordsCount(that.data.words);
					setTimeout(function () {
		        that.setData({ toView: 'bottom' })
		      }, 200)
	
					that.setData({
						noDouble: true
					})
				})
	      if (that.data.del_words.length == 0 && that.data.share_words.length == 0&&that.data.hotWords.length == 0) {
	        that.setData({ caseShow: false })
	      }
    	}
    })
  },
  //点击添加高频词汇
  addHighFrequency_one:function(e){
    var that = this
    var index = e.currentTarget.dataset.index;
    var shareWordShow = that.data.hotWords[index];
    if (!that.data.noDouble || !that.data.hotWords[index]) {
      return false;
    }
    that.setData({ noDouble: false })    
    var hotWord=that.data.hotWords[index];
    app.Dictation.AddUserLessonWord(that.data.lesson_id, that.data.hotWords[index].dictation_word, function(res) {
    	if(res.data.success){
    		//hotWords
				that.data.hotWords.splice(index, 1);
				that.setData({
					hotWords: that.data.hotWords
				});
				//words
				that.data.words.push(hotWord)	
				app.Dictation.getLessonWord(that.data.lesson_id, function(res) {
					//words
					var arr1=res.data.wordlist;
      		var arr2=that.data.words;
      		var newArr=that.changeHotData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
					//words_show 
					that.getShowWords(that.data.words);
					that.wordsCount(that.data.words);
					setTimeout(function () {
		        that.setData({ toView: 'bottom' })
		      }, 200)
	
					that.setData({
						noDouble: true
					})
				})
	      if (that.data.del_words.length == 0 && that.data.share_words.length == 0&&that.data.hotWords.length == 0) {
	        that.setData({ caseShow: false })
	      }
    	}
    })  	
  },
  //点击叉删除词语
  deleteWord: function (e) {
    var that = this;
    var wordindex = e.currentTarget.dataset.index;
    if (!that.data.noDouble || !that.data.words[wordindex]) {
      return false;
    }		
    console.log("删除", that.data.words[wordindex].dictation_word)
    that.setData({ noDouble: false })
    var wordtype = that.data.words[wordindex].is_standard;
    //发出请求删除词语
    app.Dictation.delWordById(that.data.words[wordindex].id, that.data.lesson_id, function (res) {
    	if(res.success){
    		var delWord = that.data.words_show.splice(wordindex, 1);
    		//del_words_show
	      if (wordtype == 1) {//是标准词 放到删除词里
	        that.data.del_words_show.push(delWord[0]);
	        that.setData({ del_words_show: that.data.del_words_show })
	        //del_words
	        var newDelWords = that.data.del_words;
	        newDelWords.push(that.data.words[wordindex]);
	        that.setData({ del_words: newDelWords })
	      }
    		if(that.data.navigation_type=='book'){//标准词汇第一次需要重新取数据	
    			if(that.data.words[0].id==that.data.standard_words[0].id){
    				app.Dictation.getLessonWord(that.data.lesson_id, function(res) {
							//words
							var arr1=res.data.wordlist;
		      		var arr2=that.data.words;
		      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
		        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
							//words_show 
							that.getShowWords(that.data.words);
							
							that.wordsCount(that.data.words);
				      if (that.data.words == 0) {
				        that.setData({ isEdit: false, longTimeOver: false })
				      }
				      that.setData({ noDouble: true })
						})
    			}else{
    				//words_show
			      that.setData({
			        words_show: that.data.words_show
			      });		      
			      //words
			      that.data.words.splice(wordindex, 1);
			      that.setData({
			        words: that.data.words,
			        originalWord:that.data.words,
			      });
			      that.wordsCount(that.data.words);
			      if (that.data.words == 0) {
			        that.setData({ isEdit: false, longTimeOver: false })
			      }
			      that.setData({ noDouble: true })
    			}
				  
				}else{
					//words_show
		      that.setData({
		        words_show: that.data.words_show
		      });		      
		      //words
		      that.data.words.splice(wordindex, 1);
		      that.setData({
		        words: that.data.words,
		        originalWord:that.data.words,
		      });
		      that.wordsCount(that.data.words);
		      if (that.data.words == 0) {
		        that.setData({ isEdit: false, longTimeOver: false })
		      }
		      that.setData({ noDouble: true })
				}
    	}
    });

    //第一次进入，有遮罩
    if (wordtype == 1) {
      that.setData({ caseShow: true })
    }

  },
  //单击单词后播放单个单词
  play: function (e) {
    if (this.data.canPlay) {
      var that = this;
      //如果是删除状态
      if (this.data.isEdit) {
        this.deleteWord(e);
        return false;
      }
      // console.log(e)
      var index = e.currentTarget.dataset.index;
      var lessonId = that.data.lesson_id;
      if (index > that.data.words.length - 1) {
        return false;
      }
      var whichMp3 = that.data.words[index].word_mp3_url;

      if (whichMp3) {
        wx.playBackgroundAudio({
          dataUrl: that.data.words[index].word_mp3_url,
        })

      } else {
        wx.showToast({
          title: '音频生成中',
          icon: 'success',
          duration: 1000
        })
        if (that.data.words[index].id) {
          app.Dictation.getWordMp3Url(lessonId, that.data.words[index].dictation_word, that.data.words[index].id, 1, function (res) {
            var mp3 = res.mp3Url;

            wx.playBackgroundAudio({
              dataUrl: res.mp3Url,
            });
            that.data.words[index].word_mp3_url = mp3;
            that.setData({ words: that.data.words })
          })
        } else {
          app.Dictation.getLessonWord(that.data.lesson_id, function (res) {
						var arr1=res.data.wordlist;
	      		var arr2=that.data.words;
	      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
	        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
            that.play(e)
          })
        }

      }
    }
  },
  //长按出现删除按钮
  longTapDelete: function () {
    var that = this;
    this.setData({
      isEdit: true,
      canPlay: false,
      // words_show: newList
    })
    setTimeout(function () {
      that.setData({
        longTimeOver: true,
        canPlay: true
      })
    }, 1000);
  },
  deleteCancel: function () {
    if (this.data.longTimeOver) {
      this.setData({
        isEdit: false,
        longTimeOver: false,
      })
      this.getShowWords(this.data.words);
    }
  },

  toKeyOrLesson: function () {
    var that = this;
    wx.setStorageSync("tmpWords", that.data.words)
    if (that.data.navigation_type == "custom") {
      that.gotoNext();
      return

    }
    console.log(that.data.unlock)
    if (that.data.unlock == "loading") {
      app.Dictation.ifAssess(that.data.uid, that.data.lesson_id, function (res) {
        console.log(res);
        that.setData({ unlock: res.data.unlock });
      })
    } else {
      if (!that.data.unlock) {
        that.setData({ showKey: true});
      } else {
        that.setData({ showKey: false });        
        that.gotoNext();
      }
    }
  },
  openThisUnitWithKey: function () {
    let that = this;
    if (that.data.key_rest_count > 0) {
      app.Dictation.keyToLesson(that.data.uid, that.data.book_id, that.data.lesson_id, 0, function (res) {
        if (res.success) {
          that.gotoNext();
          that.setData({ showKey: false });
        }
      });
    } else if (that.data.key_rest_count == 0) {
      wx.showToast({
        title: '您的钥匙不足',
        icon: 'success',
        duration: 2000
      })
    }
  },
  openAllBook: function () {
    var that = this;
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
        wx.requestPayment
          (
          {
            'timeStamp': rts.data.timeStamp,
            'nonceStr': rts.data.nonceStr,
            'package': rts.data.package,
            'signType': rts.data.signType,
            'paySign': rts.data.paySign,
            'success': function (res) {
              that.gotoNext();
              that.setData({ showKey: false });
            },
            'fail': function (res) {
              that.setData({ showKey: true });
            }
          }
          );
      });
    }

  },
  returnToUnit: function () {
    var that = this;
    that.setData({ showKey: false})
  },
  //打开caseshow
  openCase: function () {
    var that = this;
    if (that.data.del_words != 0 || that.data.share_words != 0 || that.data.hotWords != 0) {
      that.setData({ caseShow: !that.data.caseShow })
    }
  },
  imageOnLoad:function(e){
    console.log(e);
  },
  addAllShare: function () {
    var that = this;
    //分享过来的词汇全部添加功能
    var words = that.data.words;
    var share_words = that.data.share_words;
    var wordlist = "";
    var length = share_words.length;
    for (var i = 0; i < length; i++) {
    	//words
    	that.data.words.push(share_words[i])	
      if (i == length - 1) {
        wordlist += share_words[i].dictation_word;
      } else {
        wordlist += share_words[i].dictation_word + ";";
      }

    }
    //share_words_show
    that.setData({ share_words_show: [] });
    //share_words
    that.setData({ share_words: [] });
    app.Dictation.AddUserLessonWord(that.data.lesson_id, wordlist, function (res) {
      if (res.data.success) {
        app.Dictation.getLessonWord(that.data.lesson_id, function (res) {
          //words
          var arr1=res.data.wordlist;
      		var arr2=that.data.words;
      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
          //words_show 
          that.getShowWords(that.data.words);
          that.wordsCount(that.data.words);          
        })
      }
    })
    if (that.data.del_words.length == 0 && that.data.share_words.length == 0) {
      that.setData({ caseShow: false })
    }

  },
  addAllHighFrequency_words:function(){
  	var that = this;
    //高频词汇全部添加功能
    var words = that.data.words;
    var hotWords = that.data.hotWords;
    var wordlist = "";
    var length = hotWords.length;
    for (var i = 0; i < length; i++) {
    	//words
    	that.data.words.push(that.data.hotWords[i])	
      if (i == length - 1) {
        wordlist += hotWords[i].dictation_word;
      } else {
        wordlist += hotWords[i].dictation_word + ";";
      }

    }
    //hotWords
    that.setData({ hotWords: [] });
    app.Dictation.AddUserLessonWord(that.data.lesson_id, wordlist, function (res) {
      if (res.data.success) {
        app.Dictation.getLessonWord(that.data.lesson_id, function (res) {
          //words
          var arr1=res.data.wordlist;
      		var arr2=that.data.words;
      		var newArr=that.changeData(arr1,arr2);//arr1 原始顺序数据 arr2 要显示的	      	
        	that.setData({ words: newArr,originalWord:res.data.wordlist, })
          //words_show 
          that.getShowWords(that.data.words);
          that.wordsCount(that.data.words);
        })
      }
    })
    if (that.data.del_words.length == 0 && that.data.share_words.length == 0) {
      that.setData({ caseShow: false })
    }
  },
  //分享按钮的分享
  toShare: function () {
    app.Dictation.SetUserBookIsClick(this.data.book_id, function () {

    })
    this.onShareAppMessage();
  },
  hiddenSelf: function () {
    let that = this;
    that.setData({ ifHiddenTip: true })
  },
  //改为随机
  shuffle:function(){  	
  	var that=this;
  	//打乱words
  	var originalWord=that.data.originalWord;//原始数组
		var ifSort=!that.data.ifSort;
		that.setData({ifSort:ifSort})
		var words=that.shuffleArr(that.data.words);
		that.setData({words:words})
		that.getShowWords(words);
		
 },
  sort:function(){//改为顺序
  	var that=this;
  	var ifSort=!that.data.ifSort;
		that.setData({ifSort:ifSort})
  	that.setData({words:that.data.originalWord});
  	that.getShowWords(that.data.originalWord);;
  },
  shuffleArr:function(arr){//数组乱序
  	var len = arr.length;
    for (var i = 0; i < len - 1; i++) {
        var index = parseInt(Math.random() * (len - i));
        var temp = arr[index];
        arr[index] = arr[len - i - 1];
        arr[len - i - 1] = temp;
    }
    return arr;
  },
  changeData:function(arr1,arr2){//arr1原始数组 arr2要显示数组
  	var newArr=[];
  	for(var i=0;i<arr1.length;i++){
  		for(var j=0;j<arr2.length;j++){
  			if(arr2[j].is_standard){
  				if(arr1[i].dictation_word==arr2[j].dictation_word&arr1[i].is_standard==arr2[j].is_standard){ 				
	  				newArr[j]=arr1[i];
	  			}
  			}else{//高频词汇没有is_standard
  				if(arr1[i].dictation_word==arr2[j].dictation_word){ 				
	  				newArr[j]=arr1[i];
	  			}
  			}
  			
  		}
  	}
  	return newArr;
  	
  },
  changeHotData:function(arr1,arr2){//arr1原始数组 arr2要显示数组  高频词已经去过重
  	var newArr=[];
  	for(var i=0;i<arr1.length;i++){
  		var word=arr1[i].dictation_word.split(",")[0]
  		for(var j=0;j<arr2.length;j++){
  			var word2=arr2[j].dictation_word.split(",")[0]
  			if(word==word2){ 				
  				newArr[j]=arr1[i];
  			}
  		}
  	}
  	return newArr;
  	
  },
  forIndex:function(){//第一个非标准词汇的index
  	var that=this;
  	for(var i=0;i<that.data.words.length;i++){
  		if(that.data.words[i].is_standard==0){
  			return i;
  		}
  	}
  	return -1;
  },
  getHotWords: function (cb) {//获取高频词汇
    var that = this;
    app.Dictation.GetLessonCustomWordById(that.data.lesson_id, 20, function (res) {
      console.log(res.data);
      var hotWords = res.data.customwordlist;
      var words_show=that.data.words_show;
      var len=hotWords.length;
      console.log(words_show);
      //去重hotWords that.data.words
      for(var i=0;i<len;i++){
      	for(var j=0;j<words_show.length;j++){
      		if(hotWords[i].word==words_show[j].dictation_word){
      			hotWords.splice(i,1);
      			len--;
      			i--;
      			console.log(hotWords);
      			break;
      		}
      	}
      }      
      that.setData({ hotWords: hotWords})     
      if(hotWords.length>0){
      	if(that.data.highFrequency_ifShow=="show"){
      		that.setData({caseShow:true})
      	}
      }else{
      	that.setData({highFrequency_ifShow:'hidden'});
      	wx.removeStorage({
				  key: 'highFrequency_ifShow',
				  success: function(res) {
				  } 
				})
      }
    });
  },
  //模板消息 获取formID
    formSubmit:function(event){
  	var that=this;
  	var formData={};//{"form_id":"0","expire_time":"2017-09-14 18:24:55.000"}
  	var form_id = event.detail.formId;
  	formData.form_id=form_id;
  	var myDate=new Date();
  	myDate.setDate(myDate.getDate()+7);//设置7天后过期
  	var cur_year = myDate.getFullYear();//获取年
    var cur_month = myDate.getMonth() + 1;//获取月
    var cur_day = myDate.getDate();//获取日
    var cur_hour=myDate.getHours();//获取小时
    var cur_min=myDate.getMinutes();//获取分钟
    var cur_sec=myDate.getSeconds();//获取秒
    var time=cur_year+'-'+templateJs.toDouble(cur_month)+'-'+templateJs.toDouble(cur_day)+' '+templateJs.toDouble(cur_hour)+':'+templateJs.toDouble(cur_min)+":"+templateJs.toDouble(cur_sec);
    //expire_time
    formData.expire_time=time;
  	app.globalData.formids.push(formData);
  },
  
})