import {isBalloonNote, isDrumrollNote, isSingleNote} from "../play2/utils";
const reJudgeScore = (game)=>{
    let {score} = game
    let note = game.lastKeyDownNote, result = game.lastKeyDownResult
    score.current += 5
}

//TODO
//real logic
//update score.success, it varies by difficulty
//https://taikotime.blogspot.com/2010/08/advanced-rules.html
const changeGameStateByScore = (game, note, type)=>{
    if(!note) return

    let {score} = game
    if(isSingleNote(note.code)){
        if(type==='good'){
            score.totalGood += 1
            score.combo += 1
            score.current += (score.last = 100)
            score.percentage += 1
        }else if(type==='ok'){
            score.totalOK += 1
            score.combo += 1
            score.current += (score.last = 50)
            score.percentage += 0.5
        }else if(type === 'bad'){
            score.totalBad += 1
            score.combo = 0
            score.last = 0
        }
    }else if(isDrumrollNote(note.code)){
        score.current += (score.last = 10)
        score.percentage += 0.1
    }else if(isBalloonNote(note.code)){
        console.assert(note.currentBalloon>0,'balloon count incorrect')
        note.currentBalloon--
        score.current += (score.last = 10)
        score.percentage += 0.1
    }

    score.maxCombo = Math.max(score.maxCombo, score.combo)
}

export {reJudgeScore, changeGameStateByScore}