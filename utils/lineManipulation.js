const clearLastLine = () => {
  process.stdout.moveCursor(0, -1) // up one line
  process.stdout.clearLine(1) // from cursor to end
  process.stdout.moveCursor(0, 1)
}

const clearLines = (lineCount) => {
  process.stdout.moveCursor(0, -1* lineCount) // up one line

  process.stdout.clearScreenDown()

  process.stdout.moveCursor(0, lineCount)
}


module.exports = { clearLastLine, clearLines }