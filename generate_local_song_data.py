import os
import math
import json
import uuid

from collections import defaultdict
leanCloudStorageJson = './_File.0.json'
r = './public/song'
output_name = 'local_song.json'
FileEncoding = 'utf8'
Extreme_Indicators = ['(裏譜面)']
fileStoragePrefix = 'http://lc-x3QTObAS.cn-n1.lcfile.com/'

def getColor(s):
    m = {
        'anime':'EE5208',
        'jpop':'005FBE',
        'child':'E00070',
        'classic':'7B3E00',
        'game':'460087',
        'namco':'F34728',
        'vocaloid':'dddddd',
        'variety':'00AF00',
    }
    return '#'+m[s.lower()]

def getPlayer(s):
    s = s.strip()
    if s.find(':')==-1:
        return 0

    index_1or2 = s[s.index(':')+1:].strip().lower().replace('p','')
    return int(index_1or2) - 1 if int(index_1or2) else 0

def getValue(s):
    s = s.strip()
    return s[s.index(':')+1:]

def getLevel(s):
    s = s.strip()
    return int(s[s.index(':')+1:])
        

def getCourse(s):
    s = s.strip().lower()
    s = s[s.index(':')+1:]
    if s in ['hard','2']:
        return 2
    
    if s in ['normal','1']:
        return 1
    
    if s in ['easy','0']:
        return 0
    
    return 3

data = {
    'Genre':defaultdict(lambda:{'color':'grey'}),
    'songs':[]
}

songWithSound = {}

SoundData = ['ogg']
TabData = ['tja']
defaultSong = {'level':3,'diversed':0,'player':0}

for subdir,dirs,files in os.walk(r):
    if not dirs:
        curGen = subdir[subdir.index(os.sep)+1:]
        data['Genre'][curGen]['color'] = getColor(curGen)
        for file in files:
            if file == output_name:
                continue

            name = file[:file.rindex('.')]
            suffix = file[file.rindex('.')+1:]

            # we only consider two types of files: sound data and tab data
            if suffix in SoundData:
                songWithSound[name] = file
                continue

            if suffix in TabData:
                curSong = {
                    'id':str(uuid.uuid4()).replace('-',''),
                    'Genre':curGen,
                    'Series':'',
                    'Title':name,
                    'SubTitle':'',
                    'tja':file,
                    'sound':'',
                    'vol':1,
                    'demostart':0,
                    'subSongs':[]
                }

                data['songs'] += [curSong]

                f = open(subdir + os.sep + file,'r',encoding=FileEncoding)
                content = f.readlines()
                while content and content[-1].strip()=='':
                    content.pop()

                # some tabs with only one song does not have #END flag
                if len(content) and content[-1].strip()!='#END':
                    content.append('#END')

                curObj = dict(defaultSong)
                for line in content:
                    line = line.strip()
                    if not line:
                        continue

                    if line == '#END':
                        if curObj['player']==1: # do not add song in double mode
                            continue

                        curSong['subSongs'] += [curObj]
                        for o in curSong['subSongs']:
                            if 'course' not in o:
                                o['course'] = 3 # default course
                                print(f'{curSong["Title"]} do not have course information')
                                # exit(0)
                        curSong['subSongs'].sort(key=lambda o:o['course'])
                        curObj = dict(defaultSong)
                    
                    if '#START' in line:
                        curObj['player'] = getPlayer(line)

                    if 'COURSE:' in line:
                        curObj['course'] = getCourse(line)
                    
                    if 'LEVEL:' in line:
                        curObj['level'] = getLevel(line)

                    if 'BRANCHSTART' in line:
                        curObj['diversed'] = 1

                    if 'SUBTITLE:' in line:
                        curSong['SubTitle'] = getValue(line).replace('-','')

                    if 'SONGVOL:' in line:
                        value  = getValue(line)
                        if value:
                            curSong['vol'] = float(value)/100.0
                    
                    if 'DEMOSTART:' in line:
                        value  = getValue(line)
                        if value:
                            curSong['demostart'] = float(value)

                f.close()
with open(leanCloudStorageJson,encoding='utf8') as lcfile:
    lines = lcfile.readlines()
    stack = ''
    remote_files = defaultdict(lambda:{})
    bracket = 0
    for line in lines:
        for c in line:
            if c in ['\n','\t']:continue
            if c == '{':
                bracket += 1
            if c == '}':
                bracket -= 1
                
            stack += c
            
            if bracket == 0:
                file = json.loads(stack)
                id,filename = file['key'].split(f'/')
                songname = filename[:filename.rfind('.')]
                filetype = filename[filename.rfind('.')+1:]
                remote_files[songname][filetype] = id
                stack = ''

    for song in data['songs']:
        if song['Title'] not in remote_files:
            print(f'Song {song["Title"]} not found')
        else:
            song['remote_files'] = {k:fileStoragePrefix + v + f'/{song["Title"]}.{k}' for k,v in remote_files[song['Title']].items()}
        for ex in Extreme_Indicators + ['']:
            title = song['Title'].replace(ex,'')
            if title in songWithSound:
                song['sound'] = songWithSound[title]


data = json.dumps(data,ensure_ascii=False)

f = open('./src/data/' + output_name,'w',encoding='utf8')
f.write(data)
f.close()


