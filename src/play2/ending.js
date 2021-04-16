import { withPixiApp, Container, Sprite } from "@inlet/react-pixi"
import * as PIXI from 'pixi.js'
import React, { Component } from 'react'
import { GetParams, GetTexture, isSingleNote, GetCourseText } from "./utils"
import { bind, Result, DefaultGlobalState as overall } from "./game";
import { DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE } from './constants'
import { GameContext } from "./context";

const getCompleted = measure => {
    return measure.notes.every(note => !isSingleNote(note.code) || note.bestResult > 0)
}

//position by top left width height percentage and border pixel (mid border)
const TLWHBPos = (width, height, T, L, W, H, B) => {
    let B2 = ~~(B / 2)
    return { T: ~~(height * T / 100) + B2, L: ~~(width * L / 100) + B2, W: ~~(width * W / 100) - B, H: ~~(height * H / 100) - B, B }
}

const getColor = (r, g, b) => r * 256 * 256 + g * 256 + b

const topColor = getColor(48, 48, 48),
    completedColorNB = getColor(255, 52, 8),
    completedColorEB = getColor(44, 137, 241),
    completedColorMB = getColor(172, 73, 178),
    unfinishedColor = getColor(131, 131, 131);

const calculatingPosition = (width, height, tabs) => {
    let progressResult = []

    tabs.branches.N.measures.map((measure, i) => {
        let cur = { results: [], forking: false }, result = getCompleted(measure);

        if (measure.forking) {
            cur.forking = true
            cur.results = cur.results.concat([
                result,
                getCompleted(tabs.branches.E.measures[i]),
                getCompleted(tabs.branches.M.measures[i])])
        } else {
            cur.results = cur.results.concat([result, result, result])
        }

        progressResult.push(cur)
    })

    let bgTr = { ...TLWHBPos(width, height, 9.0, 11.8, 77.2, 82.0, 4) },
        progressText = { ...TLWHBPos(width, height, 11.2, 13.7, 15.6, 7.0, 0) },
        summaryText = { ...TLWHBPos(width, height, 52, 13.7, 15.6, 7.0, 0) },
        progressWrapper = { ...TLWHBPos(width, height, 18.8, 13.7, 73, 30.4, 4) },
        summaryWrapper = { ...TLWHBPos(width, height, 59.7, 13.7, 73, 28, 4) },

        summaryLeftText1 = { ...TLWHBPos(width, height, 64.3, 16.1, 11.0, 6.5, 0) },
        summaryLeftText2 = { ...TLWHBPos(width, height, 71, 16.1, 11.0, 6.5, 0) },
        summaryLeftText3 = { ...TLWHBPos(width, height, 77.5, 16.1, 11.0, 6.5, 0) },

        summaryLeftText1R = { ...TLWHBPos(width, height, 64.3, 28.2, 11.0, 6.5, 0) },
        summaryLeftText2R = { ...TLWHBPos(width, height, 71, 28.2, 11.0, 6.5, 0) },
        summaryLeftText3R = { ...TLWHBPos(width, height, 77.5, 28.2, 11.0, 6.5, 0) },

        summaryRightText1 = { ...TLWHBPos(width, height, 64.3, 44.0, 11.0, 6.5, 0) },
        summaryRightText2 = { ...TLWHBPos(width, height, 71, 44.0, 11.0, 6.5, 0) },
        summaryRightText3 = { ...TLWHBPos(width, height, 77.5, 44.0, 11.0, 6.5, 0) },

        summaryRightText1R = { ...TLWHBPos(width, height, 64.3, 66.2, 11.0, 6.5, 0) },
        summaryRightText2R = { ...TLWHBPos(width, height, 71, 66.2, 11.0, 6.5, 0) },
        summaryRightText3R = { ...TLWHBPos(width, height, 77.5, 66.2, 11.0, 6.5, 0) };

    let progressContentStartTop = progressWrapper.T + 5, progressContentStartLeft = progressWrapper.L + 5,
        progressContentWidth = progressWrapper.W - 10, progressContentHeight = progressWrapper.H - 10;

    return {
        bgTr,
        progressText,
        summaryText,
        progressWrapper,
        summaryWrapper,
        summaryLeftText1,
        summaryLeftText2,
        summaryLeftText3,
        summaryLeftText1R,
        summaryLeftText2R,
        summaryLeftText3R,
        summaryRightText1,
        summaryRightText2,
        summaryRightText3,
        summaryRightText1R,
        summaryRightText2R,
        summaryRightText3R,
        progressResult,
        progressContent: {
            T: progressContentStartTop,
            L: progressContentStartLeft,
            W: progressContentWidth,
            H: progressContentHeight
        }
    }
}

