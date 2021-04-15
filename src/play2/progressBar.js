import {Graphics, Text,withPixiApp} from "@inlet/react-pixi";
import {DEFAULT_DIMENSIONS, STATIC_TEXT_STYLE} from "./constants";
import React,{Component} from "react";
import {GameContext} from "./context";
import {bind, ProgressBar} from "./game";

const drawClosedPath = (g, lineStyle,path = [])=>{
    g.lineStyle(...lineStyle)
    path.forEach((point,i)=>{
        if (i){
            g.lineTo(point[0],point[1])
        }else{
            g.moveTo(point[0],point[1])
        }
    })
    g.closePath()
    g.endFill()
}


class ProgressBarComponent extends Component{
    static contextType = GameContext

    constructor(prop){
        super(prop)
        this.progressBarScoreRef = React.createRef(null)
    }

    componentDidUpdate() {
        let game = this.context
        bind(ProgressBar, this, game)
        game.score.progressBarScoreRef = this.progressBarScoreRef.current
    }

    onScore(){
        let g = this.score.progressBarScoreRef
        g.clear()
        let percentage = this.score.percentage
        let left = DEFAULT_DIMENSIONS.SCORE_BOARD_LEFT,
            right = DEFAULT_DIMENSIONS.SCORE_BOARD_RIGHT
        left.w = right.x - left.x
        right.h = left.h+left.y-right.y
        let leftPercentage = 0, rightPercentage = 0
        let leftTotalPercentage = left.w/(left.w+right.w) * 100
        let rightTotalPercentage = 100 - leftTotalPercentage
        if (percentage>leftTotalPercentage){
            leftPercentage = 100
            rightPercentage = ((percentage -leftTotalPercentage) / rightTotalPercentage) * 100
        } else{
            leftPercentage = percentage/leftTotalPercentage * 100
        }

        let xleft = left.x, yleft = left.y,wleft = left.w,
            endyleft = left.y + left.h,
            xright = right.x, yright = right.y,wright = right.w,
            endyright = right.y + right.h,
            endxright = right.x + right.w

        let line = wleft/Math.min(~~(wleft/4),60)
        let end = xleft
        let lastX = 0
        while (end <xright){
            let curline = line
            if(end + 2*line > xright){
                curline = xright - end
            }
            let lineRight = ~~(curline/4)
            let lineLeft = curline - lineRight
            if ((end+curline-xleft)/wleft*100<=leftPercentage){
                g.lineStyle(lineLeft, 0xff3408,1)
                g.moveTo(end + lineLeft, yleft+4)
                g.lineTo(end + lineLeft, endyleft-4)
                lastX = end + lineLeft
            }
            end += curline
        }

        line = wright/Math.min(~~(wright/4),20)
        end = xright
        while (end <endxright){
            let curline = line
            if(end + 2*line > endxright){
                curline =endxright - end
            }
            let lineRight = ~~(curline/4)
            let lineLeft = curline - lineRight
            if ((end+curline-xright)/wright*100<rightPercentage){
                g.lineStyle(lineLeft, 0xffff00,1)
                g.moveTo(end + lineLeft, yright+4)
                g.lineTo(end + lineLeft, endyright-4)
                lastX = end + lineLeft
            }
            end += curline
        }

        if (lastX){
            g.lineStyle(8,0xffffff,.3)
            g.moveTo(xleft+4,yleft+8)
            g.lineTo(Math.min(right.x+2,lastX+4),yleft+8)
            if(lastX+4>right.x+2){
                g.moveTo(right.x+4,yright+8)
                g.lineTo(lastX+4,yright+8)
            }
        }
    }

    drawBg(g){
        this.context.progressBar.graphics = g

        let left = DEFAULT_DIMENSIONS.SCORE_BOARD_LEFT,
            right = DEFAULT_DIMENSIONS.SCORE_BOARD_RIGHT
        left.w = right.x - left.x
        right.h = left.h+left.y-right.y

        g.beginFill(0x680000)
        let start = {...left}
        g.drawRect(start.x,start.y, left.w, left.h)
        g.endFill()

        g.beginFill(0x684900)
        start = {...right}
        g.drawRect(start.x,start.y, right.w, right.h)
        g.endFill()

        //border
        let path = [[left.x, left.y],
            [right.x, left.y],
            [right.x, right.y],
            [right.x + right.w, right.y],
            [right.x + right.w, right.y+right.h],
            [left.x, right.y+right.h]]

        drawClosedPath(g,[8,0x000000,1],path)

        //background
        let xleft = left.x, yleft = left.y,wleft = left.w,
            endyleft = left.y + left.h,
            xright = right.x, yright = right.y,wright = right.w,
            endyright = right.y + right.h,
            endxright = right.x + right.w

        let line = wleft/Math.min(~~(wleft/4),60)
        let end = xleft
        while (end <xright){
            let curline = line
            if(end + 2*line > xright){
                curline = xright - end
            }
            let lineRight = ~~(curline/4)
            g.lineStyle(lineRight,0x000000,.3)
            g.moveTo(end + curline, yleft)
            g.lineTo(end + curline, endyleft)
            end += curline
        }

        line = wright/Math.min(~~(wright/4),20)
        end = xright
        while (end <endxright){
            let curline = line
            if(end + 2*line > endxright){
                curline =endxright - end
            }
            let lineRight = ~~(curline/4)
            g.lineStyle(lineRight,0x000000,.3)
            g.moveTo(end + curline, yright)
            g.lineTo(end + curline, endyright)
            end += curline
        }
    }

    render(){
        return(<>
            <Graphics draw={this.drawBg.bind(this)}/>
            <Graphics ref={this.progressBarScoreRef}/>
            <Text {...{style:STATIC_TEXT_STYLE.soul,...DEFAULT_DIMENSIONS.STATIC_TEXT.soul}} text={'魂'}/>
            <Text {...{style:STATIC_TEXT_STYLE.pass,...DEFAULT_DIMENSIONS.STATIC_TEXT.pass}} text={'及格'}/>
        </>)
    }
}

export default withPixiApp(ProgressBarComponent)