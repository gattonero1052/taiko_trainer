import {Component} from "react";
import {GameContext} from "./context";
import {bind, Drum} from "./game";
import {withPixiApp, Graphics, Sprite} from "@inlet/react-pixi";
import {OutlineFilter} from "@pixi/filter-outline";
import * as PIXI from "pixi.js";
import React from "react";
import {GetTexture, GetParams, GetLastTime} from "./utils";
import {DefaultGlobalState as overall} from './game'
import { DEFAULT_DIMENSIONS } from "./constants";

class DrumComponent extends Component {
    static contextType = GameContext

    constructor(prop) {
        super(prop)
        this.drum_d_ref = React.createRef(null)
        this.drum_f_ref = React.createRef(null)
        this.drum_j_ref = React.createRef(null)
        this.drum_k_ref = React.createRef(null)
    }

    componentDidUpdate() {
        let game = this.context
        bind(Drum, this, game)
        game.drum.dsprite = this.drum_d_ref.current
        game.drum.fsprite = this.drum_f_ref.current
        game.drum.jsprite = this.drum_j_ref.current
        game.drum.ksprite = this.drum_k_ref.current
    }

    onTick(e){
        let time = GetLastTime(this)/1000
        const keyStartTimes = this.drum.keyStartTimes
        time -=  Drum.LastingTime;
        [68,70,74,75].forEach(code=>{
        if(code === 68 && keyStartTimes[code]<time){
            this.drum.dsprite.visible = false
        }

        if(code === 70 && keyStartTimes[code]<time){
            this.drum.fsprite.visible = false
        }

        if(code === 74 && keyStartTimes[code]<time){
            this.drum.jsprite.visible = false
        }

        if(code === 75 && keyStartTimes[code]<time){
            this.drum.ksprite.visible = false
        }
    })
    }

    onKeyDown(e){
        let time = GetLastTime(this)/1000
        this.drum.keyStartTimes[e.keyCode] = time
        if(e.keyCode === 68){
            this.drum.dsprite.visible = true
        }else if(e.keyCode === 70){
            this.drum.fsprite.visible = true
        }else if(e.keyCode === 74){
            this.drum.jsprite.visible = true
        }else if(e.keyCode === 75){
            this.drum.ksprite.visible = true
        }
    }

    draw(g){
        let {x,y,w,h} = DEFAULT_DIMENSIONS.NOTE_DRUM_BORDER
        let iw = 5
        // Rectangle + line style 2
        g.lineStyle(5, 0x000000, 1);
        g.beginFill(0xff582a);
        g.drawRect(x, y, w, h);
        g.endFill();

        g.lineStyle(iw, 0x000000, 1);
        g.beginFill(0xff582a);
        g.drawRect(x+iw/2, y+iw/2, w-iw, h-iw);
        g.endFill();
    }
    render(){
        return (<>
            <Graphics draw={this.draw.bind(this)}/>
            <Sprite texture={GetTexture(overall.loader,"drum")} {...DEFAULT_DIMENSIONS.NOTE_DRUM}/>
            <Sprite ref={this.drum_d_ref} texture={GetTexture(overall.loader,"drum-d")}  {...DEFAULT_DIMENSIONS.NOTE_DRUM}/>
            <Sprite ref={this.drum_f_ref} texture={GetTexture(overall.loader,"drum-f")}  {...DEFAULT_DIMENSIONS.NOTE_DRUM}/>
            <Sprite ref={this.drum_j_ref} texture={GetTexture(overall.loader,"drum-j")}  {...DEFAULT_DIMENSIONS.NOTE_DRUM}/>
            <Sprite ref={this.drum_k_ref} texture={GetTexture(overall.loader,"drum-k")}  {...DEFAULT_DIMENSIONS.NOTE_DRUM}/>
        </>)
    }
}

export default withPixiApp(DrumComponent)