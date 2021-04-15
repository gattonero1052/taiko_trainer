/*
* Basic concepts:
*
* Beat: Basic unit of time in music, measurement of speed
* BPM: Beats per minute, measurement of tempo, 60/BPM is time/s for each beat, note as SPB (seconds per beat)
* Measure (Bar): a segment of beats, indicates how many beats should be treated together while the number of beats is constant
*       # Assuming Measure = A / B, A means Beats per measure, B means Note value
*       # Then the actual time per beat is spb * 4/B, the time per measurement is A * SPB * 4/B
*       # Default measure is simple quadruple beats (4/4)
*
* OFFSET: Imaging there is a track of music which is 2 seconds right to the main track by default, the offset generally indicates how much time this track is shifted to the right.
*
* Note: don, kat, large don, large kat...
* Note value: a notation which indicates the relative duration of a note
*   If the given BPM is 120, and note value is 8, you can think of it as if it raises the BPM to 8/4 times higher
*
* Basic formulas:
* SPB = 60/BPM
* Measure = A / B (default 4/4)
*
* Time per beat = SPB * 4/B (Here time per beat means the actual spb in case the measure changes)
* Time per measure = A * SPB * 4/B
* Time from start playing to the beginning of the first measure = 2 + max(0, -OFFSET- 2)
* Time from start playing to the beginning of music = max(0, 2 + OFFSET)
*
 * Code-Node map
 *  0=no notes
 *  1=don
 *  2=kat
 *  3=large don
 *  4=large kat
 *  5=drumroll
 *  6=large drumroll
 *  7=balloon note
 *  8=drumroll/balloon ends (included)
 *
* Note:
*      The distance of each note from the start position should be calculated from the beginning
*       Scroll speed, A and B for each measure could vary, to get the distance above, only rely on time and the scroll speed of the corresponding measure
* */

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

let DEFAULT_CONFIG = {
    measure:'4/4',
    measure_a:4,
    measure_b:4,
    scroll:1,
    offset:0
}

const CODE_NODE = {
    '|':{
        name: 'spliter',
        size: 8
    },
    '1':{
        name:'don',
        size:8
    },
    '2':{
        name:'kat',
        size:8
    },
    '3':{
        name:'don-big',
        size:10
    },
    '4':{
        name:'kat-big',
        size:10
    },
    '5':{
        name:'drumroll',
        size:10
    },
    '6':{
        name:'drumroll-large',
        size:10
    },
    '7':{
        name:'ballon',
        size:8
    },
}

class Measure{
    constructor(state){
        this.state = state
        this.notes = []// all objects that maybe different in different tabs, including barlines
    }
}

class Note{
    constructor(measure, code, duration = 0, startTime = 0){
        //basic properties
        this.measure = measure
        this.code = code
        this.duration = duration
        this.startTime = startTime
        this.balloonStart = 0
        this.currentBallon = 0
        this.balloonCount = 0
        this.id = 'note'+this.code + '_'+measure.startTime+'_'+this.startTime

        //view properties, view and note has a strict 1-1 relationship so no problem here
        //0:before render, 1:rendered, 2:should be removed 3:removed
        this.viewStatus = 0
        this.viewAnimationStatus = 0 //0: default, other values depends
    }
}

class Tab{
    constructor(config = {}){
        this.config = config
        this.measures = []
        this.duration = 0
    }

    //allow multiple level of difficulty to be written in one file
    static fromText(text){
        let notes = text.replace(/=|\r/g,'').split("#END")
        let config = {}
        let res = []
        for(let note of notes){
            try{
                let tab = Tab._fromText(note,{...config,...DEFAULT_CONFIG}) //DEFAULT_CONFIG can't be inherited and is the same for each level of difficulty, but others can
                config = {...config, ...tab.config}
                res.push(tab)
            }catch (e) {
                //note may not be valid
                // console.error('Level 1: ',e)
            }
        }
        return res
    }

