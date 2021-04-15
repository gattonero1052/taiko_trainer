import {frames as base_frames} from "../assets/img/spritesheet";
import {frames as bg_frames} from "../assets/img/bg-spritesheet";
import * as PIXI from "pixi.js";
import {Defaultgame} from "./game";
import { DEFAULT_DIMENSIONS } from "./constants";
const KEYD = 68, KEYF = 70, KEYJ = 74, KEYK = 75, KEYQ = 81, KEYSPACE = 32, KEYESC = 27, KEYS=83, KEYL=76, KEYENTER=13

const GetTexture = (loader,name,base="note-base")=>{
    console.assert(loader && loader.resources[base].texture,
        "spritesheet resource with name of 'note-base' not found")
    let frames = base === 'note-base'?base_frames:
        base === 'bg-base'?bg_frames:null

    for (let p in frames){
        let pname = p.substring(0,p.lastIndexOf('.'))
        if(pname === name){
            let {x,y,w,h} = frames[p].frame
            return new PIXI.Texture(loader.resources[base].texture, new PIXI.Rectangle(x,y,w,h))
        }
    }
    throw Error(`Texture '${name}' not found`)
}

/**
 * just the value of game.lastTimeValue
 * the value always increases in the ticker loop
 * regardless of the game state (like paused, training mode...)
 * 
 * reason why use game.lastTimeValue instead of the currentTime - startTime
 * is beacuse game.lastTimeValue can be reset to 0 in special cases
 * 
 * return 0 just in case some function use the value 
 * before app initialized
 */
const GetLastTime = game => game && game.app?game.lastTimeValue:0

/**
 * time indicates the time passed from the beginning of the tab until now
 * 
 * if game is paused, time will not change 
 * (so in training mode we can adjust the "newStartTimeInGame" to change the position)
 * 
 * if game is not paused, always use lastTime - startTime
 */
const GetParams = (game) => {
    if (!game || !game.app) {
        throw new Error("Can't find game.")
    }
    let app = game.app
    let lastTime = GetLastTime(game)
    let time = !game.paused?(lastTime - game.startTime) / 1000: //gaming, always use lastTime - startTime
        game.trainingMode? (game.newStartTimeInGame ) / 1000://paused, if training mode, 
            (game.stopTime - game.startTime)/1000

    let tab = game.tab
    let dimensions = DEFAULT_DIMENSIONS
    return {app, time, tab, dimensions}
}

const GetMid = (a,b,c = 1/2)=>c * (b-a) + a

const zoomSpriteTo = (sprite,size)=>{
    let scale = size/sprite.width
    return zoomSprite(sprite,scale)
}

const zoomSprite = (sprite,scale)=>{
    if (sprite instanceof Array){
        sprite.forEach(e=>{
            zoomSprite(e,scale)
        })
    }else{
        sprite.width *= scale
        sprite.height *= scale
    }

    return sprite
}

const isSingleNote = code => '1,2,3,4'.indexOf(code)!==-1
const isBigNote = code => '3,4'.indexOf(code)!==-1
const isDrumrollNote = code => '5,6'.indexOf(code)!==-1
const isBalloonNote = code => code === '7'
const isSpliterNote = code => code === '|'

//only four types of notes can fly, so there is a transform
const GetFlyingNoteCode = (noteCode,keyCode)=>isSingleNote(noteCode)?noteCode:
    isDrumrollNote(noteCode)?(noteCode === '5'?(keyCode===70 || keyCode === 74?'1':'3'):(keyCode===70 || keyCode === 74?'2':'4')):
        isBalloonNote(noteCode)?'1':
            (keyCode===68 || keyCode === 75)?'2':'1'

const hideSprite = (...sprites)=>{
    sprites.forEach(sprite=>{if(sprite) sprite.visible = sprite.alpha = 0})
}

const hideSpriteAlpha = (...sprites)=>{
    sprites.forEach(sprite=>{if(sprite) sprite.alpha = 0})
}

const showSprite = (...sprites)=>{
    sprites.forEach(sprite=>{if(sprite) sprite.visible = sprite.alpha = 1})
}

const showSpriteAlpha = (...sprites)=>{
    sprites.forEach(sprite=>{if(sprite) sprite.alpha = 1})
}



const pressed = (e)=>{
    let code = e.keyCode
    let D=code === KEYD,F=code === KEYF,J=code === KEYJ,K=code === KEYK,SPACE=code === KEYSPACE,ESC=code === KEYESC,Q=code===KEYQ,
    L=code===KEYL,S=code===KEYS,ENTER=code===KEYENTER
    let res = {D,F,J,K,SPACE,ESC,Q,S,L,ENTER}
    let ctrl = {}
    if(e.ctrlKey){
        Object.assign(ctrl,{...res})
    }
    res.ctrl = ctrl
    return res
}

const getPrevIndex = (index,total)=>(index-1+total) % total
const getNextIndex = (index,total)=>(index+1+total) % total
export {pressed,getPrevIndex,getNextIndex,hideSprite,hideSpriteAlpha, showSprite, showSpriteAlpha,GetTexture, GetLastTime, GetParams, GetMid, zoomSpriteTo, zoomSprite, isSingleNote, isBigNote, isSpliterNote, isDrumrollNote, isBalloonNote, GetFlyingNoteCode}
export function ClampValue(min,value,max){
    return Math.max(min,Math.min(value,max))
}

export function GetCourseText(course){
    course = course + ''
    switch(course){
        case 'hard':case '2': return 'Hard'
        case 'normal':case '1': return 'Normal'
        case 'easy':case '0': return 'Easy'
    }
    return 'Extreme'
}