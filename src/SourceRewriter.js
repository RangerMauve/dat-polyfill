const debounce = require('debounce')

const OBSERVATION_OPTIONS = {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ['src', 'href']
}

module.exports = class SourceRewriter {
  constructor (gateway, delay) {
    this.gateway = gateway
    this.rewriter = debounce(this.rewrite.bind(this), delay, false)
    this.observer = new window.MutationObserver(this.rewriter)
  }

  start () {
    this.observer.observe(document.body, OBSERVATION_OPTIONS)

    this.rewrite()
  }

  stop () {
    this.observer.disconnect()
  }

  rewrite () {
    // Find all img, a, iframe, audio, etc tags
    // Iterate through each one
    // If the SRC starts with dat://, rewrite it to use the gateway

    const srcItems = document.querySelectorAll('img,iframe,svg,audio,video,source,script')

    for (let item of srcItems) {
      if (item.src && (item.src.indexOf('dat://') === 0)) {
        item.src = `${this.gateway}/${item.src.slice(6)}`
      }
    }

    const hrefItems = document.querySelectorAll('a')

    for (let item of hrefItems) {
      if (item.href && (item.href.indexOf('dat://') === 0)) {
        item.href = `${this.gateway}/${item.href.slice(6)}`
      }
    }
  }
}
