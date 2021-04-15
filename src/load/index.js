import React, { useRef, useEffect, useState } from "react";
import Sound from "../sound";
import WebFont from 'webfontloader'
import './index.css'
import bg_base from "../assets/img/bg-spritesheet.png";
import note_base from "../assets/img/spritesheet.png";
import * as PIXI from 'pixi.js'
import PIXISound from 'pixi-sound'
import { DefaultGameState, DefaultGlobalState } from "../play2/game";
import comboburst_0 from '../assets/sound/comboburst-0.wav'
import comboburst_1 from '../assets/sound/comboburst-1.wav'
import comboburst_2 from '../assets/sound/comboburst-2.wav'
import comboburst_3 from '../assets/sound/comboburst-3.wav'
import comboburst_4 from '../assets/sound/comboburst-4.wav'
import comboburst_5 from '../assets/sound/comboburst-5.wav'
import comboburst_6 from '../assets/sound/comboburst-6.wav'
import comboburst_7 from '../assets/sound/comboburst-7.wav'
import comboburst_8 from '../assets/sound/comboburst-8.wav'
import comboburst_9 from '../assets/sound/comboburst-9.wav'
import comboburst_10 from '../assets/sound/comboburst-10.wav'
import combobreak from '../assets/sound/combobreak.wav'
import menu_back from '../assets/sound/menu-back.wav'
import menu_don from '../assets/sound/menu-don.wav'
import menu_ka from '../assets/sound/menu-ka.wav'
import readys from '../assets/sound/readys.wav'
import res_fail from '../assets/sound/res-fail.mp3'
import res_success_1 from '../assets/sound/res-success-1.mp3'
import res_success_2 from '../assets/sound/res-success-2.wav'
import normal_don from '../assets/sound/taiko-normal-don.wav'
import normal_don2 from '../assets/sound/taiko-normal-don.wav'
import normal_ka from '../assets/sound/taiko-normal-ka.wav'
import normal_ka2 from '../assets/sound/taiko-normal-ka2.wav'
import balloon from '../assets/sound/balloon.wav'
import Menu from '../menu'
import { songs } from '../data/local_song.json'
import bg from '../assets/img/openbg.png'
import bg_don from '../assets/img/openbg-don.png'

import {
    useHistory
} from "react-router-dom";
import { autoFit } from "../play2/constants";

const sounds = [
    ['combo0', comboburst_0, "audio/wav"], ['combo1', combobreak, "audio/wav"]
    // ,['zc',zc,"audio/ogg"]
]

//Play default song for debug
// const DebuggingSingleSongTitle = "love戰!!"
const DebuggingSingleSongTitle = ""
const DebuggingSingleSongLevel = 2
let DebuggingSong = null

const Load = () => {
    const history = useHistory()
    const refs = useRef([])
    const [fontLoaded, setFontLoaded] = useState(0)
    const [ImgResourceLoaded, setImageResourceLoaded] = useState(0)
    const [SoundResourceLoaded, setSoundResourceLoaded] = useState(0)

    useEffect(() => {
        autoFit()

        WebFont.load({
            custom: {
                families: ['TnT', 'fzkt', 'qnyy', 'taiko'],
            },
            active() {
                setFontLoaded(1)
            }
        })
        let loader = (DefaultGlobalState.loader = new PIXI.Loader())
        // DEBUG SINGLE SONG
        let song = null
        let [sound, tja, id, Genre] = ['', '', '', '']
        if (DebuggingSingleSongTitle) {
            //FOR DEBUG
            DebuggingSong = songs.filter(s => s.Title == DebuggingSingleSongTitle)[0];
            sound = DebuggingSong.sound
            tja = DebuggingSong.tja
            id = DebuggingSong.id
            Genre = DebuggingSong.Genre
        }

        loader
            .add('note-base', note_base)
            .add('bg-base', bg_base)
            .add('sound_comboburst0', comboburst_0)
            .add('sound_comboburst1', comboburst_1)
            .add('sound_comboburst2', comboburst_2)
            .add('sound_comboburst3', comboburst_3)
            .add('sound_comboburst4', comboburst_4)
            .add('sound_comboburst5', comboburst_5)
            .add('sound_comboburst6', comboburst_6)
            .add('sound_comboburst7', comboburst_7)
            .add('sound_comboburst8', comboburst_8)
            .add('sound_comboburst9', comboburst_9)
            .add('sound_comboburst10', comboburst_10)
            .add('sound_combobreak', combobreak)
            .add('sound_menu-back', menu_back)
            .add('sound_menu-don', menu_don)
            .add('sound_menu-ka', menu_ka)
            .add('sound_readys', readys)
            .add('sound_res-success1', res_success_1)
            .add('sound_res-success2', res_success_2)
            .add('sound_res-fail', res_fail)
            .add('sound_taiko-normal-don', normal_don)
            .add('sound_taiko-normal-don2', normal_don2)
            .add('sound_taiko-normal-ka', normal_ka)
            .add('sound_taiko-normal-ka2', normal_ka2)
            .add('sound_balloon', balloon)

            .add(`song-${id}`, `/song/${Genre}/${sound}`)
            .add(`tab-${id}`, `/song/${Genre}/${tja}`)

            .load(() => {
                DefaultGlobalState.loadComplete = true
                setImageResourceLoaded(1)
            })
    }, [])

    const resourceLoaded = fontLoaded && ImgResourceLoaded

    return (<div style={{
        background: `url(${bg})`,
        backgroundSize:'100vw 100vh',
        height: '100vh',
        width: '100vw',
    }}>

        <div style={{
            zIndex:0,
            position: 'absolute',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'space-around', alignItems: 'center',
        }}>
            <div style={{ transform: 'scaleX(-1)',height: '90vh', width: '50vw', backgroundSize:'cover',background: `url(${bg_don}) no-repeat` }}></div>
            <div style={{ height: '90vh', width: '50vw', backgroundSize:'cover',background: `url(${bg_don}) no-repeat` }}></div>
        </div>

        <div tabIndex={1}
            style={{
                cursor: resourceLoaded ? 'pointer' : 'auto', display: 'flex',
                justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '80%'
                , backgroundColor: 'transparent', opacity: .8
            }}
            onClick={() => {
                if (resourceLoaded) {
                    if (DebuggingSingleSongTitle) {
                        history.push('/practise', { ...DebuggingSong, course: DebuggingSingleSongLevel })
                    } else {
                        history.push('/menu')
                    }
                }
            }}>

            <div style={{
                fontFamily: 'TnT', fontSize: 100,
                display: resourceLoaded ? 'none' : 'inherit'
            }}>Loading...</div>

            <div style={{
                fontFamily: 'TnT', fontSize: 100,
                display: resourceLoaded ? 'inherit' : 'none'
            }}>PLAY</div>

        <div style={{
            zIndex:0,
            position: 'fixed',
            width:'100vw',
            right: '0',
            bottom: '0',
        }}>
            <div style={{
                display:'inline-block',
                float:'right',
                margin:'1rem',
                fontSize:'2rem',
                fontFamily:'TnT',
                color:'#111'
            }}>Taiko trainer Version: 1.0.0</div>
        </div>
        </div>
    </div>)
}

export default Load