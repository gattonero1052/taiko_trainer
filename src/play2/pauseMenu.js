import React, { Component } from 'react'
import { Text, TilingSprite, withPixiApp, Container, Graphics } from "@inlet/react-pixi";
import { GameContext } from "./context";
import * as PIXI from "pixi.js";
import { DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE } from "./constants";
import {
    pressed,
    GetTexture,
    hideSprite,
    showSprite,
    hideSpriteAlpha,
    getNextIndex,
    getPrevIndex,
    GetLastTime
} from "./utils";
import { bind, PauseMenu, DefaultGlobalState as overall, DefaultGameState } from "./game";
import { onEnteringTrainingMode } from "./tape";

const MENU_TEXT_STYLE = new PIXI.TextStyle({ ...STATIC_TEXT_STYLE.game_menu })

const MENU_ITEM_TOTAL = 5

// const SoundOptions = ["0%","10%","20%","30%","40%","50%","60%","70%","80%","90%","100%"].reverse()
const TrainModeOptions = ["Off", "On"]
const GameModeOptions = ["Normal", "X2 ROLL", "X4 ROLL", "X8 ROLL", "STEALTH", "RANDOM"]
const ALL_SELECTIONS = [
    [],
    [],
    TrainModeOptions,
    GameModeOptions,
    []
]
const ResumeGame = game => {
    let lastTime = GetLastTime(game)
    game.showPausedMenu = 0
    game.paused = 0
    game.showTape = 0
    if (game.trainingMode) {
        game.lastStartTimeInGame = game.newStartTimeInGame
        game.trainingMode = 0
        game.startTime = lastTime - game.newStartTimeInGame
    } else {
        game.startTime += lastTime - game.stopTime
    }

    game.tabSong.play()
}

const RestartGame = game => {
    onEnteringTrainingMode(game)
    game.newStartTimeInGame = 0
    game.gameStage = 0
    game.gameState = 0
    game.stopTime = 0
    game.startTime = 0
    game.lastStartTimeInGame = 0
    game.showTape = 0
    game.lastTimeValue = 0
    ResumeGame(game)
}

const ExitGame = (game, history) => {
    history.push('/menu')
}

const ToggleRandom = (game) => {
    game.tab.randomState = 1
        ;[game.tabs.branches.N.measures, game.tabs.branches.E.measures, game.tabs.branches.M.measures]
            .forEach(measures => measures.forEach(measure => {
                if (measure.notes)
                    measure.notes.forEach(note => {
                        let tmp = note.code
                        if (note.randomCode && tmp) {
                            note.code = note.randomCode
                            note.randomCode = tmp
                            if (note.code !== note.randomCode) {
                                tmp = note.sprite.texture
                                note.sprite.texture = note.sprite.alternativeTexture
                                note.sprite.alternativeTexture = tmp
                            }
                        }
                    })
            }))
}

const MenuActions = { Resume: 0, Restart: 1, TrainMode: 2, GameMode: 3, Exit: 4 }
const updateSetting = (game, selectionIndex, component) => {
    let option = game.pauseMenu.options[selectionIndex]
    if (selectionIndex === MenuActions.Resume) {
        ResumeGame(game)
    } else if (selectionIndex === MenuActions.Restart) {
        RestartGame(game)
    } else if (selectionIndex === MenuActions.Exit) {
        ExitGame(game, component.props.history)
    } else if (selectionIndex === MenuActions.GameMode) {
        if (game.tab.randomState === 1) {
            game.tab.randomState = 0
            ToggleRandom(game)
        }
        // console.log(option)
        if (option === 0) {
            game.gameMode.showNote = 1
            game.gameMode.scrollSpeed = 1
        } else if (option === 1) {
            game.gameMode.showNote = 1
            game.gameMode.scrollSpeed = 2
        } else if (option === 2) {
            game.gameMode.showNote = 1
            game.gameMode.scrollSpeed = 4
        } else if (option === 3) {
            game.gameMode.showNote = 1
            game.gameMode.scrollSpeed = 8
        } else if (option === 4) {
            game.gameMode.scrollSpeed = 1
            game.gameMode.showNote = 0
        } else if (option === 5) {
            game.gameMode.showNote = 1
            game.gameMode.scrollSpeed = 1
            ToggleRandom(game)
            game.gameMode.random = 1
        } else if (option === 6) {
            // game.scrollSpeed = 1
        }
    } else if (selectionIndex === MenuActions.TrainMode) {
        if (option === 0) {
            if (game.trainingMode) {
                game.showTape = 0
            }
        } else if (option === 1) {
            if (!game.trainingMode) {
                onEnteringTrainingMode(game)
            } else {
                game.showTape = 1
            }
        }
    }

}


const showSelectionByIndex = (game) => {
    let index = game.pauseMenu.pauseMenuSelectionIndex
    game.pauseMenu.optionRefs.forEach((ref, _index) => {
        if (_index !== index) {
            hideSpriteAlpha(ref)
        } else {
            ref.alpha = .8
        }
    })
}

class PauseMenuComponent extends Component {
    static contextType = GameContext

