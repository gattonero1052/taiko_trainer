import {DEFAULT_DIMENSIONS} from "./constants";
import {GetLastTime, GetParams} from "./utils";
import {DEFAULT_SETTING} from '../setting/setting'

let t=0

class TabSong {
    constructor(game,song){
        this.delaytimeout = null
        this.musicStartTime = game.tab.config.musicOffset
        this.game = game
        this.song = song
        this.instance = null
        this.nextProgressStart = -1
        this.config = {
            start:0,
            volume: (DefaultGlobalState.musicVolume / 100) || 1,
            singleInstance:true,
            speed:1,
        }
    }

    onComplete(fn){
        this._onComplete = fn
        if(this.instance)
            this.instance.on('end',this._onComplete)
    }

    pause(){
        let {time} = GetParams(this.game)

        //only pause the music after music starts
        // console.log(this.instance, time, this.musicStartTime)
        if(this.instance && this.instance.progress<1 && time>=this.musicStartTime){
            this.instance.set('paused',1)
        }
    }

    play(){
        let {time} = GetParams(this.game)

        // t+=1
        // if(t==3){
        //     debugger
        // }
        if(time<this.musicStartTime){//before music starts
            if(this.instance) {
                this.instance.stop()
                this.instance.destroy()
                this.nextProgressStart = -1
            }
            //no else because instance only exist after music starts

            //add music start event into ticker
            if (this.delaytimeout === null){

                //keeps running until music starts
                this.delaytimeout = ()=>{
                    //in training mode, time only does not mean the time of music
                    if(this.game.trainingMode) return

                    let cur = GetParams(this.game).time
                    
                    if(cur>=this.musicStartTime){
                        this.instance = this.song.play(this.config)
                        this.instance.on('end',this._onComplete)
                        this.game.app.ticker.remove(this.delaytimeout)
                        this.delaytimeout = null
                    }
                }

                this.game.app.ticker.add(this.delaytimeout)
            }else{
            }
        }else{//after music starts
            if(!this.instance){
                this.instance = this.song.play(this.config)
                if(this._onComplete instanceof Function && this.instance && this.instance.on instanceof Function)
                    this.instance.on('end',this._onComplete)
                if(this.delaytimeout) this.game.app.ticker.remove(this.delaytimeout)
                this.delaytimeout = null
            }else{
                if(this.nextProgressStart!==-1){
                    this.nextProgressStart = -1
                    this.instance.stop()
                    this.instance.destroy()
                    this.instance = this.song.play(this.config)
                }else{
                    this.instance.set('paused',0)
                }
            }
        }
    }

    setSpeed(speed){
        if(this.instance) this.instance.set('speed',speed)
        this.config.speed = speed
    }

    /**
     * @param {*} progress in game time including music offset
     */
    setProgress(progress){
        let musicProgress = Math.max(0,progress - this.musicStartTime)
        this.config.start = musicProgress
        this.nextProgressStart = musicProgress
    }
}

const DefaultGameMode = {
    scrollSpeed:1,
    showNote:1,
    random:0
}

/**
 * The difference between DefaultGlobalState and DefaultGameState is:
 * 
 * DefaultGameState stores variables which will be reverted to default when game restarts
 * 
 * DefaultGlobalState stores the variables that stay the same even game restarts
 */
const DefaultGlobalState = {
    loader:null,
    //IN DEBUGGING, set to true
    loadComplete:true,
    musicVolume:100,
    effectVolume:100,
    delay:0,
    judgeMode:DEFAULT_SETTING.judgeMode,
    keyBoard:{...DEFAULT_SETTING.KEYBOARD},
    defaultBranch:'auto',
    // defaultBranch:'E'
}

