import { withPixiApp, ParticleContainer, Container } from "@inlet/react-pixi"
import * as PIXI from 'pixi.js'
import React, { Component } from 'react'
import { GameContext } from "./context";
import { OTHER_CONSTANTS, Note, bind, eventHandler, DefaultGameState as game, DefaultGlobalState as overall } from "./game";
import { changeGameStateByScore, reJudgeScore } from "../logic/scoreLogic";
import { hideSprite, showSprite, zoomSprite, GetTexture, GetParams, isSpliterNote, isSingleNote, isBigNote, isDrumrollNote, isBalloonNote, GetFlyingNoteCode } from "./utils";
import { MOVING_TEXT, STATIC_TEXT_STYLE, JUDGE_MODES, DEFAULT_DIMENSIONS } from "./constants";

let JudgeStandards = JUDGE_MODES[overall.judgeMode]

const textures = {
    "1": [null, null],
    "2": [null, null],
    "3": [null, null],
    "4": [null, null],
    "5": [null, null, null],
    "6": [null, null, null],
    "7": [null],
}
let TransparentTexture = null
const isHidden = sprite => sprite instanceof Array ? sprite.every(isHidden) : !sprite.visible || sprite.alpha === 0

const getTextSprite = note => {
    let firstSprite = note.sprite instanceof Array ? note.sprite[2] : note.sprite
    return firstSprite ? firstSprite.textSprite : null
}

