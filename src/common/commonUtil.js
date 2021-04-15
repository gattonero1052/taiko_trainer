import React, { useEffect } from 'react'
import {DefaultGlobalState} from '../play2/game'

const KEY = 'DATA'

const config = {
    autoSave:false
}

const DATA = {
    menu:{
        searchColumn:'',
        searchContent:'',
        page:0,
        activeMenuItemIndex:-1,
    },
    overall:DefaultGlobalState
}

export const setLocalStorage = ()=>{
    let overallObj = {...DATA.overall}

    delete overallObj.loader;
    delete overallObj.loadComplete;

    window.localStorage.setItem(KEY,JSON.stringify({
        menu:DATA.menu,
        overall:overallObj
    }))
}

export function menuReducer(menu){
    Object.assign(DATA.menu,menu)

    if(config.autoSave){
        setLocalStorage()
    }
}

export function useLocalStorage(autoSave){
    config.autoSave = autoSave

    useEffect(()=>{
        let item = window.localStorage.getItem(KEY)
        if(item){
            let itemObj = JSON.parse(item)
            Object.assign(DATA.menu,itemObj.menu)
            Object.assign(DATA.overall,itemObj.overall)

            // console.log(DefaultGlobalState);
        }else{
            setLocalStorage()
        }
    },[])
}

export default DATA