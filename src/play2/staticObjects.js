import React, {Component} from "react";
import {GameContext} from "./context";
import {Container,Graphics, Sprite, TilingSprite, Text, withPixiApp} from "@inlet/react-pixi";
import {bind, StaticObjects} from "./game";
import {DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE} from "./constants";
import {GetMid, GetParams, GetTexture, zoomSpriteTo} from "./utils";
import * as PIXI from 'pixi.js'
import {PlaySound} from '../sound'
import {DefaultGlobalState as overall} from './game'

const getRGB = c=>{
    let res = [0,0,0]
    for(let i = 0;i<3;i++){
        res[2-i] = c%256
        c = Math.floor(c/256)
    }
    return res
}

const handleFade = (propPrefix, game, time, keepTime, startCondition, endCondition)=>{
    let stateProp = propPrefix + 'State', spriteProp = propPrefix + 'Sprite', timeProp = propPrefix + 'Start'
    if(game.staticObjects[stateProp] === 0){
        if(startCondition){
            game.staticObjects[stateProp] = 1
            game.staticObjects[timeProp] = time
        }else{
            game.staticObjects[spriteProp].alpha = 0
        }
    }else if(game.staticObjects[stateProp] === 1){
        let duration = time - game.staticObjects[timeProp]
        if(duration>0 && duration<StaticObjects.ToggleTime){
            game.staticObjects[spriteProp].alpha = duration/StaticObjects.ToggleTime * .2
        }else{
            game.staticObjects[stateProp] = 2
            game.staticObjects[timeProp] = time
        }
    }else if(game.staticObjects[stateProp] === 2){
        let duration = time - game.staticObjects[timeProp]
        if(duration>=keepTime || endCondition){
            game.staticObjects[stateProp] = 3
            game.staticObjects[timeProp] = time
        }
    }else if(game.staticObjects[stateProp] === 3){
        let duration = time - game.staticObjects[timeProp]
        if(duration>0 && duration<StaticObjects.ToggleTime){
            game.staticObjects[spriteProp].alpha = (1 - duration/StaticObjects.ToggleTime )* .2
        }else{
            game.staticObjects[stateProp] = 0
        }
    }
}

class StaticObjectsComponent extends Component{
    static contextType = GameContext

    constructor(prop){
        super(prop)
        this.ggtSprite = React.createRef(null)
        this.branchBgSpriteRef = React.createRef(null)
        this.branchNText = React.createRef(null)
        this.branchEText = React.createRef(null)
        this.branchMText = React.createRef(null)
        this.donSprite = React.createRef(null)
        this.kaSprite = React.createRef(null)
        this.topTilingSpriteRef = React.createRef(null)
        this.steadyMovingSpriteRef = React.createRef(null)
        this.bottomTilingSpriteRef = React.createRef(null)
        this.container = React.createRef(null)
    }