const GetSpriteFromNoteCode = (code, game) => {
    let loader = overall.loader

    //setTexture after initialization
    if (!textures["1"][0]) {
        textures["1"][0] = GetTexture(loader, "note1-1")
        textures["1"][1] = GetTexture(loader, "note1-2")
        textures["2"][0] = GetTexture(loader, "note2-1")
        textures["2"][1] = GetTexture(loader, "note2-2")
        textures["3"][0] = GetTexture(loader, "note3")
        textures["3"][1] = GetTexture(loader, "note3")
        textures["4"][0] = GetTexture(loader, "note4")
        textures["4"][1] = GetTexture(loader, "note4")

        textures["5"][0] = GetTexture(loader, "note5-start")
        textures["5"][1] = GetTexture(loader, "note5-mid")
        textures["5"][2] = GetTexture(loader, "note5-end")

        textures["6"][0] = GetTexture(loader, "note6-start")
        textures["6"][1] = GetTexture(loader, "note6-mid")
        textures["6"][2] = GetTexture(loader, "note6-end")
        textures["7"][0] = GetTexture(loader, "note7")
    }

    let d = DEFAULT_DIMENSIONS
    let text = MOVING_TEXT[code]
    let textSprite = null
    if (text) {
        if (text instanceof Array) {
            text = text.join('')
        }
        textSprite = new PIXI.Sprite(GetTexture(loader, "eng-txt-" + code))
        // textSprite = new PIXI.Text(text,STATIC_TEXT_STYLE.note)
        zoomSprite(textSprite, d.NOTE_TRACK_BOTTOM.h * 0.8 / textSprite.height)
        textSprite.x = -1000
        textSprite.anchor.set(.5)
        textSprite.y = d.NOTE_TRACK_BOTTOM.y + d.NOTE_TRACK_BOTTOM.h / 2
    }

    let sprite = null

    if (code === '|') {
        sprite = new PIXI.Sprite(GetTexture(loader, "spliter"))
        sprite.width = 3
        sprite.height = d.NOTE_TRACK.h - d.NOTE_TRACK_BOTTOM.h - 6
        sprite.y = d.NOTE_TRACK.y + 4
        sprite.x = -1000
    } else if (code === '1') {
        sprite = new PIXI.Sprite(textures["1"][0])
        sprite.alternativeTexture = textures["2"][0]
        sprite.x = -1000
        sprite.y = d.NOTE_TARGET.y
        sprite.anchor.set(0.5)
        zoomSprite(sprite, d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.small / sprite.height)
    } else if (code === '2') {
        sprite = new PIXI.Sprite(textures["2"][0])
        sprite.alternativeTexture = textures["1"][0]
        sprite.x = -1000
        sprite.y = d.NOTE_TARGET.y
        sprite.anchor.set(0.5)
        zoomSprite(sprite, d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.small / sprite.height)
    } else if (code === '3') {
        sprite = new PIXI.Sprite(textures["3"][0])
        sprite.alternativeTexture = textures["4"][0]
        sprite.x = -1000
        sprite.y = d.NOTE_TARGET.y
        sprite.anchor.set(0.5)
        zoomSprite(sprite, d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.large / sprite.height)
    } else if (code === '4') {
        sprite = new PIXI.Sprite(textures["4"][0])
        sprite.alternativeTexture = textures["3"][0]
        sprite.x = -1000
        sprite.y = d.NOTE_TARGET.y
        sprite.anchor.set(0.5)
        zoomSprite(sprite, d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.large / sprite.height)
    } else if (code === '5') {
        let spriteStart = new PIXI.Sprite(textures["5"][0])
        let spriteMid = new PIXI.Sprite(textures["5"][1])
        let spriteMid2 = new PIXI.Sprite(textures["5"][1])
        let spriteEnd = new PIXI.Sprite(textures["5"][2])
        spriteStart.x = -1000
        spriteStart.y = d.NOTE_TARGET.y
        spriteStart.anchor.set(0.5)
        spriteMid.x = -1000
        spriteMid.y = d.NOTE_TARGET.y
        spriteMid.anchor.set(0, 0.5)
        spriteEnd.x = -1000
        spriteEnd.y = d.NOTE_TARGET.y
        spriteEnd.anchor.set(0, 0.5)

        spriteMid2.x = -1000
        spriteMid2.y = d.NOTE_TARGET.y
        spriteMid2.anchor.y = 0.5

        spriteStart.width = spriteStart.height =
            spriteEnd.height = spriteMid2.height = spriteMid.height = d.NOTE_CONSTANTS.spriteToTrackScale.small * d.NOTE_TRACK.h
        spriteEnd.width = spriteEnd.height / 2
        spriteStart.textSprite = textSprite
        return zoomSprite([spriteEnd, spriteMid, spriteStart, spriteMid2],
            d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.small / spriteMid.height)
    } else if (code === '6') {
        let spriteStart = new PIXI.Sprite(textures["6"][0])
        let spriteMid = new PIXI.Sprite(textures["6"][1])
        let spriteMid2 = new PIXI.Sprite(textures["6"][1])
        let spriteEnd = new PIXI.Sprite(textures["6"][2])
        spriteStart.x = -1000
        spriteStart.y = d.NOTE_TARGET.y
        spriteStart.anchor.set(0.5)
        spriteMid.x = -1000
        spriteMid.y = d.NOTE_TARGET.y
        spriteMid.anchor.set(0, 0.5)
        spriteEnd.x = -1000
        spriteEnd.y = d.NOTE_TARGET.y
        spriteEnd.anchor.set(0, 0.5)

        spriteMid2.x = -1000
        spriteMid2.y = d.NOTE_TARGET.y
        spriteMid2.anchor.y = 0.5

        spriteStart.width = spriteStart.height =
            spriteEnd.height = spriteMid2.height = spriteMid.height = d.NOTE_CONSTANTS.spriteToTrackScale.small * d.NOTE_TRACK.h
        spriteEnd.width = spriteEnd.height / 2
        spriteStart.textSprite = textSprite
        return zoomSprite([spriteEnd, spriteMid, spriteStart, spriteMid2],
            d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.large / spriteMid.height)
    } else if (code === '7') {
        sprite = new PIXI.Sprite(textures["7"][0])
        sprite.x = -1000
        sprite.y = d.NOTE_TARGET.y
        sprite.anchor.set(DEFAULT_DIMENSIONS.NOTE_CONSTANTS.balloonHit.x, .5)
        zoomSprite(sprite, d.NOTE_TRACK.h * d.NOTE_CONSTANTS.spriteToTrackScale.mid / sprite.height)
    }

    if (sprite && textSprite) sprite.textSprite = textSprite
    return sprite
}

