import json
import base64, pathlib
S = pathlib.Path('src')
chando = 'data:image/webp;base64,' + base64.b64encode((S/'chando.webp').read_bytes()).decode()
chando2 = 'data:image/webp;base64,' + base64.b64encode((S/'chando2.webp').read_bytes()).decode()
pret = 'data:font/woff2;base64,' + base64.b64encode((S/'pretendard-sub.woff2').read_bytes()).decode()
import urllib.parse
def board(a, bcol, op):
    svg = f"<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'><g fill='none' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round' opacity='{op}'><circle cx='62' cy='74' r='14' stroke='{a}'/><circle cx='118' cy='232' r='14' stroke='{a}'/><path d='M236 52l24 24M260 52l-24 24' stroke='{bcol}'/><path d='M282 238l24 24M306 238l-24 24' stroke='{bcol}'/><path d='M76 88C104 150 160 162 206 132' stroke='{a}' stroke-dasharray='9 9'/><path d='M196 122l11 9-13 5' stroke='{a}'/><path d='M132 222C176 200 214 214 250 250' stroke='{a}'/><path d='M238 244l13 8-14 3' stroke='{a}'/><path d='M250 82C246 122 280 150 300 172' stroke='{bcol}' stroke-dasharray='5 8'/></g></svg>"
    return 'data:image/svg+xml,' + urllib.parse.quote(svg)
css = (S/'style.css').read_text(encoding='utf-8').replace('__PRETENDARD__', pret).replace('__BOARD_LIGHT__', board('#2563eb', '#dc2626', .16)).replace('__BOARD_DARK__', board('#e8f5ee', '#facc15', .12))
body = (S/'body.html').read_text(encoding='utf-8').replace('__CHANDO__', chando).replace('__CHANDO2__', chando2)
body += '\n<script type="application/octet-stream" id="bgmData">' + base64.b64encode((S/'bgm.mp3').read_bytes()).decode() + '</script>\n'
tiles = {p.stem: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode() for p in (S/'tiles').glob('*.webp')}
js = '\n'.join((S/f).read_text(encoding='utf-8') for f in ['engine.js','sports1.js','sports2.js','sports3.js','sports4.js','sports5.js','sports6.js','sports7.js','app.js','motion.js','fs.js','bgm.js']).replace('__CHANDO__', chando).replace('__CHANDO2__', chando2)
from PIL import Image
def _bg(p):
    im = Image.open(p).convert('RGB'); w, h = im.size
    px = [im.getpixel((x, y)) for x in (3, w // 2, w - 4) for y in (3, h - 4)] + [im.getpixel((3, h // 2)), im.getpixel((w - 4, h // 2))]
    px.sort(key=sum); px = px[len(px) // 2 - 1: len(px) // 2 + 2]
    return '#%02x%02x%02x' % tuple(sum(c[i] for c in px) // len(px) for i in range(3))
tilebg = {p.stem: _bg(p) for p in (S/'tiles').glob('*.webp')}
js = js.replace('__TILEBG__', json.dumps(tilebg))
for k, v in tiles.items(): js = js.replace(f'__T_{k}__', v)
head = '''<title>급식대장의 작전 만들기</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>(function(){try{var m=matchMedia('(pointer: coarse)').matches,sw=Math.min(screen.width,screen.height);if(m&&sw<=540)document.documentElement.classList.add('is-phone');var v=document.querySelector('meta[name=viewport]');if(!v){v=document.createElement('meta');v.name='viewport';document.head.appendChild(v);}v.content='width=device-width, initial-scale=1, viewport-fit=cover';}catch(e){}})();</script>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="농구·배구·티볼·플래그풋볼·축구·풋살·피구·플라잉디스크·핸드볼·추크볼·넷볼·플로어볼·킨볼·라크로스·럭비·배드민턴·탁구·피클볼·테니스 작전을 그리고, 움직임을 돌려 보고, 작전집으로 모으는 체육 수업 도구">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
'''
page = head + '<style>\n' + css + '\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n'
pathlib.Path('dist/artifact.html').write_text(page, encoding='utf-8')
full = '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n' + head + '<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'
pathlib.Path('dist/급식대장의_작전만들기.html').write_text(full, encoding='utf-8')
# local test copy with local fonts
test = full.replace('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','jspdf.umd.min.js').replace('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&display=swap">','<link rel="stylesheet" href="fonts/fonts.css">')
pathlib.Path('test/index.html').write_text(test, encoding='utf-8')
print(len(full)//1024, 'KB')
