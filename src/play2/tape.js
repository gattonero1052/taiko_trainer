import React, {Component} from "react";
import {GameContext} from "./context";
import {bind, Tape} from "./game";
import {withPixiApp, Sprite,Container} from "@inlet/react-pixi";
import {GetMid, GetLastTime, GetParams, GetTexture, showSprite, hideSprite, zoomSprite} from "./utils";
import {eventHandler} from "./game";
import {DefaultGlobalState as overall} from './game'
import { DEFAULT_DIMENSIONS } from "./constants";

const setParams = (game, component) => {
    let d = DEFAULT_DIMENSIONS
    let height = d.height - d.NOTE_TRACK_BOTTOM_INFO.y - d.NOTE_TRACK_BOTTOM_INFO.h/2

    //locate in the middle of bottom
    let tape = component.tapeRef.current
    let scale = height / tape.height
    let width = tape.width / tape.height * height
    let x = (DEFAULT_DIMENSIONS.width - width) / 2
    let y = DEFAULT_DIMENSIONS.height
    tape.width = width
    tape.height = height
    tape.position.x = x
    tape.position.y = y

    //locate switches
    let sswitch = component.speedSwitchRef.current, sswtichbg = component.speedSwitchBgRef.current
        , pswitch = component.progressSwitchRef.current, lface = component.leftFaceRef.current, rface = component.rightFaceRef.current

    let ssp = d.TAPE_CONSTANTS.speedSwitch, spp = d.TAPE_CONSTANTS.progressSwitch
    sswtichbg.anchor.set(.5)
    sswitch.anchor.set(.5)
    pswitch.anchor.set(.5)
    zoomSprite(sswtichbg, scale)
    zoomSprite(sswitch, scale)
    zoomSprite(pswitch, scale)
    sswtichbg.position.x = tape.position.x + width * ssp.x
    sswtichbg.position.y = tape.position.y + height * (ssp.y - 1)
    sswitch.position.x = sswtichbg.position.x
    component.speedMinY = tape.position.y + height * (ssp.ymin - 1)
    component.speedMaxY = tape.position.y + height * (ssp.ymax - 1)
    component.speedYRange = height * (ssp.ymax - ssp.ymin)
    sswitch.position.y = (component.speedMinY + component.speedMaxY) / 2
    pswitch.position.y = (spp.y - 1) * height + tape.position.y
    component.progressMinX = tape.position.x + width * spp.xmin
    component.progressMaxX = tape.position.x + width * spp.xmax
    component.progressXRange = width * (spp.xmax - spp.xmin)
    pswitch.position.x = component.progressMinX

    lface.anchor.set(.5)
    rface.anchor.set(.5)
    lface.height = (lface.width = height * d.TAPE_CONSTANTS.leftFace.d)
    rface.height = (rface.width = height * d.TAPE_CONSTANTS.rightFace.d)
    lface.position.x = d.TAPE_CONSTANTS.leftFace.x * width + tape.position.x
    lface.position.y = (d.TAPE_CONSTANTS.leftFace.y - 1)* height + tape.position.y
    rface.position.x = d.TAPE_CONSTANTS.rightFace.x * width + tape.position.x
    rface.position.y = (d.TAPE_CONSTANTS.rightFace.y - 1)* height + tape.position.y
}

