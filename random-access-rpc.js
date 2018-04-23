var randomAccess = require('random-access-storage')

module.exports = {
	client: client,
	server: server
}

function client(rpc) {
	return function(name) {
		return randomAccess({
			open: ({ callback }) => {
				rpc.call('open', name, callback)
			},
			read: ({ offset, size, callback }) => {
				rpc.call('read', name, offset, size, callback)
			},
			write: ({ offset, data, callback }) => {
				rpc.call('write', name, offset, data, callback)
			},
			del: ({ offset, size, callback }) => {
				rpc.call('del', name, offset, size, callback)
			},
			close: ({ callback }) => {
				rpc.call('close', name, callback)
			},
			destroy: ({ callback }) => {
				rpc.call('destroy', name, callback)
			}
		})
	}
}

function server(storage) {
	var storageCache = {}
	return {
		open: (name, callback) => {
			if(!storageCache[name])
				storageCache[name] = storage(name)
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