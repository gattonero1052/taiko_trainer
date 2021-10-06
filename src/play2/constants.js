const HEIGHT = 937, WIDTH = 1920;//the standard size

const NOTE_DRUM_BORDER = { x: 0, y: 252, w: 300, h: 210 }
const NOTE_DRUM = { x: 35, y: 248, width: 210, height: 215 }
const NOTE_TARGET = { x: 450, y: 343, r: 64, r2: 43 }
const NOTE_TARGET_TEXT = { x: NOTE_TARGET.x, y: 260, bounce: 10 }
const NOTE_FLY_END = { x: 1780, y: 80 }
const NOTE_BLAST = { blurSize: 2, x: NOTE_TARGET.x, y: NOTE_TARGET.y, smallSize: 200, bigSize: 280 }
const NOTE_BLAST_CENTER = { x: NOTE_TARGET.x, y: NOTE_TARGET.y, height: 200, width: 200 }
const NOTE_TRACK = { x: 0, y: 252, h: 210 }
const NOTE_TRACK_BOTTOM = { x: 0, y: 418, h: 44 }
const NOTE_TRACK_BOTTOM_INFO = { x: 0, y: 462, h: 100 }
const SCORE_NUMBER = { x: 1846, y: 151, anchor: { x: 1, y: 0 }, bounce: 10 }
const SCORE_BOARD_LEFT = { x: 841, y: 68, h: 42 }
const SCORE_BOARD_RIGHT = { x: 1517, y: 38, w: 290 }
const SCORE_COMBO = { x: 146, y: 324, anchor: 0.5, bounce: 10 }
const TAPE = { anchor: { x: 0, y: 1 } }
const MENU_CONSTANTS = { w: 0.8, h: 0.8, radius: 10, border: 20 }
const TAPE_CONSTANTS = {
    speedSwitch: { x: 657 / 1318, y: 254 / 554, ymax: 169 / 280, ymin: 89 / 280 },
    progressSwitch: { y: 16 / 554, xmin: 83 / 879, xmax: 790 / 879 },
    leftFace: { x: 120 / 447, y: 123 / 278, d: 65 / 278 },
    rightFace: { x: 330 / 447, y: 123 / 278, d: 65 / 278 },
}
const BRANCH_NAME = { x: 1620, y: 300, h: 210 }

const BG = {
    MOVING_ELEMENTS_HEIGHT: 100
}
const GGT = {
    x: NOTE_TARGET.x, y: NOTE_TARGET.y, r: NOTE_TARGET.r + 10, spread: 2, fireSize: [30, 70]
}

const NOTE_CONSTANTS = {
    spriteToTrackScale: { small: 1 / 2, mid: 1 / 1.75, large: 1 / 1.5 },
    balloonHit: { x: 97 / 473, y: 0.5 }
}

const TRACK_CONSTANTS = {
    don: { x: 1 / 2, width: 1 },
    ka: { x: 1 / 2, width: 1 },
    ggt: { x: 1 / 2, width: 1 }
}

const STATIC_TEXT = {
    pass: { x: 1445, y: 25 },
    soul: { x: 1720, y: 3 },
    difficulty: { anchor: { x: 1 }, x: 1845, y: 472 }
}

const RESULT = {
    bgTop: {
        x: 0, y: 0, anchor: { x: 0, y: 1 }, width: WIDTH, height: HEIGHT / 2
    },
    bgBottom: {
        x: 0, y: HEIGHT, anchor: { x: 0, y: 0 }, width: WIDTH, height: HEIGHT / 2
    }
}

const DEFAULT_DIMENSIONS = {
    adjusted:false,
    WIDTH, HEIGHT, RESULT, BRANCH_NAME, MENU_CONSTANTS, BG, TRACK_CONSTANTS, GGT,
    NOTE_CONSTANTS, TAPE_CONSTANTS, TAPE, SCORE_COMBO, SCORE_NUMBER, STATIC_TEXT,
    NOTE_DRUM_BORDER, NOTE_DRUM, NOTE_TARGET, NOTE_TARGET_TEXT,
    NOTE_FLY_END, NOTE_BLAST, NOTE_BLAST_CENTER, NOTE_TRACK, NOTE_TRACK_BOTTOM,
    NOTE_TRACK_BOTTOM_INFO, SCORE_BOARD_LEFT, SCORE_BOARD_RIGHT
}

