import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import './index.css'
import { songs, Genre } from '../data/local_song.json'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import {
    MemoryRouter as Router,
    Switch,
    Route,
    Link,
    useHistory
} from "react-router-dom";
import { PlaySound } from '../sound'
import { pressed, ClampValue } from "../play2/utils";
import { DefaultGlobalState as overall, DefaultGameState as game } from '../play2/game'
// import * as PIXI  from 'pixi-sound'
import PIXISound from 'pixi-sound'
import SettingMenu from './settings'
import About from './about'
import DATA, { menuReducer, useLocalStorage } from "../common/commonUtil";

library.add(fas);

const MAXROW = 9

const getCourse = course => {
    return ['Easy', 'Normal', 'Hard', 'Extreme'][course]
}

const Star = ({ count }) => {
    return <div className={'difficulty-star'}>{count}</div>
}

const playSong = ({ data, history }) => {
    let song = overall.loader.resources[`song-${data.id}`],
        tab = overall.loader.resources[`tab-${data.id}`]
    // console.log(song,tab)
    PIXISound.stopAll()
    if (!song || !tab) {//waiting for resouce to be loaded
        return
    }
    history.push('/practise', data);
}

const LoadMenuItems = ['searchColumn', 'searchContent', 'page', 'activeMenuItemIndex']