    constructor(props) {
        super(props)
        this.pauseMenuContainer = React.createRef(null)
        this.borderRef = React.createRef(null)
        this.maskRef = React.createRef(null)
        this.menuBackgroundRef = React.createRef(null)
        this.option1Ref = React.createRef(null)
        this.optionLeftText1Ref = React.createRef(null)
        this.option2Ref = React.createRef(null)
        this.optionLeftText2Ref = React.createRef(null)
        this.optionRightText2Ref = React.createRef(null)
        this.option3Ref = React.createRef(null)
        this.optionLeftText3Ref = React.createRef(null)
        this.optionRightText3Ref = React.createRef(null)
        this.option4Ref = React.createRef(null)
        this.optionLeftText4Ref = React.createRef(null)
        this.optionRightText4Ref = React.createRef(null)
        this.option5Ref = React.createRef(null)
        this.optionLeftText5Ref = React.createRef(null)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        bind(PauseMenu, this, this.context)
        let d = DEFAULT_DIMENSIONS
        let h = d.MENU_CONSTANTS.h * d.height - d.MENU_CONSTANTS.border, w = d.MENU_CONSTANTS.w * d.width - d.MENU_CONSTANTS.border
        let x = (d.width - w) / 2, y = (d.height - h) / 2
        let h_each = h / (MENU_ITEM_TOTAL + 0.5)
        let ys = [...Array(MENU_ITEM_TOTAL).keys()].map(index => y + (index + 0.5) * h_each)
        let leftX = x + w * 0.15, rightX = x + w * 0.60

        this.context.pauseMenu.component = this
        this.context.pauseMenu.container = this.pauseMenuContainer.current
        this.menuBackgroundRef.current.mask = this.maskRef.current
        this.menuBackgroundRef.current.x = 0
        this.menuBackgroundRef.current.y = 0
        this.context.pauseMenu.optionRightRefs = [null, null, this.optionRightText3Ref.current, this.optionRightText4Ref.current, null]
        this.context.pauseMenu.optionRefs = [this.option1Ref.current, this.option2Ref.current, this.option3Ref.current, this.option4Ref.current, this.option5Ref.current]
        hideSpriteAlpha(...this.context.pauseMenu.optionRefs)

        //mouse events
        this.context.pauseMenu.optionRefs.forEach((ref, index) => {
            ref.buttonMode = true;
            ref.interactive = true;
            ref.on('pointerdown', (event) => {
                let button = event.data.button
                if (button === 0) {//left click
                    this.context.pauseMenu.options[index] = getNextIndex(this.context.pauseMenu.options[index], ALL_SELECTIONS[index].length)
                } else if (button === 2) {
                    this.context.pauseMenu.options[index] = getPrevIndex(this.context.pauseMenu.options[index], ALL_SELECTIONS[index].length)
                }
                updateSetting(this.context, index, this)
            })

            ref.on('pointerover', (event) => {
                this.context.pauseMenu.pauseMenuSelectionIndex = index
            });
            ref.on('pointerout', (event) => {
                // hideSpriteAlpha(ref)
            });
        })

        showSelectionByIndex(this.context)
        this.optionLeftText1Ref.current.y = ys[0]
        this.optionLeftText2Ref.current.y = ys[1]
        this.optionRightText2Ref.current.y = ys[1]
        this.optionLeftText3Ref.current.y = ys[2]
        this.optionRightText3Ref.current.y = ys[2]
        this.optionLeftText4Ref.current.y = ys[3]
        this.optionRightText4Ref.current.y = ys[3]
        this.optionLeftText5Ref.current.y = ys[4]
        //
        this.optionLeftText1Ref.current.x = leftX
        this.optionLeftText2Ref.current.x = leftX
        this.optionLeftText3Ref.current.x = leftX
        this.optionLeftText4Ref.current.x = leftX
        this.optionLeftText5Ref.current.x = leftX
        this.optionRightText2Ref.current.x = rightX
        this.optionRightText3Ref.current.x = rightX
        this.optionRightText4Ref.current.x = rightX
    }

