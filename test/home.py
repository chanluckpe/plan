import time
from playwright.sync_api import sync_playwright
VP=[(1440,900),(1280,720),(1920,1080),(1024,768),(768,1024),(1180,820),(390,844)]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h in VP:
        mob = w<700
        pg=b.new_page(reduced_motion='reduce', viewport={'width':w,'height':h}, is_mobile=mob, has_touch=mob, device_scale_factor=2 if mob else 1)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file:///home/claude/gc/test/index.html#skipintro'); time.sleep(.8)
        print((w,h), 'scroll', pg.evaluate("[document.documentElement.scrollHeight, innerHeight, document.documentElement.scrollWidth, innerWidth]"), errs)
        pg.screenshot(path=f'test/shots/home_{w}x{h}.png', full_page=mob)
        if (w,h)==(1440,900):
            pg.click('#fbOpen'); time.sleep(.3); pg.fill('#fbText','테스트 의견'); pg.click('#fbKakao'); time.sleep(.5)
            pg.screenshot(path='test/shots/fb.png'); pg.click('#fbClose')
            pg.click('.tile[data-sport="futsal"]'); time.sleep(.3)
            pg.evaluate("window.scrollTo(0,99999)"); time.sleep(.2); pg.screenshot(path='test/shots/ws_foot.png')
            print('ws errs', errs)
        pg.close()
    b.close()