    componentDidUpdate() {
        let game = this.context
        let d = DEFAULT_DIMENSIONS
        bind(StaticObjects, this, game)
        game.staticObjects.donSprite = this.donSprite.current
        game.staticObjects.kaSprite = this.kaSprite.current
        game.staticObjects.ggtSprite = this.ggtSprite.current
        game.staticObjects.prevTrackTextSprite = this.branchNText.current
        game.staticObjects.branchNTextSprite = this.branchNText.current
        game.staticObjects.branchETextSprite = this.branchEText.current
        game.staticObjects.branchMTextSprite = this.branchMText.current
        game.staticObjects.branchBgSpriteRef = this.branchBgSpriteRef.current

        let h = d.NOTE_TRACK.h - d.NOTE_TRACK_BOTTOM.h+2

        game.staticObjects.donSprite.anchor.set(.5)
        game.staticObjects.donSprite.x = d.TRACK_CONSTANTS.don.x * d.width
        game.staticObjects.donSprite.y = d.NOTE_TARGET.y
        game.staticObjects.donSprite.alpha = 0
        game.staticObjects.donSprite.height = h
        game.staticObjects.donSprite.width = d.TRACK_CONSTANTS.don.width * d.width

        game.staticObjects.kaSprite.anchor.set(.5)
        game.staticObjects.kaSprite.x = d.TRACK_CONSTANTS.ka.x * d.width
        game.staticObjects.kaSprite.y = d.NOTE_TARGET.y
        game.staticObjects.kaSprite.height = h
        game.staticObjects.kaSprite.alpha = 0
        game.staticObjects.kaSprite.width = d.TRACK_CONSTANTS.ka.width * d.width

        game.staticObjects.ggtSprite.anchor.set(.5)
        game.staticObjects.ggtSprite.x = d.TRACK_CONSTANTS.ggt.x * d.width
        game.staticObjects.ggtSprite.y = d.NOTE_TARGET.y
        game.staticObjects.ggtSprite.alpha = 0
        game.staticObjects.ggtSprite.height = h
        game.staticObjects.ggtSprite.width = d.TRACK_CONSTANTS.ggt.width * d.width
        
        game.staticObjects.branchBgSpriteRef.x = 0
        game.staticObjects.branchBgSpriteRef.y = d.NOTE_TRACK.y + 4
        game.staticObjects.branchBgSpriteRef.alpha = 0
        game.staticObjects.branchBgSpriteRef.height = h - 8
        game.staticObjects.branchBgSpriteRef.width = d.width

        game.staticObjects.branchBgSpriteRef.alpha = 0
        game.staticObjects.branchNTextSprite.alpha = 0
        game.staticObjects.branchETextSprite.alpha = 0
        game.staticObjects.branchMTextSprite.alpha = 0

        if(game.tabs.forked){
            //only show branch text when path is forked
            //higher level branch need a condition to trigger
            //so always show Normal branch at first
            game.staticObjects.branchNTextSprite.alpha = 1
        }

        game.staticObjects.topTilingSpriteRef = this.topTilingSpriteRef.current
        game.staticObjects.steadyMovingSpriteRef = this.steadyMovingSpriteRef.current
        game.staticObjects.steadyMovingSpriteRef.x = 0
        game.staticObjects.steadyMovingSpriteRef.y = 0
        game.staticObjects.steadyMovingSpriteRef.width = d.width
        game.staticObjects.steadyMovingSpriteRef.height = d.NOTE_TRACK.y
        game.staticObjects.bottomTilingSpriteRef = this.bottomTilingSpriteRef.current
        game.staticObjects.bottomTilingSpriteRef.x = 0
        game.staticObjects.bottomTilingSpriteRef.y = d.NOTE_TRACK_BOTTOM.y + d.NOTE_TRACK_BOTTOM.h
        game.staticObjects.container = this.container.current
        let elementName =`bg-top-${game.staticObjects.bgTopIndex+1}-element`
        game.staticObjects.movingElements =
            ['bg-element-1','bg-element-2','bg-element-3']
            .map(element=>{
                let sprite = new PIXI.Sprite(GetTexture(overall.loader,element,"bg-base"))
                zoomSpriteTo(sprite,DEFAULT_DIMENSIONS.BG.MOVING_ELEMENTS_HEIGHT)
                this.container.current.addChild(sprite)
                return sprite
        })
    }

    onKeyDown(e){
        let {time} = GetParams(this)
        if(!this.paused){
            if(e.keyCode === 70 || e.keyCode === 74){
                PlaySound('taiko-normal-don')
                handleFade('don',this,time,StaticObjects.KeepTime,true,false)
            }else if(e.keyCode === 68 || e.keyCode === 75){
                PlaySound('taiko-normal-ka')
                handleFade('ka',this,time,StaticObjects.KeepTime,true,false)
            }
        }
    }

