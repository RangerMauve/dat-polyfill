async function receiveMessage (event) {
// console.log(event.data)
  let data = event.data
  if (typeof data === 'string' && data.startsWith('dat:')) {
    let datAddress = data
    try {
      let forkedArchive = await DatArchive.fork(datAddress)
      console.log('we forked to', forkedArchive.url)
      // let theArchive = await DatArchive.selectArchive({})
      console.log('hey!')
      parent.location.reload()
    } catch (e) {
      console.log('Error: ' + e)
    }
  } else {
    if (typeof data.arguments !== 'undefined' && data.arguments.length > 1) {
      let url = data.arguments[1]
      if (typeof url === 'string' && url.startsWith('dat:')) {
        console.log('dat: ' + url)
        // let archive = await new DatArchive(url)
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', async (event) => {
  console.log('DOMContentLoaded in client')
  let archive = await DatArchive.selectArchive({})
  await archive._loadPromise
  let url = archive.url
  console.log('primed selectArchive for ' + url)
  const contents = `
        <title>Gateway Test</title>
        <p>Hello World!</p>
        `
  try {
    await archive.writeFile('sayHello.html', contents)
    console.log('Wrote sayHello.html to ' + url)
    alert('Wrote sayHello.html to ' + url)
    // change the iframe src to this url
  } catch (e) {
    alert('Error: ' + e)
    console.log('Error: ' + e)
  }
})

window.addEventListener('message', receiveMessage, false)
