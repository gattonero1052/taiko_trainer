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
 * 
 * Forked paths
 * 
 * #BRANCHSTART <RULES>
 * #N
 * <EMPTY LINE>*
 * #E
 * #M
 * #BRANCHEND
 * 
 * 
 * Tab
 * 
 * Note:
 *      The distance of each note from the start position should be calculated from the beginning
 *      Scroll speed, A and B for each measure could vary, to get the distance above, only rely on time and the scroll speed of the corresponding measure
 *      The paths in the same branch must have same number of lines.
 * 
 * Ignored tags: #SECTION
 * */

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

const getCourse = (s = '3') => {
    s.trim().toLowerCase()
    s = s.substr(s.indexOf(':') + 1)
    if (['hard', '2'].indexOf(s) > -1) return 2
    if (['normal', '1'].indexOf(s) > -1) return 1
    if (['easy', '0'].indexOf(s) > -1) return 0
    return 3//s could be "Oni"
}

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)]

let DEFAULT_CONFIG = {
    measure: '4/4',
    measure_a: 4,
    measure_b: 4,
    scroll: 1,
    offset: 0
}

const CODE_NODE = {
    '|': {
        name: 'spliter',
        size: 8
    },
    '1': {
        name: 'don',
        size: 8
    },
    '2': {
        name: 'kat',
        size: 8
    },
    '3': {
        name: 'don-big',
        size: 10
    },
    '4': {
        name: 'kat-big',
        size: 10
    },
    '5': {
        name: 'drumroll',
        size: 10
    },
    '6': {
        name: 'drumroll-large',
        size: 10
    },
    '7': {
        name: 'ballon',
        size: 8
    },
}

class Measure {
    constructor(state) {
        this.state = state
        this.notes = []// all objects that maybe different in different tabs, including barlines
        this.isPlaying = false
        this.forking = false
        this.activatedBranchIndex = -1//has meaning only if this.forking is true
        this.countBad = 0
        this.countOK = 0
        this.countGood = 0
    }
}

class Note {
    //only spliter note has forkCondition, when forkCondition is not empty:
    //forkCondition is not "BRANCHEND": note could be forked to another branch
    //forkCondition is "BRANCHEND": the spliter at the end of last measure indicates the change of branch to normal
    constructor(measure, code, duration = 0, startTime = 0, forkCondition = '') {
        this.bestResult = 0//0: not judged or bad, 1: ok, 2: good
        //basic properties
        this.judged = false
        this.passed = false

        this.forkCondition = forkCondition
        this.measure = measure
        this.code = code
        this.randomCode = code === '1' || code === '2' ? getRandom(['1', '2']) :
            code === '3' || code === '4' ? getRandom(['3', '4']) : ''
        this.duration = duration
        this.startTime = startTime
        this.balloonStart = 0
        this.currentBallon = 0
        this.balloonCount = 0
        this.id = 'note' + this.code + '_' + measure.startTime + '_' + this.startTime

        //view properties, view and note has a strict 1-1 relationship so no problem here
        //0:before render, 1:rendered, 2:should be removed 3:removed
        this.viewStatus = 0
        this.viewAnimationStatus = 0 //0: default, other values depends

        //has meaning only when the note is a spliter before the branch starts
        //     This Spliter has the fork condition and activated branch index, so when this note passes the target, we get the information of the index of next branches and which branch to change to based on the fork condition
        //     _|_
        //     \/                         
        //     |                | Normal Branch ... |
        //     |                | Advanced Branch.. |
        //     |                | Master Branch ... |
        //   prevSpliter2    prevSpliter
        this.activatedBranchIndex = -1
    }
}

/**
 * Tabs
 *  - Level 1 Branches
 *      - Branch N Tab
 *      - Branch E Tab
 *      - Branch M Tab
 *  - Level 4 Branches (Using)
 *      - Branch N Tab
 *  - Level Branches
 *      - Branch N Tab
 * 
 * Only branches in one level will be stored in a Tabs instance
 */
