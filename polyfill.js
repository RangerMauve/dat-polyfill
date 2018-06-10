const DatArchive = require('dat-archive-web/DatArchive')
const FrameManager = require('./src/FrameManager')
const SourceRewriter = require('./src/SourceRewriter')
const URLParse = require('url-parse')

const BASE_32_KEY_LENGTH = 52
const REWRITE_DELAY = 2000 // 2 seconds

if (!window.DatArchive) {
  doPolyfill()
}

function parsePolyfillURL () {
  const scriptURL = document.currentScript.src

  const url = new URL(scriptURL)

  let hostParts = url.hostname.split('.')

  if (hostParts[0].length === BASE_32_KEY_LENGTH) {
    hostParts = hostParts.slice(1)
  }

  let gatewayHost = `${url.protocol}//${hostParts.join}`

  if (url.port) {
    gatewayHost = `${gatewayHost}:${url.port}`
  }

  const path = url.pathname.split('/').slice(1)

  const serverPath = path.slice(0, -1).join('/')

  return {
    gateway: gatewayHost,
    path: serverPath
  }
}

function doPolyfill () {
  // Chrome's URL implementation doesn't handle `dat://` protocol
  window.URL = URLParse

  var scriptData = parsePolyfillURL()

  var polyfillGateway = scriptData.gateway
  var polyfillPath = scriptData.path

  const manager = new FrameManager(polyfillGateway, polyfillPath)

  // Once the manager has loaded and detected the best gateway to use, start rewriting
  manager.loading.then(() => addRewriter(manager.gateway))

  DatArchive.setManager(manager)

  window.DatArchive = DatArchive
}

function addRewriter (gateway) {
  const rewriter = new SourceRewriter(gateway, REWRITE_DELAY)

  // Start rewriting src and href attributes
  rewriter.start()
}
