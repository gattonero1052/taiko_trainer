import React,{Component, useEffect, useRef, useState,useCallback} from "react"
import {Stage,AppContext} from '@inlet/react-pixi'
import StaticObjectsComponent from './staticObjects'
import MovingNotes from './movingNotes'
import FlyingNotes from './flyingNotes'
import Score from './score'
import Drum from './drum'
import Stats from "stats.js";
import {GameContext} from "./context";
import {Tab,Tabs} from "../logic/tab";
import text from "../test/zctest";
import Hit from './hit'
import {TabSong, eventHandler,DefaultGameState as game, DefaultGlobalState as overall, StaticObjects, InitialGameState} from "./game";
import ProgressBar from './progressBar'
import Tape from './tape'
import GGT from './ggt'
import Ending from './ending'
import {GetLastTime,pressed} from "./utils";
import PauseMenu from './pauseMenu'
import {Song} from '../sound'

import {
    useHistory, useLocation
} from "react-router-dom";
import { autoFit, DEFAULT_DIMENSIONS } from "./constants"

const Scene = ({history})=>{
    const viewRef = useRef(null)

    const onKeyEvent = useCallback(e=>{
        eventHandler(e)
    },[])

    return (<Stage
                width={window.innerWidth}
                height={window.innerHeight}
                options={{
                    antialias:true,
                    resizeTo:window,
                    backgroundColor:0x10bb99,
                }}

                onMount = {app=>{
                    for(let key in InitialGameState){
                        game[key] = JSON.parse(JSON.stringify(InitialGameState[key]))
                    }

                    game.speed = 1
                    game.app = app
                    DEFAULT_DIMENSIONS.width = app.view.width
                    DEFAULT_DIMENSIONS.height = app.view.height
                    viewRef.current = app.view

                    // app.ticker.maxFPS = 60 //TODO Automatically detect the best stable FPS for the current device

                    app.view.setAttribute('tabIndex',0)
                    app.view.focus()
                    app.view.addEventListener('keydown',onKeyEvent)
                    app.view.addEventListener('keyup',onKeyEvent)
                    app.view.setAttribute('oncontextmenu','return false;')
                    // app.ticker.add(()=>{
                    //     console.log(app.ticker.FPS)
                    // })

                    // const stats = new Stats();
                    // stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
                    // document.body.appendChild( stats.dom );
                    // app.ticker.add(()=>{
                    //     stats.begin();
                    //     stats.end();
                    // })
                }}

                onUnMount={()=>{
                    game.app.view.removeEventListener('keydown',onKeyEvent)
                    game.app.view.removeEventListener('keyup',onKeyEvent)
                }}
            >
        <StaticObjectsComponent/>
        <ProgressBar/>
        <FlyingNotes/>
        <GGT/>
        <Hit/>
        <MovingNotes/>
        <Drum/>
        <Score/>
        <Tape/>
        <Ending/>
        <PauseMenu history={history}/>
    </Stage>)
}



const onTick = delta=>{
    eventHandler({type:'tick',delta});
    let time = performance.now()
    if(game.lastTickTime!==0)
        game.lastTimeValue+= game.speed * (time - game.lastTickTime)
    game.lastTickTime = time
}

const Play = ()=>{
    let [v,setv] = useState(0)
    let history = useHistory()
    const location = useLocation();

    let data = location.state
    let {course,id} = data
    // let tab = Tab.fromText(overall.loader.resources[`tab-${id}`].data)[0]
    // console.log(overall.loader.resources[`tab-${id}`].data)
    let tabs = new Tabs(overall.loader.resources[`tab-${id}`].data, course)
    let tab = tabs.currentTab()

    let song = overall.loader.resources[`song-${id}`].sound
    // console.log(tab,song,data)
    game.staticObjects.bgTopIndex = Math.floor(Math.random() * StaticObjects.BG_TOP_TOTAL)
    game.staticObjects.bgBottomIndex = Math.floor(Math.random() * StaticObjects.BG_BOTTOM_TOTAL)
    useEffect(()=>{
        autoFit()
        // setTimeout(()=>{
        //     game.gameStage = 1
        // },100)
        game.tabs = tabs
        game.tab = tab
        game.tabSong = new TabSong(game,song)
        game.tabSong.onComplete(()=>{

            let endSound = overall.loader.resources[`${game.score.isSuccess?`sound_res-success1`:'sound_res-success1'}`].sound
            let instance = endSound.play({singleInstance:true})
            instance.on('end',()=>{
                //TODO revert
                game.gameStage = 1
            })
        })
        game.tabSong.play()

        game.app.ticker.add(onTick)
        setv(v+1) // for each component to update since the context value change can not be handled
    },[])

    return (<GameContext.Provider value={v}>
        <Scene history={history}/>
    </GameContext.Provider>)
}

export default Play