const { RAN, NoopTransport, RasBridge } = require('random-access-network')
var randomAccess = require('random-access-storage')
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
    return (name) => {
      return RAN(name, new RPCTransport(name, this._rpc))
    }
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
    // this._wrapStorage()
    this._rpc = RPC(window, client, ANY_ORIGIN, this._methods())
    this._bridge = RasBridge((name) => this._getStorage(name))
  }

  // _wrapStorage () {
  //   const rawStorage = this.storage
  //
  //   this.storage = (name) => {
  //     const access = rawStorage(name)
  //     return randomAccess({
  //       open: (request) => {
  //         access.open(request.callback.bind(request))
  //       },
  //       read: (request) => {
  //         access.read(request.offset, request.size, request.callback.bind(request))
  //       },
  //       write: (request) => {
  //         access.write(request.offset, request.data, request.callback.bind(request))
  //       },
  //       del: (request) => {
  //         access.del(request.offset, request.size, request.callback.bind(request))
  //       },
  //       close: (request) => {
  //         access.close(request.callback.bind(request))
  //       },
  //       destroy: (request) => {
  //         access.destroy(request.callback.bind(request))
  //       }
  //     })
  //   }
  // }

  _getStorage (name) {
    const storage = this.storage(name)
    return storage
  }

  _methods () {
    return {
      selectArchive: (options, callback) => {
        this.selectArchive(options, callback)
      },
      addArchive: (key, secretKey, options, callback) => {
        this.addArchive(key, secretKey, options, callback)
      },
      storage: (name, request, callback) => {
        this._bridge(Buffer.from(request), callback)
      }
    }
  }
}

class RPCTransport extends NoopTransport {
  constructor (name, rpc) {
    super(name)
    this._rpc = rpc
  }
  send (request) {
    this._rpc.call('storage', this._name, request, (response) => {
      this._next(Buffer.from(response))
    })
  }
  close () {
    // ¯\_(ツ)_/¯
  }
}

module.exports = {
  Client: Client,
  Server: Server
}
