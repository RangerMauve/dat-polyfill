const RandomAccessRPC = require('./random-access-rpc')
const RPC = require('frame-rpc')

const ANY_ORIGIN = '*'

class Client {
  /**
   * Creates the client for frame-rpc for reading dat content
   * @param {Window} window The window the client is running in
   * @param {Window} server The window the parent of the service is running in
   */
  constructor (window, server) {
    this._rpc = RPC(window, server, ANY_ORIGIN, this._methods())
  }

  getStorage () {
    return RandomAccessRPC.client(this._rpc)
  }

  selectArchive (options, callback) {
    this._rpc.call('selectArchive', options, callback)
  }

  addArchive (key, secretKey, options, callback) {
    this._rpc.call('addArchive', key, secretKey, options, callback)
  }

  _methods () {
    return {
      // Client doesn't provide any methods
    }
  }
}

class Server {
  /**
   * Creates the server for frame-rpc for serving dat content
   * @param {Window} window  The window serving the content
   * @param {Window} client  The child window using the service
   * @param {Object} options Should contain `storage`, `selectArchive`, and `addArchive` implementations
   */
  constructor (window, client, options) {
    Object.assign(this, options)
    this._rpc = RPC(window, client, '*', this._methods())
  }

  _methods () {
    return Object.assign(RandomAccessRPC.server(this.storage), {
      selectArchive: (options, callback) => {
        this.selectArchive(options, callback)
      },
      addArchive: (key, secretKey, options, callback) => {
        this.addArchive(key, secretKey, options, callback)
      }
    })
  }
}

module.exports = {
  Client: Client,
  Server: Server
}