class Tabs {
    constructor(text, course) {
        this.currentBranchName = 'N'
        this.forked = false
        this.branches = {
            'N': null,
            'E': null,
            'M': null
        }

        let notes = text.replace(/=|\r/g, '').split("#END")
        let config = {}
        // console.log(notes)
        for (let note of notes) {
            if (note.replace(/\s/g, '').length === 0) continue
            let [forked, branches, activatedBranches] = Tab._fromText(note, { ...DEFAULT_CONFIG, ...config })
            config = { ...config, ...branches[0].config }
            if (getCourse(branches[0].config.course) === course) {
                this._use(forked, branches, activatedBranches)
                break
            }
        }
    }

    //set branches using given level
    _use(forked, branches, activatedBranches) {
        this.forked = forked
        this.activatedBranches = activatedBranches
        this.branches.N = branches[0]
        this.branches.E = branches[1]
        this.branches.M = branches[2]
    }

    //current activated tab
    currentTab() {
        return this.branches[this.currentBranchName]
    }

    //check if the specified level is in the note text
    check(text, course) {
        try {
            let config = {}
            let notes = text.replace(/=|\r/g, '').split("#END")
            for (let note of notes) {
                if (note.replace(/\s/g, '').length === 0) continue

                let [forked, branches, activatedBranches] = Tab._fromText(note, { ...DEFAULT_CONFIG, ...config, })
                config = { ...config, ...branches[0].config }
                if (getCourse(branches[0].config.course) === course) {
                    return true
                }
            }
        } catch (e) {//could be grammar problem or level not found
            return false
        }

        return false
    }
}

class Tab {
    constructor(config = {}, branchLevel = 'N') {
        this.branchLevel = branchLevel
        this.config = config
        this.measures = []
        this.duration = 0
        this.randomState = 0
    }

