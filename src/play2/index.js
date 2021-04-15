import { useRef } from "react"
import {Stage} from '@inlet/react-pixi'
import Static from './static'
import MovingNotes from './movingNotes'
import FlyingNotes from './flyingNotes'
import Stats from "stats.js";

const gameState = {}

const Scene = ()=>{
    const staticRef = useRef(null)
    const viewRef = useRef(null)
    const movingNotesRef = useRef(null)
    const flyingNotesRef = useRef(null)
    const onKeyDown = e=>{
        try{
            staticRef.current.onKeyDown(e,gameState)
            movingNotesRef.current.onKeyDown(e,gameState)
            flyingNotesRef.current.onKeyDown(e,gameState)
        }catch(e){}
    }

    return (<Stage
                onMount = {app=>{
                    viewRef.current = app.view
                    app.view.setAttribute('tabIndex',0)
                    app.view.focus()
                    app.view.addEventListener('keydown',onKeyDown)
                    const stats = new Stats();
                    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
                    document.body.appendChild( stats.dom );
                    app.ticker.add(()=>{
                        stats.begin();
                        stats.end();
                    })
                }}
            >
        <Static ref={staticRef}/>
        <MovingNotes ref={movingNotesRef}/>
        <FlyingNotes ref={flyingNotesRef}/>
    </Stage>)
}

const Play = ()=>{
    return (<>
        <Scene/>
    </>)
}

export default Play