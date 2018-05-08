async function receiveMessage (event) {
  // Do we trust the sender of this message?
  // if (event.origin !== "http://example.com:8080")
  //     return;

  // console.log(event.data)
  let data = event.data
  if (typeof data === 'string' && data.startsWith('dat:')) {
    let datAddress = data
    let forkedArchive = await DatArchive.fork(datAddress)
    console.log('we forked!')
  }
}

window.addEventListener('message', receiveMessage, false)