class Ending extends Component {
    static contextType = GameContext

    constructor(props) {
        super(props)
        this.outerContainer = React.createRef()
        this.container = React.createRef()
        this.bgTop = React.createRef()
        this.bgBottom = React.createRef()
    }

    componentDidUpdate() {
        let game = this.context
        let d = DEFAULT_DIMENSIONS
        bind(Result, this, game)
        // console.log(d.WIDTH, d.HEIGHT)

        game.result.bgTop = this.bgTop.current
        game.result.bgBottom = this.bgBottom.current
        game.result.bgBottom.scale.set(-1, -1)
        game.result.bgBottom.anchor.set(1, 1)
        game.result.bgBottom.x = DEFAULT_DIMENSIONS.RESULT.bgBottom.x
        game.result.bgBottom.y = DEFAULT_DIMENSIONS.RESULT.bgBottom.y
        game.result.bgBottom.width = DEFAULT_DIMENSIONS.RESULT.bgBottom.width
        game.result.bgBottom.height = DEFAULT_DIMENSIONS.RESULT.bgBottom.height

        game.result.outerContainer = this.outerContainer.current;
        game.result.container = this.container.current;
    }

    onTick(delta) {
        let game = this
        let { app, time, tab, dimensions } = GetParams(this)
        let { width, height } = dimensions

        let outerContainer = this.result.outerContainer
        let container = this.result.container

        let redrawObjects = false

        if (this.gameStage === 1) {
            outerContainer.alpha = 1
            //game ends automatically
            if (this.gameState === 0) {
                this.gameState = 1
                redrawObjects = true
                game.result.objects.forEach(obj => {
                    if (!obj.static)
                        game.result.container.removeChild(obj.obj)
                })
            } else if (this.gameState == 1) {
                let animationEnd = false

                if (game.result.beginAnimation1TS > time) {
                    game.result.beginAnimation1TS = time
                } else {
                    //playing animation1
                    let progress = Math.min(1, (time - game.result.beginAnimation1TS) / Result.animation1Time)
                    game.result.bgTop.y = progress * height / 2
                    game.result.bgBottom.y = height - progress * height / 2
                    animationEnd = progress == 1

                    if (animationEnd) {
                        this.gameState = 2
                    }
                }
            } else if (this.gameState == 2) {
                let animationEnd = false

                //playing animation2
                if (game.result.beginAnimation2TS > time) {
                    game.result.beginAnimation2TS = time
                } else {
                    //playing animation1
                    let progress = Math.min(1, (time - game.result.beginAnimation2TS) / Result.animation2Time)
                    if (container) container.alpha = progress
                    animationEnd = progress == 1

                    if (animationEnd) {
                        this.gameState = 3
                    }
                }
            } else if (this.gameState == 3) {
                // console.log(game.result.bgTop);
                if (this.gameStage == 1)
                    this.gameStage = 2
            }
        } else if (this.gameStage == 0) {
            outerContainer.alpha = 0
            container.alpha = 0
        }

        if (!redrawObjects) return

        //draw everything except two background pieces
        let allObjects = []
        this.result.objects = allObjects
        let d = DEFAULT_DIMENSIONS
        let allPos = calculatingPosition(d.WIDTH, d.HEIGHT, game.tabs);
        let { progressResult, progressContent } = allPos
        //Get parameters for drawing
        const graphics = new PIXI.Graphics();
        const graphicsStrip = new PIXI.Graphics();
        const graphicsOutline = new PIXI.Graphics();
        const pos = { T: progressContent.T, L: progressContent.L, W: progressContent.W, H: progressContent.H }
        const count = progressResult.length
        const result = progressResult.map(e => e.results)
        const forking = progressResult.map(e => e.forking)
        const forkingColors = [completedColorNB, completedColorEB, completedColorMB];
        const normalColors = [completedColorNB, completedColorNB, completedColorNB];

        let rowCount = Math.round(count / 2)
        const darkStripColor = getColor(48, 48, 48)
        const lightStripColor = getColor(222, 222, 222)

        let topShortFrac = 1 / 4
        let eachH = pos.H / (2 * (4 - topShortFrac))
        let eachW = pos.W / rowCount
        let w1 = eachW / 9, w2 = eachW * 2 / 9;

        let { result_title, result_progress_index, result_item_key, result_item_value } = STATIC_TEXT_STYLE
        result_progress_index.fontSize = eachH * (1 - topShortFrac) * 0.7;
        result_title.fontSize = eachH * 1.5
        result_item_key.fontSize = eachH * 1
        result_item_value.fontSize = eachH * 1

        //draw background
        const graphicsBg = new PIXI.Graphics()
        let { bgTr, progressWrapper, summaryWrapper } = allPos

        graphicsBg.lineStyle(bgTr.B, 0x000000);
        graphicsBg.beginFill(getColor(248, 229, 199), .75)
        graphicsBg.drawRoundedRect(bgTr.L, bgTr.T, bgTr.W, bgTr.H, 10)
        graphicsBg.endFill()

        graphicsBg.lineStyle(progressWrapper.B, 0x000000);
        graphicsBg.beginFill(getColor(129, 129, 129), 1)
        graphicsBg.drawRoundedRect(progressWrapper.L, progressWrapper.T, progressWrapper.W, progressWrapper.H, 5)
        graphicsBg.endFill()

        graphicsBg.lineStyle(summaryWrapper.B, 0x000000);
        graphicsBg.beginFill(getColor(129, 129, 129), 1)
        graphicsBg.drawRoundedRect(summaryWrapper.L, summaryWrapper.T, summaryWrapper.W, summaryWrapper.H, 5)
        graphicsBg.endFill()
        container.addChild(graphicsBg)
        allObjects.push({ obj: graphicsBg, static: false })

        //draw progress
        // console.log(result);
        // console.log(JSON.stringify(result));
        // console.log(game.tabs);
        // console.log(normalColors);
        //draw content of progress
        for (let i = 0; i < 2; i++) {
            let baseT = pos.T + i * pos.H / 2
            for (let j = 0; j < rowCount; j++) {
                let index = i * rowCount + j
                if (index < result.length)
                    for (let k = 0; k < 4; k++) {
                        if (k == 0)
                            graphics.beginFill(topColor);
                        else {
                            graphics.beginFill(result[index][k - 1] ? (forking[index] ? forkingColors[k - 1] : normalColors[k - 1]) : unfinishedColor);
                        }
                        graphics.drawRoundedRect(pos.L + j * eachW, baseT + Math.max(0, (k - topShortFrac)) * eachH, eachW, eachH, k == 0 ? 10 : 0);
                        graphics.endFill();
                    }
            }
        }


        //draw strips of progress
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < rowCount; j++) {
                let baseL = pos.L + j * eachW, baseT = i * pos.H / 2 + pos.T
                graphicsStrip.beginFill(darkStripColor)

                //k
                graphicsStrip.drawRect(baseL + w2 + (w1 + w2) * 2, baseT + (1 - topShortFrac) * eachH, w1, eachH * 3)
                graphicsStrip.endFill();
            }
        }

        for (let i = 0; i < 2; i++)
            for (let j = 0; j < 3; j++) {
                graphicsStrip.beginFill(lightStripColor)
                graphicsStrip.drawRect(pos.L, (j + 1 - topShortFrac) * eachH + pos.H / 2 * i + pos.T, pos.W, eachH / 6)
                graphicsStrip.endFill();
            }

        //draw outlines of progress
        graphicsOutline.lineStyle(2, 0x000000)
        for (let i = 0; i <= rowCount; i++) {
            graphicsOutline.moveTo(pos.L + eachW * i, pos.T)
                .lineTo(pos.L + eachW * i, pos.T + pos.H)
        }

        for (let i = 0; i <= 2; i++) {
            graphicsOutline.moveTo(pos.L, pos.T + pos.H / 2 * i)
                .lineTo(pos.L + pos.W, pos.T + pos.H / 2 * i)
        }

        graphicsStrip.alpha = .3

        container.addChild(graphics);
        container.addChild(graphicsStrip);
        container.addChild(graphicsOutline);
        allObjects.push({ obj: graphics, static: false })
        allObjects.push({ obj: graphicsStrip, static: false })
        allObjects.push({ obj: graphicsOutline, static: false })

        //add text of progress
        for (let i = 0; i < 2; i++) {
            let baseT = pos.T + i * pos.H / 2
            for (let j = 0; j < rowCount; j++) {
                let index = i * rowCount + j
                let textObj = new PIXI.Text('' + (index + 1), result_progress_index)
                textObj.anchor.set(.5)
                textObj.x = pos.L + (j + 0.5) * eachW
                textObj.y = baseT + (1 - topShortFrac) * eachH / 2
                container.addChild(textObj);
                allObjects.push({ obj: textObj, static: false })
            }
        }

        //draw other texts
        ;[[new PIXI.Text("Progress   (Press Q to exit to menu)", result_title), allPos.progressText],
            , [new PIXI.Text("Summary", result_title), allPos.summaryText],
            , [new PIXI.Text("GOOD", result_item_key), allPos.summaryLeftText1],
            , [new PIXI.Text("OK", result_item_key), allPos.summaryLeftText2],
            , [new PIXI.Text("BAD", result_item_key), allPos.summaryLeftText3],
            , [new PIXI.Text("DIFFICULTY", result_item_key), allPos.summaryRightText1],
            , [new PIXI.Text("MAX COMBO", result_item_key), allPos.summaryRightText2],
            , [new PIXI.Text(this.score.totalGood, result_item_value), allPos.summaryLeftText1R],
            , [new PIXI.Text(this.score.totalOK, result_item_value), allPos.summaryLeftText2R],
            , [new PIXI.Text(this.score.totalBad, result_item_value), allPos.summaryLeftText3R],
            , [new PIXI.Text(GetCourseText(game.tab.config.course), result_item_value), allPos.summaryRightText1R],
            , [new PIXI.Text(this.score.maxCombo, result_item_value), allPos.summaryRightText2R]].forEach(e => {
                let [textObj, posObj] = e;
                textObj.x = posObj.L;
                textObj.y = posObj.T;
                container.addChild(textObj)
                allObjects.push({ obj: textObj, static: false })
            });
    }

    onKeyDown(e) {
        if (e.keyCode == 84) {
            let progressResult = []

            this.tabs.branches.N.measures.map((measure, i) => {
                let cur = { results: [], forking: false }, result = getCompleted(measure);

                if (measure.forking) {
                    cur.forking = true
                    cur.results = cur.results.concat([
                        result,
                        getCompleted(this.tabs.branches.E.measures[i]),
                        getCompleted(this.tabs.branches.M.measures[i])])
                } else {
                    cur.results = cur.results.concat([result, result, result])
                }

                progressResult.push(cur)
            })

            // console.log(progressResult);
        }
    }

    render() {
        return (<Container ref={this.outerContainer}>
            <Sprite {...DEFAULT_DIMENSIONS.RESULT.bgTop} ref={this.bgTop} texture={GetTexture(overall.loader, "result-bg", "bg-base")} />
            <Sprite ref={this.bgBottom} texture={GetTexture(overall.loader, "result-bg", "bg-base")} />
            <Container ref={this.container}></Container>
        </Container>)
    }
}

export default withPixiApp(Ending)