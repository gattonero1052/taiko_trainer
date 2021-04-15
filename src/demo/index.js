import {Sprite, Stage, useTick, Container, ParticleContainer} from '@inlet/react-pixi'
import note1_1 from "../assets/img/test.png";
import * as PIXI from "pixi.js";
import {Component, useEffect, useRef,useReducer} from "react";
import Stats from 'stats.js'
import {useApp, withPixiApp} from "@inlet/react-pixi/animated";

const texture = new PIXI.Texture(new PIXI.Texture.from(note1_1))

const TestSprite = withPixiApp(({index})=>{
    const reducer = (state, { data }) => data
    const [motion, update] = useReducer(reducer)
    const time = useRef(0)
    useTick(delta=>{
        const i = (time.current += 0.3 * delta)
        update({
            type:'update',
            data:{
                x: window.innerWidth/2 + time.current * Math.cos(Math.PI*2/100*index)*5,
                y: window.innerHeight/2 + time.current * Math.sin(Math.PI*2/100*index)*5,
            }
        })
    })

    return <Sprite texture={texture}{...motion}/>
})

let stats = null

const C = ()=>{
    useEffect(()=>{
        stats = new Stats();
        stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( stats.dom );
    },[])

    useTick(()=>{
        stats.begin();
        stats.end();
    })

    // return (<Container>{[...Array(100).keys()].map(e=><TestSprite key={e} index={e}/>)}</Container>)
    return (<ParticleContainer>{[...Array(100).keys()].map(e=><TestSprite key={e} index={e}/>)}</ParticleContainer>)
}

class Demo extends Component{
    render() {
        return (
            <Stage width={window.innerWidth} height={window.innerHeight}>
                <C/>
            </Stage>
            )
    }
}

export default Demo