function setNote(beginX, endX, note) {
    let textSprite = getTextSprite(note)

    if (isSingleNote(note.code)) {
        note.sprite.position.x = beginX
    } else if (isDrumrollNote(note.code)) {
        let [end, mid, start, mid2] = note.sprite
        start.position.x = beginX
        mid.position.x = beginX
        mid.width = endX - beginX
        end.position.x = endX

        mid2.position.x = endX
        mid2.width = 100
        let rightXCoverPercent = 0.1 //For the sprite to show correctly, part of mid sprite need to be covered, the value is defined by this constant
        mid2.anchor.x = 1 - end.width * rightXCoverPercent / mid2.width
    } else if (isBalloonNote(note.code)) {
        let targetX = DEFAULT_DIMENSIONS.NOTE_TARGET.x
        if (beginX > targetX) {
            note.sprite.position.x = beginX
        } else if (endX < targetX) {
            note.sprite.position.x = endX
        } else {
            if (!note.balloonStart) {
                note.balloonStart = true
                note.currentBalloon = note.balloonCount
                note.sprite.position.x = targetX
            } else if (note.currentBalloon <= 0) {
                hideSprite(note.sprite, textSprite)
            }
        }
    } else if (isSpliterNote(note.code)) {
        note.sprite.position.x = beginX
        if (note.measure.state.barline === false) {
            hideSprite(note.sprite, textSprite)
        } else {
            showSprite(note.sprite, textSprite)
        }
    }
}

function reJudgeNote(game) {
    let note = game.lastKeyDownNote, result = game.lastKeyDownResult
    if (note && isBigNote(note.code) && result) {
        reJudgeScore(game)
        game.hit.type = game.lastKeyDownResult
        game.hit.state = 1
        game.hit.noteCode = note.code
        eventHandler({ type: 'score', note: null })
        game.lastKeyDownNote = null
        game.lastKeyDownResult = null
    }
}

let maxMeasure = 0
//Just use react component as a container, do not render by react
class MovingNotes extends Component {
    static contextType = GameContext

    constructor(props) {
        super(props)
        this.container = React.createRef(null)
    }

    componentDidUpdate() {
        let game = this.context
        TransparentTexture = GetTexture(overall.loader, "transparent")
        bind(Note, this, game)
        JudgeStandards = JUDGE_MODES[overall.judgeMode]
            ;[game.tabs.branches.N.measures, game.tabs.branches.E.measures, game.tabs.branches.M.measures]
                .forEach(measures => measures.forEach(measure => {
                    if (measure.notes)
                        measure.notes.forEach(note => {
                            note.sprite = GetSpriteFromNoteCode(note.code, game)
                            note.judged = false
                            if (note.sprite instanceof Array)
                                note.sprite.forEach(sprite => this.container.current.addChild(sprite))
                            else{
                                this.container.current.addChild(note.sprite)
                            }
                            let textSprite = getTextSprite(note)

                            if (textSprite) {
                                this.container.current.addChild(textSprite)
                            }
                        })
                }))
    }

