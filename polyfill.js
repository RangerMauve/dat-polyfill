const DatArchive = require('dat-archive-web')
const DefaultManager = DatArchive.DefaultManager
const FrameManager = require('./FrameManager')

const isFrame = (window.parent !== window)

const gateway = window.DEFAULT_DAT_GATEWAY || `http:localhost:3000`

if(isFrame) {
	DatArchive.setManager(new FrameManager(gateway, window.parent))
} else {
	DatArchive.setManager(new DefaultManager(gateway))
}
