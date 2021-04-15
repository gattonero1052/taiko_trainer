import {Component} from "react";
import {GameContext} from "./context";
import {bind, Score} from "./game";
import {Graphics, withPixiApp,Text} from "@inlet/react-pixi";
import {DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE} from "./constants";
import React from 'react'
import * as PIXI from 'pixi.js'
import {GetParams, isDrumrollNote, isSingleNote} from "./utils";
import {changeGameStateByScore} from "../logic/scoreLogic";

const COMBO_LOW_STYLE = new PIXI.TextStyle({...STATIC_TEXT_STYLE.combo,...STATIC_TEXT_STYLE.combo_low})
const COMBO_HIGH_STYLE = new PIXI.TextStyle({...STATIC_TEXT_STYLE.combo,...STATIC_TEXT_STYLE.combo_high})

class ScoreComponent extends Component{
    static contextType = GameContext

    constructor(prop){
        super(prop)
        this.comboTextRef = React.createRef(null)
        this.scoreTextRef = React.createRef(null)
    }
    
    componentDidUpdate() {
        let game = this.context
        bind(Score, this, game)
        game.score.comboTextRef = this.comboTextRef.current
        game.score.scoreTextRef = this.scoreTextRef.current
    }

    onTick(e){
        if(this.paused && (!e || !e.forced)) return

        let {time} = GetParams(this)
        if (this.score.state === 1){
            if( time>=this.score.startTime && time<=this.score.startTime + Score.TextTime){
                let scale = Score.TextFunction((time - this.score.startTime)/(Score.TextTime))
                this.score.scoreTextRef.position.y = DEFAULT_DIMENSIONS.SCORE_NUMBER.y - DEFAULT_DIMENSIONS.SCORE_NUMBER.bounce * scale
            }else{
                this.score.state = 0
            }
        }

        if(this.score.comboState === 1){
            if( time>=this.score.comboStartTime && time<=this.score.comboStartTime + Score.ComboTextTime){
                let scale = Score.ComboTextFunction((time - this.score.comboStartTime)/(Score.ComboTextTime))
                this.score.comboTextRef.position.y = DEFAULT_DIMENSIONS.SCORE_COMBO.y - DEFAULT_DIMENSIONS.SCORE_COMBO.bounce * scale
            }else{
                this.score.comboState = 0
            }
        }
    }

    onScore(e){
        if(!e || (this.paused && (!e || !e.forced))) return

        if(e.note){
            let {time} = GetParams(this)
            changeGameStateByScore(this,e.note,e.result)
            if(e.note && isSingleNote(e.note.code)){
                if(this.score.last>0){
                    this.score.last = 0
                    this.score.startTime = time
                    this.score.state = 1

                    this.score.comboStartTime = time
                    this.score.comboState = 1
                    if(this.score.combo>9){
                        this.score.comboTextRef.text = this.score.combo + ''
                        if(this.score.combo>99){
                            this.score.comboTextRef.style = COMBO_HIGH_STYLE
                        }
                    }
                }else{//empty combo
                    this.score.combo = 0
                    this.score.comboState = 0
                    this.score.comboTextRef.text = ''
                    this.score.comboTextRef.style = COMBO_LOW_STYLE
                }
            }else if(e.note && isDrumrollNote(e.note.code)){
                this.score.last = 0
                this.score.startTime = time
                this.score.state = 1
            }
        }else{
            //rejudge score, only change the score text
        }

        this.score.scoreTextRef.text = this.score.current
    }
    
    render() {
        return (<>
                <Text ref={this.comboTextRef} {...DEFAULT_DIMENSIONS.SCORE_COMBO} style={STATIC_TEXT_STYLE.combo}/>
                <Text text={"0"} ref={this.scoreTextRef}{...DEFAULT_DIMENSIONS.SCORE_NUMBER} style={STATIC_TEXT_STYLE.score}></Text>
                <Text {...{style:STATIC_TEXT_STYLE.difficulty,...DEFAULT_DIMENSIONS.STATIC_TEXT.difficulty}} text={'魔王'}/>
            </>)
    }
}

export default withPixiApp(ScoreComponent)