    onTick(delta) {
        let { app, time, tab, dimensions } = GetParams(this)
        let { width, height } = dimensions
        let measures = tab.measures
        let nextCount = 0

        if (this.paused) {
            measures.forEach((measure, i) => {
                let realStartTime = measure.startTime + tab.config.measureOffset
                measure.notes.forEach(note => {
                    let startTime = realStartTime + note.startTime
                    let beginX = (startTime - time) * this.gameMode.scrollSpeed * measure.state.scroll * 1000 + dimensions.NOTE_TARGET.x
                        , endX = (startTime + note.duration - time) * this.gameMode.scrollSpeed * measure.state.scroll * 1000 + dimensions.NOTE_TARGET.x
                    setNote(beginX, endX, note)
                    let firstSprite = note.sprite instanceof Array ? note.sprite[2] : note.sprite
                    let textSprite = firstSprite.textSprite
                    if (textSprite) {
                        textSprite.position.x = firstSprite.position.x
                    }

                })

                measure.isPlaying = realStartTime <= time && measure.state.tpm + realStartTime >= time
            })
            this.isGGT = false
        } else {
            let hasGGT = false
            let isFirstBranch = true
            for (let i = 0; i < measures.length; i++) {
                let measureN = this.tabs.branches.N.measures[i];
                let measure = measureN.forking ? (
                    this.tabs.branches[this.tabs.activatedBranches[measureN.activatedBranchIndex]].measures[i]
                ) : measureN;
                let realStartTime = measure.startTime + tab.config.measureOffset
                let notes = measure.notes

                if (!measure.hide) {
                    if (time >= measure.startTime && (i == measures.length - 1 || time < measures[i + 1].startTime)) {
                        this.face = (measure.startFace + Math.floor(0.001 + (time - measure.startTime) / measure.state.tpb)) & 1
                    }

                    notes.forEach(note => {

                        let startTime = realStartTime + note.startTime


                        if (i > maxMeasure && time > startTime + JudgeStandards.OK / 1000) {
                            maxMeasure = i
                            // console.log('Current measure:' + maxMeasure);
                        }

                        if (isSingleNote(note.code) && !note.judged && (time > startTime + JudgeStandards.OK / 1000)) {
                            measure.countBad++;
                            note.judged = true
                            changeGameStateByScore(this, note, 'bad')
                            eventHandler({ type: 'score', note, result: 'bad' })
                        }

                        let beginX = (startTime - time) * this.gameMode.scrollSpeed * measure.state.scroll * 1000 + dimensions.NOTE_TARGET.x
                            , endX = (startTime + note.duration - time) * this.gameMode.scrollSpeed * measure.state.scroll * 1000 + dimensions.NOTE_TARGET.x

                        nextCount += endX >= -500
                        //change current tab when a song has forked path and
                        //the previous spliter passes the judge target 

                        if (isDrumrollNote(note.code)) {
                            if (note.duration + startTime < time && !note.passed) {
                                note.passed = true
                                this.lastDrumRollHit = this.continuousDrumRollHit
                                this.continuousDrumRollHit = 0
                            }
                        }

                        if (isSpliterNote(note.code) && note.forkCondition && Math.abs(time - startTime) < 0.1 && !note.judged && this.tabs.forked && isFirstBranch) {
                            isFirstBranch = false
                            note.judged = true
                            // console.log(overall.defaultBranch);
                            if (note.forkCondition == 'BRANCHEND') {
                                this.tabs.activatedBranches[note.activatedBranchIndex] = 'N'
                                this.branchChange = 'N'
                            } else {
                                let splitRes = note.forkCondition.split(/,|\s+/g)
                                console.assert(splitRes.length > 2)//must be liek "p,threshold1,threshold2 extra"
                                let forkMode = splitRes[0]
                                let t1 = splitRes[1]
                                let t2 = splitRes[2]

                                if (overall.defaultBranch == 'auto') {//switch branch based on conditions
                                    if (forkMode == 'r') {
                                        t1 = Number(t1)
                                        t2 = Number(t2)
                                        if (this.lastDrumRollHit < t1) {
                                            this.tabs.activatedBranches[note.activatedBranchIndex] = 'N'
                                            this.branchChange = 'N'
                                        } else if (this.lastDrumRollHit > t2) {
                                            this.tabs.activatedBranches[note.activatedBranchIndex] = 'M'
                                            this.branchChange = 'M'
                                        } else {
                                            this.tabs.activatedBranches[note.activatedBranchIndex] = 'E'
                                            this.branchChange = 'E'
                                        }
                                        this.lastDrumRollHit = 0
                                    } else if (forkMode == 'p') {
                                        t1 = Number(t1)
                                        t2 = Number(t2)

                                        let total = 0, good = 0;

                                        for (let j = 0; j < i; j++) {
                                            total += measures[j].countBad + measures[j].countOK + measures[j].countGood;
                                            good += measures[j].countGood;
                                        }

                                        let percent = ~~(good / total * 100);

                                        if (percent < t1) {
                                            this.tabs.activatedBranches[note.activatedBranchIndex] = 'N'
                                            this.branchChange = 'N'
                                        } else if (percent > t2) {
                                            this.tabs.activatedBranches[note.activatedBranchIndex] = 'M'
                                            this.branchChange = 'M'
                                        } else {
                                            this.tabs.activatedBranches[note.activatedBranchIndex] = 'E'
                                            this.branchChange = 'E'
                                        }
                                    }
                                } else {//always change to the defaultBranch
                                    this.branchChange = overall.defaultBranch
                                }
                            }
                        }

                        if (!note.sprite) return
                        setNote(beginX, endX, note)

                        let firstSprite = note.sprite instanceof Array ? note.sprite[2] : note.sprite
                        let textSprite = firstSprite.textSprite
                        if (textSprite) {
                            textSprite.position.x = firstSprite.position.x
                        }

                        if (this.isGGT && !isHidden(note.sprite) && isSingleNote(note.code)) {
                            note.sprite.texture = textures[note.code][this.face]
                        }

                        if (!isHidden(note.sprite) && (
                            !game.gameMode.showNote ||
                            (note._spriteTexture && game.gameMode.showNote))) {
                            if (isSingleNote(note.code)) {
                                if (!game.gameMode.showNote) {
                                    note._spriteTexture = note.sprite.texture
                                    note.sprite.texture = TransparentTexture
                                } else {
                                    note.sprite.texture = note._spriteTexture
                                    note._spriteTexture = null
                                }
                            }

                            if (isDrumrollNote(note.code)) {
                                if (!game.gameMode.showNote) {
                                    if (!note._spriteTexture) {
                                        note._spriteTexture = note.sprite.map(s => s.texture)
                                        note.sprite.forEach((_, i) => note.sprite[i].texture = TransparentTexture)
                                    }
                                } else {
                                    note.sprite.forEach((_, i) => note.sprite[i].texture = note._spriteTexture[i])
                                    note._spriteTexture = null
                                }
                            }

                            if (isBalloonNote(note.code)) {
                                if (!game.gameMode.showNote) {
                                    if (!note._spriteTexture) {
                                        note._spriteTexture = note.sprite.texture
                                        note.sprite.texture = TransparentTexture
                                    }
                                } else {
                                    note.sprite.texture = note._spriteTexture
                                    note._spriteTexture = null
                                }
                            }
                        }
                    })
                }

                measure.hide = nextCount === 0
                measure.isPlaying = realStartTime <= time && measure.state.tpm + realStartTime >= time
                hasGGT |= measure.state.ggt && measure.isPlaying
            }

            this.isGGT = hasGGT
        }
    }

