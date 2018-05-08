async function receiveMessage (event) {
// console.log(event.data)
  let data = event.data
  if (typeof data === 'string' && data.startsWith('dat:')) {
    let datAddress = data
    let forkedArchive = await DatArchive.fork(datAddress)
    console.log('we forked!')
  }
}

window.addEventListener('message', receiveMessage, false)