    onTick(e){
        let {time,dimensions} = GetParams(this)
        let w = dimensions.width*1.1, h = (dimensions.NOTE_TRACK.y - dimensions.BG.MOVING_ELEMENTS_HEIGHT) /2
        let so = this.staticObjects
        if(!this.paused){
            if(this.branchChange){
                so.trackBgStartChangeColor = so.trackBgColor
                so.trackBgStartChangeTime = time
                if(this.branchChange === 'N'){
                    so.nextTrackBgColor = 0x2c2a2c
                    so.nextTrackTextSprite = so.branchNTextSprite
                }

                if(this.branchChange === 'E'){
                    so.nextTrackBgColor = 0x264D66
                    so.nextTrackTextSprite = so.branchETextSprite
                }
                
                if(this.branchChange === 'M'){
                    so.nextTrackBgColor = 0x762566
                    so.nextTrackTextSprite = so.branchMTextSprite
                }
                this.branchChange = null
            }

            if(so.nextTrackBgColor){
                if(so.nextTrackBgColor === so.trackBgColor){
                    so.nextTrackBgColor = null
                    so.trackBgStartChangeColor = null
                    so.trackBgStartChangeTime = -1
                    so.prevTrackTextSprite = so.nextTrackTextSprite
                    so.nextTrackTextSprite = null
                }else{
                    let scale = Math.min(1,(time - so.trackBgStartChangeTime) / StaticObjects.ToggleBgTime)
                    let [sr,sg,sb] = getRGB(so.trackBgStartChangeColor);
                    let [tr,tg,tb] = getRGB(so.nextTrackBgColor);
                    let color = 0
                    ;[[tr,sr],[tg,sg],[tb,sb]].forEach((a,i)=>{
                        let [target, start] = a
                        let cur = (target - start) * scale + start
                        color += ~~cur
                        if (i<2){
                          color*=256
                        }
                    })
                    color = ~~color
                    so.trackBgColor = color
                    so.branchBgSpriteRef.alpha = 1
                    so.branchBgSpriteRef.tint = color

                    so.prevTrackTextSprite.alpha = 1-scale
                    so.nextTrackTextSprite.alpha = scale
                }
            }

            let ref = so.topTilingSpriteRef
            let movRef = so.steadyMovingSpriteRef
            movRef.tilePosition.x -= 0.5*this.speed
            ref.tilePosition.x += 0.5*this.speed
            handleFade('ggt',this,time,100000000, this.isGGT, !this.isGGT)
            handleFade('don',this,time,StaticObjects.KeepTime,false,false)
            handleFade('ka',this,time,StaticObjects.KeepTime,false,false)

            so.movingElements.forEach((sprite,i)=>{
                sprite.position.x = ((-(ref.tilePosition.x + i*w/so.movingElements.length)) % w + w) % w - dimensions.width*0.05
                sprite.position.y = 0.2*Math.cos(sprite.position.x/30) * h + h
            })
        }else{
            handleFade('ggt',this,time,100000000, false, false)
            handleFade('don',this,time,StaticObjects.KeepTime,false,false)
            handleFade('ka',this,time,StaticObjects.KeepTime,false,false)
        }
    }

    drawBranchBg(color,g){
        let game = this.context
        let d = DEFAULT_DIMENSIONS
        g.beginFill(color)
        g.drawRect(d.NOTE_TRACK_BOTTOM.x,d.NOTE_TRACK.y,d.width,(d.NOTE_TRACK.h - d.NOTE_TRACK_BOTTOM.h))
        g.endFill()
    }

