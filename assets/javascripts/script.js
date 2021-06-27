import { 
  TILE_STATUSES,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose 
} from './minesweeper.js'

MicroModal.init();

const BOARD_SIZE = 15
const NUMBER_OF_MINES = 40

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES)
const boardElement = document.getElementById('board')
const minesLeftText = document.querySelector('[data-mine-count]')

const resultsText = document.querySelector('[data-message]')
const currentRecord = localStorage.getItem('minesweeperRecord')
const recordTexts = document.querySelectorAll('[data-record]')
const recentScore = document.querySelector('[data-recent-score]')

const playAgainBtn = document.getElementById('playAgain')

let timerHTML = document.querySelector('[data-timer]')
var timer = new Timer()

displayUserRecord(currentRecord)

board.forEach(row => {
  row.forEach(tile => {
    boardElement.append(tile.element)
    tile.element.addEventListener('click', () => {
      initializeCounterOnce()
      revealTile(board, tile)
      checkGameEnd()
    })
    tile.element.addEventListener('contextmenu', event => {
      event.preventDefault()
      markTile(tile)
      listMinesLeft()
    })
  })
})
  
boardElement.style.setProperty('--size', BOARD_SIZE)
minesLeftText.textContent = NUMBER_OF_MINES

function listMinesLeft() {
  const markedTilesCount = board.reduce((count, row) => {
    return count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
  }, 0)

  minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount
}

function checkGameEnd() {
  const win = checkWin(board)
  const lose = checkLose(board)

  if(win || lose) {
    boardElement.addEventListener('click', stopProp, { capture: true })
    boardElement.addEventListener('contextmenu', stopProp, { capture: true })
  }

  if(win) {
    const totalTime = timer.getTimeValues().toString(['minutes', 'seconds'])
    stopTime()

    MicroModal.show('results-modal')

    recentScore.textContent = totalTime
    resultsText.textContent = 'Congratulations, you won! 🎉'

    if(!currentRecord || totalTime < currentRecord) {
      localStorage.setItem('minesweeperRecord', totalTime)
      displayUserRecord(totalTime)
    }
  }

  if(lose) {
    stopTime()

    board.forEach(row => {
      row.forEach(tile => {
        if(tile.TILE_STATUSES === TILE_STATUSES.MARKED) markTile(tile)
        if(tile.mine) setTimeout(() =>  revealTile(board, tile), 1500)
      })
    })

    setTimeout(() => {
      MicroModal.show('results-modal')
      resultsText.textContent = 'Oh no... you lost 😔'
      recentScore.textContent = '––:––'
    }, 4000)
  }
}

function stopProp(e) {
  e.stopImmediatePropagation()
}

function displayUserRecord(record) {
  if(currentRecord) recordTexts.forEach(el => el.textContent = record)
}

function startTime() {
  timer.start()
  updateTimer()
}

function stopTime() {
  timer.stop()
  updateTimer()
}

function updateTimer() {
  timer.addEventListener('secondsUpdated', function (e) {
    timerHTML.innerText = timer.getTimeValues().toString(['minutes', 'seconds'])
  })
}

function initializeCounterOnce() {
  initializeCounterOnce = function() {}
  startTime()
}

playAgainBtn.addEventListener('click', () => {
  window.location.reload()
})