    //get branches from text
    static _fromText(text, config) {
        function removeLineComment(line) {
            if (line.indexOf('/') !== -1) {
                return line.substring(0, line.indexOf('/')).trim()
            }
            return line.trim()
        }

        //set config related to time
        const setTimeConfig = function (config) {
            config.spb = 60 / config.bpm
            config.measure_a = Number(config.measure.split('/')[0])
            config.measure_b = Number(config.measure.split('/')[1])
            config.tpb = config.spb * 4 / config.measure_b
            config.tpm = config.measure_a * config.tpb
        }

        let forked = false // forked path exist
        let tab = new Tab(config, 'N') //Normal branch for default
        let tabE = new Tab(config, 'E') //E stands for advancEd branch
        let tabM = new Tab(config, 'M') //M stands for Master branch
        let activatedBranches = []

        let configText = '', mainText = ''

        try {
            [configText, mainText] = text.split('#START')
        } catch (e) {
            //exception when splitting text
        }

        try {
            configText.trim().split('\n').forEach(userConfig => {
                try {
                    let [k, v] = userConfig.split(':')
                    config[k.toLowerCase().trim()] = v.trim()
                } catch (e) {
                    //some config may be not valid, just ignore and move to next line
                }
            })

            config.offset = Number(config.offset)
            config.measureOffset = 2 + Math.max(0, -(config.offset <= -2 ? config.offset + 2 : config.offset))
            config.musicOffset = config.offset <= -2 ? 0 : Math.max(0, config.offset) + 2
            if (config.balloon) config.balloon = config.balloon.split(',')

            config.bpm = Number(config.bpm)
            setTimeConfig(config)
        } catch (e) {
            //exception when reading config
        }

        try {
            let state = {
                measure_a: config.measure_a,
                scroll: config.scroll,
                tpb: config.tpb,
                tpm: config.tpm,
                ggt: false, // is gogo time (GGT)
                barline: true, //show barline or not
            }, time = config.measureOffset // beginning time

            let lines = mainText.trim().split('\n')
            let lineObjects = []

            //convert text to config + lines
            for (let i = 0; i < lines.length; i++) {
                let line = removeLineComment(lines[i])
                if (line.length === 0) continue

                if (line[0] === '#') {//config change
                    let command = line.substr(1)
                    if (command.indexOf('SCROLL') > -1) {
                        state.scroll = Number(command.substr(6).trim())
                    } else if (command.indexOf('MEASURE') > -1) {
                        let [a, b] = command.substr(7).trim().split('/')
                        config.measure_a = Number(a)
                        config.measure_b = Number(b)
                        setTimeConfig(config)
                    } else if (command.indexOf('BPMCHANGE') > -1) {
                        let newBpm = command.substr(9).trim()
                        config.bpm = newBpm
                        setTimeConfig(config)
                    } else if (command.indexOf('GOGOSTART') > -1) {
                        state.ggt = true
                    } else if (command.indexOf('GOGOEND') > -1) {
                        state.ggt = false
                    } else if (command.indexOf('BARLINEON') > -1) {
                        state.barline = true
                    } else if (command.indexOf('BARLINEOFF') > -1) {
                        state.barline = false
                    } else if (command.indexOf('BRANCHSTART') > -1) {
                        //This command do not indicate state change
                        lineObjects.push({
                            line: 'BRANCHSTART',
                            forkCondition: command.substr(12).trim()
                        })
                    } else if (command.indexOf('BRANCHEND') > -1) {
                        //This command do not indicate state change
                        lineObjects.push({
                            line: 'BRANCHEND',
                        })
                    } else if (command === 'N') {
                        lineObjects.push({
                            line: 'N',
                        })
                    } else if (command === 'E') {
                        lineObjects.push({
                            line: 'E',
                        })
                    } else if (command === 'M') {
                        lineObjects.push({
                            line: 'M',
                        })
                    }

                    state.tpm = config.tpm
                    state.tpb = config.tpb
                    state.measure_a = config.measure_a
                } else if (line[line.length - 1] === ',') {
                    lineObjects.push({
                        line: line.substring(0, line.length - 1),
                        state: { ...state }//copy current state
                    })
                }
            }

            console.assert(lineObjects.length > 0)

            //convert measures to objects
            let beatCount = 0, ballonIndex = 0, previousSpliter2 = null, previousSpliter = null,
                previousSpliterE = null, previousSpliterE2 = null, previousSpliterM = null, previousSpliterM2 = null,
                forkedStart = -1, lastBranchLength = -1, forkedStartConfig = null, completedForks = 0, forking = false
            let currentTab = tab, operationIndex = 0
            let normalBranchEndingState = null

            for (let i = 0; i < lineObjects.length; i++) {
                let { line, state, forkCondition } = lineObjects[i]
                if (!state) {
                    // debugger
                }

                //end of a branch
                if (forking && (
                    (operationIndex - forkedStart == lastBranchLength) ||
                    line === 'N' || line === 'E' || line === 'M' || line === 'BRANCHEND' || line === 'BRANCHSTART')) {
                    if (line === 'N') {
                        currentTab = tab
                    } else if (line === 'E') {
                        currentTab = tabE
                    } else if (line === 'M') {
                        currentTab = tabM
                    }

                    if (operationIndex > forkedStart) {
                        if (completedForks === 0) {
                            lastBranchLength = operationIndex - forkedStart
                        }
                        completedForks++;
                        if (currentTab === tab) normalBranchEndingState = { ...state }

                        //ending of a all the branches
                        if (completedForks === 3 || line === 'BRANCHEND' || line === 'BRANCHSTART') {
                            forking = false
                            completedForks = 0
                            lastBranchLength = -1
                            //using nromal branch's last state
                            state = { ...normalBranchEndingState }
                            currentTab = tab
                        } else {
                            operationIndex = forkedStart
                        }

                        let spliters = previousSpliter2.measure.forking ? [previousSpliter2, previousSpliterE2, previousSpliterM2] : [previousSpliter2];
                        spliters.forEach(ps => {
                            if (ps)
                                ps.forkCondition = 'BRANCHEND'
                        })

                        // if(previousSpliter2){
                        //     debugger
                        //     previousSpliter2.forkCondition = 'BRANCHEND'
                        // }
                    }

                    activatedBranches.push('N')

                    if (line !== 'BRANCHSTART') continue
                }

                if (line === 'BRANCHSTART') {
                    //how many measures are forked
                    //could be zero, in that case, measures are not forked
                    let allBranchLength = 0
                    for (let j = i + 1; j <= lineObjects.length; j++) {
                        let meetsEnd = j == lineObjects.length
                        if (!meetsEnd) {
                            let { line: linej } = lineObjects[j]
                            meetsEnd = linej === 'BRANCHEND' || linej === 'BRANCHSTART'
                        }

                        if (meetsEnd) {
                            allBranchLength = j - i - 1
                            break
                        }
                    }
                    if (allBranchLength) {
                        forked = true
                        forking = true
                        forkedStart = operationIndex
                        forkedStartConfig = { ...state }

                        let spliters = previousSpliter2.measure.forking ? [previousSpliter2, previousSpliterE2, previousSpliterM2] : [previousSpliter2];
                        spliters.forEach(ps => {
                            if (ps) {
                                ps.activatedBranchIndex = activatedBranches.length
                                ps.forkCondition = forkCondition
                            }
                        })
                    }

                    continue
                }

                let measure = new Measure(state)
                let emptyMeasure = new Measure(state)

                measure.startTime = currentTab.duration || 0
                measure.startFace = beatCount & 1

                emptyMeasure.startTime = currentTab.duration || 0
                emptyMeasure.startFace = beatCount & 1

                let originLine = line
                let noEndfoundAtLast = /[567]0*$/.test(line)
                line = line.replace(/([^0]0*8)/g, match => match[0].repeat(match.length - 1) + '0')//replace like "50008 to 55550"
                let parts = line.match(/(0*([5|6|7])\2*)|(0*[1|2|3|4])/g) || []
                let lastZeroLength = line.length - parts.reduce((p, c) => p + c.length, 0)
                //prepend measure spliter
                if (i === 0) {
                    measure.notes.push(new Note(measure, '|'))
                }

                if (parts && parts.length) {
                    let sum = line.length//sum of length of each part
                    let prev = 0 //total length of string processed

                    parts.forEach((part, j) => {
                        let duration = 0
                        let code = part[part.length - 1]

                        if ('1,2,3,4'.indexOf(code) > -1) {//single note
                            duration = 0
                        } else if ('5,6,7'.indexOf(code) > -1) {//consecutive note, try to find the ending
                            if (j < parts.length - 1 || !noEndfoundAtLast) {//already replaced
                                duration = state.tpm * part.length / sum
                            } else if (noEndfoundAtLast) {
                                duration = state.tpm * (part.length + lastZeroLength) / sum
                                for (let j = i + 1; j < lineObjects.length; j++) {//from i+1 because there is no need to worry about 8 appearing in the current line,  it was already replaced
                                    let nline = lineObjects[j].line, nstate = lineObjects[j].state
                                    let pos8 = nline.indexOf('8')
                                    if (pos8 != -1) {
                                        duration += nstate.tpm * pos8 / nline.length
                                        nline = nline.replaceAt(pos8, '0')
                                        lineObjects[j].line = nline
                                        break
                                    } else {
                                        duration += nstate.tpm
                                    }
                                }
                            }
                        }

                        let fullCode = part.replace(/0/g, '')
                        let breakLength = part.length - fullCode.length

                        prev += breakLength
                        measure.notes.push(new Note(measure, code, duration, prev / sum * state.tpm))

                        if (code === '7') {
                            measure.notes[measure.notes.length - 1].balloonCount = Number(config.balloon[ballonIndex++])
                        }

                        prev += fullCode.length
                    })
                }

                //append measure spliter
                let currentSpliter = new Note(measure, '|', 0, state.tpm)
                if (currentTab == tab) {
                    previousSpliter2 = previousSpliter
                    previousSpliter = currentSpliter
                }

                if (currentTab == tabE) {
                    previousSpliterE2 = previousSpliterE
                    previousSpliterE = currentSpliter
                }

                if (currentTab == tabM) {
                    previousSpliterM2 = previousSpliterM
                    previousSpliterM = currentSpliter
                }

                measure.notes.push(currentSpliter)
                for (let ctab of [tab, tabE, tabM]) {
                    if (forking) {
                        if (ctab === currentTab) {
                            ctab.measures[operationIndex] = measure
                            measure.forking = true
                            measure.activatedBranchIndex = activatedBranches.length
                            ctab.duration += state.tpm
                        }
                    } else {
                        if (ctab === currentTab) {
                            ctab.measures[operationIndex] = measure
                        } else {
                            ctab.measures[operationIndex] = emptyMeasure
                        }
                        ctab.duration += state.tpm
                    }
                }
                operationIndex++;
                beatCount += state.measure_a
            }

        } catch (e) {
            //exception when mapping notes
            throw e
        }

        return [forked, [tab, tabE, tabM], activatedBranches]
    }
}

export { Tabs, Tab, Note, Measure }