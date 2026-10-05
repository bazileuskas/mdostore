"""Bundle the game into one HTML file that can be sent to someone and opened by double-clicking it.

    python build.py    ->    share/JUJUTSU-UNLIMITEDS.html

index.html normally pulls in every game script through the loader at the bottom of the page. This copies index.html
and puts the contents of those scripts in the loader's place, in the same order, so the page needs no other file.
"""
import base64
import glob
import io
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'share', 'JUJUTSU-UNLIMITEDS.html')

html = io.open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
loader = re.search(r"<script>\s*// Load every game script.*?\[(.*?)\]\.forEach\(src => \{.*?</script>", html, re.S)
assert loader, 'the script loader was not found in index.html'
names = re.findall(r"'([^']+\.js)'", loader.group(1))

blocks = []
for name in names:
    js = io.open(os.path.join(HERE, name), encoding='utf-8').read()
    assert '</script' not in js.lower(), name + ' contains a closing script tag and cannot be inlined as it is'
    blocks.append('<script>\n/* ---- %s ---- */\n%s\n</script>' % (name, js.rstrip()))

# the patch-notes pictures travel inside the page too, as data the scroll reads from window.JU_PICS
pics = {os.path.splitext(os.path.basename(p))[0]: 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode('ascii')
        for p in sorted(glob.glob(os.path.join(HERE, 'notes', '*.jpg')))}
# ...and so do the pictures the game itself shows (img/): the same table, under their own names
for p in sorted(glob.glob(os.path.join(HERE, 'img', '*'))):
    name, ext = os.path.splitext(os.path.basename(p))
    if ext.lower() in ('.jpg', '.jpeg', '.png') and not name.endswith('-original'):
        pics[name] = 'data:image/%s;base64,' % ('png' if ext.lower() == '.png' else 'jpeg') + base64.b64encode(open(p, 'rb').read()).decode('ascii')
blocks.insert(0, '<script>window.JU_PICS = {%s};</script>' % ','.join('"%s":"%s"' % kv for kv in pics.items()))
# and any sound files the game has been given (the Black Flash voice line, the music for a domain), read from window.JU_SOUNDS
sounds = {os.path.splitext(os.path.basename(p))[0]: 'data:audio/mpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode('ascii')
          for p in sorted(glob.glob(os.path.join(HERE, 'sounds', '*.mp3')))}
if sounds:
    blocks.insert(0, '<script>window.JU_SOUNDS = {%s};</script>' % ','.join('"%s":"%s"' % kv for kv in sounds.items()))

page = html[:loader.start()] + '\n'.join(blocks) + html[loader.end():]
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(page)
print('%s  (%d scripts, %d pictures, %d KB)' % (OUT, len(names), len(pics), len(page.encode('utf-8')) // 1024))
