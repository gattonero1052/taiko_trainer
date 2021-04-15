import os
import codecs

r = './public/song'
fromEncoding, toEncoding = 'ansi','utf8'
for subdir,dirs,files in os.walk(r):
    if not dirs:
        for file in files:
            suffix = file[file.rindex('.')+1:]
            if suffix!='tja':
                continue

            path = subdir + os.sep + file

            with codecs.open(path, 'r', encoding = fromEncoding) as f:
                lines = f.read()

            with codecs.open(path, 'w', encoding = toEncoding) as f:
                f.write(lines)