    static _fromText(text, config){
        const setTimeConfig = function (config){
            config.spb = 60/config.bpm
            config.measure_a = Number(config.measure.split('/')[0])
            config.measure_b = Number(config.measure.split('/')[1])
            config.tpb = config.spb * 4 / config.measure_b
            config.tpm = config.measure_a * config.tpb
        }

        let tab = new Tab(config)

        let configText = '', mainText = ''

        try{
            [configText, mainText] = text.split('#START')
        }catch (e) {
            //exception when splitting text
        }

        try{
            configText.trim().split('\n').forEach(userConfig => {
                try{
                    let [k, v] = userConfig.split(':')
                    config[k.toLowerCase().trim()] = v.trim()
                }catch (e) {
                    //some config may be not valid, just ignore and move to next line
                }
            })

            config.offset = Number(config.offset)
            config.measureOffset = 2 + Math.max(0, -config.offset - 2)
            config.musicOffset = Math.max(0, 2 + config.offset)
            if(config.balloon) config.balloon = config.balloon.split(',')

            config.bpm = Number(config.bpm)
            setTimeConfig(config)
        }catch (e) {
            //exception when reading config
        }

        try {
            let state = {
                measure_a:config.measure_a,
                scroll:config.scroll,
                tpb:config.tpb,
                tpm:config.tpm,
                gogo:false, // is gogo time (GGT)
                barline:true, //show barline or not
            }, time = config.measureOffset // beginning time

            let lines = mainText.trim().split('\n')
            let lineObjects = []

            //convert text to config + lines
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim()
                if (line.length === 0) continue

                if (line[0] === '#') {//config change
                    let command = line.substr(1)
                    if (command.indexOf('SCROLL') > -1) {
                        state.scroll = Number(command.substr(6).trim())
                    }else if(command.indexOf('MEASURE')>-1){
                        let [a,b] = command.substr(7).trim().split('/')
                        config.measure_a = Number(a)
                        config.measure_b = Number(b)
                        setTimeConfig(config)
                    }else if(command.indexOf('BPMCHANGE')>-1){
                        let newBpm = command.substr(9).trim()
                        config.bpm = newBpm
                        setTimeConfig(config)
                    } else if (command.indexOf('GOGOSTART') > -1) {
                        state.gogo = true
                    } else if (command.indexOf('GOGOEND') > -1) {
                        state.gogo = false
                    } else if (command.indexOf('BARLINEON') > -1) {
                        state.barline = true
                    } else if (command.indexOf('BARLINEOFF') > -1) {
                        state.barline = false
                    }

                    state.tpm = config.tpm
                    state.tpb = config.tpb
                    state.measure_a = config.measure_a
                }else if(line[line.length-1] === ','){
                    lineObjects.push({
                        line:line.substring(0,line.length-1),
                        state:{...state}//copy current state
                    })
                }
            }

            console.assert(lineObjects.length>0)

            //convert measures to objects
            let beatCount = 0,ballonIndex = 0
            for (let i = 0; i < lineObjects.length; i++) {
                let {line, state} = lineObjects[i]
                let measure = new Measure(state)
                measure.startTime = tab.duration||0
                measure.startFace = beatCount & 1
                let originLine = line
                let noEndfoundAtLast = /[567]0*$/.test(line)
                line = line.replace(/([^0]0*8)/g,match=>match[0].repeat(match.length))//replace like "50008 to 55555"
                let parts = line.match(/(0*([5|6|7])\2*)|(0*[1|2|3|4])/g) || []
                let lastZeroLength = line.length - parts.reduce((p,c)=>p+c.length,0)
                //prepend measure spliter
                if (i === 0){
                    measure.notes.push(new Note(measure, '|'))
                }

                if (parts && parts.length){
                    let sum = line.length//sum of length of each part
                    let prev = 0 //total length of string processed

                    parts.forEach((part, j)=>{
                        let duration = 0
                        let code = part[part.length-1]

                        if ('1,2,3,4'.indexOf(code)>-1){//single note
                            duration = 0
                        }else if('5,6,7'.indexOf(code)>-1){//consecutive note, try to find the ending
                            if (j<parts.length-1 || !noEndfoundAtLast){//already replaced
                                duration = state.tpm *  part.length / sum
                            }else if(noEndfoundAtLast){
                                duration = state.tpm * (part.length + lastZeroLength) / sum
                                for (let j = i + 1; j < lineObjects.length; j++) {//from i+1 because there is no need to worry about 8 appearing in the current line,  it was already replaced
                                    let nline = lineObjects[j].line, nstate = lineObjects[j].state
                                    let pos8 = nline.indexOf('8')
                                    if (pos8!=-1){
                                        duration += nstate.tpm * (pos8 + 1)/nline.length
                                        nline = nline.replaceAt(pos8,'0')
                                        lineObjects[j].line = nline
                                        break
                                    }else{
                                        duration += nstate.tpm
                                    }
                                }
                            }
                        }

                        let fullCode = part.replace(/0/g,'')
                        let breakLength = part.length - fullCode.length

                        prev += breakLength
                        measure.notes.push(new Note(measure,code ,duration,prev/sum*state.tpm))

                        if (code === '7'){
                            measure.notes[measure.notes.length-1].balloonCount = Number(config.balloon[ballonIndex++])
                        }

                        prev += fullCode.length
                    })
                }

                //append measure spliter
                measure.notes.push(new Note(measure, '|',0, state.tpm))
                tab.measures.push(measure)
                tab.duration += state.tpm
                beatCount += state.measure_a
            }

        }catch (e) {
            //exception when mapping notes
            throw e
        }

        return tab
    }
}

export {Tab, Note, Measure}