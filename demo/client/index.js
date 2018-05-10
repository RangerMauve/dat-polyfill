async function receiveMessage (event) {
// console.log(event.data)
  let data = event.data
  if (typeof data === 'string' && data.startsWith('dat:')) {
    let datAddress = data
    try {
      let forkedArchive = await DatArchive.fork(datAddress)
      console.log('we forked to', forkedArchive.url)
      // DatArchive.selectArchive()
      let theArchive = await DatArchive.selectArchive({})
      console.log('hey!')

      // const contents = `
      //   <title>Gateway Test</title>
      //   <p>Hello World!</p>
      //   `
      // const archive = await new DatArchive(forkedArchive.url)
      // await archive.writeFile('sayHello.html', contents)
      // console.log('Wrote sayHello.html to ' + forkedArchive.url)
    } catch (e) {
      console.log('Error: ' + e)
    }
  } else {
    if (typeof data.arguments !== 'undefined' && data.arguments.length > 1) {
      let url = data.arguments[1]
      if (typeof url === 'string' && url.startsWith('dat:')) {
        console.log('dat: ' + url)
        alert('Check console for progress on writing to ' + url)
        // let archive = await new DatArchive(url)
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', async (event) => {
  console.log('DOMContentLoaded in client')
  let archive = await DatArchive.selectArchive({})
  let url = archive.url
  console.log('primed selectArchive for ' + url)
  let nuArchive = await new DatArchive(url)
  const contents = `
        <title>Gateway Test</title>
        <p>Hello World!</p>
        `
  await archive.writeFile('sayHello.html', contents)
  console.log('Wrote sayHello.html to ' + nuArchive.url)
})

window.addEventListener('message', receiveMessage, false)
