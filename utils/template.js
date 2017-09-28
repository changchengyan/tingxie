var app = getApp();
function goPlay(lessonId, lessonName, navigation_type, book_id,book_name,disOrder) {
  //console.log("template")
  wx.navigateTo({
    url: `/pages/play/play?navigation_type=${navigation_type}&lessonId=${lessonId}&book_id=${book_id}&lessonName=${lessonName}&disOrder=${disOrder}`
  })
}
function toDouble(num){
	if(num>=10){//大于10
		return num;
	}else{//0-9
		return '0'+num
	}
}
module.exports = {
  goPlay: goPlay,
  toDouble:toDouble

}
// that.data.lesson_id, that.data.lesson_name, that.data.navigation_type, that.data.book_id, that.data.book_name, that.data.disOrder