import React, { useEffect } from 'react'
import {DefaultGlobalState} from '../play2/game'

const KEY = 'DATA'

export function getUserLocation(callback){

    var new_js = document.createElement("script");
    try {
        document.body.appendChild(new_js);
        new_js.src = 'http://pv.sohu.com/cityjson';
    } catch (err) {
    }
     
    // 监听script标签加载完毕
    new_js.onload = new_js.onreadystatechange = function () {
        if (!this.readyState //这是FF的判断语句，因为ff下没有readyState这人值，IE的readyState肯定有值
            || this.readyState == 'loaded' || this.readyState == 'complete' // 这是IE的判断语句
        ) {
            var returnCitySN
            let location = isNaN(returnCitySN) ? 'OTHER':'PRC'
            callback(location)
            // cid: "US"
            // cip: "XX.X.XX.X"
            // cname: "UNITED STATES"
            document.body.removeChild(new_js);
        }
    }
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