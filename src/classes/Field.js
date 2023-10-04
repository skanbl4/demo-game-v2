import Square from "./Square";
export default class Field {
    constructor(prop) {
        this.width_ = prop.width_sq
        this.height_ = prop.height_sq
        this.squareSize_ = prop.square_size
        this.squareSpeed_ = 1
        this.gapSize_ = prop.gap

        this.squareGraph_ = new Map()
        this.markedColumnsList_ = new Map()
        this.squareList_ = new Map()
        this.activeSquareList_ = new Map()
        this.canvasBaseColor_ = '#FFFFFF'

        this.cavasAnimation_ = () => this.animation()
    }

    static cellXYtoStr(x, y) {
        return `x${x}y${y}`
    }

    set markColumn_(cX) {
        let rY = this.height_ - 1
        while (rY >= 0) {
            if (!!this.squareGraph_.get(`x${cX}y${rY}`)?.insideSquare) {
                --rY
            } else {
                this.markedColumnsList_.set(`x${cX}`, rY)
                rY = -1
            }
        }
    }

    get activeCount_() {
        let count = 0
        this.activeSquareList_.forEach(list => count += list.size)
        return count
    }

    restart() {
        this.squareGraph_.clear()
        this.markedColumnsList_.clear()
        this.squareList_.clear()
        this.activeSquareList_.clear()
        this.fillField()
    }

    calcCellKey(x, y) {
        return {
            x: Math.floor(x / (this.squareSize_ + this.gapSize_)),
            y: Math.floor(y / (this.squareSize_ + this.gapSize_))
        }
    }

    fillField() {
        for (let x = 0; x < this.width_; x++) {
            for (let y = 0; y < this.height_; y++) {
                const coord_x = x * this.squareSize_ + this.gapSize_ * (x + 1)
                const coord_y = y * this.squareSize_ + this.gapSize_ * (y + 1)
                const [is_busy, square_item] = this.createSquare(coord_x, coord_y, `x${x}y${y}`)
                this.squareGraph_.set(`x${x}y${y}`, {
                    x, y,
                    coordX: coord_x,
                    coordY: coord_y,
                    nearCells: {
                        top: y > 0 ? `x${x}y${y - 1}` : null,
                        right: x > 0 ? `x${x - 1}y${y}` : null,
                        bottom: y < this.height_ ? `x${x}y${y + 1}` : null,
                        left: x < this.width_ ? `x${x + 1}y${y}` : null,
                    },
                    isBusy: is_busy,
                    insideSquare: square_item
                })
            }
        }
    }

    createSquare(x, y, currentCell) {
        const [square_uuid, square_item] = Square.create({
            cell_id: currentCell,
            x,
            y,
        })
        this.squareList_.set(square_uuid, square_item)

        !this.activeSquareList_.has(square_item.color_) && this.activeSquareList_.set(
            square_item.color_,
            new Set()
        )
        this.activeSquareList_.get(square_item.color_).add(square_uuid)
        return [true, square_uuid]
    }

    propSquare(uuid) {
        return [this.squareList_.get(uuid).doDelete_, this.squareList_.get(uuid).color_]
    }

    click(clickedX, clickedY) {
        const cell = this.calcCellKey(clickedX, clickedY)
        const square_item = this.squareList_.get(this.squareGraph_.get(`x${cell.x}y${cell.y}`).insideSquare) || false

        if (square_item?.moveToY_ === null && !square_item?.doDelete_) {
            return this.checkNearSquare(square_item.uuid_)
        }
        return 0
    }

    preSettingMoving() {
        this.markedColumnsList_.forEach((nRow, col) => {
            for (let rY = nRow; rY >= 0; rY--) {
                const cellStr = `${col}y${rY}`
                !!this.squareGraph_.get(cellStr).insideSquare && this.checkBottomCell(cellStr)
            }
        })
        this.markedColumnsList_.clear()
    }

    checkNearSquare(square_uuid, precount = 0) {
        const target_cell_id = this.squareList_.get(square_uuid).insideCellId_
        const [target_doDelete, target_color] = this.propSquare(square_uuid)
        let eq_count = precount

        this.squareList_.get(square_uuid).doDelete_ = true

        for (const side in this.squareGraph_.get(target_cell_id).nearCells) {
            const cell_id = this.squareGraph_.get(target_cell_id).nearCells[side]
            const near_square_uuid = this.squareGraph_.get(cell_id)?.insideSquare

            if (this.squareList_.get(near_square_uuid)?.color_ === target_color && !this.squareList_.get(near_square_uuid)?.doDelete_) {
                eq_count === 0 && ++eq_count
                eq_count += this.checkNearSquare(near_square_uuid, 1)
            }
        }

        if (eq_count > 0) {
            this.activeSquareList_.get(target_color).add(square_uuid)
            this.squareGraph_.get(target_cell_id).isBusy = false
            this.squareGraph_.get(target_cell_id).insideSquare = null

            this.markColumn_ = this.squareGraph_.get(target_cell_id).x
        } else {
            this.squareList_.get(square_uuid).doDelete_ = false
        }

        console.log('eq_count ->', eq_count)
        return eq_count
    }

    checkBottomCell(targetCell) {
        const bottom_cell_key = this.squareGraph_.get(targetCell)?.nearCells.bottom
        const square_uuid = this.squareGraph_.get(targetCell)?.insideSquare

        if (square_uuid) {
            const [doDelete, color] = this.propSquare(square_uuid)

            if (this.squareGraph_.get(bottom_cell_key)?.insideSquare === null && !doDelete) {
                this.activeSquareList_.get(color).add(square_uuid)

                this.squareList_.get(square_uuid).moveToY_ = this.squareGraph_.get(bottom_cell_key).coordY
                return true
            }
        }
        return false
    }

    setNewCell(square_uuid) {
        const square_item = this.squareList_.get(square_uuid)
        const cell_item = this.squareGraph_.get(square_item.insideCellId_)

        if (square_item.y_ > cell_item.coordY) {
            this.squareGraph_.get(cell_item.nearCells.bottom).isBusy = true

            if (square_item.y_ > (cell_item.coordY + this.squareSize_ / 2)) {
                cell_item.isBusy = false
                cell_item.insideSquare = null

                square_item.insideCellId_ = cell_item.nearCells.bottom
                this.squareGraph_.get(cell_item.nearCells.bottom).insideSquare = square_uuid
                this.markColumn_ = cell_item.x
            }
        }
    }
}