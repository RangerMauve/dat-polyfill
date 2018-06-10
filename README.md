# dat-polyfill
Add support for the DatArchive API to the web

## How to

- Set up a local instance of this [dat-gateway]([dat-gateway](https://github.com/RangerMauve/dat-gateway) for, or use [this public one](http://gateway.mauve.moe:3000)
- Add a script tag pointing to `{gateway URL here}/TODO, COMPILE AND PUBLISH/dat-polyfill.js` to your application.
- Alternately you can build your own version
	- Clone the repo `git clone git@github.com:RangerMauve/dat-polyfill.git`
	- Run `npm install` and `npm run build`
	- Publish the `build` folder to dat
	- Add the same script tag as above, but replace the dat key with your own
- The script will automatically detect the gateway that it's being served from
- Profit!

## Limitations

- Make sure the polyfill runs before any of your application code to make sure it's included the necessary globals
- Since data is stored in IndexedDB, there's a limit on how much you can store
- Synchronizing with a public gateway isn't as secure as using a local one since it can inspect the dat URLs you are trying to load.
- Gateways and IndexedDB are a lot slower than what Beaker supports
- If you're serving content from an iframe, make sure it has the appropriate [sandbox attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) set up to allow scripts and allow-same-origin to enabled storage in IndexedDB

## How it works

It uses a [dat-gateway](https://github.com/RangerMauve/dat-gateway) in order to replicate Dats with the rest of the Dat ecosystem over websockets.

Archives that weren't created by the user are loaded in-memory using [random-access-memory](https://github.com/random-access-storage/random-access-memory)

Data is de-duplicated between origins by storing created dats within an [random-access-idb](https://github.com/random-access-storage/random-access-idb) instance in an iframe loaded to the same URL as the dat-polyfill being used in the script tag. This iframe is created automatically and is used for the `selectArchive` UI. The data is stored in the `dat://storage` database within the iframe.

It uses the following logic to detect a Dat gateway to use:
- It will build a list of potential gateways using the following
	- A local gateway on `http://localhost:3000`. Uses the `lvh.me` domain in order to support subdomain redirection
	- The global variable `DEFAULT_DAT_GATEWAY` if it exists
	- The gateway used to serve the script file
- It will go through the list and attempt to access `{gateway_url}/{dat server url}/.well-known/dat` which is a special URL that the gateway is guaranteed to respond to with the dat URL

When a new DatArchive is created through either `DatArchive.create()` or `DatArchive.fork()`, the "server iframe" gets a `window.postMessage` event which tells it to save the private key and set up indexedDB storage for the dat. `window.postMessage` is used for all data reads and writes.

it gets stored in IndexedDB inside the `dat://storage` DB. All these dats share the same IndexedDB instance, but they are separated from each other. The list of created archives is stored in `localStorage.getItem('dat://storage')`.