const onEnteringTrainingMode = game=>{
    game.showTape = 1
    game.enteredTrainingMode = 1

    //move to the nearest progress when triggered by train mode
    if(game.trainingMode && game.progressChangedOnce===0){
        //for the first time, get the nearest measure's start time
        let time = (GetLastTime(game) - game.startTime) / 1000
        for(let i = 0;i<game.tab.measures.length;i++){
            let cur = game.tab.measures[i].startTime + game.tab.config.measureOffset
            if (cur<=time){
                game.newStartTimeInGame = cur * 1000
            }else{
                break
            }
        }
    }else{
        game.newStartTimeInGame = game.lastStartTimeInGame
    }

    game.tabSong.setProgress(game.newStartTimeInGame/1000)

    game.stopTime = 0
    game.trainingMode = 1;

    [game.tabs.branches.N.measures, game.tabs.branches.E.measures, game.tabs.branches.M.measures]
    .forEach(measures => measures.forEach((measure,i)=> {
        measure.hide = false
        let notes = measure.notes
        if(notes)
            notes.forEach(note=>{
                note.passed = false
                note.judged = false
                note.sprite.visible = true
                note.sprite.alpha = 1
                note.currentBalloon = 0
                note.balloonStart = 0
            })
    }))

    game.score = {...game.score, ...{
            state:1,
            percentage:0,
            startTime:0,
            current:0,
            last:0,
            isSuccess:0,
            combo:0,
            comboStartTime:0,
            comboState:0,
        },
    }

    game.score.comboTextRef.text = ''

    game.hit = {...game.hit,...{
            startTime: 0,
            type: 'good,ok,bad',
            state: 0,//0:not hit animation, 1:hit animation ready 2:hit animating
            noteCode: '1 2 3 4... anyway the hit animation differs based on the type of note',
        }
    }

    for(let type in game.fly.notes) {
        game.fly.notes[type].forEach(object=>{
            if(object.sprite){
                object.sprite.visible = 0
            }
        })
    }

    game.judge = {...game.judge,...{
            state: 0,//not in judge animation, 1:judge animation ready, 2: judge animating
            type: 'good,ok'
        }}

    game.drum = {...game.drum,...{
            keyStartTimes: [...Array(128)].fill(0),
        }
    }

    game.staticObjects = {...game.staticObjects,
            ggtStart:-1,
            ggtState:0,
            donStart:-1,
            donState:0,
            kaStart:-1,
            kaState:0,
    }

    game.ggt = {
            ...game.ggt,
            zoomState:0,
            zoomStart:-1,
            counter:0,
    }

    game.pauseMenu = {
        ...game.pauseMenu,
    }

    game.face = 0
    game.drum.dsprite.visible = false
    game.drum.fsprite.visible = false
    game.drum.jsprite.visible = false
    game.drum.ksprite.visible = false
    game.lastKeyDownTime = -1
    game.lastKeyDownNote = null
    game.lastKeyDownResult = null
    game.lastDrumRollHit = 0
    game.continuousDrumRollHit = 0
    eventHandler({type:'tick',forced:true})
    eventHandler({type:'score',forced:true})
}

class TapeComponent extends Component {
    static contextType = GameContext

    constructor(prop) {
        super(prop)
        this.tapeRef = React.createRef(null)
        this.speedSwitchBgRef = React.createRef(null)
        this.speedSwitchRef = React.createRef(null)
        this.progressSwitchRef = React.createRef(null)
        this.leftFaceRef = React.createRef(null)
        this.rightFaceRef = React.createRef(null)
        this.container = React.createRef(null)
    }

    componentDidUpdate() {
        let game = this.context
        bind(Tape, this, game)
        this.speedSwitchRef.current.interactive = true
        this.speedSwitchRef.current.on('pointerdown',this.onDragSpeedStart.bind(this))
        this.speedSwitchRef.current.on('pointerup',this.onDragSpeedEnd.bind(this))
        this.speedSwitchRef.current.on('pointermove',this.onDragSpeedMove.bind(this))
        this.speedSwitchRef.current.on('pointerupoutside',this.onDragSpeedEnd.bind(this))
        this.progressSwitchRef.current.interactive = true
        this.progressSwitchRef.current.on('pointerdown',this.onDragProgressStart.bind(this))
        this.progressSwitchRef.current.on('pointerup',this.onDragProgressEnd.bind(this))
        this.progressSwitchRef.current.on('pointerupoutside',this.onDragProgressEnd.bind(this))
        this.progressSwitchRef.current.on('pointermove',this.onDragProgressMove.bind(this))
        game.tape.container = this.container.current
        game.tape.tapeRef = this
        game.tape.switchRef = this.speedSwitchRef.current
        game.tape.progressRef = this.progressSwitchRef.current
        game.tape.leftFaceRef = this.leftFaceRef.current
        game.tape.rightFaceRef = this.rightFaceRef.current
        setParams(game, this)
    }

    onTick(){
        let {time,tab} = GetParams(this)
        let totalTime = tab.measures[tab.measures.length-1].startTime + tab.measures[tab.measures.length-1].state.tpm
        let scale = time/totalTime
        this.tape.progressRef.position.x = Math.min(this.tape.tapeRef.progressMaxX, this.tape.tapeRef.progressMinX + scale * this.tape.tapeRef.progressXRange)

        if(!this.paused){
            this.tape.leftFaceRef.rotation += 0.005
            this.tape.rightFaceRef.rotation += 0.005
        }

        if(this.showTape)
            showSprite(this.tape.container)
        else
            hideSprite(this.tape.container)
    }

