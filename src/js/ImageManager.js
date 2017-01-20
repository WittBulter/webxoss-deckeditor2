
import ImageFileCache from './ImageFileCache.js'

const manager = (function(){

  function newImage (src) {
    let img = new Image()
    img.src = src
    return img
  }


// ImageManager
  function ImageManager (dir) {
    this.dir = dir || './'
	// 缓存
    this.black = newImage(this.dir + 'images/WIXOSS_BLACK.jpg')
    this.white = newImage(this.dir + 'images/WIXOSS_WHITE.jpg')
    this.noimage = newImage(this.dir + 'images/noimage.jpg')
    this.imageCache = {}
    this.stateImageMap = {
      'frozen': newImage(this.dir + 'background/frozen.png'),
      'charm': newImage(this.dir + 'background/charm.png'),
      'lancer': newImage(this.dir + 'background/lancer.png'),
      'doubleCrash': newImage(this.dir + 'background/doubleCrash.png'),
      'locked': newImage(this.dir + 'background/locked.png'),
      'assassin': newImage(this.dir + 'background/assassin.png'),
    }
  }

  ImageManager.prototype.getUrlByPid = function (pid) {
    let url = ImageFileCache.getUrlByPid(pid)
    if (url) return url
    url = this.dir + 'images/' + ('0000' + pid).slice(-4) + '.jpg'
    ImageFileCache.fetchAndCache(pid, url)
    return url
  }

  ImageManager.prototype.getImageByPid = function (pid) {
    if (!pid) return this.noimage
    if (pid in this.imageCache) {
      return this.imageCache[pid]
    } else {
      let src = this.getUrlByPid(pid)
      let img = newImage(src)
      this.imageCache[pid] = img
      return img
    }
  }

  ImageManager.prototype.getBackImage = function (isWhite) {
    return isWhite? this.white : this.black
  }

  ImageManager.prototype.getStateImage = function (state) {
    return this.stateImageMap[state]
  }

  return ImageManager
})()

const ImageManager = new manager('')

export default ImageManager