const Table = ({ data, parentKeyDown, currentSongRef }) => {
    const [totalData, setTotalData] = useState(data)
    const [tableData, setTableData] = useState(data.slice(0, MAXROW))
    const [expanded, setExpanded] = useState(-1)
    const [selectedRow, setSelectedRow] = useState(0)
    const [prevExpandedRow, setPrevExpandedRow] = useState(-1) // show close animation
    const [selectedSubSong, setSelectedSubSong] = useState(0)
    const [searchingColumn, setSearchingColumn] = useState(null)
    const [loadedMenuCacheIndex, setLoadedMenuCacheIndex] = useState(-1)
    const history = useHistory()
    const inputRefs = useRef({})

    const titleRef = useCallback(node => {
        inputRefs.current.Title = node
        return node ? node.focus() : ''
    }, []), genreRef = useCallback(node => {
        inputRefs.current.Genre = node
        return node ? node.focus() : ''
    }, []), seriesRef = useCallback(node => {
        inputRefs.current.Series = node
        return node ? node.focus() : ''
    }, [])

    let maxPage = Math.ceil(totalData.length / MAXROW)

    const onPrevPage = () => {
        if (!pagination.hasPrevPage) return
        let page = pagination.page - 1
        if (page > 0) {
            setPagination({ ...pagination, page, hasNextPage: true, hasPrevPage: true })
        } else if (page === 0) {
            setPagination({ ...pagination, page, hasNextPage: true, hasPrevPage: false })
        } else {
            return
        }
        setPrevExpandedRow(expanded)
        setExpanded(-1)
        setTableData(totalData.slice(MAXROW * page, MAXROW * (page + 1)))
    }

    const onNextPage = () => {
        if (!pagination.hasNextPage) return
        let page = pagination.page + 1
        if (page < pagination.maxPage - 1) {
            setPagination({ ...pagination, page, hasPrevPage: true, hasNextPage: true })
        } else if (page === pagination.maxPage - 1) {
            setPagination({ ...pagination, page, hasPrevPage: true, hasNextPage: false })
        } else {
            return
        }
        setPrevExpandedRow(expanded)
        setExpanded(-1)
        setTableData(totalData.slice(MAXROW * page, MAXROW * (page + 1)))
    }

    const [pagination, setPagination] = useState({
        page: 0,
        hasPrevPage: false,
        hasNextPage: maxPage > 1,
        maxPage
    })

    //update menu using menu state in localStorage

    //several operations will change the total data and pagination, so we only record the final version and change at last
    let expectedTotalData = useRef(data) 
    let expectedPagination = useRef(pagination)

    useEffect(() => {
        setTimeout(()=>{
            for (let i = 0; i < LoadMenuItems.length; i++) {
                if (i == loadedMenuCacheIndex + 1) {
                    let value = DATA.menu[LoadMenuItems[i]]
                    if (i == 0 && value) {//searchColumn
                        setSearchingColumn(value)
                    } else if (i == 1 && value) {//searchContent
                        let column = DATA.menu.searchColumn
                        inputRefs.current[column].value = value
                        let v = value
                        let newData = data.filter(row => row[column].toLowerCase().indexOf(v) !== -1)

                        expectedTotalData.current = newData

                        let maxPage = Math.ceil(newData.length / MAXROW)
                        expectedPagination.current = {
                            page: 0,
                            hasPrevPage: false,
                            hasNextPage: maxPage > 1,
                            maxPage
                        }

                    } else if (i == 2 && value) {//page
                        expectedPagination.current = {...expectedPagination.current, page:value, hasPrevPage: !!value, hasNextPage: value < pagination.maxPage - 1 }
                    } else if (i == 3) {//activeMenuItemIndex

                        if(value > -1){
                            setTimeout(()=>setExpanded(value),0)
                            setSelectedRow(value)
                        }

                        //set total data and pagination in the last step
                        setTotalData(expectedTotalData.current)
                        setPagination(expectedPagination.current)
                        setTableData(expectedTotalData.current.slice(MAXROW * expectedPagination.current.page, MAXROW * (expectedPagination.current.page + 1)))
                    }
    
                    setLoadedMenuCacheIndex(v => v + 1)
                }
            }
        },0)
    }, [loadedMenuCacheIndex])

    useEffect(()=>{
        //do not use any effect before the initial stage ends
        if(loadedMenuCacheIndex<LoadMenuItems.length - 1) return

        setSelectedRow(-1)
        setExpanded(-1)
    },[tableData])
    //update menu state in localStorage
    useEffect(() => {
        //do not use any effect before the initial stage ends
        if(loadedMenuCacheIndex<LoadMenuItems.length - 1) return

        menuReducer({
            searchColumn:searchingColumn,
            searchContent: searchingColumn ? inputRefs.current[searchingColumn].value : '',
            page:pagination.page,
            activeMenuItemIndex:expanded
        })

        console.log(DATA);
    }, [pagination,pagination,expanded]) // do not need an indicator because pagination changes when input changes

    useEffect(() => {
        //do not use any effect before the initial stage ends
        if(loadedMenuCacheIndex<LoadMenuItems.length - 1) return

        setSelectedRow(index => ClampValue(0, index, tableData.length - 1))
    }, [tableData.length])

    useEffect(async () => {
        if (expanded !== -1) {
            async function fetchData() {
                let playCurrentSong = (loader, resources) => {
                    let song = resources[`song-${id}`].sound
                    // console.log(id)
                    currentSongRef.current = song
                    PIXISound.volumeAll = songObj['vol'] || 1
                    if (song) {
                        song.volume = overall.musicVolume
                        song.play({
                            start: songObj['demostart'] || 0,
                        })
                    }
                    else
                        console.error(genre, songObj, id)
                }

                const songObj = tableData[expanded]
                const soundFile = songObj['sound']
                const tabFile = songObj['tja']
                const genre = songObj['Genre']
                const id = songObj['id']
                const loader = overall.loader

                if (loader.resources[`song-${id}`]) {
                    playCurrentSong(loader, loader.resources)
                } else {
                    loader
                        .add(`song-${id}`, `/song/${genre}/${soundFile}`)
                        .add(`tab-${id}`, `/song/${genre}/${tabFile}`)
                        .load(function (loader, resources) {
                            playCurrentSong(loader, resources)
                        })
                }

            }

            fetchData()
        } else {
            if (currentSongRef.current) {
                currentSongRef.current.stop()
            }
        }
    }, [expanded])

    const onClickRow = index => {
        if (index === selectedRow) {
            if (expanded !== index) {
                setPrevExpandedRow(expanded)
                setExpanded(index)
                setSelectedSubSong(0)
            }
        } else {
            setSelectedRow(index)
            setPrevExpandedRow(expanded)
            setExpanded(-1)
        }
    }

    const onClickSearch = column => {
        setSearchingColumn(column)
    }

    const onInputBlur = (column, e) => {
        let v = (e.target.value || '').trim()
        if (v === '') {
            setSearchingColumn(null)
        }
    }

    const confirmSongSelection = (song, subSong) => {
        playSong({ data: { ...song, ...subSong }, history })
    }

    const onInputChange = (column, e) => {
        let v = (e.target.value || '').toLowerCase()
        let newData = data.filter(row => row[column].toLowerCase().indexOf(v) !== -1)
        setTotalData(newData)
        setTableData(newData.slice(0, MAXROW))
        let maxPage = Math.ceil(newData.length / MAXROW)
        setPagination({
            page: 0,
            hasPrevPage: false,
            hasNextPage: maxPage > 1,
            maxPage
        })
    }

    const onKeyDown = e => {
        if (document.activeElement === document.querySelector('#title_search') && (pressed(e).ESC || pressed(e).ENTER)) {
            document.querySelector('#title_search').blur()
            onInputBlur('Title', e)
            document.querySelector('#menu').focus()
        }

        if (pressed(e).ctrl.F) {
            PlaySound('menu-ka')
            let searchElement = document.querySelector('#title_search')
            if (searchElement) {
                searchElement.focus()
            } else {
                onClickSearch('Title')
            }
            e.preventDefault()
            return
        }

        if (document.activeElement === document.querySelector('#title_search')) return

        if (pressed(e).L) {
            PlaySound('menu-ka')
            onNextPage()
        }

        if (pressed(e).S) {
            PlaySound('menu-ka')
            onPrevPage()
        }

        if (expanded === -1) {
            if (pressed(e).D) {
                PlaySound('menu-ka')
                setSelectedRow(index => ClampValue(0, index - 1, tableData.length - 1))
            }

            if (pressed(e).K) {
                PlaySound('menu-ka')
                setSelectedRow(index => ClampValue(0, index + 1, tableData.length - 1))
            }

            if (pressed(e).F || pressed(e).J) {
                PlaySound('menu-don')
                onClickRow(selectedRow)
            }
        } else {
            let song = tableData[expanded]
            if (pressed(e).D) {
                PlaySound('menu-ka')
                setSelectedSubSong(index => ClampValue(0, index - 1, song['subSongs'].length - 1))
            }

            if (pressed(e).K) {
                PlaySound('menu-ka')
                setSelectedSubSong(index => ClampValue(0, index + 1, song['subSongs'].length - 1))
            }

            if (pressed(e).ENTER || pressed(e).F || pressed(e).J) {
                PlaySound('menu-don')
                confirmSongSelection(song, song['subSongs'][selectedSubSong])
            }

            if (pressed(e).SPACE || pressed(e).ESC) {
                setSelectedRow(expanded)
                setPrevExpandedRow(expanded)
                setExpanded(-1)
            }
        }
    }

    useEffect(() => {
        parentKeyDown.current = onKeyDown
    }, [searchingColumn, pagination, expanded, selectedRow, selectedSubSong, searchingColumn, prevExpandedRow])

    return (<div className="responsive-table">
        <div className={'settings'}>

        </div>
        <div className={'thead'}>
            <div className={'tr tr-head'}>
                <div className={'th-b'}>
                    <div className={`th-item ${searchingColumn === 'Title' ? 'hide' : ''}`}>Title</div>
                    {searchingColumn === 'Title' ? <><input autoComplete="off" id="title_search" ref={titleRef} onBlur={(e) => { onInputBlur('Title', e) }} onInput={e => { onInputChange('Title', e) }} onChange={e => { onInputChange('Title', e) }} className={'search-input-b search-input'} placeholder={'Title'} /><div className={``}></div></> :
                        <div className={`th-search ${searchingColumn ? 'hide' : ''}`} onClick={() => { PlaySound('menu-don'); onClickSearch('Title'); }}><FontAwesomeIcon icon={"search"} /></div>}
                </div>
                <div className={'th'}>
                    <div className={`th-item ${searchingColumn === 'Genre' ? 'hide' : ''}`}>Genre</div>
                    {searchingColumn === 'Genre' ? <input autoComplete="off" ref={genreRef} onBlur={(e) => { onInputBlur('Genre', e) }} onInput={e => { onInputChange('Genre', e) }} onChange={e => { onInputChange('Genre', e) }} className={'search-input'} placeholder={'Genre'} /> :
                        <div className={`th-search ${searchingColumn ? 'hide' : ''}`} onClick={() => { PlaySound('menu-don'); onClickSearch('Genre'); }}><FontAwesomeIcon icon={"search"} /></div>}
                </div>
                <div className={'th'}>
                    <div className={`th-item ${searchingColumn === 'Series' ? 'hide' : ''}`}>Series</div>
                    {searchingColumn === 'Series' ? <input autoComplete="off" ref={seriesRef} onBlur={(e) => { onInputBlur('Series', e) }} onInput={e => { onInputChange('Series', e) }} onChange={e => { onInputChange('Series', e) }} className={'search-input'} placeholder={'Series'} /> :
                        <div className={`th-search ${searchingColumn ? 'hide' : ''}`} onClick={() => { PlaySound('menu-don'); onClickSearch('Series'); }}><FontAwesomeIcon icon={"search"} /></div>}
                </div>
            </div>
        </div>
        <div className={'tbody'}>
            {tableData.map((row, index) => (
                <div style={{ backgroundColor: Genre[row['Genre']]['color'] }} className={`tr tr- ${index === selectedRow ? (index !== expanded ? 'tr-selected' : 'tr-expanded tr-selected-' + row['subSongs'].length) : ''} ${index === expanded ? 'tr-e-' + row['subSongs'].length : ''} ${index === prevExpandedRow ? 'tr-e-' + row['subSongs'].length + 'b' : ''}`} onClick={() => { PlaySound('menu-don'); onClickRow(index); }} key={row['id'] ? row['id'] : index}>
                    {
                        <>
                            <div className={`td-b ${expanded === index ? 'td-sub-title' : ''}`}
                                scope="row"
                                data-label={'Title'}>
                                {row['Title']}
                            </div>
                            <div className={`td`}
                                scope="row"
                                data-label={'Genre'}>
                                {
                                    expanded === index ?
                                        <div className={'td-level'}>{row['subSongs'].map((song, _index) => <div key={_index} className={'td-sub-level'} onMouseOver={() => { setSelectedSubSong(_index) }} onClick={() => { confirmSongSelection(row, song) }}>{(selectedSubSong === _index ? '>>  ' : '     ') + getCourse(song.course)}</div>)}</div>
                                        : row['Genre']
                                }
                            </div>
                            <div className={`td`}
                                scope="row"
                                data-label={'Series'}>
                                {
                                    expanded === index ?
                                        <div className={'td-difficulty'}>{row['subSongs'].map((song, _index) => <div key={_index} className={'td-sub-difficulty'} onMouseOver={() => { setSelectedSubSong(_index) }} onClick={() => { PlaySound('readys'); confirmSongSelection(row, song); }}><Star count={song.level} /></div>)}</div>
                                        : row['Series']
                                }
                            </div>
                        </>
                    }
                </div>
            ))}
        </div>
        <div className={'tfooter'}>
            <div className={'tr'}>
                <div className={`td ${pagination.hasPrevPage ? '' : 'disabled'}`} onClick={() => { PlaySound('menu-don'); onPrevPage(); }}>Prev</div>
                <div className={'td td-info'}>{`${pagination.page + 1} of ${pagination.maxPage}`}</div>
                <div className={`td ${pagination.hasNextPage ? '' : 'disabled'}`} onClick={() => { PlaySound('menu-don'); onNextPage() }}>Next</div>
            </div>
        </div>
    </div>)
}


