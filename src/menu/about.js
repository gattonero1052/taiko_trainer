import React, { useState, useRef, useEffect } from 'react'
import { useLocalKVStorage } from '../common/commonUtil'
import { DefaultGlobalState as overall } from '../play2/game'

const duration = 300

const Modal = ({ currentSongRef, isOpen, setIsOpen, onClose = () => { } }) => {
    let modalBg = useRef()
    let [hidden, setHidden] = useState(true)
    let [realOpen, setIsRealOpen] = useState(false)//if hidden and opacity changed simontaneously, animation fails
    const {set:setLocal,get:getLocal} = useLocalKVStorage()

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
                <div className='name'>
                  Instruction:
                  <div className="skip-instruction">
                    <input type="checkbox" defaultChecked={getLocal('skipInstructionOnStart')?true:false} onChange={e=>{
                      setLocal('skipInstructionOnStart',e.target.checked?true:false)
                    }}/>
                    <label>Skip instruction by default</label>
                  </div>
                  </div>
                <div className='content'>
                    <p>This is a unofficial simulator for taiko no tatsujin game.</p>
                    <p>This is designed to be a single player game for practising.</p>
                    <p>You can control the speed and progress to improve your skills.</p>
                    <p>Some of the features are trimmed like the scoring, </p>
                    <p>you can try <a href="https://taiko.bui.pm/" target="_blank">Taiko Web</a> for a more immersive experience</p>
                </div>
                <div className='name'>Control:</div>
                <div className='content control'><span className="key">D,F,J,K</span> to Hit</div>
                <div className='content control'><span className="key">Q</span> to adjust progress</div>
                <div className='content control'><span className="key">Space</span> to pause</div>
                <div className='content control'><span className="key">Esc</span> to pause and open menu</div>
                <div className='name'>Feature:</div>
                <div className='content'>
                  <p>You can adjust the speed of song by dragging the button on the radio.</p>
                  <p>You can see which part of the song you failed to combo at the end.</p>
                </div>
            </div>
            <div className='author'>
                <div style={{justifySelf:'flex-end'}}>Contact Author:</div>
                <div><a href="mailto:gattonero1052@gmail.com" target="_self">mskf -</a></div>
                <div style={{justifySelf:'flex-end'}}>Bug report and contribute:</div>
                <div><a href="https://github.com/gattonero1052/taiko_trainer" target="_self">Github</a></div>
            </div>
        </div>
    </div>)
}

export default Modal