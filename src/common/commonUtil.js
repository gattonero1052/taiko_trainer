import React, { useEffect } from 'react'
import {DefaultGlobalState} from '../play2/game'

const KEY = 'DATA'

const LocalKVStorageKey = "KV"

export function useLocalKVStorage(){
  return {
    set(k,v){
      let jsonStr = window.localStorage.getItem(LocalKVStorageKey)
      if(!jsonStr){
        jsonStr = "{}"
        window.localStorage.setItem(LocalKVStorageKey,jsonStr)
      }

      let dict = JSON.parse(jsonStr)
      dict[k] = v
      window.localStorage.setItem(LocalKVStorageKey,JSON.stringify(dict))
    },
    get(k){
      let jsonStr = window.localStorage.getItem(LocalKVStorageKey)
      if(!jsonStr){
        jsonStr = "{}"
        window.localStorage.setItem(LocalKVStorageKey,jsonStr)
      }
      return JSON.parse(jsonStr)[k]
    }
  }
}

export function getUserLocation(callback){
  fetch("https://ipgeolocation.abstractapi.com/v1/?api_key=1bd1a3a3670b4fb0bffa96d3708ad5cc").then((res)=>{
    return res.json()
  }).then((json)=>{
    let { country_code } = json
    callback(country_code)
  })
}

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