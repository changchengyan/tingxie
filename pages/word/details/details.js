import Modal from '../../../components/modal/modal.js'

var app = getApp()
Page({
  data: {
    name: '',
    src: "../../../images/word/star.png",
    listWords: [],
    errCount: 0,
    star: 3,
    errList: [],
    navigation_type: null,
    book_name: null,
    book_id: 0,
    lesson_name: null,
    bg_p: null
  },
  //切换是否为错误单词
  toggleErrWord: function (e) {
    let { index } = e.currentTarget.dataset;
    let { listWords } = this.data;
    let { errList } = this.data;
    let errCount = 0;
    //errList=[];
    //let nerrList = [];
    let star;
    //listWords[index].error = !listWords[index].error
    // for (let i = 0; i <= listWords.length - 1; i++) {
    //   if (listWords[i].error) {
    //    // errCount += 1;
    //     console.log(listWords[i])
    errList.push(listWords[index]);
    //console.log(listWords.length)
    if (listWords.length - 1 == 0) {
      star = 0
    }
    else if (errList.length == 0) {
      star = 3
    }
    else if (errList.length > 0 && errList.length < 3) {
      star = 2
    }
    else if (errList.length >= 3) {
      star = 1
    }
    listWords.splice(index, 1);
    //   } 
    //   else {
    //   }
    // }

    //去重
    // for (var i = 0; i < nerrList.length; i++) {
    //   if (errList.indexOf(nerrList[i]) == -1) {
    //     errList.push(nerrList[i]);
    //   }
    // }
    //console.log(listWords[0].display_word)
    console.log(errList);
    this.setData({ listWords, star, errList })
    console.log('star=' + star)
  },

  //恢复错误单词
  delerr: function (e) {
    var { errindex } = e.currentTarget.dataset;
    //console.log(errindex);
    let that = this;
    var { errList, listWords, star } = that.data;
    console.log(errList[errindex])
    listWords.push(errList[errindex]);

    if (errList.length - 1 == 0) {
      star = 3
    }
    else if (errList.length > 0 && errList.length < 3) {
      star = 2
    }
    else if (errList.length >= 3) {
      star = 1
    }
    errList.splice(errindex, 1);

    this.setData({ listWords, errList, star })
    console.log(star)
  },

  //提交
  submitTest: function () {
    let that = this;
    let { listWords, star } = this.data;
    let { lessonId, testTime } = this.testInfo;
    let wordList = '', wrongWordList = '';
    for (let i = 0; i <= listWords.length - 1; i++) {
      if (listWords[i].error == true) {
        wrongWordList += `${listWords[i].word};`
      }
      wordList += `${listWords[i].word};`
    }
    wordList = wordList.replace(/;$/gi, '')
    wrongWordList = wrongWordList.replace(/;$/gi, '');
    // this.modal.show({
    //   title: '确定已标记错误生词并完成听写？',
    //   cancel: '取消',
    //   submit: '确定',
    //   success: function (e) {
    app.Dictation.addTestRecord(parseInt(lessonId), wordList, wrongWordList, star, parseInt(testTime), function (res) {
      console.log('提交测试成功')
      //     let pages = getCurrentPages(),
      //       delta;
      //     for (let i = 0; i < pages.length; i++) {
      //       if (pages[i].route == 'pages/book/book' || pages[i].route == 'pages/word/word') {
      //         delta = pages.length - i - 1;
      //         break;
      //       }
      //       if (pages[i].route == 'pages/unit/unit') {
      //         wx.navigateBack({
      //           url: '../word',
      //         })
      //         //delta = pages.length - i - 1;
      //         //break;
      //       }
      //     }
      //     wx.navigateBack({ delta })
      //   })
      // },
      // fail: function (e) {

      // }
    })
    wx.redirectTo({
      url: `../../finally/finally?star=${that.data.star}&lessonId=${lessonId}&navigation_type=${that.data.navigation_type}&book_name=${that.data.book_name}&book_id=${that.data.book_id}&lessonName=${that.data.lesson_name}`,
    })
    console.log(that.data.star)
  },
  /**
   * 页面参数需要lessonId和testTime
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      navigation_type: options.navigation_type,
      book_name: options.book_name,
      book_id: options.book_id,
      lesson_name: options.lessonName
    })
    console.log(options.navigation_type, options.book_name, options.book_id, options.lessonName)
    let listWords = wx.getStorageSync('lastPlayList')
    console.log(options);
    for (let i in listWords) {
      //console.log(listWords[i].word.split(',')[0])
      listWords[i].display_word = listWords[i].word.split(',')[0]
    }
    that.modal = new Modal()
    that.setData({ listWords, name: options.lessonName })
    that.testInfo = options;
    console.log(options.lessonId)
    wx.playBackgroundAudio({
      dataUrl: "http://image.chubanyun.net/images/Dictation/505.wav",
    })

    //   for (let i = 0; i < listWords.length;i++){
    //     if (listWords[i].display_word.length>15){
    //       that.setData({
    //         bg_p:"bg_p"
    //       })
    //     }
    // }

  },
  onUnload: function () {
    wx.stopBackgroundAudio()
  },



})