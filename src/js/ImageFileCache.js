// Check IndexedDB support.
// https://bl.ocks.org/nolanlawson/8a2ead46a184c9fae231
const checkIndexedDBSupport = () => {
  // static checks
  let notSupported =
    (typeof indexedDB === 'undefined') ||
    (window.indexedDB === null) ||
    (typeof IDBKeyRange === 'undefined')

  if (notSupported) {
    return Promise.resolve(false)
  }

  // test broken IndexedDB on iOS 8,9
  return new Promise(resolve => {
    let req = indexedDB.open('test', 1)
    req.onerror = () => resolve(false)
    req.onupgradeneeded = function (event) {
      let db = event.target.result
      db.createObjectStore('one', {
        keyPath: 'key',
      })
      db.createObjectStore('two', {
        keyPath: 'key',
      })
    }
    req.onsuccess = function (event) {
      let db = event.target.result
      let tx = null
      try {
        tx = db.transaction(['one', 'two'], 'readwrite')
      } catch (error) {
        return resolve(false)
      }
      tx.objectStore('two').put({
        'key': Date.now(),
      })
      tx.oncomplete = function () {
        db.close()
        resolve(true)
      }
    }
  })
}

/* Helper functions */
const get = (url, type, callback, err) => {
  let xhr = new XMLHttpRequest()
  xhr.responseType = type
  xhr.onload = () => {
    if (xhr.status !== 200) {
      err(xhr, event)
    } else {
      callback(xhr, event)
    }
  }
  xhr.onerror = event => {
    err(xhr, event)
  }
  xhr.open('GET', url, true)
  xhr.send()
}
const wait = timeout => {
  return new Promise(resolve => {
    window.setTimeout(resolve, timeout)
  })
}

/* locals */
let urlMap = {}
let fetchingMap = {}

/* private methods */
const cache = (pid, blob) => {
  if (!ImageFileCache.supportBlob) return
  if (pid in urlMap) return
  let url = window.URL.createObjectURL(blob)
  urlMap[pid] = url
  let open = indexedDB.open('card images', 1)
  open.onupgradeneeded = function () {
    this.result.createObjectStore('images')
  }
  open.onsuccess = function () {
    let db = this.result
    db.transaction(['images'], 'readwrite').objectStore('images').add(blob, pid)
  }
}
// Read all images form DB to cached blob urls.
const readAll = () => {
  return new Promise(resolve => {
    let open = indexedDB.open('card images', 1)
    open.onupgradeneeded = function () {
      this.result.createObjectStore('images')
    }
    open.onsuccess = function () {
      let db = this.result
      db.transaction(['images'])
      .objectStore('images')
      .openCursor()
      .onsuccess = function () {
        let cursor = this.result
        if (!cursor) {
          return resolve()
        }
        let pid = cursor.key
        let blob = cursor.value
        let url = window.URL.createObjectURL(blob)
        urlMap[pid] = url
        cursor.continue()
      }
    }
  })
}

const ImageFileCache = {
  supportIndexedDB: false,
  supportBlob: !!window.Blob && !!window.URL,
  getUrlByPid(pid) {
    return urlMap[pid] || ''
  },
  fetchAndCache(pid, url) {
    if (!this.supportBlob) return
    if (fetchingMap[pid]) return
    fetchingMap[pid] = true
    get(url, 'blob', function (xhr) {
      let blob = xhr.response
      cache(pid, blob)
    }, function () {
      fetchingMap[pid] = false
    })
  },
  init(timeout = 1000) {
    if (!this.supportBlob) {
      return Promise.resolve(false)
    }
    return Promise.race([
      wait(timeout).then(() => false),
      checkIndexedDBSupport().then(support => {
        if (!support) {
          return false
        }
        this.supportIndexedDB = true
        return readAll().then(() => true)
      }),
    ])
  },
}

export default ImageFileCache