    onDragSpeedStart(){
        if(!this.context.trainingMode) return

        let sprite = this.speedSwitchRef.current
        sprite.dragging = true

        //Entering Progress Mode
        let game = this.context
        if(!game.trainingMode) onEnteringTrainingMode(game)
    }

    onDragSpeedEnd(){
        if(!this.context.trainingMode) return

        let sprite = this.speedSwitchRef.current
        sprite.dragging = false
    }

    onDragSpeedMove(e){
        let game = this.context
        if(!game.paused) return

        let sprite = this.speedSwitchRef.current
        if(sprite.dragging){
            const newPosition = e.data.global
            if (newPosition.y>=this.speedMinY && newPosition.y<=this.speedMaxY){
                let level = Math.round((newPosition.y - this.speedMinY)/this.speedYRange * (Tape.SPEEDLEVEL - 1))
                sprite.position.y = this.speedMinY + this.speedYRange/(Tape.SPEEDLEVEL - 1) * level
                game.speed = GetMid(Tape.MIN_SPEED,Tape.MAX_SPEED,1 - level/(Tape.SPEEDLEVEL-1))
                game.tabSong.setSpeed(game.speed)
            }
        }
    }

    onDragProgressStart(){
        if(!this.context.trainingMode) return

        let sprite = this.progressSwitchRef.current
        sprite.dragging = true

        //Entering Progress Mode
        let game = this.context
        if(!game.trainingMode) onEnteringTrainingMode(game)
    }

    onDragProgressEnd(){
        if(!this.context.trainingMode) return

        let sprite = this.progressSwitchRef.current
        sprite.dragging = false
    }

    onDragProgressMove(e){
        let game = this.context
        if(!game.paused) return

        let sprite = this.progressSwitchRef.current
        if(sprite.dragging){
            game.progressChangedOnce = 1
            let {tab} = GetParams(game)
            const newPosition = e.data.global
            if(newPosition.x>=this.progressMinX && newPosition.x<=this.progressMaxX){
                let scale = (newPosition.x - this.progressMinX) / this.progressXRange
                let dir = (newPosition.x - game.tape.lastMouseX)/(Math.abs(newPosition.x - game.tape.lastMouseX)+0.00001)
                game.tape.leftFaceRef.rotation += dir*(newPosition.x - sprite.position.x)*0.01
                game.tape.rightFaceRef.rotation += dir*(newPosition.x - sprite.position.x)*0.01
                sprite.position.x = newPosition.x
                game.tape.lastMouseX = newPosition.x
                //adjust time to the beginnning of measure
                //move the notes to corresponding time
                let measureIndex = Math.floor((tab.measures.length + 1) * scale+0.0001)
                if(measureIndex>0){//move to a specific measure
                    game.newStartTimeInGame =  (tab.config.measureOffset + tab.measures[measureIndex-1].startTime) * 1000
                }else{
                    game.newStartTimeInGame = 0
                }

                game.tabSong.setProgress(game.newStartTimeInGame/1000)
                eventHandler({type:'tick'})
            }
        }
    }

    render() {
        return (<Container ref={this.container}>
            <Sprite ref={this.progressSwitchRef} texture={GetTexture(overall.loader, "progress-switch")}></Sprite>
            <Sprite ref={this.tapeRef}{...DEFAULT_DIMENSIONS.TAPE}
                    texture={GetTexture(overall.loader, "tape")}/>
            <Sprite ref={this.speedSwitchBgRef} texture={GetTexture(overall.loader, "switch-bg")}></Sprite>
            <Sprite ref={this.speedSwitchRef} texture={GetTexture(overall.loader, "switch")}></Sprite>
            <Sprite ref={this.leftFaceRef} texture={GetTexture(overall.loader, "tape-face")}></Sprite>
            <Sprite ref={this.rightFaceRef} texture={GetTexture(overall.loader, "tape-face")}></Sprite>
        </Container>)
    }
}
export {onEnteringTrainingMode}
export default withPixiApp(TapeComponent)