const InitialGameState = {
    //game stage
    //0: playing stage, 1: pre ending  stage, 2: ending stage
    gameStage:0,

    //game state
    //0 game not ending (pause or play), 
    //1: game result animation1 start (playing ending animation), playing stage
    //2: game result animation1 end, game result animation2 start, pre ending stage
    //3:game result animation2 end, show result, ending stage
    //game can restart at any state
    gameState:0,

    //the "one keydown" event handler records the result after each hit regardless of the note type
    //if the note is a big note, and there is a "two keydown" event detected
    // right after the big note was judged by "one keydown" event handler,
    // we change the score and hit animation of the previous one,
    //but will not judge the note again
    //the judge result can't be changed after the first hit
    //no matter what the interval is between two keydown events
    //the reason is "any interval between keyboard event and judge will affect the game's feeling catastrophically"
    progressChangedOnce:0,//if progress was never changed, each time entering training mode, the position will be the nearest one, otherwise, it's the chosen one
    lastDrumRollHit:0,
    continuousDrumRollHit:0,
    lastKeyDownTime:-1,
    lastKeyDownNote:null,
    lastKeyDownResult:null,
    pauseMenu:{
        component:null,
        container:null,
        optionRefs:[],
        optionRightRefs:[],
        options:[0,0,0,0,0],
        pauseMenuSelectionIndex:0
    },
    gameObjects:[],
    showPausedMenu:0,
    lastTimeValue:0,
    lastTickTime:0,
    paused:0,
    gameMode:{...DefaultGameMode},
    speed:1,//game running speed
    startTime: 0,//ms, value of ticker.lastTime when game started/unpaused
    newStartTimeInGame:0,//ms, value of the start time in a song (with in [0,total time of a song]) selected by tape
    lastStartTimeInGame:-1,//ms, value of the start time in a song (with in [0,total time of a song]) last selected
    enteredTrainingMode:0,
    trainingMode:0,
    isGGT:false,//GOGOTIME
    branchChange:null,
    staticObjects:{
        trackBgStartChangeTime:-1,
        prevTrackTextSprite:null,
        nextTrackTextSprite:null,
        nextTrackBgColor:null,
        trackBgStartChangeColor:null,
        trackBgColor:0x2c2a2c,
        bgTopIndex:-1,
        bgBottomIndex:-1,
        container:null,
        movingElements:[],
        branchBgSpriteRef:null,
        steadyMovingSpriteRef:null,
        topTilingSpriteRef:null,
        bottomTilingSpriteRef:null,
        ggtSprite:null,
        donSprite:null,
        kaSprite:null,
        ggtStart:-1,
        ggtState:0,
        donStart:-1,
        donState:0,
        kaStart:-1,
        kaState:0,
    },
    ggt:{
        container:null,
        ggtSprite:null,
        zoomState:0,
        zoomStart:-1,
        counter:0,

        bgRef:null,
        bgSpriteRef:null,
        maskRef:null,
        centerSprite:null,
        partPoints:[]
    },
    stopTime: 0,
    app: null,
    tab: null,
    tabs: null,
    tabSong: null,
    score:{
        totalGood:0,
        totalOK:0,
        totalBad:0,
        state:0,
        percentage:0,
        comboTextRef:null,
        scoreTextRef:null,
        progressBarScoreRef:null,
        startTime:0,
        current:0,
        last:0,

        isSuccess:0,
        combo:0,
        maxCombo:0,
        comboStartTime:0,
        comboState:0,
    },
    hit: {
        startTime: 0,
        type: 'good,ok,bad',
        state: 0,//0:not hit animation, 1:hit animation ready 2:hit animating
        noteCode: '1 2 3 4... anyway the hit animation differs based on the type of note',
        container:null,
        hitBlur:null,
        smallGood: null,//should be instance of PIXI.Sprite
        bigGood: null,
        smallOK: null,
        bigOK: null,
        hitText:null,
    },
    fly: {
        container: null,
        notes: {
            '1': [],//{startTime,x,y,code,sprite}
            '2': [],
            '3': [],
            '4': [],
        }
    },
    judge: {
        state: 0,//not in judge animation, 1:judge animation ready, 2: judge animating
        type: 'good,ok'
    },
    drum: {
        keyStartTimes: [...Array(128)].fill(0),
        dsprite: null,
        fsprite: null,
        jsprite: null,
        ksprite: null
    },
    face: 0,
    progressBar: {
        graphics: null
    },
    showTape:0,
    tape:{
        container:null,
        lastMouseX:0,
        tapeRef:null,
       switchRef:null,
       progressRef:null,
    },
    result:{
        pos:null,
        beginAnimation1TS:Number.MAX_SAFE_INTEGER,
        beginAnimation2TS:Number.MAX_SAFE_INTEGER,
        bgTop:null,
        bgBottom:null,
        container:null,
        innerContainer:null,
        objects:[],
    },
}

const DefaultGameState = JSON.parse(JSON.stringify(InitialGameState))

//Here for each handler, we only define the orders
//Reason for not defining orders in each component is that I want to see the orders together
const Note = {
    onTick: {
        order: 1,
    },

    onKeyDown: {
        order: 1,
    },
    onFJKeyDown: {},
    onDKKeyDown: {}
}

const Hit = {
    BlastTime: 0.3,
    TextTime: 0.3,
    BlastFunction: x => (x * 2 / 2 - 1 / 2 * x * x + 1 - 1 / 2 )* 0.8,
    TextFunction: x => x<0.5?(-12.063484*x*x+8.0476133*x-0.00793555):1,
    onTick: {
        order: 2,
    },
}

const Judge = {
    onKeyDown: {
        order: 2,
    }
}

const Drum = {
    LastingTime: 0.2,
    onTick: {
        order: 3,
    },
    onKeyDown: {
        order: 2,
    }
}

