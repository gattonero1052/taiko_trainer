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
import taiko_normal_don from '../assets/sound/taiko-normal-don.wav'
import taiko_normal_don2 from '../assets/sound/taiko-normal-don.wav'
import taiko_normal_ka from '../assets/sound/taiko-normal-ka.wav'
import taiko_normal_ka2 from '../assets/sound/taiko-normal-ka2.wav'
import balloon from '../assets/sound/balloon.wav'
import Menu from '../menu'
import { songs } from '../data/local_song.json'
import bg from '../assets/img/openbg.png'
import bg_don from '../assets/img/openbg-don.png'

import {
    useHistory
} from "react-router-dom";
import { autoFit } from "../play2/constants";
import { getUserLocation } from "../common/commonUtil";

//Play default song for debug
// const DebuggingSingleSongTitle = "love戰!!"
const DebuggingSingleSongTitle = ""
const DebuggingSingleSongLevel = 2
let DebuggingSong = null

const remoteResourceLinks = 
`http://lc-x3QTObAS.cn-n1.lcfile.com/muFqhO8ge5toQ2AoNWOcdLFC7V5gHupQ/taiko-normal-ka2.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/pH9dMfCzINXXMfPSJRA48LYbJPeufgQB/taiko-normal-ka.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/DTJhxeMbJ5tboFRwkQNAhreLLHxlYy8g/taiko-normal-don2.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/UwmffOUn4PmduAY3lWCzVC6DYYuR1Deu/taiko-normal-don.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/DKpBHJ7EOBgXfgnVvfhbJLfk9NRF17Na/spinnerbonus.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/DHJEFUYRBUu9oNeDRae0e4A1RXYBW261/res-success-2.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/38dizGMSSEH9CqfXS8iLmvH5XDqDhN1P/res-success-1.mp3
http://lc-x3QTObAS.cn-n1.lcfile.com/qMquPorCOToNYBtemJ8Qpa3oL14wCJq2/res-fail.mp3
http://lc-x3QTObAS.cn-n1.lcfile.com/JbbToVfc8nUm9ncnl3lNQJswbyXqoi39/readys.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/fUaLHhirknHjlKLTVhqeLFmna4MbQU71/menu-ka.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/kxI2F6NsyIGkluhYgbc5omzERh3YUS0h/menu-don.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/y8CLYm7h0IBCu4wVfSqtYWz3tPuyrsi4/menu-back.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/XNsEz6YaM5Xa4gDL21pfGpnW5T9OaCUF/comboburst-10.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/VLXAOlx7D21VDN4gNuFmqMeSciY8uBAr/comboburst-9.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/6c6d13jEp9vDxqSfHiI7PkfPjtLsUtYF/comboburst-8.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/QUTSWnEtKHA5fNmYbjdcn7pEO8K85b7I/comboburst-7.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/S87kx5JeDYsDx4o5IaiOBFDF7dwYMa36/comboburst-6.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/aERGU37SFuE7MPMYaV65EvkLcS1HHp3g/comboburst-5.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/A3V24pkdpmyTlQiMhXRju3sbzCCItilI/comboburst-4.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/76A9lGTeUKvXBeEsdft0LuV15aBL6dll/comboburst-3.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/IeWGpsibirh24EfcJucqXsykn2HDx2ya/comboburst-2.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/uRskkoFU5tjvm3iuwLpPjKnAtWKT660s/comboburst-1.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/c3QgFulcXI2LiYtl9uxj4NvG8XtEPx6x/combobreak.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/LgDk82XNY2HRh3zx8z00pIgEvUJb3szl/comboburst-0.wav
http://lc-x3QTObAS.cn-n1.lcfile.com/PR8YQLlR3cYGIO0zyviIXii1ynQBmlyg/balloon.wav`

const localResourceLinks = {
    comboburst_0:comboburst_0,
    comboburst_1:comboburst_1,
    comboburst_2:comboburst_2,
    comboburst_3:comboburst_3,
    comboburst_4:comboburst_4,
    comboburst_5:comboburst_5,
    comboburst_6:comboburst_6,
    comboburst_7:comboburst_7,
    comboburst_8:comboburst_8,
    comboburst_9:comboburst_9,
    comboburst_10:comboburst_10,
    combobreak:combobreak,
    menu_back:menu_back,
    menu_don:menu_don,
    menu_ka:menu_ka,
    readys:readys,
    res_fail:res_fail,
    res_success_1:res_success_1,
    res_success_2:res_success_2,
    taiko_normal_don:taiko_normal_don,
    taiko_normal_don2:taiko_normal_don2,
    taiko_normal_ka:taiko_normal_ka,
    taiko_normal_ka2:taiko_normal_ka2,
    balloon:balloon
}
    
const Load = () => {
    const history = useHistory()
    const refs = useRef([])
    let [imgLoadProgress,setImgLoadProgress] = useState(0)
    let [fontLoadProgress,setFontLoadProgress] = useState(0)
    let [loadingFile,setLoadingFile] = useState('')
    const [fontLoaded, setFontLoaded] = useState(0)
    const [ImgResourceLoaded, setImageResourceLoaded] = useState(0)
    const [SoundResourceLoaded, setSoundResourceLoaded] = useState(0)

    useEffect(() => {
        autoFit()

        function loadAll(location){
            let resourceMap = {}
            let links = remoteResourceLinks.split('\n')

            for(let link of links){
                let fileName = link.substring(1 + link.lastIndexOf('/'),link.lastIndexOf('.')).replace('-','_')
                if(location=='PRC'){
                    resourceMap[fileName] = link
                }else{
                    resourceMap[fileName] = localResourceLinks[fileName]
                }
            }

            WebFont.load({
                custom: {
                    families: ['TnT', 'qnyy', 'taiko'],
                },
                active() {
                    setFontLoadProgress(100)
                    setFontLoaded(1)
                },

                timeout:30000
            })

            let loader = (DefaultGlobalState.loader = new PIXI.Loader())
            // DEBUG SINGLE SONG, to use, uncomment add(`song-${id}`, `/so and the subsequent line
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
                .add('sound_taiko-normal-don', taiko_normal_don)
                .add('sound_taiko-normal-don2', taiko_normal_don2)
                .add('sound_taiko-normal-ka', taiko_normal_ka)
                .add('sound_taiko-normal-ka2', taiko_normal_ka2)
                .add('sound_balloon', balloon)
    
                // .add(`song-${id}`, `/song/${Genre}/${sound}`)
                // .add(`tab-${id}`, `/song/${Genre}/${tja}`)
    
                .load(() => {
                    DefaultGlobalState.loadComplete = true
                    setImgLoadProgress(100)
                    setImageResourceLoaded(1)
                })

                loader.onProgress.once(loader=>{
                    setImgLoadProgress(Math.min(99.99,Number(loader.progress).toFixed(2)))
                })

                loader.onError.add((a,b,c,d)=>{
                    console.error(a)
                })
        }

        getUserLocation(loadAll)
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
            }}>{Number(imgLoadProgress*0.8 + fontLoadProgress*0.2).toFixed(2)+'%'}
            <p style={{fontSize:20}}>{loadingFile}</p>
            </div>

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