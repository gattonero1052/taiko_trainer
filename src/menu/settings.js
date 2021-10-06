import React, { useState, useRef, useEffect } from 'react'
import { DefaultGlobalState as overall } from '../play2/game'
import {autoFit} from '../play2/constants'
import {setLocalStorage} from '../common/commonUtil'

const duration = 300

const Modal = ({ currentSongRef, isOpen, setIsOpen, onClose = () => { } }) => {
    let modalBg = useRef()
    let [hidden, setHidden] = useState(true)
    let [realOpen, setIsRealOpen] = useState(false)//if hidden and opacity changed simontaneously, animation fails
    let eleRef = useRef({})

    const getRef = (ref, type)=>{
        eleRef.current[type] = ref
    }
    
    useEffect(() => {
        for(let key in overall){
            let refs = eleRef.current
            if(refs[key]){
                let ele = refs[key]
                ele.value = overall[key]
            }
        }

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
            <div className='items'>
                <div className='label'>Music volume %</div>
                <div className='input'>
                  <datalist id="musicVolumes">
                    <option value='0'></option>
                    <option value='20'></option>
                    <option value='40'></option>
                    <option value='60'></option>
                    <option value='80'></option>
                    <option value='100'></option>
                  </datalist>

                  <input type="number" list="musicVolumes" min={0} max={100} ref={ref=>getRef(ref,'musicVolume')}
                      onChange={e=>{
                        overall.musicVolume = Number(e.target.value ) || 0
                        if(currentSongRef.current){
                            currentSongRef.current.volume = (e.target.value / 100)
                        }
                        setLocalStorage()
                    }}></input>
                </div>

                <div className='label'>Effect volume %</div>
                <div className='input'>
                  <datalist id="effectVolumes">
                      <option value='0'></option>
                      <option value='20'></option>
                      <option value='40'></option>
                      <option value='60'></option>
                      <option value='80'></option>
                      <option value='100'></option>
                    </datalist>

                    
                  <input type="number" list="musicVolumes" min={0} max={100} ref={ref=>getRef(ref,'effectVolume')}
                      onChange={e=>{
                        overall.effectVolume = Number(e.target.value ) || 0
                        setLocalStorage()
                    }}></input>
                </div>

                <div className='label'>Delay (ms)</div>
                <div className='input'>
                    <input ref={ref=>getRef(ref,'delay')} onInput={e=>{
                        overall.delay = Number(e.target.value)||0
                        setLocalStorage()
                    }}/>
                </div>

                <div className='label'>Default Branch</div>
                <div className='input'>
                    <select ref={ref=>getRef(ref,'defaultBranch')} onChange={e=>{
                        overall.defaultBranch = e.target.value
                        setLocalStorage()
                    }}>
                        <option value='auto'>Auto</option>
                        <option value='N'>Normal</option>
                        <option value='E'>Advanced</option>
                        <option value='M'>Master</option>
                    </select>
                </div>

                <div className='label'>Judge Mode</div>
                <div className='input'>
                    <select ref={ref=>getRef(ref,'judgeMode')} onChange={e=>{
                        overall.judgeMode = e.target.value
                        setLocalStorage()
                    }}>
                        <option value='0'>Normal</option>
                        <option value='1'>Loose</option>
                        <option value='2'>Strict</option>
                    </select>
                </div>
            </div>
        </div>
    </div>)
}

export default Modal