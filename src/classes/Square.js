export default class Square {
    constructor(prop) {
        this.uuid_ = this.generateUuid_
        this.insideCellId_ = prop.cell_id
        this.currentCoordX_ = prop.x
        this.currentCoordY_ = prop.y
        this.color_ = this.startColor_

        this.doDelete_ = false
        this.stateMoving_ = false
        this.moveToY_ = null
    }

    static create(prop) {
        const newSquare = new Square(prop)
        return [newSquare.uuid_, newSquare]
    }

    get generateUuid_() {
        let dt = new Date().getTime()
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = (dt + Math.random() * 16) % 16 | 0
            dt = Math.floor(dt / 16)
            return (c == 'x' ? r : (r & 0x3 | 0x8).toString(16))
        })
    }

    get startColor_() {
        const color_list = [
            '#44aadd',
            '#aa44dd',
            '#aadd44',
            '#ddaa44',
            '#dd44aa',
            '#44ddaa',
        ]
        return color_list[Math.floor(Math.random() * color_list.length)]
    }

    get x_() {
        return this.currentCoordX_
    }
    get y_() {
        return this.currentCoordY_
    }

    set incrY_(val) {
        if (this.currentCoordY_ <= this.moveToY_ - val) {
            this.currentCoordY_ += val
        } else {
            this.currentCoordY_ = this.moveToY_
            this.moveToY_ = null
        }
    }
}