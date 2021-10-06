import React, { useCallback, useEffect, useState } from 'react'
// import * as PIXI from 'pixi.js'
import *as PIXI from 'pixi-sound'
import PIXISound from 'pixi-sound'
import { DefaultGlobalState as overall, DefaultGameState as game } from "../play2/game";

const PlaySound = name => {
    try {
        overall.loader.resources['sound_' + name].sound.volume = overall.effectVolume / 100
        overall.loader.resources['sound_' + name].sound.play()
    } catch (e) {
        console.error('Resource not found: ' + name)
    }
}

const Sound = (name) => {
    try {
        return overall.loader.resources['sound_' + name].sound
    } catch (e) {
        console.error('Resource not found: ' + name)
    }
}

const Audio = () => {
    useEffect(() => {
    }, [])
    return (<>
        <button onClick={function () {
            PlaySound('menu-ka')
        }}>menu</button>

    </>)
}

export { PlaySound, Sound }
export default Audio