    draw(g){
        let game = this.context
        let d = DEFAULT_DIMENSIONS

        g.beginFill(0X2C2A2C)
        g.drawRect(d.NOTE_TRACK.x,d.NOTE_TRACK.y,d.width,d.NOTE_TRACK.h)
        g.endFill()

        //bottom
        g.beginFill(0x847f84)
        g.drawRect(d.NOTE_TRACK_BOTTOM.x,d.NOTE_TRACK_BOTTOM.y,d.width,d.NOTE_TRACK_BOTTOM.h)
        g.endFill()

        //bottom info
        g.beginFill(0x141414)
        g.drawRect(d.NOTE_TRACK_BOTTOM_INFO.x,d.NOTE_TRACK_BOTTOM_INFO.y,d.width,d.NOTE_TRACK_BOTTOM_INFO.h)
        g.endFill()

        //border
        g.beginFill(0x000000)
        g.lineStyle(8,0x000000,1)
        g.moveTo(d.NOTE_TRACK.x, d.NOTE_TRACK.y)
        g.lineTo(d.NOTE_TRACK.x + d.width, d.NOTE_TRACK.y)
        g.closePath()
        g.lineStyle(4,0x000000,1)
        g.moveTo(d.NOTE_TRACK_BOTTOM.x, d.NOTE_TRACK_BOTTOM.y)
        g.lineTo(d.NOTE_TRACK_BOTTOM.x + d.width, d.NOTE_TRACK_BOTTOM.y)
        g.closePath()
        g.lineStyle(8,0x000000,1)
        g.moveTo(d.NOTE_TRACK_BOTTOM.x, d.NOTE_TRACK_BOTTOM.y+d.NOTE_TRACK_BOTTOM.h)
        g.lineTo(d.NOTE_TRACK_BOTTOM.x + d.width, d.NOTE_TRACK_BOTTOM.y+d.NOTE_TRACK_BOTTOM.h)
        g.closePath()
        g.endFill()

        
    }
    
    //target
    drawTarget(g){
        let game = this.context
        let d = DEFAULT_DIMENSIONS
        g.lineStyle(4,0x626262, 1)
        g.beginFill(0,0)
        g.drawCircle(d.NOTE_TARGET.x, d.NOTE_TARGET.y, d.NOTE_TARGET.r)
        g.drawCircle(d.NOTE_TARGET.x, d.NOTE_TARGET.y, d.NOTE_TARGET.r2)
        g.endFill()
    }

    render() {
        return (
            <Container ref={this.container}>

                <Sprite ref={this.ggtSprite} texture={GetTexture(overall.loader,"track-ggt")}/>

                <TilingSprite ref={this.topTilingSpriteRef} texture={GetTexture(overall.loader,`bg-top-${this.context.staticObjects.bgTopIndex + 1}`,"bg-base")} width={DEFAULT_DIMENSIONS.width} height={DEFAULT_DIMENSIONS.height}/>
                <TilingSprite ref={this.steadyMovingSpriteRef} texture={GetTexture(overall.loader,`bg-top-${this.context.staticObjects.bgTopIndex + 1}-element`,"bg-base")} width={DEFAULT_DIMENSIONS.width} height={DEFAULT_DIMENSIONS.height}/>
                <TilingSprite ref={this.bottomTilingSpriteRef} texture={GetTexture(overall.loader,`bg-bottom-${this.context.staticObjects.bgBottomIndex + 1}`,"bg-base")} width={DEFAULT_DIMENSIONS.width} height={DEFAULT_DIMENSIONS.height}/>
                <Graphics draw={this.draw.bind(this)}/>
                <Sprite ref={this.branchBgSpriteRef} texture={PIXI.Texture.WHITE}/>
                <Graphics draw={this.drawTarget.bind(this)}/>
                <Text text={"Advanced"} ref={this.branchEText}{...DEFAULT_DIMENSIONS.BRANCH_NAME} style={{...STATIC_TEXT_STYLE.branch,fill:'#94D7E7'}}></Text>
                <Text text={"Master"} ref={this.branchMText}{...DEFAULT_DIMENSIONS.BRANCH_NAME} style={{...STATIC_TEXT_STYLE.branch,fill:'#F796EF'}}></Text>

                <Text text={"Normal"} ref={this.branchNText}{...DEFAULT_DIMENSIONS.BRANCH_NAME} style={{...STATIC_TEXT_STYLE.branch,fill:'#D3D3D3'}}></Text>

                <Sprite ref={this.donSprite} texture={GetTexture(overall.loader,"track-don")}/>
                <Sprite ref={this.kaSprite} texture={GetTexture(overall.loader,"track-ka")}/>
            </Container>
        )
    }
}

export default withPixiApp(StaticObjectsComponent)