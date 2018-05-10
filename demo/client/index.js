async function receiveMessage (event) {
// console.log(event.data)
  let data = event.data
  if (typeof data === 'string' && data.startsWith('dat:')) {
    let datAddress = data
    try {
      let forkedArchive = await DatArchive.fork(datAddress)
      console.log('we forked to', forkedArchive.url)
      DatArchive.selectArchive()
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
  }
}
DatArchive.selectArchive()

window.addEventListener('message', receiveMessage, false)
