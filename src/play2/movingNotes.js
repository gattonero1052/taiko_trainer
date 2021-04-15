import { withPixiApp,Container } from "@inlet/react-pixi"
import * as PIXI from 'pixi.js'
import React,{Component} from 'react'
import {GlowFilter} from "@pixi/filter-glow";
import note1_1 from "../assets/img/note1-1.png";

const glowFilter = new GlowFilter({distance: 16, outerStrength: 1, color: 0x000000})
const texture = new PIXI.Texture(new PIXI.Texture.from(note1_1))
const spritesCount = 100
//Just use react component as a container, do not render by react
class MovingNotes extends Component{
    notes = []
    
    constructor(props){
        super(props)
        this.container = React.createRef(null)
    }

    componentDidMount(){
        // this.props.app
        this.notes = [...Array(spritesCount).keys()].map(e=> {
            let sprite = new PIXI.Sprite(texture)
            sprite.x = window.innerWidth/2
            sprite.y = window.innerHeight/2
            sprite.anchor.set(0.5)
            this.container.current.addChild(sprite)
            // container.addChild(sprite)
            // sprite.filters = [glowFilter]
            return sprite
        })

        console.log(this.notes.length)

        this.props.app.ticker.add((delta)=>{
            // console.log(delta)
            this.notes.forEach((sprite, index)=>{
                sprite.position.x += Math.cos(Math.PI*2/100*index) * 3
                sprite.position.y += Math.sin(Math.PI*2/100*index) * 3
            })
        })
    }

    onKeyDown(){

    }

    render(){
        console.log(123)
        return (<Container ref={this.container}></Container>)
    }
}

export default withPixiApp(MovingNotes)