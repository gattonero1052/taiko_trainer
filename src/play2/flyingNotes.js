import React, {Component} from "react";
import {GameContext} from "./context";
import {bind, Fly} from "./game";
import {ParticleContainer,Container, withPixiApp} from "@inlet/react-pixi";
import {GetSpriteFromNoteCode} from "./movingNotes";
import * as PIXI from 'pixi.js'
import {AdjustmentFilter} from "@pixi/filter-adjustment";
import {GetParams,GetFlyingNoteCode} from "./utils";
import { DEFAULT_DIMENSIONS } from "./constants";

const getQuadratic = (p1, p2, p3) => {
    let arr = [p1, p2, p3].map(p => [p.x ** 2, p.x, 1, p.y])

    let var_num = 3

    //Gaussian elimination
    for (let i = 1; i < var_num; i++) {
        for (let j = i; j < var_num; j++) {
            arr[j] = arr[j].map((e, k) => e - arr[i - 1][k] * arr[j][i - 1] / arr[i - 1][i - 1])
        }
    }

    for (let i = 0; i < var_num; i++) {
        arr[i] = arr[i].map((e, j) => e / arr[i][i])
    }

    let res = arr.map(e => e[var_num])

    for (let i = var_num - 1; i > -1; i--) {
        for (let j = 0; j < var_num - 1 - i; j++) {
            res[i] -= arr[i][var_num - 1 - j] * res[var_num - 1 - j]
        }
    }

    return res//[a,b,c]
}


class FlyingNotes extends Component{
    static contextType = GameContext

    constructor(prop){
        super(prop)
        this.container = React.createRef(null)
    }

    componentDidUpdate() {
        let game = this.context
        bind(Fly, this, game)
        game.fly.container = this.container.current
    }

    onTick(e){
        if(this.paused && (!e || !e.forced)) return

        function GC(){
            for(let type in this.fly.notes) {
                let newFly = []
                this.fly.notes[type].forEach((object, i) => {
                    if(!object.curve || !(!object.sprite.visible || object.sprite.alpha <0.01)){
                        newFly.push(object)
                    }else{
                        if(object.sprite){
                            this.fly.container.removeChild(object.sprite)
                        }
                    }
                })
                this.fly.notes[type] = newFly
            }
        }

        let {app,time,tab,dimensions} = GetParams(this)

        if((e && e.forced) || Math.round(time) % 5 === 0)
            GC.call(this)

        for(let type in this.fly.notes){
            this.fly.notes[type].forEach((object,i)=>{//startTime x y code
                let start = {x:object.x,y:object.y}
                let end = DEFAULT_DIMENSIONS.NOTE_FLY_END

                if(!object.curve){
                    let sprite = GetSpriteFromNoteCode(GetFlyingNoteCode(object.code), this)
                    this.fly.container.addChild(sprite)
                    sprite.x = object.x
                    sprite.anchor.set(.5)
                    sprite.y = object.y
                    let start = {x:object.x,y:object.y}
                    let topPoint = {x: end.x - (end.x - start.x) / 5, y: end.y + (end.y - start.y) / 5}
                    object.curve = getQuadratic(
                        {x:object.x, y:object.y},
                        {...topPoint},
                        {...end}
                    )
                    object.sprite = sprite
                }else{
                    if(time - object.startTime>0 && time - object.startTime<=Fly.FlyTime){
                        let x = Fly.FlyFunction((time - object.startTime) / Fly.FlyTime) * (end.x - start.x) + start.x
                        let y = object.curve[0] * x**2 + object.curve[1] * x + object.curve[2]
                        object.sprite.position.x = x
                        object.sprite.position.y = y
                    }else if(time - object.startTime<=Fly.FlyTime + Fly.ShineTime){
                        const scale = (time - object.startTime - Fly.FlyTime)/Fly.ShineTime
                        const dark = Fly.ShineFunction(scale)
                        object.sprite.filters =  object.sprite.filters? object.sprite.filters:[new AdjustmentFilter({brightness:1})]
                        object.sprite.filters[0].brightness = dark
                        object.sprite.alpha = Fly.AlphaFunction(scale)
                    }else{
                        object.sprite.visible = false
                    }
                }
            })
        }
    }

    render() {
        return (<ParticleContainer ref={this.container}></ParticleContainer>)
        // return (<Container ref={this.container}></Container>)
    }
}

export default withPixiApp(FlyingNotes)