const Setting = ({ currentSongRef, parentKeyDown }) => {
    const [isSettingOpen, setIsSettingOpen] = useState(0)
    const [isAboutOpen, setIsAboutOpen] = useState(0)

    //save settings automatically
    return (<div className={'setting'}>
        <FontAwesomeIcon icon={"question-circle"} onClick={() => setIsAboutOpen(1)} />
        <FontAwesomeIcon icon={"user-cog"} onClick={() => setIsSettingOpen(1)} />
        <About isOpen={isAboutOpen} setIsOpen={setIsAboutOpen} />
        <SettingMenu currentSongRef={currentSongRef} isOpen={isSettingOpen} setIsOpen={setIsSettingOpen} />
    </div>)
}

const Menu = () => {
    useLocalStorage(true)

    const currentSongRef = useRef(null)
    const tableKeyDown = useRef()
    const settingKeyDown = useRef()
    const history = useHistory()

    const onKeyDown = e => {
        if (tableKeyDown.current) {
            tableKeyDown.current(e)
        }

        if (settingKeyDown.current) {
            settingKeyDown.current(e)
        }
    }

    useEffect(() => {
        if (!overall.loadComplete) {
            history.push('/')
        }
    }, [])

    return (<div id="menu" className='menu' style={{ display: overall.loadComplete ? 'flex' : 'none' }} ref={ref => { if (ref) ref.focus() }} tabIndex={0} onKeyDown={onKeyDown}>
        <Setting currentSongRef={currentSongRef} parentKeyDown={settingKeyDown} />
        <Table currentSongRef={currentSongRef} parentKeyDown={tableKeyDown} data={songs} />
    </div>)
}

export default Menu