    //handling keyboard events
    onKeyDown(e) {
        let previousPaused = this.paused
        let resumeGame = 0
        let lastTime = GetLastTime(this)
        if (pressed(e).SPACE) {//Pause
            if (!this.paused) {
                this.paused = 1
                this.stopTime = lastTime
                this.tabSong.pause()
            } else {
                if (!this.showPausedMenu) {
                    resumeGame = 1
                } else {
                    this.showPausedMenu = 0
                }
            }
        } else if (pressed(e).Q) {//Enter practise mode and restart from previous start
            if (this.gameStage == 2) {//game already ended
                this.pauseMenu.component.props.history.push('/menu');
                return
            }

            if (!this.paused) this.tabSong.pause()
            this.paused = 1
            if (!this.trainingMode) onEnteringTrainingMode(this)
        } else if (pressed(e).ESC) {//Pause and show menu


            if (this.paused) {
                if (!this.showPausedMenu) {
                    this.showPausedMenu = 1
                } else {
                    resumeGame = 1
                }
            } else {
                // console.log('stoptime is set to be: ' + lastTime)
                this.stopTime = lastTime
                this.tabSong.pause()
                this.paused = 1
                this.showPausedMenu = 1
            }
        }

        if (resumeGame) {
            ResumeGame(this)
        }

        if (this.showPausedMenu) {
            let sindex = this.pauseMenu.pauseMenuSelectionIndex
            if (pressed(e).D) {
                this.pauseMenu.pauseMenuSelectionIndex = getPrevIndex(this.pauseMenu.pauseMenuSelectionIndex, MENU_ITEM_TOTAL)
            } else if (pressed(e).K) {
                this.pauseMenu.pauseMenuSelectionIndex = getNextIndex(this.pauseMenu.pauseMenuSelectionIndex, MENU_ITEM_TOTAL)
            } else if (pressed(e).J) {
                this.pauseMenu.options[sindex] = getPrevIndex(this.pauseMenu.options[sindex], ALL_SELECTIONS[sindex].length)
                updateSetting(this, sindex, this.pauseMenu.component)
            } else if (pressed(e).F) {
                this.pauseMenu.options[sindex] = getNextIndex(this.pauseMenu.options[sindex], ALL_SELECTIONS[sindex].length)
                updateSetting(this, sindex, this.pauseMenu.component)
            }
        }
    }

    onTick(e) {
        if (this.showPausedMenu) {
            this.pauseMenu.optionRightRefs.forEach((ref, index) => {
                if (ref) ref.text = ALL_SELECTIONS[index][this.pauseMenu.options[index] || 0]
            })
            showSprite(this.pauseMenu.container)
            showSelectionByIndex(this)
        } else {
            hideSprite(this.pauseMenu.container)
        }
    }

    drawOptions(index, g) {
        let d = DEFAULT_DIMENSIONS
        let h = d.MENU_CONSTANTS.h * d.height - d.MENU_CONSTANTS.border, w = d.MENU_CONSTANTS.w * d.width - d.MENU_CONSTANTS.border
        let x = (d.width - w) / 2 + w * 0.12, y = (d.height - h) / 2
        let h_each = h / (MENU_ITEM_TOTAL + 0.5)
        let ys = [...Array(MENU_ITEM_TOTAL).keys()].map(index => y + (index + 0.5) * h_each)
        g.beginFill(0xffb447)
        g.drawRoundedRect(x, ys[index], w * 0.8, h_each * 0.8, d.MENU_CONSTANTS.radius)
        g.endFill()
    }

    drawBorder(g) {
        let d = DEFAULT_DIMENSIONS
        let h = d.MENU_CONSTANTS.h * d.height, w = d.MENU_CONSTANTS.w * d.width
        g.beginFill(0x000000)
        g.drawRoundedRect((d.width - w) / 2, (d.height - h) / 2, w, h, d.MENU_CONSTANTS.radius)
        g.endFill()
    }

    drawMask(g) {
        let d = DEFAULT_DIMENSIONS
        let h = d.MENU_CONSTANTS.h * d.height - d.MENU_CONSTANTS.border, w = d.MENU_CONSTANTS.w * d.width - d.MENU_CONSTANTS.border
        g.beginFill(0xffffff)
        g.drawRoundedRect((d.width - w) / 2, (d.height - h) / 2, w, h, d.MENU_CONSTANTS.radius)
        g.endFill()
    }

    render() {
        return (<Container ref={this.pauseMenuContainer}>
            <Graphics ref={this.borderRef} draw={this.drawBorder.bind(this)} />
            <Graphics ref={this.maskRef} draw={this.drawMask.bind(this)} />
            <TilingSprite ref={this.menuBackgroundRef} texture={GetTexture(overall.loader, "bg-pass", "bg-base")} width={DEFAULT_DIMENSIONS.width} height={DEFAULT_DIMENSIONS.height} />

            <Graphics ref={this.option1Ref} draw={this.drawOptions.bind(this, 0)} />
            <Text text={"Resume"} ref={this.optionLeftText1Ref} style={MENU_TEXT_STYLE} />
            <Graphics ref={this.option2Ref} draw={this.drawOptions.bind(this, 1)} />
            <Text text={"Restart"} ref={this.optionLeftText2Ref} style={MENU_TEXT_STYLE} />
            <Text ref={this.optionRightText2Ref} style={MENU_TEXT_STYLE} />
            <Graphics ref={this.option3Ref} draw={this.drawOptions.bind(this, 2)} />
            <Text text={"Train Mode"} ref={this.optionLeftText3Ref} style={MENU_TEXT_STYLE} />
            <Text ref={this.optionRightText3Ref} style={MENU_TEXT_STYLE} />
            <Graphics ref={this.option4Ref} draw={this.drawOptions.bind(this, 3)} />
            <Text text={"Game Mode"} ref={this.optionLeftText4Ref} style={MENU_TEXT_STYLE} />
            <Text ref={this.optionRightText4Ref} style={MENU_TEXT_STYLE} />
            <Graphics ref={this.option5Ref} draw={this.drawOptions.bind(this, 4)} />
            <Text text={"Exit"} ref={this.optionLeftText5Ref} style={MENU_TEXT_STYLE} />
        </Container>)
    }
}

export default withPixiApp(PauseMenuComponent)