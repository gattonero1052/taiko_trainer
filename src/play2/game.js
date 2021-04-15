const DefaultGameState = {
    app:null,
    tab:null,
    hit:{
        startTime:0,
        type:'good,ok',
        state:0,//0:not hit animation, 1:hit animation ready 2:hit animating
        noteCode:'1 2 3 4... anyway the hit animation differs based on the type of note',
        smallGood:null,//should be instance of PIXI.Sprite
        bigGood:null,
        smallOk:null,
        bigOk:null,
    },
    fly:{
        '1':[],//{time,x,y,code,sprite}
        '2':[],
        '3':[],
        '4':[],
    },
    judge:{
        state:0,//not in judge animation, 1:judge animation ready, 2: judge animating
        type:'good,ok'
    },
    drum:{
        keyStartTimes :[...Array(128)].fill(0),
        dsprite:null,
        fsprite:null,
        jsprite:null,
        ksprite:null
    },
    dimensions:{}
}

const JudgeStandards = {
    Good:50/2,
    OK:150/2,
    Bad:217/2
}

const GetParams = (gameState)=>{
    if(!this || !this.app){throw new Exception("Can't find GameState.")}

    let app = gameState.app
    let time = (gameState.app.ticker.lastTime - gameState.startTime) / 1000
    let tab = gameState.tab
    let dimensions = gameState.dimensions
    return {app,time,tab,dimensions}
}

// must run after gameState can be achieved
const bind = (object,gameState){
    for(let p in object){
        object[p].handle = object[p].handle.bind(gameState)
    }
}

const NoteCommonKeyDownHandler = (e,handleHitByNote)=>{
    let {dimensions} = GetParams(this)

    //only four types of notes can fly, so there is a transform
    function GetFlyingNote(noteCode){
        return ['1','2','3','4'].indexOf(noteCode)!=-1?noteCode:[68,75].indexOf(e.keyCode)!=-1?'2':'1'
    }

    measures.forEach(measure=>{
        let notes = measure.notes

        if(!measure.hide){
            for(let i=0;i<notes.length;i++){
                let note = notes[i]
                console.assert(!!note.sprite,"No sprite found for current note")
                let x = note.sprite.position.x, y = note.sprite.position.y
                let timeDif = Math.abs(x - dimensions.NOTE_TARGET.x)/(measure.state.scroll * 1000)
                let fly = {time:0,x,y,code:note.code}
                const isGood = 0
                const wrongHit = !isGood && (timeDif<=JudgeStandards.Bad && !(
                    ((note.code === '1' || note.code === '3') && (e.keyCode === 68 || e.keyCode === 75)) ||
                    ((note.code === '2' || note.code === '4') && (e.keyCode === 70 || e.keyCode === 74))
                ))

                if(isGood||(!wrongHit && timeDif<=JudgeStandards.Good)){
                    this.hit.type = 'good'
                    this.hit.state = 1
                    handleHitByNote(note)

                    note.show = 0
                    this.fly[GetFlyingNote(note.code)].push(fly)
                    this.judge.state = 1
                    this.judge.type = 'good'
                }else if(!wrongHit && timeDif<=JudgeStandards.Good){
                    this.hit.type = 'ok'
                    this.hit.state = 1
                    handleHitByNote(note)

                    note.show = 0
                    this.fly[GetFlyingNote(note.code)].push(fly)
                    this.judge.state = 1
                    this.judge.type = 'ok'
                }else if(wrongHit || timeDif<=JudgeStandards.Bad){
                    this.hit.state = 0

                    note.show = 0
                    this.judge.state = 1
                    this.judge.type = 'bad'
                }
            }
        }
    })
}

const Note = {
    tick:{
        order:1,
        handle(e){
            let {app,time,tab,dimensions} = GetParams(this)
            let {width,height} = dimensions
            let measures = tab.measures

            measures.forEach(measure=>{
                let notes = measure.notes
                let showCount = 0

                if(!measure.hide){
                    notes.forEach(note=>{
                        let startTime = measure.startTime + note.startTime
                        let x = (startTime + tab.config.measureOffset - time) * measure.state.scroll * 1000

                        if (x<-500 || x>width + 500){
                            showCount += (note.show = 1)
                        }else{
                            note.show = 0
                        }

                        if(note.sprite){
                            note.sprite.position.x = x
                        }
                    })
                }

                measure.hide = showCount===0
            })
        }
    },

    keydown:{
      order:1,
      handle(e){
        NoteCommonKeyDownHandler.call(this,e,note=>{
            this.hit.noteCode = (note.code == '3' || note.code == '1')?'1':(note.code == '2' || note.code == '4')?'2':'1'
        })
      }
    },
    fjkeydown:{
        handle(e){
            NoteCommonKeyDownHandler.call(this,e,note=>{
                this.hit.noteCode = note.code
            })
        }
    },
    dkkeydown:{
        handle(e){
            NoteCommonKeyDownHandler.call(this,e,note=>{
                this.hit.state = 1
                this.hit.noteCode = note.code
            })
        }
    }
}

