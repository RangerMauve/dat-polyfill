const RPC = require('../../rpc')
const idb = require('random-access-idb')

const DEFAULT_SELECT_MESSAGE = 'Select an archive'

const clientWindow = window.parent
const form = document.getElementById('selection-form')
const selectionItems = document.getElementById('selection-items')

const selectQueue = []
let currentSelection = null

const storage = idb('dat://storage')

const server = new RPC.Server(window, clientWindow, {
  storage,
  addArchive,
  selectArchive
})

form.addEventListener('submit', handleSelected)

window.gatewayServer = server
window.gatewayStorage = storage

function addArchive (key, secretKey, options, callback) {
  const archiveList = getArchives()
  archiveList.push({
    key,
    secretKey,
    details: options
  })
  setArchives(archiveList)
  callback(null)
}

function selectArchive (options, callback) {
  selectQueue.push({
    options: options,
    callback: callback
  })

  showNext()
}

function showSelection (selectionItem) {
  currentSelection = selectionItem
  const archiveList = getArchives()
  const renderedItems = archiveList.map((archive) => {
    return `
    <label class="select-item">
      <input type="checkbox" value="${archive.key}">
      ${archive.details.title || archive.key}
    </label>
`
  })
  const toRender = `
    <div class="select-message">
      ${selectionItem.options.title || DEFAULT_SELECT_MESSAGE}
    </div>
    ${renderedItems.join('\n')}
`

  selectionItems.innerHTML = toRender
  form.classList.remove('hidden')
}

function showNext () {
  if (!currentSelection) {
    showSelection(selectQueue.shift())
  }
}

function hideForm () {
  form.classList.add('hidden')
}

function handleSelected (e) {
  e.preventDefault()

  if (currentSelection) {
    const input = form.querySelector('input:checked')
    const url = `dat://${input.value}`
    currentSelection.callback(false, url)
    currentSelection = null
  }

  if (selectQueue.length === 0) {
    hideForm()
  } else {
    showNext()
  }
}

function setArchives (newList) {
  window.localStorage.archives = JSON.stringify(newList)
}

function getArchives () {
  return JSON.parse(window.localStorage.archives || '[]')
}
