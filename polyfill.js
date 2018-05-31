const DatArchive = require('dat-archive-web/DatArchive')
const FrameManager = require('./FrameManager')
const PersistentManager = require('./PersistentManager')
const SourceRewriter = require('./SourceRewriter')
const URLParse = require('url-parse')

const MATCH_GATEWAY = /DAT_GATEWAY=([^&]+)/
const BASE_32_KEY_LENGTH = 52
const DEFAULT_GATEWAY = `http:localhost:3000`
const DAT_STORAGE_KEY = 'dat://storage'
const REWRITE_DELAY = 2000 // 2 seconds

if (!window.DatArchive) {
  doPolyfill()
}

function detectGateway () {
  const parsed = URLParse(window.location + '')

  const inURL = MATCH_GATEWAY.exec(parsed.query)

  if (inURL) {
    return unescape(inURL[1])
  }

  if (window.DEFAULT_DAT_GATEWAY) {
    return window.DEFAULT_DAT_GATEWAY
  }

  const subdomain = parsed.hostname.split('.')[0]
  // Probably being served from a gateway, so we should use it
  if (subdomain.length === BASE_32_KEY_LENGTH) {
    const port = parsed.port || (parsed.protocol === 'http:' ? 80 : 443)
    const fulldomain = parsed.hostname.slice(BASE_32_KEY_LENGTH + 1)
    return `${parsed.protocol}//${fulldomain}:${port}`
  }

  if (window.localStorage.DAT_GATEWAY) {
    return window.localStorage.DAT_GATEWAY
  }

  return DEFAULT_GATEWAY
}

function doPolyfill () {
  const isFrame = (window.parent !== window)

  const gateway = detectGateway()

  if (isFrame) {
    DatArchive.setManager(new FrameManager(gateway, window.parent.window))
  } else {
    DatArchive.setManager(new PersistentManager(gateway, DAT_STORAGE_KEY))
  }

  // Chrome's URL implementation doesn't handle `dat://` protocol
  window.URL = URLParse

  const rewriter = new SourceRewriter(gateway, REWRITE_DELAY)

  // Start rewriting src and href attributes
  rewriter.start()

  // Once the document loads, we should rewrite all existing items
  document.addEventListener('load', () => rewriter.rewrite())

  window.DatArchive = DatArchive
}
