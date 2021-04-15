import React, {Component} from "react";
import {GameContext} from "./context";
import {Hit, bind, DefaultGameState, OTHER_CONSTANTS} from "./game";
import * as PIXI from "pixi.js";
import {DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE} from "./constants";
import {withPixiApp,Text,Sprite,Container} from "@inlet/react-pixi";
import {GetParams,GetTexture} from "./utils";
import {DefaultGlobalState as overall} from './game'

const TEXT_STYLES=[
    new PIXI.TextStyle({...STATIC_TEXT_STYLE.hit_good}),
    new PIXI.TextStyle({...STATIC_TEXT_STYLE.hit_ok}),
    new PIXI.TextStyle({...STATIC_TEXT_STYLE.hit_bad})
]

const TEXT_WORDS=[
    'GOOD',
    'OK',
    'BAD'
]

const getIndexByType = (type)=>{
    return type === 'good'?0:type === 'ok'?1:2
}

class HitComponent extends Component {
    textures = []

    static contextType = GameContext

    constructor(prop) {
        super(prop)
        this.hitSmallGoodRef = React.createRef(null)
        this.hitBigGoodRef = React.createRef(null)
        this.hitSmallOKRef = React.createRef(null)
        this.hitBigOKRef = React.createRef(null)
        this.containerRef = React.createRef(null)
        this.hitTextRef = React.createRef(null)
    }

    componentDidUpdate() {
        let game = this.context
        bind(Hit, this, game)
        game.hit.container = this.containerRef.current
        game.hit.smallGood = this.hitSmallGoodRef.current
        game.hit.bigGood = this.hitBigGoodRef.current
        game.hit.smallOK = this.hitSmallOKRef.current
        game.hit.bigOK = this.hitBigOKRef.current
        game.hit.hitText= this.hitTextRef.current
        let sizes = [
            DEFAULT_DIMENSIONS.NOTE_BLAST.smallSize,
            DEFAULT_DIMENSIONS.NOTE_BLAST.smallSize,
            DEFAULT_DIMENSIONS.NOTE_BLAST.bigSize,
            DEFAULT_DIMENSIONS.NOTE_BLAST.bigSize,
        ]
        ;[game.hit.smallGood, game.hit.smallOK,game.hit.bigGood,game.hit.bigOK].forEach((e,i)=>{
            e.width = e.height = sizes[i]
            e.position.x = DEFAULT_DIMENSIONS.NOTE_BLAST.x
            e.position.y = DEFAULT_DIMENSIONS.NOTE_BLAST.y
            e.anchor.set(.5)
        })
        game.hit.hitText.anchor.set(.5)
        game.hit.hitText.x =  DEFAULT_DIMENSIONS.NOTE_TARGET_TEXT.x
        game.hit.hitText.y= DEFAULT_DIMENSIONS.NOTE_TARGET_TEXT.y

        //TODO How to use mask to create a blurred outline
        const mask = new PIXI.Graphics()
        mask.beginFill(0xffffff)
             // .drawCircle(DEFAULT_DIMENSIONS.NOTE_BLAST.x, DEFAULT_DIMENSIONS.NOTE_BLAST.y,DEFAULT_DIMENSIONS.NOTE_BLAST.height/2)
             .drawCircle(0,0,DEFAULT_DIMENSIONS.NOTE_BLAST.height/2 - 25)
            .endFill()
        mask.x = DEFAULT_DIMENSIONS.NOTE_BLAST.x
        mask.y = DEFAULT_DIMENSIONS.NOTE_BLAST.y
        mask.alpha = 0
        // game.hit.container.addChild(mask)
        // game.hit.smallGood.mask = mask
        // game.hit.bigGood.mask = mask
        // game.hit.smallOK.mask = mask
        // game.hit.bigOK.mask = mask
        game.hit.hitBlur = mask
    }

    onTick(e){
        if(this.paused && (!e || !e.forced)) return

        let {time} = GetParams(this)
        let d = DEFAULT_DIMENSIONS
        if(this.hit.state === 1){//start a new animation
            this.hit.state = 2
            this.hit.smallGood.visible = false
            this.hit.bigGood.visible = false
            this.hit.smallOK.visible = false
            this.hit.bigOK.visible = false
            this.hit.hitBlur.visible = true
            this.hit.hitText.visible = true

            this.hit.startTime = time
            let index = getIndexByType(this.hit.type)
            this.hit.hitText.style = TEXT_STYLES[index]
            this.hit.hitText.text = TEXT_WORDS[index]

            if(this.hit.type === 'good'){//Here only four type of noteCode are accepted
                if(this.hit.noteCode === '1' || this.hit.noteCode === '2'){//small good
                    this.hit.lastHitTime = time
                    this.hit.smallGood.visible = true
                }else if(this.hit.noteCode === '3' || this.hit.noteCode === '4'){//big good
                    // if(time>this.hit.lastHitTime && time - this.hit.lastHitTime<OTHER_CONSTANTS.MIinKeyInterval){
                    //
                    // }
                    this.hit.bigGood.visible = true
                }
            }else if(this.hit.type === 'ok'){
                if(this.hit.noteCode === '1' || this.hit.noteCode === '2'){//small OK
                    this.hit.lastHitTime = time
                    this.hit.smallOK.visible = true
                }else if(this.hit.noteCode === '3' || this.hit.noteCode === '4'){//big OK
                    // if(time>this.hit.lastHitTime && time - this.hit.lastHitTime<OTHER_CONSTANTS.MIinKeyInterval) return
                    this.hit.bigOK.visible = true
                }
            }
        }else if(this.hit.state === 2){
            let blastScale = (time - this.hit.startTime) / Hit.BlastTime
                ,textScale = (time - this.hit.startTime) / Hit.TextTime

            if (blastScale<=1){
                let alpha = Hit.BlastFunction(blastScale)
                this.hit.smallGood.alpha =  alpha
                this.hit.bigGood.alpha =  alpha
                this.hit.smallOK.alpha =  alpha
                this.hit.bigOK.alpha =  alpha
            }else{
                this.hit.smallGood.visible = false
                this.hit.bigGood.visible = false
                this.hit.smallOK.visible = false
                this.hit.bigOK.visible = false
                this.hit.hitBlur.visible = false
            }

            if(textScale<=1){
                this.hit.hitText.position.y = d.NOTE_TARGET_TEXT.y - (d.NOTE_TARGET_TEXT.bounce ) * Hit.TextFunction(textScale)
            }else{
                this.hit.hitText.visible = false
            }
        }else if(this.hit.state === 0){
            this.hit.smallGood.visible = false
            this.hit.bigGood.visible = false
            this.hit.smallOK.visible = false
            this.hit.bigOK.visible = false
            this.hit.hitBlur.visible = false
            this.hit.hitText.visible = false
        }

        // this.hit.bigGood.visible = 1
    }

    render() {
        return (<Container ref={this.containerRef}>
            <Sprite visible={false} ref={this.hitSmallGoodRef} texture={GetTexture(overall.loader,"hit-small-good")}/>
            <Sprite visible={false} ref={this.hitSmallOKRef} texture={GetTexture(overall.loader,"hit-small-ok")}/>
            <Sprite visible={false} ref={this.hitBigGoodRef} texture={GetTexture(overall.loader,"hit-big-good")}/>
            <Sprite visible={false} ref={this.hitBigOKRef} texture={GetTexture(overall.loader,"hit-big-ok")}/>
            <Text ref={this.hitTextRef}/>
        </Container>)
    }
}

export default withPixiApp(HitComponent)