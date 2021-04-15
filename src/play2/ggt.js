import React, {Component, createRef} from 'react'
import * as PIXI from 'pixi.js'
import {withPixiApp, Container, ParticleContainer} from "@inlet/react-pixi";
import {GameContext} from "./context";
import {GGT,bind} from "./game";
import {AdjustmentFilter} from '@pixi/filter-adjustment'
import {showSprite, hideSprite, GetParams, GetTexture,GetMid} from "./utils";
import {DefaultGlobalState as overall} from './game'
import { DEFAULT_DIMENSIONS } from './constants';

const draw = (game,scale)=>{
    game.ggt.centerSprite.scale.x = scale
    game.ggt.centerSprite.scale.y = scale
    game.ggt.bgRef.visible = 1
    let counter = (game.ggt.counter++)/10
    if(game.ggt.bgSpriteRef) game.ggt.bgSpriteRef.filters[0].brightness = 1.5 + Math.sin(counter/2)/3
    //use the random points in the triangle to build curve
    game.ggt.partPoints.forEach(e=>{
        let [g, p1, p2,p3,getPosition] = e
        g.blendMode = PIXI.BLEND_MODES.NORMAL
        g.clear()
        g.beginFill(0xff0000,1)
        let mid1 = getPosition(counter, 2/3,true)
        let mid2 = getPosition(counter, 1/2,true)
        g.moveTo(p1.x * scale, p1.y * scale)
        g.bezierCurveTo(
            mid1.x * scale, mid1.y * scale,
            mid2.x * scale, mid2.y * scale,
            p3.x * scale, p3.y * scale,
        )
        let mid3 = getPosition(counter, 1/2,false)
        let mid4 = getPosition(counter, 2/3,false)
        g.bezierCurveTo(
            mid3.x * scale,mid3.y * scale,
            mid4.x * scale,mid4.y * scale,
            p2.x * scale,p2.y * scale
        )
        g.lineTo(p1.x * scale,p1.y * scale)
        g.closePath()
        g.endFill()
    })
}

class GGTComponent extends Component{
    static contextType = GameContext

    constructor(props) {
        super(props)
        this.bgRef = React.createRef(null)
        this.maskRef = React.createRef(null)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let game = this.context
        bind(GGT,this,game)
        let d = DEFAULT_DIMENSIONS
        game.ggt.bgRef = this.bgRef.current
        game.ggt.maskRef = this.maskRef.current
        game.ggt.maskRef.pivot = new PIXI.Point(-d.GGT.x,-d.GGT.y)
        // game.ggt.maskRef.pivot = new PIXI.Point(0,0)
        game.ggt.bgRef.mask = game.ggt.maskRef
        // var bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        var bgSprite = new PIXI.Sprite(GetTexture(overall.loader,"note5-mid"));
        game.ggt.bgSpriteRef = bgSprite
        bgSprite.anchor.set(.5)
        // bgSprite.blendMode = PIXI.BLEND_MODES.ADD
        bgSprite.x = d.NOTE_TARGET.x
        bgSprite.y = d.NOTE_TARGET.y
        bgSprite.width = d.width
        bgSprite.height = d.height
        bgSprite.filters = [new AdjustmentFilter({
            red:3,
            green:1,
            blue:2,
            brightness:1.5})]
        bgSprite.alpha = .5
        game.ggt.bgRef.addChild(bgSprite)
        let R = d.GGT.r
        let center = new PIXI.Graphics()
        center.beginFill(0xff0000,1)
        center.drawCircle(0,0,d.GGT.r)
        center.endFill()
        // let cx =(center.x = d.GGT.x-10)
        //     ,cy = (center.y = d.GGT.y-10)
        let cx =(center.x = 0)
            ,cy = (center.y = 0)
        game.ggt.centerSprite = center
        // game.ggt.maskRef.filters = [new GlowFilter({innerStrength:4,outerStrength:4})]
        game.ggt.maskRef.addChild(center)

        function getPartPoint(partIndex){
            let angle = Math.PI/6 + Math.PI/6 * partIndex
            let d = d.GGT.r * (0.5 + 0.5*Math.random())
            return {x:d * Math.cos(angle), y:d * Math.sin(angle)}
        }

        function getTopPoint(p1,p2){
            let pm = mid(p1,p2)
            let theta = Math.atan2(p2.x - p1.x,p2.y- p1.y)
            let len = d.GGT.fireSize[0] + (d.GGT.fireSize[1] - d.GGT.fireSize[0]) * Math.random()
            return {x:pm.x + len * Math.cos(theta),y:pm.y - len*Math.sin(theta)}
        }

        function mid(p1,p2,scale = 1/2){
            return {
                x:GetMid(p1.x,p2.x,scale),
                y:GetMid(p1.y,p2.y,scale)
            }
        }

        function dist2(p1,p2) {
            return (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y) * (p1.y-p2.y)
        }

        // 0x8bc5ff
        ;[[0,3],[1,4],[1,6],[2,6],[2,5]].forEach(e=>{
            let [i1,i2] = e
            let ang1 = Math.PI*i1/12,ang2 = Math.PI*i2/12
            let p2 = {x:cx + R * Math.cos(ang1),y:cy - R*Math.sin(ang1)}
            let p1 = {x:cx + R * Math.cos(ang2),y:cy - R*Math.sin(ang2)}
            let p3 = getTopPoint(p1,p2)
            let thetaRange = [Math.atan2(p1.y - p3.y,p3.x - p1.x),
                Math.atan2(p2.y - p3.y,p3.x - p2.x)]
            let t1 = thetaRange[0], t2 = thetaRange[1], tr = t2-t1
            let p13 = mid(p1,p3), p23 = mid(p2,p3),p12 = mid(p1,p2)
            let r = Math.sqrt(dist2(p1,p3) - dist2(p1,p12))
            let SIZE = 10
            let getPosition = (index, scale,left)=>{
                let theta = left?
                    t1 + tr/4 + Math.sin(index/SIZE * Math.PI * 2) *tr/4:
                    t1 + tr*3/4 + Math.sin(index/SIZE * Math.PI * 2) *tr/4

                return {x:p3.x - Math.cos(theta) * r * scale, y:p3.y + Math.sin(theta) * r * scale}
            }

            let g = new PIXI.Graphics()
            game.ggt.maskRef.addChild(g)
            game.ggt.partPoints.push([g,p1,p2,p3,getPosition])
        })
    }

