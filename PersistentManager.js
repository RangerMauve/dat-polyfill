const DatArchive = require('dat-archive-web')
const DefaultManager = DatArchive.DefaultManager

const ram = require('random-access-memory')
const idb = require('randpm-access-idb')

module.exports = class FrameManager extends DefaultManager {
  constructor (gateway, storageKey) {
    super(gateway)
    this.storage = idb(storageKey)
    this.keys = new Keys(storageKey)
  }

  getStorage (key, isNew) {
    if (isNew) {
      this.keys.add(key)
    }

    const storage = this.keys.has(key) ? this.storage : ram

    return (name) => {
      return storage(`${key}/${name}`)
    }
  }

  // TODO: Implement onAddArchive to save dat details
  // TODO: Implement selectArchive UI
}

class Keys {
  constructor (storageKey) {
    this.storageKey = storageKey
  }

  add (key) {
    const existing = this.list()
    existing.push(key)
    window.localStorage.setItem(this.storageKey, existing.join(','))
  }

  list () {
    return (window.localStorage.getItem(this.storageKey) || '').split(',')
  }

  has (key) {
    return this.list().indexOf(key) !== -1
  }
}
