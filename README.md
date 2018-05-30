# dat-polyfill
Add support for the DatArchive API to the web

## How to

- Clone the repo `git clone git@github.com:RangerMauve/dat-polyfill.git`
- `npm install` the dependencies
- Compile `polyfill.js` using your favorite [build tools](https://github.com/browserify/browserify)
- Embed the bundled JS into your HTML
	- Make sure it gets loaded before any application code
- Set up a [dat-gateway](https://github.com/RangerMauve/dat-gateway) on localhost:3000. You'll need to clone the repo since it's not on NPM
- Optionally set a global variable called `DEFAULT_DAT_GATEWAY` to point to the gateway you want. (Set it up before the polyfill loads)
- Profit!

## Limitations

- Since data is stored in IndexedDB, there's a limit on how much you can store
- Synchronizing with a public gateway isn't as secure as using a local one since it can inspect the dat URLs you are trying to load.
- `dat://` URLs aren't being redirected yet, so links and images/iframes might be broken. This will be addressed soon enough

## How it works

It uses a [dat-gateway](https://github.com/RangerMauve/dat-gateway) in order to replicate Dats with the rest of the Dat ecosystem over websockets

It uses the following logic to detect a Dat gateway to use:
- If the URL has the parameter `DAT_GATEWAY` in the query string, parse it out and use it 
- If the global variable `DEFAULT_DAT_GATEWAY` exists, use that
- If the page is being served through `dat-gateway` (by detecting the subdomain redirection logic), use that
- If `localStorage.DAT_GATEWAY` is defined, use that
- Use `http://localhost:3000`

When a new DatArchive is created through either `DatArchive.create()` or `DatArchive.fork()`, it gets stored in IndexedDB inside the `dat://storage` DB. All these dats share the same IndexedDB instance, but they are separated from each other. The list of created archives is stored in `localStorage.getItem('dat://storage')`.

When you use `new DatArchive(url)`, if it was created locally, it will load it from IndexedDB, else it will store it in memory.

It supports an `iframe` mode, where if it's served from within an iframe, it will delegate storage to the parent frame. Check out `demo/server/index.js` for how to set that up. The benefit is that storage is de-duplicated between origins.