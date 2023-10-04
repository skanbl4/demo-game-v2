import "./scss/main.scss"
import { animation, settings, score } from "./utilites"
import Field from "./classes/Field"

const canvas = document.getElementById('game')
const canvasCtx = canvas.getContext('2d')
const game_setting = settings('game-block', 20, 1)
const [increment_score, restart_score] = score()

const GameField = new Field(game_setting)
GameField.fillField()

canvas.addEventListener('click', (e) => {
    const count = GameField.click(e.offsetX, e.offsetY)
    increment_score(count)
})
document.getElementById('restart').addEventListener('click', (e) => {
    GameField.restart()
    restart_score()
})

canvas.width = game_setting.width_sq * (game_setting.square_size + game_setting.gap)
canvas.height = game_setting.height_sq * (game_setting.square_size + game_setting.gap)


animation({
    update() {
        GameField.preSettingMoving()
    },
    clear() {
        if (GameField.activeCount_ > 0) {
            canvasCtx.beginPath()
            canvasCtx.fillStyle = GameField.canvasBaseColor_
            GameField.activeSquareList_.forEach(square_list => {
                square_list.forEach(square_uuid => {
                    canvasCtx.rect(
                        GameField.squareList_.get(square_uuid).x_,
                        GameField.squareList_.get(square_uuid).y_,
                        GameField.squareSize_,
                        GameField.squareSize_)
                })
            })
            canvasCtx.fill()
        }
    },
    render() {
        if (GameField.activeCount_ > 0) {
            GameField.activeSquareList_.forEach((color_list, color) => {
                canvasCtx.beginPath()
                canvasCtx.fillStyle = color

                color_list.forEach(square_uuid => {
                    const new_cell = GameField.squareList_.get(square_uuid).insideCellId_

                    if (GameField.squareList_.get(square_uuid).moveToY_ !== null) {
                        GameField.squareList_.get(square_uuid).incrY_ = GameField.squareSpeed_
                    }

                    if (!GameField.squareList_.get(square_uuid).doDelete_) {
                        canvasCtx.rect(
                            GameField.squareList_.get(square_uuid).x_,
                            GameField.squareList_.get(square_uuid).y_,
                            GameField.squareSize_,
                            GameField.squareSize_
                        )
                        GameField.setNewCell(square_uuid, new_cell)
                    }

                    if (GameField.squareList_.get(square_uuid).moveToY_ === null) {
                        !GameField.checkBottomCell(GameField.squareGraph_.get(new_cell).nearCells.top) && color_list.delete(square_uuid)
                    }
                })

                canvasCtx.fill()
            })
        }
    }
})