const Hit = {
    CompleteTime:0.1,
    LastingTime:0.2,
    tick:{
        order:2,
        handle(e){
            let state = this.hit.state
            let {time} = GetParams(this)
            if(state === 0){
                this.hit.smallGood.alpha = 0
                this.hit.bigGood.alpha = 0
                this.hit.smallOk.alpha = 0
                this.hit.bigOk.alpha = 0
            }else if(state === 1){
                this.hit.state = 2
                this.hit.smallGood.alpha = 0
                this.hit.bigGood.alpha = 0
                this.hit.smallOk.alpha = 0
                this.hit.bigOk.alpha = 0
                this.hit.startTime = time
            }else if(state === 2){
                let alpha = Math.min(1,(time - this.hit.startTime) / Hit.CompleteTime)
                if (this.hit.type === 'good'){
                    if(this.hit.noteCode === '3' || this.hit.noteCode === '4'){//big good
                        bigGood.alpha = alpha
                    }else{//small good
                        smallGood.alpha = alpha
                    }
                }else if(this.hit.type === 'ok'){
                    if(this.hit.noteCode === '3' || this.hit.noteCode === '4'){//big ok
                        bigOk.alpha = alpha
                    }else{//small good
                        smallOk.alpha = alpha
                    }
                }

                if (time - this.hit.startTime - Hit.CompleteTime>=Hit.LastingTime){
                    this.hit.state = 0
                }
            }
        }
    },
}

const Judge = {
    keydown:{
        order:2,
        handle(e){

        }
    }
}

const Drum = {
    LastingTime:0.2,
    tick:{
        order:3,
        handle(e){
            let {time} = GetParams(this)
            const keyStartTimes = this.drum.keyStartTimes
            time +=  Drum.LastingTime 
            [68,70,74,75].forEach(code=>{
                if(code === 68 && keyStartTimes[code]<time){
                    this.drum.dsprite.alpha = 0
                }

                if(code === 70 && keyStartTimes[code]<time){
                    this.drum.fsprite.alpha = 0
                }

                if(code === 74 && keyStartTimes[code]<time){
                    this.drum.jsprite.alpha = 0
                }

                if(code === 75 && keyStartTimes[code]<time){
                    this.drum.ksprite.alpha = 0
                }
            })
        }
    },
    keydown:{
        order:2,
        handle(e){
            const {time} = GetParams(this)
            this.drum.keyStartTimes[e.keyCode] = time
            if(code === 68){
                this.drum.dsprite.alpha = 1
            }else if(code === 70){
                this.drum.fsprite.alpha = 1
            }else if(code === 74){
                this.drum.jsprite.alpha = 1
            }else if(code === 75){
                this.drum.ksprite.alpha = 1
            }
        }
    }
}

const Fly = {
    tick:{
        order:4,
        handle(e){
            let fly = this.fly
            for(let p in fly){
                fly[p].forEach(flyObject=>{
                    if(!flyObject.curveFunction){
                        
                    }

                    if(!flyObject.sprite){

                    }
                })
            }
        }
    }
}

const Track = {
    keydown:{
        handle(e){

        }
    }
}

const GameObjects = [Note,Drum,Track,Hit,Fly,Judge]

const Actions = {//68 70 74 75
    "tick":-1,
    "keydown":0,
    "fjkeydown":1,
    "dkkeydown":2
}

const keyMap = [...Array(123)].fill(0)
let pressingCount = 0

const listeners = {}

for(let p in Actions){
    listeners[p] = GameObjects.map(o=>o[p]).filter(Boolean).sort((a,b)=>(a.order||0)<(b.order||0)?-1:1)
}

function publish(eventType,event){
    for(let i=0;i<listeners[eventType].length;i++){
        let res = listener[eventType][i].handle(event)
        if (res && res.break){
            break
        }
    }
}

function keyEventHandler(e){
    pressingCount += e.type === 'keydown'?1:-1
    keyMap[e.keyCode] = e.type === 'keydown'
    if (pressingCount === 1 && e.type == 'keydown'){
        publish(Actions.keydown,e)
    }

    if (e.type == 'keydown'){
        let pressingDK = (e.keyCode === 68 || e.keyCode === 75) && keyMap[68] && keyMap[75],
        pressingFJ = (e.keyCode === 70 || e.keyCode === 74) && keyMap[70] && keyMap[74]
        if(pressingCount >= 2 && (pressingDK || pressingFJ)){//handle two/more keys down first
            if(pressingDK){
                publish(Actions.dkkeydown,e)
            }
    
            if(pressingFJ){
                publish(Actions.fjkeydown,e)
            }
        }else{//only one key down
            publish(Actions.keydown,e)
        }
    }
}