const STATIC_TEXT_STYLE = {
    result_title: {
        fontFamily: 'TnT',
        "lineJoin": "round",
        "strokeThickness": 2,
        "whiteSpace": "normal"
    },

    result_progress_index: {
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: '#4a1850',
        strokeThickness: 4,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    },

    result_item_key: {
        fontFamily: 'TnT',
        "lineJoin": "round",
        "strokeThickness": 2,
        "whiteSpace": "normal"
    },

    result_item_value: {
        fontFamily: 'TnT',
        "lineJoin": "round",
        "strokeThickness": 2,
        "whiteSpace": "normal"
    },

    branch: {
        fontFamily: 'TnT',
        "dropShadow": true,
        "dropShadowAlpha": 0.5,
        "dropShadowBlur": 5,
        "fontSize": 50,
        "lineJoin": "round",
        "strokeThickness": 2,
        "whiteSpace": "normal"
    },
    game_menu: {
        fontFamily: 'taiko',
        fontSize: 50,
        fill: '#ffffff',
        letterSpacing: 10,
        stroke: '#000000',
        strokeThickness: 10,
    },
    combo: {
        fontFamily: 'TnT',
        fontSize: 70,
        fill: '#ffffff',
        letterSpacing: 15,
        stroke: '#000000',
        strokeThickness: 10,
    },
    combo_low: {
        fill: ['#ffffff'],
    },
    combo_high: {
        fill: ['#ffff00', '#ff4900'],
    },
    score: {
        fontFamily: 'TnT',
        fontSize: 70,
        fill: '#ffffff',
        letterSpacing: 15,
        stroke: '#000000',
        strokeThickness: 10,
    },
    hit_good: {
        fontFamily: 'TnT',
        fill: ['#ffff00', '#ff4900'],
        fontSize: 50,
        stroke: '#000000',
        strokeThickness: 10,
    },
    hit_ok: {
        fontFamily: 'TnT',
        fill: ['#ffffff'],
        fontSize: 50,
        stroke: '#000000',
        strokeThickness: 10,
    },
    hit_bad: {
        fontFamily: 'TnT',
        fill: ['#5262e4', '#ffaede'],
        fontSize: 50,
        stroke: '#000000',
        strokeThickness: 10,
    },
    note: {
        fontFamily: 'TnT',
        fill: ['#ffffff'],
        fontSize: DEFAULT_DIMENSIONS.NOTE_TRACK_BOTTOM.h - 20,
        stroke: '#000000',
        strokeThickness: 4,
    },

    difficulty: {
        fontFamily: 'qnyy',
        fill: ['#ffffff'],
        fontSize: 55
    },

    pass: {
        fontFamily: 'qnyy',
        fontWeight: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        fill: ['#ffffff'],
        fontSize: 40,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 10,
    },
    soul: {
        fontFamily: 'qnyy',
        fontWeight: 'bold',
        stroke: '#000000',
        strokeThickness: 15,
        fill: ['#ffffff'], fontSize: 100,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 10,
    }
}
const MOVING_TEXT = {
    '|': '',
    '1': 'Do',
    '2': 'Ka',
    '3': 'DON',
    '4': 'KA',
    '5': ['Drum roll', '-', '!!'],
    '6': ['Drum roll', '-', '!!'],
    '7': 'Ballon',
}

const JUDGE_MODES = {
    '0': { 'Good': 50 / 2, 'OK': 150 / 2, 'Bad': 217 / 2 },//normal
    '1': { 'Good': 150 / 2, 'OK': 217 / 2, 'Bad': 400 / 2 },//loose
    '2': { 'Good': 25 / 2, 'OK': 50 / 2, 'Bad': 150 / 2 },//strict
}

const autoFit = () => {
    try {
        if (DEFAULT_DIMENSIONS.adjusted){
            return
        }

        let d = DEFAULT_DIMENSIONS
        // let dimension = document.querySelector('#root').getBoundingClientRect()
        // let {width,height} = dimension
        let width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        let height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;


        let scale = (width / WIDTH + height / HEIGHT) / 2

        function fit(obj, { standard = false, skips = [], xs = [], ys = [], ss = [] } = {}) {
            let wScale = width / WIDTH, hScale = height / HEIGHT
            const hw = height / width, HW = HEIGHT / WIDTH

            if (standard) {
                wScale = hw>HW ? height / HW / WIDTH : wScale
            }

            for (let key in obj) {
                if (skips.indexOf(key) > -1) continue;

                if ('x width w'.split(' ').concat(xs).indexOf(key) > -1) {

                    obj[key] = ~~((Number(obj[key]) || 0) * wScale)
                } else if ('y height h bounce'.split(' ').concat(ys).indexOf(key) > -1) {

                    obj[key] = ~~((Number(obj[key]) || 0) * hScale)
                } else if ('radius r border'.split(' ').concat(ss).indexOf(key) > -1) {
                    obj[key] = ~~((Number(obj[key]) || 0) * scale)
                }
            }
        }

        function fitAll(obj) {
            for (let key in obj) {
                fit(obj[key])
            }
        }

        fitAll(d.RESULT)
        fit(d.BRANCH_NAME)
        fit(d.MENU_CONSTANTS, { skips: ['w', 'h'] })
        fit(d.BG, { ys: ['MOVING_ELEMENTS_HEIGHT'] })
        fit(d.GGT, { standard:true, ss: ['fireSize'] })
        fit(d.SCORE_COMBO)
        fit(d.SCORE_NUMBER)
        fitAll(d.STATIC_TEXT)
        fit(d.NOTE_DRUM_BORDER, { standard: true })
        fit(d.NOTE_DRUM, { standard: true })
        fit(d.NOTE_TARGET, { ss: ['r2'], standard: true })
        fit(d.NOTE_TARGET_TEXT, { standard: true })
        fit(d.NOTE_FLY_END)
        fit(d.NOTE_BLAST, { standard: true, ss: ['smallSize', 'bigSize'] })
        fit(d.NOTE_BLAST_CENTER, { standard: true })
        fit(d.NOTE_TRACK)
        fit(d.NOTE_TRACK_BOTTOM)
        fit(d.NOTE_TRACK_BOTTOM_INFO, { standard: true })
        fit(d.SCORE_BOARD_LEFT)
        fit(d.SCORE_BOARD_RIGHT)

        for (let key in STATIC_TEXT_STYLE) {
            for (let property in ['letterSpacing', 'fontSize', 'strokeThickness', 'dropShadowDistance', 'dropShadowBlur']) {
                if (STATIC_TEXT_STYLE[key].hasOwnProperty(property)) {
                    STATIC_TEXT_STYLE[key][property] *= scale
                }
            }
        }

        d.WIDTH = width;
        d.HEIGHT = height;
        // console.log(d);
        d.adjusted = true
    } catch (e) {
        console.error('Failed at auto fitting size.' + e)
    }
}

export { autoFit, DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE, MOVING_TEXT, JUDGE_MODES }