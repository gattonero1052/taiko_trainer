import React, { useState, useRef, useEffect } from 'react'
import { DefaultGlobalState as overall } from '../play2/game'

const duration = 300

const Modal = ({ currentSongRef, isOpen, setIsOpen, onClose = () => { } }) => {
    let modalBg = useRef()
    let [hidden, setHidden] = useState(true)
    let [realOpen, setIsRealOpen] = useState(false)//if hidden and opacity changed simontaneously, animation fails


    useEffect(() => {
        if (!isOpen && !hidden) {
            setTimeout(() => {
                setHidden(true)
            }, duration)
        } else if (isOpen && hidden) {
            setHidden(false)
        }
        setTimeout(() => setIsRealOpen(isOpen))
    }, [isOpen])

    return (<div ref={modalBg} onClick={e => {
        if (e.target === modalBg.current) {
            onClose()
            setIsOpen(false)
        }
    }
    } className={`modal-setting`} style={{
        opacity: realOpen ? '1' : '0',
        display: hidden ? 'none' : 'flex'
    }}>
        <div className={`modal-content`}>
            <div className='about'>
                <div class='name'>Instruction:</div>
                <div class='content'>
                    <p>This is a unofficial simulator for taiko no tatsujin game.</p>
                    <p>This is designed to be a single player game for practising.</p>
                    <p>You can control the speed and progress to improve your skills.</p>
                    <p>Some of the features are trimmed like the scoring, </p>
                    <p>you can try <a href="https://taiko.bui.pm/" target="_blank">Taiko Web</a> for a more immersive experience</p>
                </div>
                <div class='name'>Control:</div>
                <div class='content'>D,F,J,K to Hit</div>
                <div class='content'>Q to adjust progress</div>
                <div class='content'>Space to pause</div>
                <div class='content'>Esc to pause and open menu</div>
            </div>
            <div className='author'>
                <div style={{justifySelf:'flex-end'}}>Contact Author:</div>
                <div><a style={{fontFamily:'Aerial',color:'white'}} href="mailto:gattonero1052@gmail.com" target="_self">mskf -</a></div>
                <div style={{justifySelf:'flex-end'}}>Bug report and contribute:</div>
                <div><a style={{fontFamily:'Aerial',color:'white'}} href="https://github.com/gattonero1052/taiko_trainer" target="_self">Github</a></div>
            </div>
        </div>
    </div>)
}

export default Modal