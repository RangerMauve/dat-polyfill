var styleText = require('./style.css.js')

module.exports = class ServerFrame {
  /**
   * @param {String} url     The URL to load the server frame at
   * @param {Node}   element The element to attach the fame to
   */
  constructor (url, element) {
    const frame = document.createElement('iframe')

    this.frame = frame
    frame.classList.add('dat-polyfill-frame')
    this.hide()

    element.appendChild(frame)

    // Inject the stylesheet
    const styleElement = document.createElement('style')
    styleElement.innerHTML = styleText
    element.appendChild(styleElement)
  }

  hide () {
    this.frame.classList.add('dat-polyfill-hidden')
  }

  show () {
    this.frame.classList.remove('dat-polyfill-hidden')
  }
}