    onKeyDown(e) {
        if (this.paused) {

        } else {
            let handleHitByNote = note => {
                if (note.code === '5') this.hit.noteCode = '1'
                else if (note.code === '6') this.hit.noteCode = '3'
                else this.hit.noteCode = (note.code == '3' || note.code == '1') ? '1' : (note.code == '2' || note.code == '4') ? '2' : '1'
            }

            if ([68, 70, 74, 75].indexOf(e.keyCode) === -1) return

            let { dimensions, tab, time } = GetParams(this)

            time -= overall.delay / 1000

            let breakLoop = false // only judge one note

            for (let i = 0; !breakLoop && i < tab.measures.length; i++) {
                let measure = tab.measures[i]
                let notes = measure.notes

                if (!measure.hide) {
                    for (let j = 0; !breakLoop && j < notes.length; j++) {
                        let note = notes[j]
                        let textSprite = getTextSprite(note)
                        console.assert(!!note.sprite, "No sprite found for current note")
                        if (isHidden(note.sprite) || note.code === '|') continue
                        let isGood = false, wrongHit = false
                        let timeDif = 1000000
                        let fly = null
                        let showHit = false, showJudge = false, hideAfterHit = false

                        let adjustedTime = time - overall.delay
                        let adjustedTargetX = dimensions.NOTE_TARGET.x - overall.delay * this.gameMode.scrollSpeed * measure.state.scroll
                        if (isDrumrollNote(note.code)) {
                            let [endSprite, midSprite, startSprite] = note.sprite
                            let beginX = startSprite.position.x, endX = endSprite.position.x

                            //for drumroll, large drumroll and balloon, hit = good
                            isGood = beginX <= adjustedTargetX && endX >= adjustedTargetX
                            if (isGood) {
                                this.continuousDrumRollHit++;
                            }
                            fly = { startTime: time, x: dimensions.NOTE_TARGET.x, y: dimensions.NOTE_TARGET.y, code: note.code }
                            showJudge = true
                        } else if (isSingleNote(note.code)) {
                            showHit = true
                            let x = note.sprite.position.x, y = note.sprite.position.y
                            timeDif = Math.abs(x - adjustedTargetX) / (this.gameMode.scrollSpeed * measure.state.scroll * 1000) * 1000;
                            
                            isGood = (
                                adjustedTime >= note.startTime + measure.startTime &&
                                adjustedTime <= note.startTime + measure.startTime + note.duration)

                            wrongHit = !isGood && (timeDif <= JudgeStandards.Bad && !(
                                ((note.code === '2' || note.code === '4') && (e.keyCode === 68 || e.keyCode === 75)) ||
                                ((note.code === '1' || note.code === '3') && (e.keyCode === 70 || e.keyCode === 74))
                            ))

                            fly = { startTime: time, x:dimensions.NOTE_TARGET.x, y, code: note.code }
                            hideAfterHit = true
                        } else if (isBalloonNote(note.code)) {
                            if ((e.keyCode === 70 || e.keyCode === 74) && note.currentBalloon > 0 && Math.abs(note.sprite.position.x - adjustedTargetX < 0.001)) {
                                isGood = true
                                if (note.currentBalloon === 1) fly = { startTime: time, x: dimensions.NOTE_TARGET.x, y: dimensions.NOTE_TARGET.y, code: '1' }
                            }
                        }


                        if (isGood || (!wrongHit && timeDif <= JudgeStandards.Good)) {
                            note.judged = true
                            if (showHit) {
                                this.hit.type = 'good'
                                this.hit.state = 1
                                handleHitByNote(note)
                            }

                            if (hideAfterHit) {
                                hideSprite(note.sprite, textSprite)
                            }

                            if (fly) this.fly.notes[GetFlyingNoteCode(note.code, e.keyCode)].push(fly)


                            if (showJudge) {
                                this.judge.state = 1
                                this.judge.type = 'good'
                            }
                            eventHandler({ type: 'score', note, result: 'good' })

                            //important rule about judging two keydown event, see game object
                            this.lastKeyDownNote = note
                            this.lastKeyDownResult = 'good'
                            breakLoop = true

                            if (isSingleNote(note.code)) {
                                note.bestResult = Math.max(note.bestResult, 2)
                                measure.countGood++;
                            }

                        } else if (!wrongHit && timeDif <= JudgeStandards.OK) {
                            note.judged = true
                            if (showHit) {
                                this.hit.type = 'ok'
                                this.hit.state = 1
                                handleHitByNote(note)
                            }

                            if (hideAfterHit) {
                                hideSprite(note.sprite, textSprite)
                            }

                            if (fly) this.fly.notes[GetFlyingNoteCode(note.code, e.keyCode)].push(fly)
                            if (showJudge) {
                                this.judge.state = 1
                                this.judge.type = 'ok'
                            }
                            eventHandler({ type: 'score', note, result: 'ok' })

                            this.lastKeyDownNote = note
                            this.lastKeyDownResult = 'ok'
                            breakLoop = true

                            if (isSingleNote(note.code)) {
                                note.bestResult = Math.max(note.bestResult, 1)
                                measure.countOK++;
                            }

                        } else if (wrongHit || timeDif <= JudgeStandards.Bad) {
                            note.judged = true
                            if (showHit) {
                                this.hit.type = 'bad'
                                this.hit.state = 1
                            }
                            if (hideAfterHit && (wrongHit || timeDif > JudgeStandards.Bad)) { // only when hit the correct note at the bad time, will the sprite disappear
                                hideSprite(note.sprite, textSprite)
                            }
                            if (showJudge) {
                                this.judge.state = 1
                                this.judge.type = 'bad'
                            }
                            eventHandler({ type: 'score', note, result: 'bad' })
                            breakLoop = true

                            if (isSingleNote(note.code)) {
                                measure.countBad++;
                            }

                        }
                    }
                }
            }
        }
    }

    onFJKeyDown(e) {
        if (this.paused) return
        reJudgeNote(this)
    }

    onDKKeyDown(e) {
        if (this.paused) return
        reJudgeNote(this)
    }

    render() {
        return (<Container
            // properties={{
            //     scale: true,
            //     position: true,
            //     rotation: true,
            //     uvs: true,
            //     alpha: true,
            // }}
            ref={this.container}>
        </Container>)
        // return (<Container ref={this.container}></Container>)
    }
}

export { GetSpriteFromNoteCode }

export default withPixiApp(MovingNotes)