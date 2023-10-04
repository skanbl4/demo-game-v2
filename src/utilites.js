export function animation(params) {
    const { clear, update, render, canvasProp } = params
    let past_ts = 0

    requestAnimationFrame(tick)

    function tick(ts) {
        requestAnimationFrame(tick)

        const diff = ts - past_ts
        const fps = 1000 / diff
        const second_part = diff / 1000
        past_ts = ts

        const metrics = {
            diff,
            fps,
            second_part,
        }

        update(metrics)
        clear()
        render()
    }
}

export function settings(id_game, size, gap) {
    const game_block = document.getElementById(id_game)
    return {
        square_size: size,
        gap: 1,
        width_sq: Math.floor((game_block.offsetWidth - gap) / (size + gap)),
        height_sq: Math.floor((game_block.offsetHeight - gap) / (size + gap)),
    }
}

export function score() {
    let user_score = 0
    return [function (i) {
        user_score += i * (i - 1)
        document.getElementById('score').innerText = `счёт ${user_score}`
    }, function () {
        user_score = 0
        document.getElementById('score').innerText = `счёт ${user_score}`
    }]
}