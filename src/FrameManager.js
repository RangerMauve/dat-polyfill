const DatArchive = require('dat-archive-web')
const delay = require('delay')
const DefaultManager = DatArchive.DefaultManager
const rpc = require('./rpc')
const ServerFrame = require('./ServerFrame')

// How long to wait to try to contact a gateway
const GATEWAY_DISCOVERY_TIMEOUT = 4000

module.exports = class FrameManager extends DefaultManager {
  constructor (gateway, serverKey) {
    // Gateway will be discovered asynchronously
    super()

    const server = new ServerFrame(`${gateway}/${serverKey}`, document.body)
    const serverWindow = server.frame.contentWindow
    this.server = server

    this._inital_gateway = gateway
    this._server_key = serverKey
    this._client = new rpc.Client(window, serverWindow)
    this._loaded = false
    this.loading = this.init()
  }

  async init () {
    if (this._loaded) {
      return
    }

    const gateway = await this.findGateway()

    this.gateway = gateway

    this._loaded = true
    this.loading = null
  }

  async findGateway () {
    const list = [
      // Default port for local gateway
      'http://lvh.me:3000',

      // Port 0xDA7 for local gateway
      'http://lvh.me:3495'
    ]

    if (window.DEFAULT_DAT_GATEWAY) {
      list.push(window.DEFAULT_DAT_GATEWAY)
    }

    if (this._inital_gateway) {
      list.push(this._inital_gateway)
    }

    // Attempt to load all URLs at once
    const results = Promise.all(list.map((url) => this.tryGateway(url)))

    for (let exists of results) {
      if (exists) return exists
    }

    throw new Error("Couldn't discovery gateway")
  }

  tryGateway (url) {
    // Either time out with null, or resolve to the URL if it works
    return Promise.race([
      delay(GATEWAY_DISCOVERY_TIMEOUT, null),
      window.fetch(`${url}/${this._server_key}/.well-known/dat`).then((response) => {
        // TODO: Make sure that the result contains a dat DNS entry
        return response.ok ? url : null
      })
    ])
  }

  getStorage (key, isNew) {
    return (name) => {
      return this._client.getStorage()(`${key}/${name}`)
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
    this.server.show()
    return new Promise((resolve, reject) => {
      this._client.selectArchive(options, (err, key) => {
        this.server.hide()
        if (err) reject(new Error(err))
        else resolve(key)
      })
    })
  }
}