const Fly = {
    FlyFunction: x => 2 * x - x * x,
    FlyTime: 0.6,
    ShineTime: 0.5,
    ShineFunction: x => 10 * x - 5 * x * x,
    AlphaFunction: x => 1 - x * x,

    onTick: {
        order: 4,
    }
}

const StaticObjects = {
    ToggleBgTime:0.2,
    ToggleTime:0.1,
    KeepTime:0.1,
    BG_TOP_TOTAL:4,
    BG_BOTTOM_TOTAL:3,
}

const Score = {
    ComboTextTime:0.1,
    TextTime:0.1,
    TextFunction: x => -4.761904761904762*x*x+4.761904761904*x,
    ComboTextFunction: x => -4.761904761904762*x*x+4.761904761904*x,
    onScore: {}
}

const ProgressBar = {
    onScore: {}
}

const Tape = {
    SPEEDLEVEL:5,//must be an odd number >=3, for the 1 to be in the middle
    MAX_SPEED:1.5,
    MIN_SPEED:0.5
}

const GGT = {
    ZoomTime:0.5,
    MaxZoomScale:3,
    ZoomFn:x=>(x-1)*(x-1),
    onTick:{}
}

const OTHER_CONSTANTS = {
    MIinKeyInterval:0.05,
}

const PauseMenu = {

}

const Result = {
    animation1Time:1,
    animation2Time:1,
    animation1Fn:x=>x,
    animation2Fn:x=>x,
}

const Actions = {//action name : handler name
    //action name does not matter, handler name must be the same as the handler function of each component
    "score": "onScore",
    "tick": "onTick",
    "keydown": "onKeyDown",
    "fjkeydown": "onFJKeyDown",
    "dkkeydown": "onDKKeyDown"
}

const listeners = {}//{handle,order}

// must run after gameState can be achieved
const bind = (object, component, gameState) => {
    DefaultGameState.gameObjects.push(object)

    for (let p in Actions) {
        if (component[Actions[p]] instanceof Function) {
            object[Actions[p]] = object[Actions[p]] || {}
            object[Actions[p]].handle = component[Actions[p]].bind(gameState)
        }
    }

    for (let p in Actions) {
        listeners[Actions[p]] = DefaultGameState.gameObjects.map(o => o[Actions[p]])
            .filter(Boolean).sort((a, b) => (a.order || 0) < (b.order || 0) ? -1 : 1)
    }
}

function publish(eventType, event) {
    for (let i = 0; i < (listeners[eventType] ? listeners[eventType].length : 0); i++) {
        console.assert(listeners[eventType][i].handle instanceof Function, `Must bind ${eventType} handler function after defined`)
        let res = listeners[eventType][i].handle(event)
        if (res && res.break) {
            break
        }
    }
}

const keyMap = [...Array(123)].fill(0)
let pressingCount = 0

function eventHandler(e) {
    if (e.type === 'keydown' || e.type === 'keyup') {
        pressingCount += (e.type === 'keydown' ? 1 : -1)
        if (e.type === 'keydown') {
            if (keyMap[e.keyCode]) {//keep pressing
                return
            } else {
                keyMap[e.keyCode] = true
            }
        } else {
            keyMap[e.keyCode] = false
        }
    }

    if (e.type == 'keydown') {
        let {time} = GetParams(DefaultGameState)
        let pressingDK = (e.keyCode === 68 || e.keyCode === 75) && keyMap[68] && keyMap[75],
            pressingFJ = (e.keyCode === 70 || e.keyCode === 74) && keyMap[70] && keyMap[74]

        //if there is an "one keydown" event just happened before this "two keydown" event
        if (time>DefaultGameState.lastKeyDownTime && time - DefaultGameState.lastKeyDownTime<=OTHER_CONSTANTS.MIinKeyInterval
            && pressingCount >= 2 && (pressingDK || pressingFJ)) {
            e.elapsedTime =  time - DefaultGameState.lastKeyDownTime
            DefaultGameState.lastKeyDownTime = -1

            //handle two/more keys down first
            if (pressingDK) {
                publish(Actions.dkkeydown, e)
            }

            if (pressingFJ) {
                publish(Actions.fjkeydown, e)
            }
            
            publish(Actions.keydown,e)//two keydown count as one keydown
        }else{
            DefaultGameState.lastKeyDownTime = time
            publish(Actions.keydown,e)
        }

    } else if (e.type == 'tick') {
        publish(Actions.tick, e)
    }else if (e.type == 'score') {
        publish(Actions.score,e)
    }
}

export {TabSong, DefaultGameMode, eventHandler, bind, Result, PauseMenu, OTHER_CONSTANTS, GGT, Note, Judge, Drum, Hit, StaticObjects, Fly, Score, ProgressBar, Tape, DefaultGameState, DefaultGlobalState, InitialGameState}