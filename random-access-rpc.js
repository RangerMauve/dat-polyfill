var randomAccess = require('random-access-storage')

module.exports = {
  client: client,
  server: server
}

function client (rpc) {
  return function (name) {
    return randomAccess({
      open: (request) => {
        rpc.call('open', name, request.callback.bind(request))
      },
      read: (request) => {
        rpc.call('read', name, request.offset, request.size, request.callback.bind(request))
      },
      write: (request) => {
        rpc.call('write', name, request.offset, request.data, request.callback.bind(request))
      },
      del: (request) => {
        rpc.call('del', name, request.offset, request.size, request.callback.bind(request))
      },
      close: (request) => {
        rpc.call('close', name, request.callback.bind(request))
      },
      destroy: (request) => {
        rpc.call('destroy', name, request.callback.bind(request))
      }
    })
  }
}

function server (storage) {
  var storageCache = {}
  return {
    open: (name, callback) => {
      if (!storageCache[name]) {
        storageCache[name] = storage(name)
      }
      storageCache[name].open(callback)
    },
    read: (name, offset, size, callback) => {
      storageCache[name].read(offset, size, callback)
    },
    write: (name, offset, data, callback) => {
      storageCache[name].write(offset, data, callback)
    },
    del: (name, offset, size, callback) => {
      storageCache[name].del(offset, size, callback)
    },
    close: (name, callback) => {
      storageCache[name].close(callback)
    },
    destroy: (name, callback) => {
      storageCache[name].destroy(callback)
    }
  }
}
