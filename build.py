"""Bundle the game into one HTML file that can be sent to someone and opened by double-clicking it.

    python build.py    ->    share/JUJUTSU-UNLIMITEDS.html

index.html loads the game's scripts piece by piece through the loader at the bottom of the page (Build 0.34). This copies index.html and
puts the contents of every one of those scripts in front of the loader, in the order of the loader's list, so the page needs no other
file; the loader then finds them all in already (JU_ALL) and holds nothing back.

It also keeps the loader's KEEP up to date in index.html itself (run it before a push): for each file the loader holds back, the
engine's hooks it plugs into that a file after it in the list plugs into too, and what of JU's it wraps that a later file wraps too. The
loader keeps their places for it, so that loading it later changes no order.
"""
import base64
import glob
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'share', 'JUJUTSU-UNLIMITEDS.html')
LOADER = re.compile(r"<script>\s*// Load every game script.*?</script>", re.S)


def game_list(loader):
    """The game's files, in their order: the list the loader pushes from."""
    m = re.search(r"const LIST = \[\];\n(\[.*?\])\.forEach\(src => LIST\.push\(src\)\);", loader, re.S)
    assert m, "the loader's list was not found"
    return re.findall(r"'([^']+\.js)'", m.group(1))


def pieces_in(loader):
    """The loader's PIECES: {piece: [files]}."""
    m = re.search(r"const PIECES = \{(.*?)\n\};", loader, re.S)
    assert m, "the loader's PIECES were not found"
    return {k: re.findall(r"'([^']+\.js)'", v) for k, v in re.findall(r"(\w+): \[(.*?)\]", m.group(1), re.S)}


def plugs(src):
    """The engine's hooks a file sets (H.x = ..., hooks.x = ..., E.hooks.x = ...), and the things of JU's it sets (JU.x = ...)."""
    alias = set(re.findall(r'\b(\w+)\s*=\s*(?:E|JU\.eng)\.hooks\b', src)) | {'hooks'}
    hooks = set()
    for a in alias:
        hooks |= set(re.findall(r'(?<![\w.])' + re.escape(a) + r'\.(\w+)\s*=(?!=)', src))
    hooks |= set(re.findall(r'\b(?:E|JU\.eng)\.hooks\.(\w+)\s*=(?!=)', src))
    ju = set(re.findall(r'(?<![\w.])JU\.(\w+)\s*=(?!=)', src))
    return hooks, ju


def keep_for(root, names, pieces):
    """For each held-back file: what it sets that a file after it in the list sets too."""
    held = {f for fs in pieces.values() for f in fs}
    got = {f: plugs(io.open(os.path.join(root, f), encoding='utf-8').read()) for f in names}
    keep = {}
    for i, f in enumerate(names):
        if f not in held:
            continue
        later_h, later_j = set(), set()
        for g in names[i + 1:]:
            later_h |= got[g][0]
            later_j |= got[g][1]
        ks = sorted(got[f][0] & later_h) + ['JU.' + k for k in sorted(got[f][1] & later_j)]
        if ks:
            keep[f] = ks
    return keep


def as_js(keep):
    return json.dumps(keep, separators=(', ', ': '))


if __name__ == '__main__':
    html = io.open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
    loader = LOADER.search(html)
    assert loader, 'the script loader was not found in index.html'
    names = game_list(loader.group(0))

    # KEEP, worked out again from the files as they are now
    keep = as_js(keep_for(HERE, names, pieces_in(loader.group(0))))
    line = re.search(r"const KEEP = (\{.*?\});", loader.group(0))
    assert line, "the loader's KEEP was not found"
    if line.group(1) != keep:
        html = html[:loader.start() + line.start(1)] + keep + html[loader.start() + line.end(1):]
        io.open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8', newline='\n').write(html)
        print("index.html: the loader's KEEP was out of date, and is now", keep)
        loader = LOADER.search(html)

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
    # and any sound files the game has been given (the Black Flash voice line, the music for a domain), read from window.JU_SOUNDS.
    # Not the ones cut from a clip of another game (the Vengeful Artist's four hits), or taken from one (Jujutsu Shenanigans' hits, if Ratio
    # Man has been given them), or clips from the anime found online (home-*): those stay in this copy, and the page that is put online makes
    # its own instead (kept out of git too: .gitignore)
    HOME_ONLY = ('vengeful-', 'jjs-', 'home-')
    sounds = {os.path.splitext(os.path.basename(p))[0]: 'data:audio/mpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode('ascii')
              for p in sorted(glob.glob(os.path.join(HERE, 'sounds', '*.mp3'))) if not os.path.basename(p).startswith(HOME_ONLY)}
    if sounds:
        blocks.insert(0, '<script>window.JU_SOUNDS = {%s};</script>' % ','.join('"%s":"%s"' % kv for kv in sounds.items()))
    blocks.insert(0, '<script>window.JU_ALL = true;      // every file is in this page: the loader holds nothing back</script>')

    page = html[:loader.start()] + '\n'.join(blocks) + '\n' + loader.group(0) + html[loader.end():]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(page)
    print('%s  (%d scripts, %d pictures, %d KB)' % (OUT, len(names), len(pics), len(page.encode('utf-8')) // 1024))