    onTick(e){
        let {time} = GetParams(this)
        if(this.paused){

        }else{
            let scale = 1
            if(this.isGGT){
                if(this.ggt.zoomState === 0){
                    this.ggt.zoomState = 1
                    this.ggt.zoomStart = time
                }else if(this.ggt.zoomState === 1){
                    if(time > this.ggt.zoomStart + GGT.ZoomTime){
                        this.ggt.zoomState = 2
                    }else if (time>this.ggt.zoomStart){
                        scale = GGT.ZoomFn((time - this.ggt.zoomStart) / GGT.ZoomTime) * GGT.MaxZoomScale + 1
                        this.ggt.bgRef.alpha = 1/scale
                    }else{
                        this.ggt.zoomState = 0
                    }
                }
                draw(this,scale)
            }else{
                if(this.ggt.zoomState === 2){
                    this.ggt.zoomStart = time
                    this.ggt.zoomState = 3
                }else if(this.ggt.zoomState === 3){
                    if(time > this.ggt.zoomStart + GGT.ZoomTime){
                        this.ggt.zoomState = 0
                    }else if(time>this.ggt.zoomStart){
                        scale = GGT.ZoomFn( (time - this.ggt.zoomStart) / GGT.ZoomTime)
                        this.ggt.bgRef.alpha = scale
                    }else{
                        this.ggt.zoomState = 0
                    }
                    draw(this,scale)
                }else if(this.ggt.zoomState === 0){
                    this.ggt.bgRef.visible = 0
                    this.ggt.bgRef.alpha = 0
                }
            }
        }
    }

    render(){
        // return (<ParticleContainer ref={this.container} properties={{
        //     scale: true,
        //     position: true,
        //     rotation: true,
        //     alpha: true
        // }}>
        //
        // </ParticleContainer>)
        return (<>
                <Container ref={this.bgRef}></Container>
                <Container ref={this.maskRef}></Container>
            </>
        )
    }
}

// const GGT_TOTAL_SPRITES = 7
// class GGTComponentOld extends Component{
//     static contextType = GameContext
//     constructor(props) {
//         super(props)
//         this.containerRef = createRef()
//     }

//     componentDidUpdate(){
//         let game = this.context
//         let d = DEFAULT_DIMENSIONS
//         bind(GGT,this,game)
//         let sprites = [...Array(GGT_TOTAL_SPRITES).keys()].map(e=>GetTexture(overall.loader,"ggt"+(e+1)))
//         const ggtSprite = new PIXI.AnimatedSprite(sprites)
//         ggtSprite.x = d.GGT.x
//         ggtSprite.y = d.GGT.y
//         ggtSprite.anchor.set(.5)
//         // hideSprite(ggtSprite)
//         this.containerRef.current.addChild(ggtSprite)
//         game.ggt.ggtSprite = ggtSprite
//         ggtSprite.animationSpeed=0.4
//         ggtSprite.play()
//     }

//     onTick(){
//         let {time} = GetParams(this)
//         showSprite(this.ggt.ggtSprite)
//         return
//         if(this.paused){

//         }else{
//             let scale = 1
//             if(this.isGGT){
//                 if(this.ggt.zoomState === 0){
//                     this.ggt.zoomState = 1
//                     this.ggt.zoomStart = time
//                 }else if(this.ggt.zoomState === 1){
//                     if(time > this.ggt.zoomStart + GGT.ZoomTime){
//                         this.ggt.zoomState = 2
//                     }else if (time>this.ggt.zoomStart){
//                         scale = GGT.ZoomFn((time - this.ggt.zoomStart) / GGT.ZoomTime) * GGT.MaxZoomScale + 1
//                         this.ggt.ggtSprite.alpha = 1/scale
//                     }else{
//                         this.ggt.zoomState = 0
//                     }
//                 }
//             }else{
//                 if(this.ggt.zoomState === 2){
//                     this.ggt.zoomStart = time
//                     this.ggt.zoomState = 3
//                 }else if(this.ggt.zoomState === 3){
//                     if(time > this.ggt.zoomStart + GGT.ZoomTime){
//                         this.ggt.zoomState = 0
//                     }else if(time>this.ggt.zoomStart){
//                         scale = GGT.ZoomFn( (time - this.ggt.zoomStart) / GGT.ZoomTime)
//                         this.ggt.ggtSprite.alpha = scale
//                     }else{
//                         this.ggt.zoomState = 0
//                     }
//                 }else if(this.ggt.zoomState === 0){
//                     hideSprite(this.ggt.ggtSprite)
//                 }
//             }
//         }
//     }

//     render(){
//         return <Container ref={this.containerRef}></Container>
//     }
// }

export default withPixiApp(GGTComponent)

