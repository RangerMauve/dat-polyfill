const DatArchive = require('dat-archive-web')
const DefaultManager = DatArchive.DefaultManager
const rpc = require('./rpc')

module.exports = class FrameManager extends DefaultManager {
  constructor (gateway, serverWindow) {
    super(gateway)
    this._client = new rpc.Client(window, serverWindow)
  }

  getStorage (key, isNew) {
    return (name) => {
      return this._client.getStorage(`${key}/${name}`)
    }
  }

  onAddArchive (key, secretKey, options) {
    return new Promise((resolve, reject) => {
      this._client.addArchive(key, secretKey, options, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  selectArchive (options) {
    return new Promise((resolve, reject) => {
      this._client.selectArchive(options, function (err, key) {
        if (err) reject(new Error(err))
        else resolve(key)
      })
    })
  }
}
